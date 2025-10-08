package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.service.IAIGenerationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIGenerationController {

    private final IAIGenerationService aiGenerationService;

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/reading")
    public Result<Map<String, Object>> generateReading(@RequestBody GenerateReadingRequest request) {
        Map<String, Object> result = aiGenerationService.generateReading(
                request.getSource(),
                request.getCategory(),
                request.getDifficulty(),
                request.getLength());
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/writing")
    public Result<Map<String, Object>> generateWriting(@RequestBody GenerateWritingRequest request) {
        Map<String, Object> result = aiGenerationService.generateWriting(
                request.getExamType(),
                request.getMode());
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @PostMapping("/evaluate/writing")
    public Result<Map<String, Object>> evaluateWriting(@RequestBody EvaluateWritingRequest request) {
        Map<String, Object> result = aiGenerationService.evaluateWriting(
                request.getTopic(),
                request.getContent());
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/listening")
    public Result<Map<String, Object>> generateListening(@RequestBody GenerateListeningRequest request) {
        Map<String, Object> result = aiGenerationService.generateListening(
                request.getType(),
                request.getDifficulty());
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/grammar")
    public Result<Map<String, Object>> generateGrammar(@RequestBody GenerateGrammarRequest request) {
        Map<String, Object> result = aiGenerationService.generateGrammar(
                request.getTopic(),
                request.getDifficulty());
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @PostMapping("/generate/speaking")
    public Result<Map<String, Object>> generateSpeaking(@RequestBody GenerateSpeakingRequest request) {
        Map<String, Object> result = aiGenerationService.generateSpeaking(
                request.getType(),
                request.getDifficulty());
        return Result.success(result);
    }

    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @PostMapping("/evaluate/speaking")
    public Result<Map<String, Object>> evaluateSpeaking(@RequestBody EvaluateSpeakingRequest request) {
        Map<String, Object> result = aiGenerationService.evaluateSpeaking(
                request.getTopic(),
                request.getTranscription());
        return Result.success(result);
    }

    @GetMapping("/reading/history")
    public Result<List<Map<String, Object>>> getReadingHistory() {
        return Result.success(aiGenerationService.getRecentReadings());
    }

    @GetMapping("/listening/history")
    public Result<List<Map<String, Object>>> getListeningHistory() {
        return Result.success(aiGenerationService.getRecentListenings());
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
