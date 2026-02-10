package com.learnsphere.controller.admin;

import com.learnsphere.common.Result;
import com.learnsphere.service.AIContentFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI反馈审计控制器
 */
@RestController
@RequestMapping("/api/admin/ai/feedback")
public class AdminAIFeedbackController {

    @Autowired
    private AIContentFeedbackService feedbackService;

    /**
     * 获取反馈列表
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
     * 审计反馈
     */
    @PostMapping("/audit")
    public Result<?> auditFeedback(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Integer status = (Integer) params.get("status");
        String correctedContent = (String) params.get("correctedContent");
        String adminNotes = (String) params.get("adminNotes");

        feedbackService.auditFeedback(id, status, correctedContent, adminNotes);
        return Result.success("操作成功");
    }
}
