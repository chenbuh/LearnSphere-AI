package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.learnsphere.common.annotation.AdminOperation;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.common.Result;
import com.learnsphere.entity.AIContentFeedback;
import com.learnsphere.service.AIContentFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AI反馈审核控制器
 */
@RestController
@RequestMapping("/api/admin/ai/feedback")
@SaCheckRole("admin")
public class AdminAIFeedbackController {

    @Autowired
    private AIContentFeedbackService feedbackService;

    /**
     * 获取反列表
     */
    @GetMapping("/list")
    public Result<?> getFeedbackList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer rating) {
        return Result.success(feedbackService.getFeedbackPage(page, size, status, rating));
    }

    /**
     * 反馈汇总：待处理数量、正向反馈率（不受列表筛选影响）
     */
    @GetMapping("/stats")
    public Result<?> getFeedbackStats() {
        long total = feedbackService.count();
        long pending = feedbackService.count(new LambdaQueryWrapper<AIContentFeedback>()
                .eq(AIContentFeedback::getStatus, 0));
        long positive = feedbackService.count(new LambdaQueryWrapper<AIContentFeedback>()
                .eq(AIContentFeedback::getRating, 1));
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("pending", pending);
        stats.put("positive", positive);
        // 没有反馈时返回 null，前端显示为 "—" 而不是 0%
        stats.put("positiveRate", total == 0 ? null : Math.round(positive * 1000.0 / total) / 10.0);
        return Result.success(stats);
    }

    /**
     * 审核反馈
     */
    @PostMapping("/audit")
    @AdminOperation(module = "AI反馈", action = "审核反馈")
    public Result<?> auditFeedback(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Integer status = (Integer) params.get("status");
        String correctedContent = (String) params.get("correctedContent");
        String adminNotes = (String) params.get("adminNotes");

        feedbackService.auditFeedback(id, status, correctedContent, adminNotes);
        return Result.success("操作成功");
    }

    /**
     * 智能归因分析
     */
    @PostMapping("/{id}/analyze")
    public Result<?> analyzeFeedback(@PathVariable Long id) {
        String result = feedbackService.analyzeNegativeFeedback(id);
        return Result.success(result);
    }
}
