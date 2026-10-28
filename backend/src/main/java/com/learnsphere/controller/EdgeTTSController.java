package com.learnsphere.controller;

import com.alibaba.dashscope.audio.asr.recognition.Recognition;
import com.alibaba.dashscope.audio.asr.recognition.RecognitionParam;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.learnsphere.common.Result;
import com.learnsphere.util.EdgeTTSClient;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
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

    @Value("${ai.api-key:}")
    private String aiApiKey;

    @Value("${ai.speech-recognition-model:paraformer-v2}")
    private String speechRecognitionModel;

    /** 本地 Python edge-tts 服务开关（复用 voice-engine 配置） */
    @Value("${voice-engine.enabled:false}")
    private boolean localTtsEnabled;

    @Value("${voice-engine.host:127.0.0.1}")
    private String localTtsHost;

    @Value("${voice-engine.port:5010}")
    private int localTtsPort;

    /**
     * 原生 WebSocket 兜底开关。
     * 微软升级 Sec-MS-GEC v2 后它大概率返回 403，所以排在 SAPI 之后；
     * 若将来 edge-tts 库修复而 SAPI 不可用（非 Windows），可以靠它兜底。
     */
    @Value("${voice-engine.native-websocket-fallback:true}")
    private boolean nativeWebSocketFallback;

    /** 教学发音统一使用的美音音色 */
    private static final String AMERICAN_ENGLISH_VOICE = "en-US-JennyNeural";

    /**
     * 是否强制英语语音一律使用美音（Jenny）。
     * 产品要求所有学习场景发音统一为美式英语，默认开启。
     */
    @Value("${tts.force-american-english:true}")
    private boolean forceAmericanEnglish;

    /**
     * 用 Windows 系统语音（SAPI）合成，返回 MP3 字节。
     * 这是最后一道保险：即使 Python 服务和微软接口都不可用，也能出声。
     * 非 Windows 或缺少 PowerShell/ffmpeg 时返回 null。
     */
    private byte[] synthesizeViaSystemSpeech(String text) {
        String os = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
        if (!os.contains("win")) {
            return null;
        }

        Path tmpDir = null;
        try {
            tmpDir = Files.createTempDirectory("tts-sapi-");
            Path wav = tmpDir.resolve("out.wav");
            Path mp3 = tmpDir.resolve("out.mp3");

            // 转义单引号，避免注入 PowerShell
            String safeText = text.replace("'", "''");
            // Java 字符串里 "$" 是普通字符，无需转义；PowerShell 变量才用 $。
            String psScript = String.join(" ",
                    "Add-Type -AssemblyName System.Speech;",
                    "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer;",
                    "$v = $s.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'en*' } | Select-Object -First 1;",
                    "if ($v) { $s.SelectVoice($v.VoiceInfo.Name) };",
                    "$s.SetOutputToWaveFile('" + wav.toAbsolutePath() + "');",
                    "$s.Speak('" + safeText + "');",
                    "$s.Dispose();"
            );

            ProcessBuilder ps = new ProcessBuilder("powershell", "-NoProfile", "-NonInteractive", "-Command", psScript);
            ps.redirectErrorStream(true);
            Process psProcess = ps.start();
            boolean psDone = psProcess.waitFor(30, java.util.concurrent.TimeUnit.SECONDS);
            if (!psDone) {
                psProcess.destroyForcibly();
                return null;
            }
            if (psProcess.exitValue() != 0 || !Files.exists(wav)) {
                return null;
            }

            // 用 ffmpeg 转 MP3；没有 ffmpeg 就直接返回 WAV（浏览器也能播）
            ProcessBuilder ff = new ProcessBuilder("ffmpeg", "-y", "-loglevel", "error",
                    "-i", wav.toAbsolutePath().toString(),
                    "-codec:a", "libmp3lame", "-b:a", "48k", "-ar", "24000", "-ac", "1",
                    mp3.toAbsolutePath().toString());
            ff.redirectErrorStream(true);
            Process ffProcess = ff.start();
            boolean ffDone = ffProcess.waitFor(30, java.util.concurrent.TimeUnit.SECONDS);
            if (ffDone && ffProcess.exitValue() == 0 && Files.exists(mp3)) {
                return Files.readAllBytes(mp3);
            }

            return Files.readAllBytes(wav);
        } catch (Exception e) {
            log.warn("System speech synthesis failed: {}", e.getMessage());
            return null;
        } finally {
            if (tmpDir != null) {
                try {
                    Files.walk(tmpDir)
                            .sorted((a, b) -> b.getNameCount() - a.getNameCount())
                            .forEach(f -> {
                                try { Files.deleteIfExists(f); } catch (IOException ignored) { }
                            });
                } catch (IOException ignored) { }
            }
        }
    }

    /**
     * 调用本地 Python edge-tts 服务合成语音。
     * 服务端 caches 结果，重复词条 3ms 内返回。
     */
    private byte[] synthesizeViaLocalService(String text, String voice, String ratePercent) throws Exception {
        JSONObject payload = new JSONObject();
        payload.set("text", text);
        payload.set("voice", voice);
        payload.set("rate", ratePercent);

        java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(3))
                .build();

        java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("http://" + localTtsHost + ":" + localTtsPort + "/api/tts"))
                .timeout(java.time.Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        java.net.http.HttpResponse<byte[]> response = client.send(httpRequest,
                java.net.http.HttpResponse.BodyHandlers.ofByteArray());

        if (response.statusCode() != 200) {
            throw new IllegalStateException("local tts http " + response.statusCode());
        }
        return response.body();
    }


    /**
     * Edge TTS 语音合成
     */
    @PostMapping("/edge")
    public ResponseEntity<byte[]> synthesizeSpeech(@RequestBody TTSRequest request) {
        if (request == null || request.getText() == null || request.getText().trim().isEmpty()) {
            log.warn("Edge TTS request rejected: empty text");
            return ResponseEntity.badRequest().build();
        }

        String text = request.getText().trim();
        String requestedVoice = request.getVoice() == null || request.getVoice().trim().isEmpty()
                ? AMERICAN_ENGLISH_VOICE
                : request.getVoice().trim();
        // 服务端兜底：英语语音一律锁定美音，避免任何前端漏改导致非美式发音
        String voice = enforceAmericanEnglish(requestedVoice);
        double rate = sanitizeRate(request.getRate());
        String ratePercent = formatRatePercent(rate);

        log.info("Edge TTS request: voice={}, requested={}, text length={}, rate={}",
                voice, requestedVoice, text.length(), rate);

        byte[] audioData = null;
        String audioMime = "audio/mpeg";

        // 首选：本地 Python 边-tts 服务（复用官方 edge-tts 库，自动跟进微软 GEC v2 鉴权变更）。
        // 微软已把 Sec-MS-GEC 令牌升级到 v2 格式（"<16hex>-<64hex>"）并强制校验 Cookie: muid=，
        // 纯 Java 实现需要复刻混淆过的 CS64 哈希，维护成本高且易随服务端调整而失效。
        if (localTtsEnabled) {
            try {
                audioData = synthesizeViaLocalService(text, voice, ratePercent);
            } catch (Exception localException) {
                log.warn("Local TTS service unavailable, falling back to native WebSocket: {}",
                        localException.getMessage());
            }
        }

        // 二级兜底：Windows 系统语音（SAPI）。
        // 放在 WebSocket 之前的原因：微软已升级到 Sec-MS-GEC v2，原生 WebSocket 目前必然 403，
        // 每次要耗约 4 秒在重试上。SAPI 本地合成约 500ms，先试它能让降级快 8 倍。
        if (audioData == null || audioData.length == 0) {
            try {
                audioData = synthesizeViaSystemSpeech(text);
                if (audioData != null && audioData.length > 0) {
                    // ffmpeg 不可用时返回的是 WAV，按文件头判断真实类型
                    audioMime = (audioData.length > 8
                            && audioData[0] == 'R' && audioData[1] == 'I'
                            && audioData[2] == 'F' && audioData[3] == 'F')
                            ? "audio/wav" : "audio/mpeg";
                    log.info("TTS served by system speech fallback: {} bytes, {}", audioData.length, audioMime);
                }
            } catch (Exception sapiException) {
                log.error("System speech fallback failed: {}", sapiException.getMessage());
            }
        }

        // 三级兜底：原生 WebSocket 直连。
        // 保留是因为一旦 edge-tts 库跟进微软鉴权、SAPI 又不可用（非 Windows），它还有机会。
        // 关闭方式：voice-engine.native-websocket-fallback=false
        if ((audioData == null || audioData.length == 0) && nativeWebSocketFallback) {
            try {
                audioData = EdgeTTSClient.synthesize(text, voice, ratePercent);
            } catch (Exception nativeException) {
                log.warn("Edge TTS native synthesis failed: {}", nativeException.getMessage());
            }
        }

        // 全部失败才报错
        if (audioData == null || audioData.length == 0) {
            return buildTextErrorResponse("语音合成失败，请稍后重试");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(audioMime));
        headers.setContentLength(audioData.length);
        headers.set("Cache-Control", "public, max-age=604800");
        // 添加移动端播放必需的响应头
        headers.set("Accept-Ranges", "bytes");
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");

        return ResponseEntity.ok()
                .headers(headers)
                .body(audioData);
    }

    private ResponseEntity<byte[]> buildTextErrorResponse(String message) {
        String resolvedMessage = (message == null || message.isBlank()) ? "语音合成失败，请稍后重试" : message;
        byte[] payload = resolvedMessage.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.internalServerError()
                .contentType(MediaType.parseMediaType("text/plain;charset=UTF-8"))
                .contentLength(payload.length)
                .body(payload);
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

    private double sanitizeRate(double rate) {
        if (Double.isNaN(rate) || Double.isInfinite(rate)) {
            return 1.0;
        }
        return Math.max(0.5, Math.min(2.0, rate));
    }

    /**
     * 教学发音强制使用美音。
     *
     * <p>产品要求：所有学习场景（单词、例句、听力、口语示范）统一用
     * {@code en-US-JennyNeural}。此前只在前端各处写死音色，任何一处漏改、
     * 或者请求被篡改，都会出现「不像美式也不像英式」的反馈。
     *
     * <p>这里在服务端做最后一道兜底：只要是英语语音，一律映射到 Jenny。
     * 中文语音（zh-CN-*）保留，因为 {@code /api/tts/voices} 调试页要用。
     *
     * <p>可用 {@code tts.force-american-english=false} 关闭。
     */
    String enforceAmericanEnglish(String voice) {
        if (!forceAmericanEnglish || voice == null || voice.isBlank()) {
            return voice;
        }
        String normalized = voice.trim();
        if (normalized.toLowerCase(Locale.ROOT).startsWith("en-")) {
            return AMERICAN_ENGLISH_VOICE;
        }
        return normalized;
    }

    private String formatRatePercent(double rate) {
        int percent = (int) Math.round((sanitizeRate(rate) - 1.0) * 100.0);
        return String.format(Locale.ROOT, "%+d%%", percent);
    }

    @PostMapping("/stt")
    public Result<?> transcribeSpeech(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error("未检测到音频文件");
        }

        if (aiApiKey == null || aiApiKey.trim().isEmpty()) {
            return Result.error("语音转写未配置 AI API Key");
        }

        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        String format = detectRecognitionFormat(originalFilename, contentType);

        if (format == null) {
            log.warn("STT request rejected due to unsupported audio format: filename={}, contentType={}",
                    originalFilename, contentType);
            return Result.error("当前录音格式暂不支持自动转写，请改用 Chrome/Edge 或重新录音后重试。");
        }

        Path tempFile = null;
        try {
            tempFile = createTempAudioFile(file, format);
            String transcript = transcribeWithDashScope(tempFile, format);
            if (transcript == null || transcript.trim().isEmpty()) {
                return Result.error("未识别到有效语音，请靠近麦克风后重试。");
            }

            log.info("STT success: filename={}, contentType={}, format={}, transcriptLength={}",
                    originalFilename, contentType, format, transcript.trim().length());
            return Result.success("转写成功", transcript.trim());
        } catch (Exception e) {
            log.error("STT failed: filename={}, contentType={}, format={}", originalFilename, contentType, format, e);
            return Result.error("语音转写失败，请重试。");
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException ignored) {
                }
            }
        }
    }

    private Path createTempAudioFile(MultipartFile file, String format) throws IOException {
        String suffix = switch (format) {
            case "wav" -> ".wav";
            case "mp3" -> ".mp3";
            case "aac" -> ".aac";
            case "m4a" -> ".m4a";
            case "mp4" -> ".mp4";
            case "ogg" -> ".ogg";
            case "opus" -> ".opus";
            case "webm" -> ".webm";
            case "amr" -> ".amr";
            default -> ".audio";
        };

        Path tempFile = Files.createTempFile("learnsphere-stt-", suffix);
        Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
        return tempFile;
    }

    private String transcribeWithDashScope(Path audioPath, String format) {
        List<Integer> sampleRates = preferredSampleRates(format);
        RuntimeException lastError = null;
        String recognitionModel = resolveRecognitionModel(format);

        for (Integer sampleRate : sampleRates) {
            try {
                Recognition recognizer = new Recognition();
                RecognitionParam param = RecognitionParam.builder()
                        .apiKey(aiApiKey)
                        .model(recognitionModel)
                        .format(format)
                        .sampleRate(sampleRate)
                        .parameter("language_hints", List.of("zh", "en"))
                        .disfluencyRemovalEnabled(true)
                        .build();

                String response = recognizer.call(param, audioPath.toFile());
                String transcript = extractTranscript(response);
                if (transcript != null && !transcript.trim().isEmpty()) {
                    log.info("STT recognized audio with sampleRate={}, format={}, model={}, transcriptLength={}",
                            sampleRate, format, recognitionModel, transcript.trim().length());
                    return transcript;
                }
                log.info("STT returned empty transcript with sampleRate={}, format={}, model={}, rawResponse={}",
                        sampleRate, format, recognitionModel, abbreviateResponse(response));
            } catch (Exception e) {
                lastError = new RuntimeException(
                        String.format(Locale.ROOT, "sampleRate=%d, format=%s, model=%s",
                                sampleRate, format, recognitionModel), e);
                log.warn("STT retry failed for sampleRate={}, format={}, model={}: {}",
                        sampleRate, format, recognitionModel, e.getMessage());
            }
        }

        if (lastError != null) {
            throw lastError;
        }
        return null;
    }

    private List<Integer> preferredSampleRates(String format) {
        List<Integer> sampleRates = new ArrayList<>();
        if ("aac".equals(format) || "m4a".equals(format) || "mp4".equals(format)
                || "ogg".equals(format) || "opus".equals(format) || "webm".equals(format)) {
            sampleRates.add(48000);
            sampleRates.add(44100);
            sampleRates.add(16000);
        } else {
            sampleRates.add(16000);
            sampleRates.add(44100);
            sampleRates.add(48000);
        }
        sampleRates.add(8000);
        return sampleRates;
    }

    private String detectRecognitionFormat(String filename, String contentType) {
        String normalizedContentType = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
        String normalizedFilename = filename == null ? "" : filename.toLowerCase(Locale.ROOT);

        if (normalizedContentType.contains("m4a") || normalizedFilename.endsWith(".m4a")) {
            return "m4a";
        }
        if (normalizedContentType.contains("mp4") || normalizedFilename.endsWith(".mp4")) {
            return "mp4";
        }
        if (normalizedContentType.contains("ogg") || normalizedFilename.endsWith(".ogg")) {
            return "ogg";
        }
        if (normalizedContentType.contains("opus") || normalizedFilename.endsWith(".opus")) {
            return "opus";
        }
        if (normalizedContentType.contains("webm") || normalizedFilename.endsWith(".webm")) {
            return "webm";
        }
        if (normalizedContentType.contains("wav") || normalizedFilename.endsWith(".wav")) {
            return "wav";
        }
        if (normalizedContentType.contains("mpeg") || normalizedFilename.endsWith(".mp3")) {
            return "mp3";
        }
        if (normalizedContentType.contains("aac") || normalizedFilename.endsWith(".aac")) {
            return "aac";
        }
        if (normalizedContentType.contains("amr") || normalizedFilename.endsWith(".amr")) {
            return "amr";
        }

        return null;
    }

    private String resolveRecognitionModel(String format) {
        if (("mp4".equals(format) || "m4a".equals(format) || "webm".equals(format) || "ogg".equals(format))
                && "paraformer-realtime-v2".equalsIgnoreCase(speechRecognitionModel)) {
            return "paraformer-v2";
        }
        return speechRecognitionModel;
    }

    private String extractTranscript(String response) {
        if (response == null || response.trim().isEmpty()) {
            return null;
        }

        String trimmed = response.trim();
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            return trimmed;
        }

        try {
            Object parsed = JSONUtil.parse(trimmed);
            List<String> fragments = new ArrayList<>();
            collectTranscriptFragments(parsed, fragments);
            String transcript = fragments.stream()
                    .map(String::trim)
                    .filter(fragment -> !fragment.isEmpty())
                    .reduce((left, right) -> left + " " + right)
                    .orElse("")
                    .replaceAll("\\s+", " ")
                    .trim();
            return transcript.isEmpty() ? null : transcript;
        } catch (Exception e) {
            log.warn("Failed to parse DashScope STT response as JSON, falling back to raw text: {}", e.getMessage());
            return trimmed;
        }
    }

    private void collectTranscriptFragments(Object node, List<String> fragments) {
        if (node == null) {
            return;
        }

        if (node instanceof JSONArray array) {
            for (Object item : array) {
                collectTranscriptFragments(item, fragments);
            }
            return;
        }

        if (node instanceof JSONObject object) {
            appendTextIfPresent(object, fragments, "text");
            appendTextIfPresent(object, fragments, "transcript");
            appendTextIfPresent(object, fragments, "sentence");
            appendTextIfPresent(object, fragments, "sentence_text");

            for (String key : List.of("sentences", "segments", "result", "output", "data")) {
                if (object.containsKey(key)) {
                    collectTranscriptFragments(object.get(key), fragments);
                }
            }
            return;
        }

        if (node instanceof CharSequence text) {
            String value = text.toString().trim();
            if (!value.isEmpty()) {
                fragments.add(value);
            }
        }
    }

    private void appendTextIfPresent(JSONObject object, List<String> fragments, String key) {
        Object value = object.get(key);
        if (value instanceof CharSequence text) {
            String normalized = text.toString().trim();
            if (!normalized.isEmpty()) {
                fragments.add(normalized);
            }
        }
    }

    private String abbreviateResponse(String response) {
        if (response == null) {
            return "null";
        }
        String trimmed = response.replaceAll("\\s+", " ").trim();
        if (trimmed.length() <= 200) {
            return trimmed;
        }
        return trimmed.substring(0, 200) + "...";
    }

    @Data
    public static class TTSRequest {
        private String text;
        private String voice = "en-US-JennyNeural";
        private double rate = 1.0;
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
