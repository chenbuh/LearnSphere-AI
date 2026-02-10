package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.service.AIContentFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户 AI 反馈控制器
 */
@RestController
@RequestMapping("/api/ai/feedback")
public class AIFeedbackController {

    @Autowired
    private AIContentFeedbackService feedbackService;

    /**
     * 提交反馈
     */
    @PostMapping("/submit")
    public Result<?> submitFeedback(@RequestBody Map<String, Object> params) {
        Long logId = Long.valueOf(params.get("logId").toString());
        Integer rating = (Integer) params.get("rating");
        String feedbackText = (String) params.get("feedbackText");

        Long userId = StpUtil.getLoginIdAsLong();

        feedbackService.submitFeedback(userId, logId, rating, feedbackText);
        return Result.success("感谢您的反馈！");
    }
}
