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
     * 返回数据包含：
     * 1. 每日学习时长
     * 2. 每日做题数量 (正确/错误)
     * 用于前端绘制折线图。
     */
    @GetMapping("/trends")
    public Result<Map<String, Object>> getTrends(@RequestParam(defaultValue = "7") Integer days) {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> trends = learningRecordService.getTrendStatistics(userId, days);
        return Result.success(trends);
    }

    /**
     * 获取复习列表 (基于艾宾浩斯遗忘曲线)
     * 系统会自动筛选出当前时间点需要复习的词汇或知识点。
     * 核心算法：根据上次复习时间和掌握程度，计算下一次复习时间。
     * 复习间隔：1天 -> 3天 -> 7天 -> 15天 -> 30天 (示例)。
     *
     * @param page     页码
     * @param pageSize 每页数量
     * @return 待复习的 LearningRecord 列表
     */
    @GetMapping("/review")
    public Result<Page<LearningRecord>> getReviewList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        Long userId = StpUtil.getLoginIdAsLong();
        Page<LearningRecord> reviewList = learningRecordService.getReviewList(userId, page, pageSize);
        return Result.success(reviewList);
    }

    /**
     * 获取特定模块的答题历史
     * 支持查询听力(listening)、阅读(reading)、语法(grammar) 等模块的历史记录。
     * 用于历史回顾页面展示。
     * 
     * @param module 模块类型：listening/reading/grammar/speaking/writing
     * @param page   页码
     * @param size   每页数量
     * @return 答题历史列表
     */
    @GetMapping("/answer-history/{module}")
    public Result<Map<String, Object>> getAnswerHistory(
            @PathVariable String module,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(learningRecordService.getAnswerHistory(module, page, size));
    }

    /**
     * 删除学习记录 (仅限错题本管理)
     * 注意：
     * 1. 只允许删除属于自己的记录。
     * 2. 删除后，该题目将不再出现在错题复习列表中，但统计数据可能保留。
     */
    @DeleteMapping("/record/{id}")
    public Result<Boolean> deleteRecord(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        LearningRecord record = learningRecordService.getById(id);
        if (record == null) {
            return Result.error("记录不存在");
        }
        if (!record.getUserId().equals(userId)) {
            return Result.error("无权操作此记录");
        }
        boolean success = learningRecordService.removeById(id);
        return Result.success(success);
    }
}
