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
    private final ObjectMapper objectMapper;

    @Override
    public String chat(String question, Map<String, Object> context) {
        try {
            // 构建系统提示词（包含上下文）
            String systemPrompt = buildSystemPrompt(context);

            // 构建消息列表
            List<Message> messages = new ArrayList<>();
            messages.add(Message.builder()
                    .role(Role.SYSTEM.getValue())
                    .content(systemPrompt)
                    .build());

            messages.add(Message.builder()
                    .role(Role.USER.getValue())
                    .content(question)
                    .build());

            // 调用通义千问
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

        // 获取 AI 回答
        String answer = chat(question, context);

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
            StringBuilder prompt = new StringBuilder();
            prompt.append("你是一个专业的英语学习教练。\n\n");
            prompt.append("学生在「").append(topic).append("」这个知识点上遇到了困难：\n");
            prompt.append("- 总练习次数：").append(weakness.getTotalCount()).append("\n");
            prompt.append("- 错误次数：").append(weakness.getErrorCount()).append("\n");
            prompt.append("- 正确率：").append(String.format("%.1f%%", weakness.getAccuracy())).append("\n\n");

            if (knowledge != null) {
                prompt.append("知识点信息：\n");
                prompt.append("- 难度级别：").append(knowledge.getDifficultyLevel()).append("/5\n");
                if (knowledge.getDescription() != null) {
                    prompt.append("- 描述：").append(knowledge.getDescription()).append("\n");
                }
                prompt.append("\n");
            }

            prompt.append("请生成一份简短的学习建议（100字以内），包括：\n");
            prompt.append("1. 简要指出学生可能的薄弱点\n");
            prompt.append("2. 提供1-2个具体的学习建议\n");
            prompt.append("3. 鼓励性的话语\n");

            // 调用 AI
            List<Message> messages = new ArrayList<>();
            messages.add(Message.builder()
                    .role(Role.USER.getValue())
                    .content(prompt.toString())
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
    private String buildSystemPrompt(Map<String, Object> context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个专业的英语学习助手，擅长用通俗易懂的方式解释语法知识。\n");
        prompt.append("你的任务是帮助学生理解他们在做题过程中遇到的问题。\n\n");

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

        prompt.append("回答要求：\n");
        prompt.append("1. 用简单易懂的语言解释，避免过于学术化的术语\n");
        prompt.append("2. 结合具体例句说明\n");
        prompt.append("3. 如果学生答错了，解释为什么错误答案是错的\n");
        prompt.append("4. 提供记忆技巧或规律总结\n");
        prompt.append("5. 回答要简洁，控制在 200 字以内\n");
        prompt.append("6. 使用友好、鼓励的语气\n");

        return prompt.toString();
    }
}
