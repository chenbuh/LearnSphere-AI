package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.UserOperation;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.service.LearningHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 学习历史记录控制器
 */
@RestController
@RequestMapping("/learning")
public class LearningHistoryController {

    @Autowired
    private LearningHistoryService learningHistoryService;

    /**
     * 获取答题历史
     * 
     * @param module 模块类型：listening/reading/grammar/speaking/writing
     * @param page   页码
     * @param size   每页数量
     * @return 答题历史列表
     */
    @GetMapping("/answer-history/{module}")
    @UserOperation(module = "learning", action = "view_history", description = "查看答题历史", detailKeys = { "module",
            "page", "size" })
    public Result<Map<String, Object>> getAnswerHistory(
            @PathVariable String module,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(learningHistoryService.getAnswerHistory(module, page, size));
    }

    /**
     * 保存答题记录
     * 
     * @param record 答题记录
     * @return 保存结果
     */
    @PostMapping("/answer-record")
    @UserOperation(module = "learning", action = "submit", description = "保存答题记录", detailKeys = {
            "record.module", "record.contentType", "record.isCorrect", "record.timeSpent"
    })
    public Result<String> saveAnswerRecord(@RequestBody LearningRecord record) {
        learningHistoryService.saveAnswerRecord(record);
        return Result.success("保存成功");
    }

    /**
     * 获取学习统计
     *
     * @return 学习统计数据
     */
    @GetMapping("/stats")
    @UserOperation(module = "learning", action = "view_stats", description = "查看学习统计")
    public Result<Map<String, Object>> getLearningStats() {
        return Result.success(learningHistoryService.getLearningStats());
    }
}
