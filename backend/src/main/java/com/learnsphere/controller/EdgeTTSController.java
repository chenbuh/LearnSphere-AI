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
            byte[] audioData = EdgeTTSClient.synthesize(text, voice, formatRatePercent(rate));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
            headers.setContentLength(audioData.length);
            headers.set("Cache-Control", "public, max-age=604800");

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

    private double sanitizeRate(double rate) {
        if (Double.isNaN(rate) || Double.isInfinite(rate)) {
            return 1.0;
        }
        return Math.max(0.5, Math.min(2.0, rate));
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
