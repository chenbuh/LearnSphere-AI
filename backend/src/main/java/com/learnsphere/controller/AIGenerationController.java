package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.CheckSensitive;
import com.learnsphere.service.IAIGenerationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIGenerationController {

    private final IAIGenerationService aiGenerationService;
    private final com.learnsphere.service.IUserLogService userLogService;
    private final com.learnsphere.service.IUserService userService;

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/reading")
    public Result<Map<String, Object>> generateReading(@RequestBody GenerateReadingRequest request,
            jakarta.servlet.http.HttpServletRequest httpServletRequest) {
        Long userId = cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong();
        com.learnsphere.entity.User user = userService.getById(userId);
        try {
            Map<String, Object> result = aiGenerationService.generateReading(
                    request.getSource(),
                    request.getCategory(),
                    request.getDifficulty(),
                    request.getLength());
            com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
            userLogService.logSuccess(userId, user.getUsername(), "reading", "generate",
                    "生成阅读文章: " + request.getCategory() + " (" + request.getDifficulty() + ")", httpServletRequest);
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", request.getDifficulty());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("reading", criteria);
            fallback.put("_from", "local");
            userLogService.logSuccess(userId, user.getUsername(), "reading", "generate_fallback",
                    "本地库加载阅读文章: " + request.getDifficulty(), httpServletRequest);
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/writing")
    public Result<Map<String, Object>> generateWriting(@RequestBody GenerateWritingRequest request,
            jakarta.servlet.http.HttpServletRequest httpServletRequest) {
        Long userId = cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong();
        com.learnsphere.entity.User user = userService.getById(userId);
        try {
            Map<String, Object> result = aiGenerationService.generateWriting(
                    request.getExamType(),
                    request.getMode());
            com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
            userLogService.logSuccess(userId, user.getUsername(), "writing", "generate",
                    "生成写作题目: " + request.getExamType(), httpServletRequest);
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("examType", request.getExamType());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("writing", criteria);
            fallback.put("_from", "local");
            userLogService.logSuccess(userId, user.getUsername(), "writing", "generate_fallback",
                    "本地库加载写作题目: " + request.getExamType(), httpServletRequest);
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @CheckSensitive(fields = { "content" })
    @PostMapping("/evaluate/writing")
    public Result<Map<String, Object>> evaluateWriting(@RequestBody EvaluateWritingRequest request,
            jakarta.servlet.http.HttpServletRequest httpServletRequest) {
        Long userId = cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong();
        com.learnsphere.entity.User user = userService.getById(userId);
        Map<String, Object> result = aiGenerationService.evaluateWriting(
                request.getTopic(),
                request.getContent());
        userLogService.logSuccess(userId, user.getUsername(), "writing", "evaluate", "评估写作: " + request.getTopic(),
                httpServletRequest);
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/listening")
    public Result<Map<String, Object>> generateListening(@RequestBody GenerateListeningRequest request) {
        try {
            Map<String, Object> result = aiGenerationService.generateListening(
                    request.getType(),
                    request.getDifficulty(),
                    request.getCount());
            com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", request.getDifficulty());
            criteria.put("type", request.getType()); // Also adding type for better DB matching
            criteria.put("count", request.getCount());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("listening", criteria);
            fallback.put("_from", "local");
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/grammar")
    public Result<Map<String, Object>> generateGrammar(@RequestBody GenerateGrammarRequest request) {
        try {
            Map<String, Object> result = aiGenerationService.generateGrammar(
                    request.getTopic(),
                    request.getDifficulty());
            com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", request.getDifficulty());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("grammar", criteria);
            fallback.put("_from", "local");
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/speaking")
    public Result<Map<String, Object>> generateSpeaking(@RequestBody GenerateSpeakingRequest request) {
        try {
            Map<String, Object> result = aiGenerationService.generateSpeaking(
                    request.getType(),
                    request.getDifficulty());
            com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", request.getDifficulty());
            criteria.put("type", request.getType());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("speaking", criteria);
            fallback.put("_from", "local");
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @PostMapping("/evaluate/speaking")
    public Result<Map<String, Object>> evaluateSpeaking(@RequestBody EvaluateSpeakingRequest request) {
        Map<String, Object> result = aiGenerationService.evaluateSpeaking(
                request.getTopic(),
                request.getTranscription());
        com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
        return Result.success(result);
    }

    @PostMapping("/analyze-error/{id}")
    public Result<Map<String, Object>> deepAnalyzeError(@PathVariable Long id) {
        return Result.success(aiGenerationService.deepAnalyzeError(id));
    }

    @PostMapping("/speaking-mock/start")
    public Result<Map<String, Object>> startSpeakingMock(@RequestBody Map<String, String> params) {
        return Result.success(aiGenerationService.startSpeakingMock(params.get("topic"), params.get("difficulty")));
    }

    @PostMapping("/speaking-mock/continue")
    public Result<Map<String, Object>> continueSpeakingMock(@RequestBody Map<String, String> params) {
        return Result.success(
                aiGenerationService.continueSpeakingMock(params.get("sessionId"), params.get("transcription")));
    }

    @PostMapping("/speaking-mock/report")
    public Result<Map<String, Object>> generateSpeakingReport(@RequestBody List<Map<String, String>> conversation) {
        return Result.success(aiGenerationService.generateSpeakingReport(conversation));
    }

    @GetMapping("/reading/history")
    public Result<Map<String, Object>> getReadingHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(aiGenerationService.getRecentReadings(page, size));
    }

    @GetMapping("/listening/history")
    public Result<Map<String, Object>> getListeningHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(aiGenerationService.getRecentListenings(page, size));
    }

    @GetMapping("/grammar/history")
    public Result<Map<String, Object>> getGrammarHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(aiGenerationService.getRecentGrammars(page, size));
    }

    @GetMapping("/speaking/history")
    public Result<Map<String, Object>> getSpeakingHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(aiGenerationService.getRecentSpeakings(page, size));
    }

    @GetMapping("/writing/history")
    public Result<Map<String, Object>> getWritingHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(aiGenerationService.getRecentWritings(page, size));
    }

    @Data
    public static class GenerateReadingRequest {
        private String source;
        private String category;
        private String difficulty;
        private String length;
    }

    @Data
    public static class GenerateWritingRequest {
        private String examType;
        private String mode;
    }

    @Data
    public static class EvaluateWritingRequest {
        private String topic;
        private String content;
    }

    @Data
    public static class GenerateListeningRequest {
        private String type;
        private String difficulty;
        private Integer count; // 篇章数量
    }

    @Data
    public static class GenerateGrammarRequest {
        private String topic;
        private String difficulty;
    }

    @Data
    public static class GenerateSpeakingRequest {
        private String type;
        private String difficulty;
    }

    @Data
    public static class EvaluateSpeakingRequest {
        private String topic;
        private String transcription;
    }
}
