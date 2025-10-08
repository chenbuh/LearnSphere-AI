package com.learnsphere.service;

import com.learnsphere.vo.RecommendationVO;
import java.util.List;
import java.util.Map;

/**
 * AI推荐服务接口
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
public interface IRecommendationService {

    /**
     * 获取 AI 智能分析出的建议 (从最近的分析报告中提取，减少 Token 消耗)
     * 
     * @param userId 用户 ID
     * @return 建议列表
     */
    List<Map<String, Object>> getAIRecommendations(Long userId);

    /**
     * 获取个性化推荐词汇
     * 
     * @param userId 用户ID
     * @param limit  推荐数量
     * @return 推荐词汇列表
     */
    List<RecommendationVO> getPersonalizedRecommendations(Long userId, Integer limit);

    /**
     * 获取基于难度的推荐
     * 
     * @param userId     用户ID
     * @param difficulty 难度等级
     * @param limit      推荐数量
     * @return 推荐词汇列表
     */
    List<RecommendationVO> getRecommendationsByDifficulty(Long userId, Integer difficulty, Integer limit);

    /**
     * 获取需要复习的词汇推荐
     * 
     * @param userId 用户ID
     * @param limit  推荐数量
     * @return 推荐词汇列表
     */
    List<RecommendationVO> getReviewRecommendations(Long userId, Integer limit);

    /**
     * 获取基于考试类型的推荐
     * 
     * @param userId   用户ID
     * @param examType 考试类型
     * @param limit    推荐数量
     * @return 推荐词汇列表
     */
    List<RecommendationVO> getRecommendationsByExamType(Long userId, String examType, Integer limit);
}
