package com.learnsphere.util;

import lombok.extern.slf4j.Slf4j;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Microsoft Edge Read Aloud TTS client.
 * Keeps protocol details close to the current edge-tts implementation shape.
 */
@Slf4j
public class EdgeTTSClient {
    private static final String TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
    private static final String WSS_URL =
            "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
    private static final String OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";
    private static final String CHROMIUM_FULL_VERSION = "143.0.3650.75";
    private static final String CHROMIUM_MAJOR_VERSION = "143";
    // 微软已把 Sec-MS-GEC-Version 前缀从 "1-" 改为 "2-"，旧前缀会被服务端拒绝（握手后无音频返回）。
    // 参考 edge-tts 7.3.1 的 constants.SEC_MS_GEC_VERSION。
    private static final String SEC_MS_GEC_VERSION = "2-" + CHROMIUM_FULL_VERSION;
    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/" + CHROMIUM_MAJOR_VERSION + ".0.0.0 Safari/537.36 Edg/" + CHROMIUM_MAJOR_VERSION + ".0.0.0";
    private static final String ORIGIN = "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold";
    private static final long WINDOWS_EPOCH_SECONDS = 11644473600L;
    private static final long WINDOWS_TICKS_PER_SECOND = 10_000_000L;
    private static final char[] HEX = "0123456789ABCDEF".toCharArray();

    private EdgeTTSClient() {
    }

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
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private static String buildTimestamp() {
        return String.format(
                Locale.US,
                "%1$ta %1$tb %1$td %1$tY %1$tT GMT+0000 (Coordinated Universal Time)",
                System.currentTimeMillis()
        );
    }

    private static String generateSecMsGec() throws Exception {
        long unixSeconds = System.currentTimeMillis() / 1000;
        long windowsFileTimeTicks = (unixSeconds + WINDOWS_EPOCH_SECONDS) * WINDOWS_TICKS_PER_SECOND;
        windowsFileTimeTicks -= windowsFileTimeTicks % (300L * WINDOWS_TICKS_PER_SECOND);
        String token = windowsFileTimeTicks + TRUSTED_CLIENT_TOKEN;

        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        byte[] digest = sha256.digest(token.getBytes(StandardCharsets.US_ASCII));
        char[] chars = new char[digest.length * 2];
        for (int i = 0; i < digest.length; i++) {
            int value = digest[i] & 0xFF;
            chars[i * 2] = HEX[value >>> 4];
            chars[i * 2 + 1] = HEX[value & 0x0F];
        }
        return new String(chars);
    }

    private static String generateMuid() {
        byte[] randomBytes = new byte[16];
        new Random().nextBytes(randomBytes);
        char[] chars = new char[randomBytes.length * 2];
        for (int i = 0; i < randomBytes.length; i++) {
            int value = randomBytes[i] & 0xFF;
            chars[i * 2] = HEX[value >>> 4];
            chars[i * 2 + 1] = HEX[value & 0x0F];
        }
        return new String(chars);
    }

    private static String buildConfigPayload() {
        return "{\"context\":{\"synthesis\":{\"audio\":{\"metadataoptions\":{"
                + "\"sentenceBoundaryEnabled\":\"false\",\"wordBoundaryEnabled\":\"false\"},"
                + "\"outputFormat\":\"" + OUTPUT_FORMAT + "\"}}}}\r\n";
    }

    private static byte[] extractAudioPayload(byte[] bytes) throws Exception {
        if (bytes.length < 2) {
            throw new Exception("Binary message missing header length");
        }

        int headerLength = ((bytes[0] & 0xFF) << 8) | (bytes[1] & 0xFF);
        if (headerLength + 2 > bytes.length) {
            throw new Exception("Binary message header length exceeds frame length");
        }

        int payloadOffset = headerLength + 2;
        int headerEnd = -1;
        for (int i = 2; i < payloadOffset - 1; i++) {
            if (bytes[i] == 0x0D && bytes[i + 1] == 0x0A) {
                headerEnd = i;
                break;
            }
        }

        if (headerEnd < 0) {
            throw new Exception("Binary message missing header section");
        }

        String headerText = new String(bytes, 2, headerLength, StandardCharsets.UTF_8);
        if (!headerText.contains("Path:audio")) {
            throw new Exception("Received binary frame without audio path");
        }
        if (headerText.contains("Content-Type:") && !headerText.contains("Content-Type:audio/mpeg")) {
            throw new Exception("Received audio frame with unexpected content type");
        }

        int dataLength = bytes.length - payloadOffset;
        if (dataLength <= 0) {
            return new byte[0];
        }

        byte[] data = new byte[dataLength];
        System.arraycopy(bytes, payloadOffset, data, 0, dataLength);
        return data;
    }

