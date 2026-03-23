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
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
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
    private final StringRedisTemplate redisTemplate;
    private final com.learnsphere.service.IAIGenerationLogService aiGenerationLogService;

    private final com.learnsphere.service.ISystemConfigService systemConfigService;
    private final MeterRegistry meterRegistry;

    /**
     * 获取当前实际执行的模型名称
     */
    private String getEffectiveModel() {
        try {
            // 1. 优先检查 AI 助教专项覆盖
            String tutorOverride = redisTemplate.opsForValue().get("config:ai:tutor:model_override");
            if (tutorOverride != null && !tutorOverride.isEmpty()) {
                return tutorOverride;
            }
            // 2. 其次检查 AI 全局覆盖
            String globalOverride = redisTemplate.opsForValue().get("config:ai:model_override");
            if (globalOverride != null && !globalOverride.isEmpty()) {
                return globalOverride;
            }
        } catch (Exception e) {
            log.warn("获取模型覆盖配置失败: {}", e.getMessage());
        }
        // 3. 最后使用默认配置
        return modelName;
    }

    private int getConfiguredMemoryDepth() {
        try {
            String value = systemConfigService.getConfigValue("ai_tutor_memory_depth", "10");
            int resolved = Integer.parseInt(value);
            if (resolved < 1) {
                return 1;
            }
            return Math.min(resolved, 30);
        } catch (Exception e) {
            log.warn("读取 AI 助教记忆深度失败，使用默认值: {}", e.getMessage());
            return 10;
        }
    }

    private boolean isFewShotEnabled() {
        try {
            return Boolean.parseBoolean(systemConfigService.getConfigValue("ai_tutor_few_shot_enabled", "true"));
        } catch (Exception e) {
            log.warn("读取 AI 助教 Few-shot 开关失败，使用默认值: {}", e.getMessage());
            return true;
        }
    }

    private boolean isFallbackEnabled() {
        try {
            return Boolean.parseBoolean(systemConfigService.getConfigValue("ai_tutor_fallback_enabled", "true"));
        } catch (Exception e) {
            log.warn("读取 AI 助教容灾开关失败，使用默认值: {}", e.getMessage());
            return true;
        }
    }

    @Override
    public String chat(String question, Map<String, Object> context) {
        return chatWithMessages(question, context, new ArrayList<>());
    }

    private String chatWithMessages(String question, Map<String, Object> context, List<AITutorConversation> history) {
        String contextualPrompt = "";
        String selectedModel = getEffectiveModel();
        boolean fewShotEnabled = isFewShotEnabled();
        boolean fallbackEnabled = isFallbackEnabled();
        try {
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("AI 助教未配置可用的 API Key");
            }

            String systemPromptText = systemPromptService.getPromptTemplate(
                    "AI_TUTOR_SYSTEM",
                    "你是一个专业且友好的英语学习助手，名字叫小智。你擅长用通俗易懂的方式解释语法知识、解答学习问题、提供学习建议，也会友好地回应学生的日常交流。",
                    "AI 助教-系统提示词");

            contextualPrompt = buildSystemPrompt(context, systemPromptText);

            if (fewShotEnabled) {
                try {
                    String fewShot = feedbackService.getFewShotExamples("AI_TUTOR_CHAT");
                    if (fewShot != null && !fewShot.isEmpty()) {
                        contextualPrompt += fewShot;
                    }
                } catch (Exception fewShotError) {
                    log.warn("加载 AI 助教 few-shot 示例失败，已跳过: {}", fewShotError.getMessage());
                }
            }

            List<Message> messages = new ArrayList<>();
            messages.add(Message.builder()
                    .role(Role.SYSTEM.getValue())
                    .content(contextualPrompt)
                    .build());

            if (history != null && !history.isEmpty()) {
                int start = Math.max(0, history.size() - getConfiguredMemoryDepth());
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

            String cacheKey = "ai:tutor:cache:" + cn.hutool.crypto.digest.DigestUtil.md5Hex(messages.toString());
            String cachedResponse = cacheUtil.getOrCompute(cacheKey, () -> null, 2,
                    java.util.concurrent.TimeUnit.HOURS);
            if (cachedResponse != null) {
                log.info("AI 助教结果缓存命中 (Cost Saved)");
                return cachedResponse;
            }

            io.github.resilience4j.bulkhead.Bulkhead bulkhead = bulkheadRegistry.bulkhead("fastTask");
            io.github.resilience4j.circuitbreaker.CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("aiTutor");
            io.github.resilience4j.retry.Retry retry = retryRegistry.retry("aiTutor");

            GenerationResult result;
            final String primaryModel = selectedModel;
            try {
                result = io.github.resilience4j.retry.Retry.decorateSupplier(retry,
                        io.github.resilience4j.circuitbreaker.CircuitBreaker.decorateSupplier(cb,
                                io.github.resilience4j.bulkhead.Bulkhead.decorateSupplier(bulkhead, () -> {
                                    try {
                                        return callGeneration(primaryModel, messages);
                                    } catch (Exception e) {
                                        throw new RuntimeException(e);
                                    }
                                })))
                        .get();
            } catch (Exception e) {
                if (!fallbackEnabled) {
                    throw e;
                }
                log.warn("AI 助教主服务异常，尝试容灾对冲: {}", e.getMessage());
                selectedModel = getFallbackModel(selectedModel);
                result = callGeneration(selectedModel, messages);
            }

            String response = extractAssistantContent(result);
            if (response != null && !response.isBlank()) {
                cacheUtil.getOrCompute(cacheKey, () -> response, 2, java.util.concurrent.TimeUnit.HOURS);

                try {
                    Long userId = cn.dev33.satoken.stp.StpUtil.isLogin()
                            ? cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong()
                            : null;
                    Integer inputTokens = result.getUsage() != null ? result.getUsage().getInputTokens() : 0;
                    Integer outputTokens = result.getUsage() != null ? result.getUsage().getOutputTokens() : 0;
                    Integer totalTokens = result.getUsage() != null ? result.getUsage().getTotalTokens() : 0;

                    aiGenerationLogService.log(
                            userId,
                            "AI 助教提问",
                            selectedModel,
                            contextualPrompt,
                            question,
                            response,
                            "SUCCESS",
                            null,
                            0L,
                            inputTokens,
                            outputTokens,
                            totalTokens);
                } catch (Exception logError) {
                    log.warn("Failed to log AI tutor generation: {}", logError.getMessage());
                }

                try {
                    Integer totalTokensSafe = result.getUsage() != null ? result.getUsage().getTotalTokens() : 0;
                    if (totalTokensSafe != null && totalTokensSafe > 0) {
                        double costPer1k = getCostPer1kTokens(selectedModel);
                        double cost = (totalTokensSafe / 1000.0) * costPer1k;
                        String costKey = getDailyCostKey();
                        redisTemplate.opsForValue().increment(costKey, cost);
                        if (meterRegistry != null) {
                            meterRegistry.counter("ai.cost.usd", "model", selectedModel).increment(cost);
                        }
                        maybeWarnBudget(costKey);
                    }
                } catch (Exception e) {
                    log.warn("Failed to record AI tutor cost: {}", e.getMessage());
                }

                return response;
            }

            throw new IllegalStateException("AI 助教返回了空响应");
        } catch (Exception e) {
            log.error("AI Tutor chat error", e);

            try {
                Long userId = cn.dev33.satoken.stp.StpUtil.isLogin() ? cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong()
                        : null;
                aiGenerationLogService.log(
                        userId,
                        "AI 助教提问",
                        selectedModel,
                        "",
                        question,
                        null,
                        "FAIL",
                        e.getMessage(),
                        0L,
                        0,
                        0,
                        0);
            } catch (Exception logError) {
                log.warn("Failed to log AI tutor error: {}", logError.getMessage());
            }

            if (!fallbackEnabled) {
                return "当前 AI 助教服务暂不可用，请稍后重试。";
            }
            return buildLocalTutorFallback(question, context, e);
        }
    }

    private GenerationResult callGeneration(String model, List<Message> messages) throws Exception {
        Generation gen = new Generation();
        GenerationParam.GenerationParamBuilder<?, ?> builder = GenerationParam.builder()
                .apiKey(apiKey)
                .model(model)
                .messages(messages)
                .resultFormat(GenerationParam.ResultFormat.MESSAGE);

        if (model != null && model.toLowerCase(java.util.Locale.ROOT).startsWith("qwen3")) {
            builder.parameter("enable_thinking", false);
        }

        return gen.call(builder.build());
    }

    private String getFallbackModel(String currentModel) {
        String normalized = currentModel == null ? "" : currentModel.toLowerCase(java.util.Locale.ROOT).trim();
        if (normalized.startsWith("qwen3")) {
            return "qwen-plus";
        }
        if (normalized.contains("plus")) {
            return "qwen3.5-turbo";
        }
        return "qwen-plus";
    }

    private String extractAssistantContent(GenerationResult result) {
        if (result == null || result.getOutput() == null || result.getOutput().getChoices() == null
                || result.getOutput().getChoices().isEmpty()
                || result.getOutput().getChoices().get(0) == null
                || result.getOutput().getChoices().get(0).getMessage() == null) {
            return null;
        }
        return result.getOutput().getChoices().get(0).getMessage().getContent();
    }

    private String buildLocalTutorFallback(String question, Map<String, Object> context, Exception error) {
        String rootMessage = error == null ? "" : String.valueOf(error.getMessage());
        String lowerMessage = rootMessage.toLowerCase(java.util.Locale.ROOT);
        boolean quotaLimited = rootMessage.contains("AllocationQuota")
                || rootMessage.contains("FreeTierOnly")
                || lowerMessage.contains("quota");
        boolean configIssue = lowerMessage.contains("api key") || lowerMessage.contains("model");

        StringBuilder answer = new StringBuilder();
        if (quotaLimited) {
            answer.append("当前云端学习助手额度已用完，我先切换到离线辅导模式，继续帮你梳理这道题。\n\n");
        } else if (configIssue) {
            answer.append("当前云端学习助手配置异常，我先切换到离线辅导模式，给你一个基于题目信息的学习建议。\n\n");
        } else {
            answer.append("当前云端学习助手暂时不可用，我先根据页面里的题目信息为你做一个离线讲解。\n\n");
        }

        if (context != null && "vocabulary".equals(String.valueOf(context.get("module"))) && context.get("word") != null) {
            answer.append("【单词梳理】\n");
            answer.append("- 单词：").append(context.get("word")).append("\n");
            if (context.get("meaning") != null) {
                answer.append("- 释义：").append(context.get("meaning")).append("\n");
            }
            if (context.get("phonetic") != null) {
                answer.append("- 音标：").append(context.get("phonetic")).append("\n");
            }
            if (context.get("examples") != null) {
                answer.append("- 例句参考：").append(context.get("examples")).append("\n");
            }
            answer.append("- 学习建议：先用“拼写 + 中文义 + 自己造句”连读 3 次，再对比易混词。\n");
            answer.append("- 你可以继续问我：这个词怎么记、怎么造句、和哪个近义词最容易混。\n");
        } else if (context != null && !context.isEmpty()) {
            answer.append("【题目梳理】\n");
            if (context.get("topic") != null) {
                answer.append("- 知识点：").append(context.get("topic")).append("\n");
            }
            if (context.get("question") != null) {
                answer.append("- 题目：").append(context.get("question")).append("\n");
            }
            if (context.get("userAnswer") != null) {
                answer.append("- 你的答案：").append(context.get("userAnswer")).append("\n");
            }
            if (context.get("correctAnswer") != null) {
                answer.append("- 参考答案：").append(context.get("correctAnswer")).append("\n");
            }
            if (context.get("explanation") != null) {
                answer.append("- 解析重点：").append(context.get("explanation")).append("\n");
            }
            answer.append("\n【学习建议】\n");
            answer.append("- 先用题干关键词定位考点，再用选项差异做二次排除。\n");
            answer.append("- 如果你刚做错这题，优先问“为什么正确答案对、我的答案错在哪”。\n");
            answer.append("- 你可以继续追问我：这题考什么语法、为什么不能选别的、同类题怎么做。\n");
        } else {
            answer.append("【通用学习建议】\n");
            answer.append("- 先把你的疑问缩小到一个点，例如“这句为什么用过去完成时”或“这道阅读题答案依据在哪”。\n");
            answer.append("- 如果方便，请把题目、你的答案和你不懂的地方一起发给我，我能更精准地继续帮你分析。\n");
        }

        if (question != null && !question.isBlank()) {
            answer.append("\n【你刚才的问题】\n");
            answer.append(question).append("\n");
        }

        return answer.toString();
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
                    .model(getEffectiveModel())
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
            String module = context.containsKey("module") ? String.valueOf(context.get("module")) : "";

            // ==== 词汇学习模式 ====
            if ("vocabulary".equals(module) && context.containsKey("word")) {
                prompt.append("【词汇学习上下文】\n");
                prompt.append("当前学习单词：").append(context.get("word")).append("\n");
                if (context.containsKey("phonetic")) {
                    prompt.append("音标：").append(context.get("phonetic")).append("\n");
                }
                if (context.containsKey("meaning")) {
                    prompt.append("中文释义：").append(context.get("meaning")).append("\n");
                }
                if (context.containsKey("examType")) {
                    prompt.append("所属考纲：").append(context.get("examType")).append("\n");
                }
                if (context.containsKey("examples")) {
                    prompt.append("例句：").append(context.get("examples")).append("\n");
                }
                prompt.append("请围绕这个单词进行解释和辅导。\n");
            } else {
                // ==== 题目/其他模式 ====
                prompt.append("当前题目信息：\n");
                if (context.containsKey("question")) {
                    prompt.append("题目：").append(context.get("question")).append("\n");
                }
                if (context.containsKey("options")) {
                    prompt.append("选项：").append(context.get("options")).append("\n");
                }
                if (context.containsKey("userAnswer")) {
                    prompt.append("学生的答案：").append(context.get("userAnswer")).append("\n");
                }
                if (context.containsKey("correctAnswer")) {
                    prompt.append("正确答案：").append(context.get("correctAnswer")).append("\n");
                }
                if (context.containsKey("explanation")) {
                    prompt.append("官方解析：").append(context.get("explanation")).append("\n");
                }
                if (context.containsKey("topic")) {
                    prompt.append("语法点：").append(context.get("topic")).append("\n");
                }
            }

            prompt.append("\n");
        }

        String adviceRules = systemPromptService.getPromptTemplate(
                "AI_TUTOR_ADVICE_RULES",
                "回答规范：\n1. 如果学生打招呼，请友好回应并询问能帮什么忙\n2. 用简单易懂的语言解释，控制在50-150字\n3. 结合具体例句说明\n4. 如果学生答错了，先肯定努力，再解释错误\n5. 提供记忆技巧或规律总结\n6. 使用友好、鼓励的语气",
                "AI 助教-回答规范提示词");
        prompt.append(adviceRules);

        return prompt.toString();
    }

    // ==================== 辅助方法 ====================

    private double getCostPer1kTokens(String modelString) {
        if (modelString == null)
            return 0.0;
        switch (modelString.toLowerCase()) {
            case "qwen-max":
            case "qwen-max-latest":
                return 0.012; // 假设单价
            case "qwen-plus":
            case "qwen-plus-latest":
                return 0.002;
            case "qwen-turbo":
            case "qwen-turbo-latest":
                return 0.0003;
            default:
                return 0.001;
        }
    }

    private String getDailyCostKey() {
        return "ai:cost:daily:" + java.time.LocalDate.now().toString();
    }

    private void maybeWarnBudget(String costKey) {
        if (redisTemplate == null)
            return;
        try {
            String budgetStr = systemConfigService.getConfigValue("ai_daily_budget_usd", "5.0");
            double budget = Double.parseDouble(budgetStr);
            Object costObj = redisTemplate.opsForValue().get(costKey);
            if (costObj != null) {
                double currentCost = Double.parseDouble(costObj.toString());
                if (currentCost >= budget * 0.9) {
                    log.error("CRITICAL: AI daily budget reached 90%! Current: ${}, Budget: ${}", currentCost, budget);
                } else if (currentCost >= budget * 0.8) {
                    log.warn("WARNING: AI daily budget reached 80%.");
                }
            }
        } catch (Exception e) {
            log.warn("Budget check failed: {}", e.getMessage());
        }
    }
}
