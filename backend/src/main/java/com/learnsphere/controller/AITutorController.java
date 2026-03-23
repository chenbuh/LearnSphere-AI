package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.UserOperation;
import com.learnsphere.entity.AITutorConversation;
import com.learnsphere.entity.KnowledgeGraph;
import com.learnsphere.entity.UserWeakness;
import com.learnsphere.service.IAITutorService;
import com.learnsphere.common.annotation.RequireVip;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * AI Tutor 智能会话控制器
 * 
 * @author LearnSphere Team
 * @since 2.5.0
 */
@Slf4j
@RestController
@RequestMapping("/api/ai/tutor")
@RequiredArgsConstructor
@Tag(name = "AI 助教接口", description = "提供智能对话、学习建议、知识点分析等功能")
public class AITutorController {

    private final IAITutorService aiTutorService;

    /**
     * AI Tutor 对话接口
     * 用于回答用户关于题目的疑问
     */
    @RequireVip(feature = "AI 助教提问", checkQuota = true, minLevel = 0)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @com.learnsphere.common.annotation.CheckSensitive(fields = { "question" })
    @Operation(summary = "无状态对话", description = "单次提问，不保存历史记录")
    @UserOperation(module = "ai_tutor", action = "chat", description = "AI 助教单轮提问", detailKeys = {
            "request.context.topic", "request.context.module" })
    @PostMapping("/chat")
    public Result<Map<String, Object>> chat(@RequestBody Map<String, Object> request) {
        try {
            String question = (String) request.get("question");
            @SuppressWarnings("unchecked")
            Map<String, Object> context = (Map<String, Object>) request.get("context");

            if (question == null || question.trim().isEmpty()) {
                return Result.error("问题不能为空");
            }

            // 调用 AI Tutor 服务
            String answer = aiTutorService.chat(question, context);

            Map<String, Object> response = Map.of(
                    "answer", answer,
                    "timestamp", System.currentTimeMillis());

            return Result.success(response);
        } catch (Exception e) {
            log.error("AI Tutor chat failed", e);
            return Result.error("AI 助手暂时不可用，请稍后再试");
        }
    }

    /**
     * AI Tutor 对话接口（带历史记录）
     * 保存对话历史到数据库
     */
    @RequireVip(feature = "AI 助教提问", checkQuota = true, minLevel = 0)
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 10)
    @com.learnsphere.common.annotation.CheckSensitive(fields = { "question" })
    @Operation(summary = "有状态对话", description = "保存对话历史，支持多轮对话")
    @UserOperation(module = "ai_tutor", action = "chat", description = "AI 助教多轮对话", detailKeys = {
            "request.sessionId", "request.context.topic", "request.context.module" })
    @PostMapping("/chat/history")
    public Result<Map<String, Object>> chatWithHistory(@RequestBody Map<String, Object> request) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            String sessionId = (String) request.get("sessionId");
            String question = (String) request.get("question");
            @SuppressWarnings("unchecked")
            Map<String, Object> context = (Map<String, Object>) request.get("context");

            // 如果没有 sessionId,生成一个新的
            if (sessionId == null || sessionId.isEmpty()) {
                sessionId = UUID.randomUUID().toString();
            }

            if (question == null || question.trim().isEmpty()) {
                return Result.error("问题不能为空");
            }

            // 调用带历史的对话服务
            String answer = aiTutorService.chatWithHistory(userId, sessionId, question, context);

            Map<String, Object> response = Map.of(
                    "answer", answer,
                    "sessionId", sessionId,
                    "timestamp", System.currentTimeMillis());

            return Result.success(response);
        } catch (Exception e) {
            log.error("AI Tutor chat with history failed", e);
            return Result.error("AI 助手暂时不可用，请稍后再试");
        }
    }

    /**
     * 获取对话历史
     */
    @UserOperation(module = "ai_tutor", action = "view_history", description = "查看 AI 助教会话历史", detailKeys = {
            "sessionId" })
    @GetMapping("/history/{sessionId}")
    public Result<List<AITutorConversation>> getHistory(@PathVariable String sessionId) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            List<AITutorConversation> history = aiTutorService.getConversationHistory(userId, sessionId);
            return Result.success(history);
        } catch (Exception e) {
            log.error("Get conversation history failed", e);
            return Result.error("获取对话历史失败");
        }
    }

    /**
     * 获取用户薄弱知识点
     */
    @UserOperation(module = "ai_tutor", action = "view_weaknesses", description = "查看薄弱知识点", detailKeys = {
            "needsReview" })
    @GetMapping("/weaknesses")
    public Result<List<UserWeakness>> getUserWeaknesses(
            @RequestParam(required = false) Boolean needsReview) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            List<UserWeakness> weaknesses = aiTutorService.getUserWeaknesses(userId, needsReview);
            return Result.success(weaknesses);
        } catch (Exception e) {
            log.error("Get user weaknesses failed", e);
            return Result.error("获取薄弱知识点失败");
        }
    }

    /**
     * 获取个性化复习建议
     */
    @UserOperation(module = "ai_tutor", action = "review_suggestions", description = "查看复习建议", detailKeys = {
            "limit" })
    @GetMapping("/review-suggestions")
    public Result<List<UserWeakness>> getReviewSuggestions(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            List<UserWeakness> suggestions = aiTutorService.getReviewSuggestions(userId, limit);
            return Result.success(suggestions);
        } catch (Exception e) {
            log.error("Get review suggestions failed", e);
            return Result.error("获取复习建议失败");
        }
    }

    /**
     * 记录答题情况
     */
    @UserOperation(module = "ai_tutor", action = "record_practice", description = "记录练习结果", detailKeys = {
            "request.topic", "request.category", "request.isCorrect" })
    @PostMapping("/record-practice")
    public Result<Void> recordPractice(@RequestBody Map<String, Object> request) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            String topic = (String) request.get("topic");
            String category = (String) request.get("category");
            Boolean isCorrect = (Boolean) request.get("isCorrect");

            if (topic == null || category == null || isCorrect == null) {
                return Result.error("参数不完整");
            }

            aiTutorService.recordPractice(userId, topic, category, isCorrect);
            return Result.success(null);
        } catch (Exception e) {
            log.error("Record practice failed", e);
            return Result.error("记录答题情况失败");
        }
    }

    /**
     * 获取相关知识点推荐
     */
    @UserOperation(module = "ai_tutor", action = "related_topics", description = "查看相关知识点", detailKeys = {
            "topic" })
    @GetMapping("/related-topics")
    public Result<List<KnowledgeGraph>> getRelatedTopics(@RequestParam String topic) {
        try {
            List<KnowledgeGraph> relatedTopics = aiTutorService.getRelatedTopics(topic);
            return Result.success(relatedTopics);
        } catch (Exception e) {
            log.error("Get related topics failed", e);
            return Result.error("获取相关知识点失败");
        }
    }

    /**
     * 为用户生成学习建议
     */
    @com.learnsphere.common.annotation.RateLimit(time = 60, count = 5)
    @UserOperation(module = "ai_tutor", action = "learning_advice", description = "生成学习建议", detailKeys = {
            "topic" })
    @GetMapping("/learning-advice")
    public Result<String> getLearningAdvice(@RequestParam String topic) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            String advice = aiTutorService.generateLearningAdvice(userId, topic);
            return Result.success(advice);
        } catch (Exception e) {
            log.error("Generate learning advice failed", e);
            return Result.error("生成学习建议失败");
        }
    }
}
