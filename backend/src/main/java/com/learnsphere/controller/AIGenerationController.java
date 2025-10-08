package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.RequireVip;
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

    @com.learnsphere.common.annotation.RequireVip(feature = "AI 阅读理解生成", quotaCost = 1)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/reading")
    public Result<Map<String, Object>> generateReading(@RequestBody GenerateReadingRequest request) {
        try {
            Map<String, Object> result = aiGenerationService.generateReading(
                    request.getSource(),
                    request.getCategory(),
                    request.getDifficulty(),
                    request.getLength());
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", request.getDifficulty());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("reading", criteria);
            fallback.put("_from", "local");
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RequireVip(feature = "AI 写作题目生成", quotaCost = 1)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/writing")
    public Result<Map<String, Object>> generateWriting(@RequestBody GenerateWritingRequest request) {
        try {
            Map<String, Object> result = aiGenerationService.generateWriting(
                    request.getExamType(),
                    request.getMode());
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("examType", request.getExamType());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("writing", criteria);
            fallback.put("_from", "local");
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RequireVip(feature = "AI 写作批改", quotaCost = 2)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @PostMapping("/evaluate/writing")
    public Result<Map<String, Object>> evaluateWriting(@RequestBody EvaluateWritingRequest request) {
        Map<String, Object> result = aiGenerationService.evaluateWriting(
                request.getTopic(),
                request.getContent());
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RequireVip(feature = "AI 听力生成", quotaCost = 1)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/listening")
    public Result<Map<String, Object>> generateListening(@RequestBody GenerateListeningRequest request) {
        try {
            Map<String, Object> result = aiGenerationService.generateListening(
                    request.getType(),
                    request.getDifficulty(),
                    request.getCount());
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", request.getDifficulty());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("listening", criteria);
            fallback.put("_from", "local");
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RequireVip(feature = "AI 语法生成", quotaCost = 1)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/grammar")
    public Result<Map<String, Object>> generateGrammar(@RequestBody GenerateGrammarRequest request) {
        try {
            Map<String, Object> result = aiGenerationService.generateGrammar(
                    request.getTopic(),
                    request.getDifficulty());
            return Result.success(result);
        } catch (com.learnsphere.exception.QuotaExceededException e) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", request.getDifficulty());
            Map<String, Object> fallback = aiGenerationService.generateFromLocal("grammar", criteria);
            fallback.put("_from", "local");
            return Result.success(fallback);
        }
    }

    @com.learnsphere.common.annotation.RequireVip(feature = "AI 口语生成", quotaCost = 1)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/speaking")
    public Result<Map<String, Object>> generateSpeaking(@RequestBody GenerateSpeakingRequest request) {
        try {
            Map<String, Object> result = aiGenerationService.generateSpeaking(
                    request.getType(),
                    request.getDifficulty());
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

    @com.learnsphere.common.annotation.RequireVip(feature = "AI 口语评测", quotaCost = 2)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @PostMapping("/evaluate/speaking")
    public Result<Map<String, Object>> evaluateSpeaking(@RequestBody EvaluateSpeakingRequest request) {
        Map<String, Object> result = aiGenerationService.evaluateSpeaking(
                request.getTopic(),
                request.getTranscription());
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RequireVip(feature = "AI 错题深度分析", quotaCost = 1)
    @PostMapping("/analyze-error/{id}")
    public Result<Map<String, Object>> deepAnalyzeError(@PathVariable Long id) {
        return Result.success(aiGenerationService.deepAnalyzeError(id));
    }

    @RequireVip(feature = "AI 口语1V1模考", quotaCost = 3)
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
