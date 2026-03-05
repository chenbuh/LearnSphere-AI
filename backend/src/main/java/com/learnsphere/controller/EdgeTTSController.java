package com.learnsphere.controller;

import com.learnsphere.common.Result;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Edge TTS 控制器
 * 提供免费的高质量语音合成服务
 */
@Slf4j
@RestController
@RequestMapping("/api/tts")
@RequiredArgsConstructor
public class EdgeTTSController {

    @Value("${voice-engine.host:127.0.0.1}")
    private String voiceEngineHost;

    @Value("${voice-engine.port:5010}")
    private int voiceEnginePort;

    /**
     * Edge TTS 语音合成
     */
    @PostMapping("/edge")
    public ResponseEntity<byte[]> synthesizeSpeech(@RequestBody TTSRequest request) {
        try {
            if (request == null || request.getText() == null || request.getText().trim().isEmpty()) {
                log.warn("Edge TTS request rejected: empty text");
                return ResponseEntity.badRequest().build();
            }

            String text = request.getText().trim();
            String voice = request.getVoice() == null || request.getVoice().trim().isEmpty()
                    ? "en-US-JennyNeural"
                    : request.getVoice().trim();
            double rate = sanitizeRate(request.getRate());

            log.info("Edge TTS request: voice={}, text length={}, rate={}", voice, text.length(), rate);

            // 调用 Edge TTS API（第三方免费服务）
            byte[] audioData = callEdgeTTS(text, voice, rate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
            headers.setContentLength(audioData.length);
            headers.set("Cache-Control", "public, max-age=604800"); // 缓存7天

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(audioData);

        } catch (Exception e) {
            log.error("Edge TTS synthesis failed", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取可用语音列表
     */
    @GetMapping("/voices")
    public Result<?> getVoices() {
        return Result.success(new Object[] {
                new Voice("en-US-JennyNeural", "Jenny (美音-女)", "en-US"),
                new Voice("en-US-GuyNeural", "Guy (美音-男)", "en-US"),
                new Voice("en-GB-SoniaNeural", "Sonia (英音-女)", "en-GB"),
                new Voice("en-GB-RyanNeural", "Ryan (英音-男)", "en-GB"),
                new Voice("en-AU-NatashaNeural", "Natasha (澳音-女)", "en-AU"),
                new Voice("zh-CN-XiaoxiaoNeural", "晓晓 (中文-女)", "zh-CN"),
                new Voice("zh-CN-YunxiNeural", "云希 (中文-男)", "zh-CN")
        });
    }

    /**
     * 调用 Edge TTS API
     */
    private byte[] callEdgeTTS(String text, String voice, double rate) throws IOException {
        // 使用开源的 Edge TTS API 服务
        // 注意：这个服务可能不稳定，建议自建或使用官方 API

        // 方案1：使用第三方免费服务（不稳定）
        // String apiUrl = "https://tts.example.com/api/edge";

        // 方案2：本地 Python Edge TTS 服务（推荐）
        // 需要先部署：pip install edge-tts && python edge_tts_server.py
        String apiUrl = buildVoiceEngineUrl("/api/tts");

        // 构建请求
        String requestBody = String.format(
                Locale.ROOT,
                "{\"text\":\"%s\",\"voice\":\"%s\",\"rate\":\"%s\"}",
                escapeJson(text), escapeJson(voice), formatRatePercent(rate));

        HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(30000);

        // 发送请求
        try (OutputStream os = conn.getOutputStream()) {
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
        }

        // 读取响应
        int responseCode = conn.getResponseCode();
        if (responseCode == 200) {
            try (InputStream is = conn.getInputStream();
                    ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, bytesRead);
                }
                return baos.toByteArray();
            }
        } else {
            // 本地服务不可用，降级到简单的 TTS 方案
            log.warn("Edge TTS service unavailable (HTTP {}), using fallback", responseCode);
            throw new IOException("Edge TTS service unavailable");
        }
    }

    /**
     * JSON 字符串转义
     */
    private String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private double sanitizeRate(double rate) {
        if (Double.isNaN(rate) || Double.isInfinite(rate)) {
            return 1.0;
        }
        return Math.max(0.5, Math.min(2.0, rate));
    }

    private String formatRatePercent(double rate) {
        int percent = (int) Math.round((sanitizeRate(rate) - 1.0) * 100.0);
        // edge-tts expects signed percent, e.g. +0%, +20%, -20%
        return String.format(Locale.ROOT, "%+d%%", percent);
    }

    /**
     * Whisper STT 语音识别
     */
    @PostMapping("/stt")
    public Result<?> transcribeSpeech(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            log.info("STT request: filename={}, size={}", file.getOriginalFilename(), file.getSize());

            // 调用本地 Python Whisper 服务
            String text = callWhisperSTT(file);

            return Result.success(text);

        } catch (Exception e) {
            log.error("STT transcription failed", e);
            return Result.error("语音识别失败: " + e.getMessage());
        }
    }

    /**
     * 调用本地 Whisper STT API
     */
    private String callWhisperSTT(org.springframework.web.multipart.MultipartFile file) throws IOException {
        String apiUrl = buildVoiceEngineUrl("/api/stt");

        // 由于需要上传文件，这里使用更复杂的请求方式
        // 为了简单起见，我们直接构建一个 Multipart POST 请求
        String boundary = "---" + System.currentTimeMillis();
        HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
        conn.setDoOutput(true);
        conn.setConnectTimeout(20000);
        conn.setReadTimeout(60000);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(("--" + boundary + "\r\n").getBytes());
            os.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getOriginalFilename()
                    + "\"\r\n").getBytes());
            os.write(("Content-Type: application/octet-stream\r\n\r\n").getBytes());
            os.write(file.getBytes());
            os.write(("\r\n--" + boundary + "--\r\n").getBytes());
        }

        int responseCode = conn.getResponseCode();
        if (responseCode == 200) {
            try (InputStream is = conn.getInputStream();
                    ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    baos.write(buffer, 0, bytesRead);
                }
                String response = baos.toString(StandardCharsets.UTF_8);
                // 简单解析 JSON 结果中的 text 字段
                // 实际生产环境建议使用 Jackson
                if (response.contains("\"text\":\"")) {
                    int start = response.indexOf("\"text\":\"") + 8;
                    int end = response.indexOf("\"", start);
                    return response.substring(start, end);
                }
                return response;
            }
        } else {
            throw new IOException("Whisper service returned error code: " + responseCode);
        }
    }

    @Data
    public static class TTSRequest {
        private String text;
        private String voice = "en-US-JennyNeural";
        private double rate = 1.0; // 语速倍率 0.5-2.0
    }

    @Data
    public static class Voice {
        private String code;
        private String name;
        private String locale;

        public Voice(String code, String name, String locale) {
            this.code = code;
            this.name = name;
            this.locale = locale;
        }
    }

    private String buildVoiceEngineUrl(String path) {
        return "http://" + voiceEngineHost + ":" + voiceEnginePort + path;
    }
}