    public static byte[] synthesize(String text, String voice, String rate) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        ByteArrayOutputStream audioOutput = new ByteArrayOutputStream();
        String requestId = UUID.randomUUID().toString().replace("-", "");
        String connectionId = UUID.randomUUID().toString().replace("-", "");
        String secMsGec = generateSecMsGec();
        String secMsGecVersion = SEC_MS_GEC_VERSION;
        String timestamp = buildTimestamp();
        String muid = generateMuid();

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build();

        URI uri = URI.create(
                WSS_URL
                        + "?TrustedClientToken=" + TRUSTED_CLIENT_TOKEN
                        + "&ConnectionId=" + connectionId
                        + "&Sec-MS-GEC=" + secMsGec
                        + "&Sec-MS-GEC-Version=" + secMsGecVersion
        );

        CompletableFuture<WebSocket> wsFuture = client.newWebSocketBuilder()
                .header("User-Agent", USER_AGENT)
                .header("Origin", ORIGIN)
                .header("Pragma", "no-cache")
                .header("Cache-Control", "no-cache")
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Cookie", "muid=" + muid + ";")
                .buildAsync(uri, new WebSocket.Listener() {
                    @Override
                    public void onOpen(WebSocket webSocket) {
                        webSocket.request(1);
                    }

                    @Override
                    public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
                        String message = data.toString();
                        if (message.contains("Path:turn.end")) {
                            latch.countDown();
                        }
                        webSocket.request(1);
                        return WebSocket.Listener.super.onText(webSocket, data, last);
                    }

                    @Override
                    public CompletionStage<?> onBinary(WebSocket webSocket, ByteBuffer data, boolean last) {
                        byte[] bytes = new byte[data.remaining()];
                        data.get(bytes);
                        try {
                            byte[] audioPayload = extractAudioPayload(bytes);
                            if (audioPayload.length > 0) {
                                audioOutput.write(audioPayload, 0, audioPayload.length);
                            }
                        } catch (Exception parseError) {
                            log.debug("Skip non-audio binary frame: {}", parseError.getMessage());
                        }

                        webSocket.request(1);
                        return WebSocket.Listener.super.onBinary(webSocket, data, last);
                    }

                    @Override
                    public void onError(WebSocket webSocket, Throwable error) {
                        log.error("Edge TTS WebSocket error: {}", error.getMessage(), error);
                        latch.countDown();
                    }

                    @Override
                    public CompletionStage<?> onClose(WebSocket webSocket, int statusCode, String reason) {
                        log.info("Edge TTS WebSocket closed: code={}, reason={}", statusCode, reason);
                        latch.countDown();
                        return CompletableFuture.completedFuture(null);
                    }
                });

        WebSocket ws = wsFuture.get(10, TimeUnit.SECONDS);

        String config = "X-Timestamp:" + timestamp + "\r\n"
                + "Content-Type:application/json; charset=utf-8\r\n"
                + "Path:speech.config\r\n\r\n"
                + buildConfigPayload();
        ws.sendText(config, true).join();

        String escapedText = escapeSsmlText(text);
        String ssml = "X-RequestId:" + requestId + "\r\n"
                + "Content-Type:application/ssml+xml\r\n"
                + "X-Timestamp:" + timestamp + "Z\r\n"
                + "Path:ssml\r\n\r\n"
                + "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>"
                + "<voice name='" + voice + "'>"
                + "<prosody pitch='+0Hz' rate='" + rate + "' volume='+0%'>" + escapedText + "</prosody>"
                + "</voice></speak>";
        ws.sendText(ssml, true).join();

        if (!latch.await(45, TimeUnit.SECONDS)) {
            ws.sendClose(WebSocket.NORMAL_CLOSURE, "Timeout").join();
            throw new Exception("Edge TTS synthesis timed out");
        }

        try {
            ws.sendClose(WebSocket.NORMAL_CLOSURE, "OK").join();
        } catch (Exception closeError) {
            log.debug("Edge TTS WebSocket close skipped: {}", closeError.getMessage());
        }

        byte[] result = audioOutput.toByteArray();
        if (result.length == 0) {
            throw new Exception("Edge TTS returned no audio data");
        }

        log.info("Edge TTS synthesis successful, audio size: {} bytes", result.length);
        return result;
    }
}
