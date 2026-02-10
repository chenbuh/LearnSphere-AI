package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.CheckSensitive;
import com.learnsphere.service.IAIGenerationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI 生成接口", description = "提供阅读、写作、听力、语法等 AI 内容生成与评估功能")
public class AIGenerationController {

    private final IAIGenerationService aiGenerationService;
    private final com.learnsphere.service.IUserLogService userLogService;
    private final com.learnsphere.service.IUserService userService;

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @Operation(summary = "生成阅读文章")
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
            result.put("logId", aiGenerationService.getLastLogId());
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
            result.put("logId", aiGenerationService.getLastLogId());
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
        result.put("logId", aiGenerationService.getLastLogId());
        com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
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
            result.put("logId", aiGenerationService.getLastLogId());
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
            result.put("logId", aiGenerationService.getLastLogId());
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
            result.put("logId", aiGenerationService.getLastLogId());
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
    @CheckSensitive(fields = { "transcription" })
    @PostMapping("/evaluate/speaking")
    public Result<Map<String, Object>> evaluateSpeaking(@RequestBody EvaluateSpeakingRequest request) {
        Map<String, Object> result = aiGenerationService.evaluateSpeaking(
                request.getTopic(),
                request.getTranscription());
        result.put("logId", aiGenerationService.getLastLogId());
        com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @GetMapping("/vocab/detail")
    public Result<Map<String, Object>> generateVocabularyDetails(@RequestParam String word,
            @RequestParam(defaultValue = "cet4") String examType) {
        Map<String, Object> result = aiGenerationService.generateVocabularyDetails(word, examType);
        result.put("logId", aiGenerationService.getLastLogId());
        com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/analyze-error/{id}")
    public Result<Map<String, Object>> deepAnalyzeError(@PathVariable Long id) {
        Map<String, Object> result = aiGenerationService.deepAnalyzeError(id);
        result.put("logId", aiGenerationService.getLastLogId());
        com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 3)
    @PostMapping("/speaking-mock/start")
    public Result<Map<String, Object>> startSpeakingMock(@RequestBody Map<String, String> params) {
        Map<String, Object> result = aiGenerationService.startSpeakingMock(params.get("topic"),
                params.get("difficulty"));
        result.put("logId", aiGenerationService.getLastLogId());
        com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 20)
    @CheckSensitive(fields = { "transcription" })
    @PostMapping("/speaking-mock/continue")
    public Result<Map<String, Object>> continueSpeakingMock(@RequestBody Map<String, String> params) {
        Map<String, Object> result = aiGenerationService.continueSpeakingMock(params.get("sessionId"),
                params.get("transcription"));
        result.put("logId", aiGenerationService.getLastLogId());
        com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/speaking-mock/report")
    public Result<Map<String, Object>> generateSpeakingReport(@RequestBody List<Map<String, String>> conversation) {
        Map<String, Object> result = aiGenerationService.generateSpeakingReport(conversation);
        result.put("logId", aiGenerationService.getLastLogId());
        com.learnsphere.utils.ContentSecurityUtil.encryptPayload(result);
        return Result.success(result);
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
    @Schema(description = "生成阅读请求")
    public static class GenerateReadingRequest {
        @Schema(description = "来源")
        private String source;
        @Schema(description = "分类")
        private String category;
        @Schema(description = "难度 (easy/medium/hard)")
        private String difficulty;
        @Schema(description = "字数范围")
        private String length;
    }

    @Data
    @Schema(description = "生成写作请求")
    public static class GenerateWritingRequest {
        @Schema(description = "考试类型")
        private String examType;
        @Schema(description = "模式")
        private String mode;
    }

    @Data
    @Schema(description = "评估写作请求")
    public static class EvaluateWritingRequest {
        @Schema(description = "题目")
        private String topic;
        @Schema(description = "提交的内容")
        private String content;
    }

    @Data
    @Schema(description = "生成听力请求")
    public static class GenerateListeningRequest {
        @Schema(description = "类型")
        private String type;
        @Schema(description = "难度")
        private String difficulty;
        @Schema(description = "篇章数量")
        private Integer count;
    }

    @Data
    @Schema(description = "生成语法请求")
    public static class GenerateGrammarRequest {
        @Schema(description = "主题")
        private String topic;
        @Schema(description = "难度")
        private String difficulty;
    }

    @Data
    @Schema(description = "生成口语请求")
    public static class GenerateSpeakingRequest {
        @Schema(description = "类型")
        private String type;
        @Schema(description = "难度")
        private String difficulty;
    }

    @Data
    @Schema(description = "评估口语请求")
    public static class EvaluateSpeakingRequest {
        @Schema(description = "题目")
        private String topic;
        @Schema(description = "转录文本")
        private String transcription;
    }
}
