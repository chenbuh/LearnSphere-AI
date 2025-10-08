package com.learnsphere.service;

import com.learnsphere.entity.AITutorConversation;
import com.learnsphere.entity.KnowledgeGraph;
import com.learnsphere.entity.UserWeakness;

import java.util.List;
import java.util.Map;

/**
 * AI Tutor 服务接口
 * 
 * @author LearnSphere Team
 * @since 2.5.0
 */
public interface IAITutorService {

    /**
     * AI Tutor 对话
     * 
     * @param question 用户提问
     * @param context  上下文（题目、答案等信息）
     * @return AI 回答
     */
    String chat(String question, Map<String, Object> context);

    /**
     * AI Tutor 对话（带历史保存）
     * 
     * @param userId    用户ID
     * @param sessionId 会话ID
     * @param question  用户提问
     * @param context   上下文
     * @return AI 回答
     */
    String chatWithHistory(Long userId, String sessionId, String question, Map<String, Object> context);

    /**
     * 获取对话历史
     * 
     * @param userId    用户ID
     * @param sessionId 会话ID
     * @return 对话历史列表
     */
    List<AITutorConversation> getConversationHistory(Long userId, String sessionId);

    /**
     * 获取用户的薄弱知识点
     * 
     * @param userId      用户ID
     * @param needsReview 是否只获取需要复习的
     * @return 薄弱知识点列表
     */
    List<UserWeakness> getUserWeaknesses(Long userId, Boolean needsReview);

    /**
     * 获取个性化复习建议
     * 
     * @param userId 用户ID
     * @param limit  建议数量
     * @return 复习建议列表
     */
    List<UserWeakness> getReviewSuggestions(Long userId, int limit);

    /**
     * 记录答题情况，更新薄弱点统计
     * 
     * @param userId    用户ID
     * @param topic     知识点
     * @param category  类别
     * @param isCorrect 是否正确
     */
    void recordPractice(Long userId, String topic, String category, Boolean isCorrect);

    /**
     * 获取知识点推荐（基于知识图谱）
     * 
     * @param topic 当前知识点
     * @return 推荐的相关知识点
     */
    List<KnowledgeGraph> getRelatedTopics(String topic);

    /**
     * 为用户薄弱点生成 AI 学习建议
     * 
     * @param userId 用户ID
     * @param topic  知识点
     * @return AI 学习建议
     */
    String generateLearningAdvice(Long userId, String topic);
}
