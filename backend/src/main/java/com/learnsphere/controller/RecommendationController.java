package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.service.IRecommendationService;
import com.learnsphere.vo.RecommendationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI推荐控制器
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final IRecommendationService recommendationService;

    /**
     * 获取个性化推荐
     * 
     * @param limit 推荐数量，默认10条
     * @return 推荐列表
     */
    @GetMapping("/personalized")
    public Result<List<RecommendationVO>> getPersonalizedRecommendations(
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            log.info("用户 {} 请求个性化推荐，数量: {}", userId, limit);

            List<RecommendationVO> recommendations = recommendationService.getPersonalizedRecommendations(userId,
                    limit);
            return Result.success(recommendations);
        } catch (Exception e) {
            log.error("获取个性化推荐失败", e);
            return Result.error("获取推荐失败: " + e.getMessage());
        }
    }

    /**
     * 获取基于难度的推荐
     * 
     * @param difficulty 难度等级 1-5
     * @param limit      推荐数量
     * @return 推荐列表
     */
    @GetMapping("/by-difficulty")
    public Result<List<RecommendationVO>> getRecommendationsByDifficulty(
            @RequestParam Integer difficulty,
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            log.info("用户 {} 请求难度 {} 的推荐", userId, difficulty);

            if (difficulty < 1 || difficulty > 5) {
                return Result.error("难度等级必须在1-5之间");
            }

            List<RecommendationVO> recommendations = recommendationService.getRecommendationsByDifficulty(userId,
                    difficulty, limit);
            return Result.success(recommendations);
        } catch (Exception e) {
            log.error("获取难度推荐失败", e);
            return Result.error("获取推荐失败: " + e.getMessage());
        }
    }

    /**
     * 获取复习推荐
     * 
     * @param limit 推荐数量
     * @return 推荐列表
     */
    @GetMapping("/review")
    public Result<List<RecommendationVO>> getReviewRecommendations(
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            log.info("用户 {} 请求复习推荐", userId);

            List<RecommendationVO> recommendations = recommendationService.getReviewRecommendations(userId, limit);
            return Result.success(recommendations);
        } catch (Exception e) {
            log.error("获取复习推荐失败", e);
            return Result.error("获取推荐失败: " + e.getMessage());
        }
    }

    /**
     * 获取基于考试类型的推荐
     * 
     * @param examType 考试类型（CET4/CET6/TOEFL/IELTS/GRE）
     * @param limit    推荐数量
     * @return 推荐列表
     */
    @GetMapping("/by-exam-type")
    public Result<List<RecommendationVO>> getRecommendationsByExamType(
            @RequestParam String examType,
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            log.info("用户 {} 请求考试类型 {} 的推荐", userId, examType);

            List<RecommendationVO> recommendations = recommendationService.getRecommendationsByExamType(userId,
                    examType, limit);
            return Result.success(recommendations);
        } catch (Exception e) {
            log.error("获取考试类型推荐失败", e);
            return Result.error("获取推荐失败: " + e.getMessage());
        }
    }

    /**
     * 获取今日推荐（综合推荐）
     * 
     * @return 推荐列表
     */
    @GetMapping("/daily")
    public Result<List<RecommendationVO>> getDailyRecommendations() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            log.info("用户 {} 请求今日推荐", userId);

            // 今日推荐：5条个性化 + 5条复习
            List<RecommendationVO> personalizedList = recommendationService.getPersonalizedRecommendations(userId, 5);
            List<RecommendationVO> reviewList = recommendationService.getReviewRecommendations(userId, 5);

            personalizedList.addAll(reviewList);
            return Result.success(personalizedList);
        } catch (Exception e) {
            log.error("获取今日推荐失败", e);
            return Result.error("获取推荐失败: " + e.getMessage());
        }
    }

    /**
     * 获取 AI 智能分析出的建议 (从最近的分析报告中提取，减少 Token 消耗)
     * 
     * @return 建议列表
     */
    @GetMapping("/ai")
    public Result<List<Map<String, Object>>> getAIRecommendations() {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            List<Map<String, Object>> recommendations = recommendationService.getAIRecommendations(userId);
            return Result.success(recommendations);
        } catch (Exception e) {
            log.error("获取 AI 建议失败", e);
            return Result.error("获取建议失败: " + e.getMessage());
        }
    }
}
