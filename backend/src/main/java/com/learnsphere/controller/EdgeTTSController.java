package com.learnsphere.controller;

import com.learnsphere.common.Result;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

/**
 * Edge TTS 控制器
 * 提供免费的高质量语音合成服务
 */
@Slf4j
@RestController
@RequestMapping("/api/tts")
@RequiredArgsConstructor
public class EdgeTTSController {

    /**
     * Edge TTS 语音合成
     */
    @PostMapping("/edge")
    public ResponseEntity<byte[]> synthesizeSpeech(@RequestBody TTSRequest request) {
        try {
            log.info("Edge TTS request: voice={}, text length={}", request.getVoice(), request.getText().length());

            // 调用 Edge TTS API（第三方免费服务）
            byte[] audioData = callEdgeTTS(request.getText(), request.getVoice(), request.getRate());

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
        String apiUrl = "http://localhost:5010/api/tts";

        // 构建请求
        String requestBody = String.format(
                "{\"text\":\"%s\",\"voice\":\"%s\",\"rate\":\"%.0f%%\"}",
                escapeJson(text), voice, (rate - 1.0) * 100);

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
}
