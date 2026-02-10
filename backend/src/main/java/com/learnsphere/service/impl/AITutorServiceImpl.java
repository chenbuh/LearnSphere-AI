package com.learnsphere.service.impl;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnsphere.entity.AITutorConversation;
import com.learnsphere.entity.KnowledgeGraph;
import com.learnsphere.entity.UserWeakness;
import com.learnsphere.mapper.AITutorConversationMapper;
import com.learnsphere.mapper.KnowledgeGraphMapper;
import com.learnsphere.mapper.UserWeaknessMapper;
import com.learnsphere.service.IAITutorService;
import com.learnsphere.service.AIContentFeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * AI Tutor 服务实现
 * 
 * @author LearnSphere Team
 * @since 2.5.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AITutorServiceImpl implements IAITutorService {

    @Value("${ai.api-key:}")
    private String apiKey;

    @Value("${ai.model:qwen-plus}")
    private String modelName;

    private final AITutorConversationMapper conversationMapper;
    private final UserWeaknessMapper userWeaknessMapper;
    private final KnowledgeGraphMapper knowledgeGraphMapper;
    private final com.learnsphere.service.ISystemPromptService systemPromptService;
    private final ObjectMapper objectMapper;
    private final io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry circuitBreakerRegistry;
    private final io.github.resilience4j.retry.RetryRegistry retryRegistry;
    private final io.github.resilience4j.bulkhead.BulkheadRegistry bulkheadRegistry;
    private final com.learnsphere.util.CacheUtil cacheUtil;
    private final AIContentFeedbackService feedbackService;

    @Override
    public String chat(String question, Map<String, Object> context) {
        return chatWithMessages(question, context, new ArrayList<>());
    }

    private String chatWithMessages(String question, Map<String, Object> context, List<AITutorConversation> history) {
        try {
            // 构建系统提示词
            String systemPromptText = systemPromptService.getPromptTemplate(
                    "AI_TUTOR_SYSTEM",
                    "你是一个专业的英语学习助手，擅长用通俗易懂的方式解释语法知识。你的任务是帮助学生理解他们在做题过程中遇到的问题。",
                    "AI 助教-系统提示词");

            String contextualPrompt = buildSystemPrompt(context, systemPromptText);

            // 加入 Few-shot 示例（自动化持续学习）
            String fewShot = feedbackService.getFewShotExamples("AI_TUTOR_CHAT");
            if (!fewShot.isEmpty()) {
                contextualPrompt += fewShot;
            }

            // 构建消息列表
            List<Message> messages = new ArrayList<>();
            messages.add(Message.builder()
                    .role(Role.SYSTEM.getValue())
                    .content(contextualPrompt)
                    .build());

            // 添加历史消息（最多最近 5 轮以节省 Token/防止越界）
            if (history != null && !history.isEmpty()) {
                int start = Math.max(0, history.size() - 10); // 5轮对话 = 10条消息
                for (int i = start; i < history.size(); i++) {
                    AITutorConversation msg = history.get(i);
                    messages.add(Message.builder()
                            .role(msg.getRole().equalsIgnoreCase("user") ? Role.USER.getValue()
                                    : Role.ASSISTANT.getValue())
                            .content(msg.getContent())
                            .build());
                }
            }

            messages.add(Message.builder()
                    .role(Role.USER.getValue())
                    .content(question)
                    .build());

            // 效能优化：对话缓存 (Cost Control)
            String cacheKey = "ai:tutor:cache:" + cn.hutool.crypto.digest.DigestUtil.md5Hex(messages.toString());
            String cachedResponse = cacheUtil.getOrCompute(cacheKey, () -> null, 2,
                    java.util.concurrent.TimeUnit.HOURS);
            if (cachedResponse != null) {
                log.info("AI 助教结果缓存命中 (Cost Saved)");
                return cachedResponse;
            }

            // 稳定性保护：Bulkhead -> CircuitBreaker -> Retry
            io.github.resilience4j.bulkhead.Bulkhead bulkhead = bulkheadRegistry.bulkhead("fastTask");
            io.github.resilience4j.circuitbreaker.CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("aiTutor");
            io.github.resilience4j.retry.Retry retry = retryRegistry.retry("aiTutor");

            GenerationResult result;
            try {
                result = io.github.resilience4j.retry.Retry.decorateSupplier(retry,
                        io.github.resilience4j.circuitbreaker.CircuitBreaker.decorateSupplier(cb,
                                io.github.resilience4j.bulkhead.Bulkhead.decorateSupplier(bulkhead, () -> {
                                    try {
                                        Generation gen = new Generation();
                                        GenerationParam param = GenerationParam.builder()
                                                .apiKey(apiKey)
                                                .model(modelName)
                                                .messages(messages)
                                                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                                                .build();
                                        return gen.call(param);
                                    } catch (Exception e) {
                                        throw new RuntimeException(e);
                                    }
                                })))
                        .get();
            } catch (Exception e) {
                log.warn("AI 助教主服务异常，尝试容灾对冲: {}", e.getMessage());
                // 容灾对冲: 切换到备用模型
                String fallbackModel = modelName.contains("plus") ? "qwen-turbo" : "qwen-plus";
                try {
                    Generation gen = new Generation();
                    GenerationParam param = GenerationParam.builder()
                            .apiKey(apiKey)
                            .model(fallbackModel)
                            .messages(messages)
                            .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                            .build();
                    result = gen.call(param);
                } catch (Exception fatal) {
                    log.error("AI 助教服务全链路崩溃: {}", fatal.getMessage());
                    throw new RuntimeException("AI 助教暂时休息了，请稍后再来问我吧", fatal);
                }
            }

            if (result != null && result.getOutput() != null && result.getOutput().getChoices() != null) {
                String response = result.getOutput().getChoices().get(0).getMessage().getContent();
                // 写入缓存 (Cost Control)
                if (response != null) {
                    cacheUtil.getOrCompute(cacheKey, () -> response, 2, java.util.concurrent.TimeUnit.HOURS);
                }
                return response;
            }

            return "抱歉，我暂时无法回答这个问题。";
        } catch (Exception e) {
            log.error("AI Tutor chat error", e);
            return "抱歉，我遇到了一些问题。请稍后再试。";
        }
    }

    @Override
    @Transactional
    public String chatWithHistory(Long userId, String sessionId, String question, Map<String, Object> context) {
        // 保存用户消息
        AITutorConversation userMessage = new AITutorConversation();
        userMessage.setUserId(userId);
        userMessage.setSessionId(sessionId);
        userMessage.setRole("user");
        userMessage.setContent(question);
        try {
            userMessage.setContextInfo(context != null ? objectMapper.writeValueAsString(context) : null);
        } catch (Exception e) {
            log.warn("Failed to serialize context", e);
            userMessage.setContextInfo(null);
        }
        userMessage.setTopic(context != null ? (String) context.get("topic") : null);
        conversationMapper.insert(userMessage);

        // 获取历史记录
        List<AITutorConversation> history = getConversationHistory(userId, sessionId);

        // 获取 AI 回答
        String answer = chatWithMessages(question, context, history);

        // 保存 AI 回答
        AITutorConversation aiMessage = new AITutorConversation();
        aiMessage.setUserId(userId);
        aiMessage.setSessionId(sessionId);
        aiMessage.setRole("assistant");
        aiMessage.setContent(answer);
        aiMessage.setTopic(context != null ? (String) context.get("topic") : null);
        conversationMapper.insert(aiMessage);

        return answer;
    }

    @Override
    public List<AITutorConversation> getConversationHistory(Long userId, String sessionId) {
        return conversationMapper.getConversationHistory(userId, sessionId);
    }

    @Override
    public List<UserWeakness> getUserWeaknesses(Long userId, Boolean needsReview) {
        return userWeaknessMapper.getUserWeaknesses(userId, needsReview);
    }

    @Override
    public List<UserWeakness> getReviewSuggestions(Long userId, int limit) {
        return userWeaknessMapper.getReviewSuggestions(userId, limit);
    }

    @Override
    @Transactional
    public void recordPractice(Long userId, String topic, String category, Boolean isCorrect) {
        userWeaknessMapper.updateTopicStats(userId, topic, category, isCorrect);

        // 如果正确率低于60%，生成 AI 学习建议
        UserWeakness weakness = userWeaknessMapper.selectOne(
                new LambdaQueryWrapper<UserWeakness>()
                        .eq(UserWeakness::getUserId, userId)
                        .eq(UserWeakness::getTopic, topic));

        if (weakness != null && weakness.getAccuracy() != null && weakness.getAccuracy() < 60
                && weakness.getAiSuggestion() == null) {
            String advice = generateLearningAdvice(userId, topic);
            weakness.setAiSuggestion(advice);
            userWeaknessMapper.updateById(weakness);
        }
    }

    @Override
    public List<KnowledgeGraph> getRelatedTopics(String topic) {
        return knowledgeGraphMapper.getRelatedTopics(topic);
    }

    @Override
    public String generateLearningAdvice(Long userId, String topic) {
        try {
            // 获取用户在该知识点的统计
            UserWeakness weakness = userWeaknessMapper.selectOne(
                    new LambdaQueryWrapper<UserWeakness>()
                            .eq(UserWeakness::getUserId, userId)
                            .eq(UserWeakness::getTopic, topic));

            if (weakness == null) {
                return null;
            }

            // 获取知识图谱信息
            KnowledgeGraph knowledge = knowledgeGraphMapper.getByTopic(topic);

            // 构建提示词
            String promptTemplate = systemPromptService.getPromptTemplate(
                    "LEARNING_ADVICE_USER",
                    "学生在「%s」这个知识点上遇到了困难：\n- 总练习次数：%d\n- 错误次数：%d\n- 正确率：%.1f%%\n\n请生成一份简短的学习建议（100字以内），包括：1. 简要指出学生可能的薄弱点 2. 提供1-2个具体的学习建议 3. 鼓励性的话语\n",
                    "学习建议生成-用户提示词");

            String userPrompt = String.format(promptTemplate, topic, weakness.getTotalCount(), weakness.getErrorCount(),
                    weakness.getAccuracy());

            // 调用 AI
            List<Message> messages = new ArrayList<>();
            messages.add(Message.builder()
                    .role(Role.USER.getValue())
                    .content(userPrompt)
                    .build());

            Generation gen = new Generation();
            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model(modelName)
                    .messages(messages)
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .build();

            GenerationResult result = gen.call(param);

            if (result != null && result.getOutput() != null && result.getOutput().getChoices() != null) {
                return result.getOutput().getChoices().get(0).getMessage().getContent();
            }

            return "继续努力练习，你一定能掌握这个知识点！";
        } catch (Exception e) {
            log.error("Generate learning advice error", e);
            return "继续努力练习，你一定能掌握这个知识点！";
        }
    }

    /**
     * 构建系统提示词（包含题目上下文）
     */
    private String buildSystemPrompt(Map<String, Object> context, String baseSystemPrompt) {
        StringBuilder prompt = new StringBuilder(baseSystemPrompt);
        prompt.append("\n\n");

        if (context != null && !context.isEmpty()) {
            prompt.append("当前题目信息：\n");

            // 题目内容
            if (context.containsKey("question")) {
                prompt.append("题目：").append(context.get("question")).append("\n");
            }

            // 选项
            if (context.containsKey("options")) {
                prompt.append("选项：").append(context.get("options")).append("\n");
            }

            // 用户答案
            if (context.containsKey("userAnswer")) {
                prompt.append("学生的答案：").append(context.get("userAnswer")).append("\n");
            }

            // 正确答案
            if (context.containsKey("correctAnswer")) {
                prompt.append("正确答案：").append(context.get("correctAnswer")).append("\n");
            }

            // 官方解析
            if (context.containsKey("explanation")) {
                prompt.append("官方解析：").append(context.get("explanation")).append("\n");
            }

            // 话题
            if (context.containsKey("topic")) {
                prompt.append("语法点：").append(context.get("topic")).append("\n");
            }

            prompt.append("\n");
        }

        String adviceRules = systemPromptService.getPromptTemplate(
                "AI_TUTOR_ADVICE_RULES",
                "回答要求：\n1. 用简单易懂的语言解释，避免过于学术化的术语\n2. 结合具体例句说明\n3. 如果学生答错了，解释为什么错误答案是错的\n4. 提供记忆技巧或规律总结\n5. 回答要简洁，控制在 200 字以内\n6. 使用友好、鼓励的语气",
                "AI 助教-回答规范提示词");
        prompt.append(adviceRules);

        return prompt.toString();
    }
}
