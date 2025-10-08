package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.dto.LearningRecordDTO;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.service.ILearningRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 学习记录控制器
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/learning")
@RequiredArgsConstructor
public class LearningRecordController {

    private final ILearningRecordService learningRecordService;
    private final com.learnsphere.service.IAIGenerationService aiGenerationService;

    /**
     * 获取用户学习分析报告 (生成新的)
     */
    @GetMapping("/analysis/generate")
    public Result<Map<String, Object>> generateAnalysisReport() {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> statistics = learningRecordService.getUserStatistics(userId);
        Map<String, Object> report = aiGenerationService.generateLearningAnalysis(userId, statistics);
        return Result.success(report);
    }

    /**
     * 获取用户最近一次分析报告
     */
    @GetMapping("/analysis/last")
    public Result<Map<String, Object>> getLastAnalysisReport() {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> report = aiGenerationService.getLastAnalysis(userId);
        return Result.success(report);
    }

    /**
     * 创建学习记录
     */
    @PostMapping("/record")
    public Result<Map<String, Object>> createRecord(@RequestBody LearningRecordDTO dto) {
        Long userId = StpUtil.getLoginIdAsLong();
        Integer points = learningRecordService.createRecord(userId, dto);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("points", points);
        result.put("message", "学习记录创建成功");
        return Result.success(result);
    }

    /**
     * 获取学习记录列表
     */
    @GetMapping("/records")
    public Result<Page<LearningRecord>> getRecords(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) Integer isCorrect) {
        Long userId = StpUtil.getLoginIdAsLong();
        Page<LearningRecord> records = learningRecordService.getUserRecords(userId, page, pageSize, contentType,
                isCorrect);
        return Result.success(records);
    }

    /**
     * 获取学习统计
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> statistics = learningRecordService.getUserStatistics(userId);
        return Result.success(statistics);
    }

    /**
     * 获取趋势统计 (7天/30天)
     */
    @GetMapping("/trends")
    public Result<Map<String, Object>> getTrends(@RequestParam(defaultValue = "7") Integer days) {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> trends = learningRecordService.getTrendStatistics(userId, days);
        return Result.success(trends);
    }

    /**
     * 获取复习列表
     */
    @GetMapping("/review")
    public Result<Page<LearningRecord>> getReviewList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        Long userId = StpUtil.getLoginIdAsLong();
        Page<LearningRecord> reviewList = learningRecordService.getReviewList(userId, page, pageSize);
        return Result.success(reviewList);
    }
}
