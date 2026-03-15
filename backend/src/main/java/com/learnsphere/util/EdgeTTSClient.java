package com.learnsphere.util;

import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * 微软 Edge TTS 协议原生 Java 实现
 * 无需 Python 环境，无服务器内存压力，完全免费
 */
@Slf4j
public class EdgeTTSClient {
    private static final String WSS_URL = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";
    private static final String OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

    private static int findHeaderEnd(byte[] bytes) {
        for (int i = 0; i < bytes.length - 3; i++) {
            if (bytes[i] == 0x0D && bytes[i + 1] == 0x0A && bytes[i + 2] == 0x0D && bytes[i + 3] == 0x0A) {
                return i + 4;
            }
        }
        return -1;
    }

    private static String escapeSsmlText(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    public static byte[] synthesize(String text, String voice, String rate) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        ByteArrayOutputStream audioOutput = new ByteArrayOutputStream();
        String requestId = UUID.randomUUID().toString().replace("-", "");

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build();

        CompletableFuture<WebSocket> wsFuture = client.newWebSocketBuilder()
                .header("User-Agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Origin", "chrome-extension://jdianpbcponcodfocbgmhnkjlebcjmax")
                .buildAsync(URI.create(WSS_URL + "&ConnectionId=" + requestId), new WebSocket.Listener() {
                    private boolean audioStreamOpened = false;

                    @Override
                    public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
                        String message = data.toString();
                        if (message.contains("Path:turn.end")) {
                            latch.countDown();
                        }
                        return WebSocket.Listener.super.onText(webSocket, data, last);
                    }

                    @Override
                    public CompletionStage<?> onBinary(WebSocket webSocket, ByteBuffer data, boolean last) {
                        byte[] bytes = new byte[data.remaining()];
                        data.get(bytes);

                        if (!audioStreamOpened) {
                            String headerSearch = new String(bytes, 0, Math.min(bytes.length, 256), StandardCharsets.UTF_8);
                            if (headerSearch.contains("Path:audio")) {
                                int audioStart = findHeaderEnd(bytes);
                                audioStreamOpened = true;
                                if (audioStart != -1 && audioStart < bytes.length) {
                                    audioOutput.write(bytes, audioStart, bytes.length - audioStart);
                                }
                            }
                        } else if (bytes.length > 0) {
                            audioOutput.write(bytes, 0, bytes.length);
                        }

                        return WebSocket.Listener.super.onBinary(webSocket, data, last);
                    }

                    @Override
                    public void onError(WebSocket webSocket, Throwable error) {
                        log.error("Edge TTS WebSocket error: {}", error.getMessage());
                        latch.countDown();
                    }

                    @Override
                    public CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
                        latch.countDown();
                        return null;
                    }
                });

        WebSocket ws = wsFuture.get(10, TimeUnit.SECONDS);

        String config = "Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n" +
                "{\"context\":{\"synthesis\":{\"audio\":{\"metadataoptions\":{\"sentenceBoundaryEnabled\":\"false\",\"wordBoundaryEnabled\":\"false\"},\"outputFormat\":\"" + OUTPUT_FORMAT + "\"}},\"system\":{\"name\":\"SpeechSDK\",\"version\":\"1.12.1-rc.1\",\"build\":\"JavaScript\",\"lang\":\"JavaScript\",\"os\":{\"platform\":\"Browser/Win32\",\"name\":\"Chrome\",\"version\":\"120.0.0.0\"}}}}";
        ws.sendText(config, true);

        String escapedText = escapeSsmlText(text);
        String ssml = String.format(
                "X-RequestId:%s\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n" +
                        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>" +
                        "<voice name='%s'><prosody pitch='+0Hz' rate='%s' volume='+0%%'>%s</prosody></voice></speak>",
                requestId, voice, rate, escapedText);
        ws.sendText(ssml, true);

        if (!latch.await(45, TimeUnit.SECONDS)) {
            ws.sendClose(WebSocket.NORMAL_CLOSURE, "Timeout");
            throw new Exception("Edge TTS synthesis timed out");
        }

        byte[] result = audioOutput.toByteArray();
        if (result.length == 0) {
            throw new Exception("Edge TTS returned no audio data");
        }

        log.info("Edge TTS synthesis successful, audio size: {} bytes", result.length);
        return result;
    }
}
