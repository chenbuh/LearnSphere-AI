package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.AIContentFeedback;

import java.util.Map;

/**
 * AI Content Feedback Service
 */
public interface AIContentFeedbackService extends IService<AIContentFeedback> {

    /**
     * Submit feedback
     */
    void submitFeedback(Long userId, Long logId, Integer rating, String feedbackText);

    /**
     * Get feedback list for admin with pagination and filters
     */
    Page<Map<String, Object>> getFeedbackPage(int page, int size, Integer status, Integer rating);

    /**
     * Process/Audit feedback
     */
    void auditFeedback(Long id, Integer status, String correctedContent, String adminNotes);

    /**
     * Get few-shot examples for a specific action type from corrected feedback
     */
    String getFewShotExamples(String actionType);

    /**
     * Check if the negative feedback rate exceeds threshold and notify if so
     */
    /**
     * Check if the negative feedback rate exceeds threshold and notify if so
     */
    void monitorFeedbackAnomalies(String actionType);

    /**
     * Analyze Negative Feedback (Smart Attribution)
     */
    String analyzeNegativeFeedback(Long feedbackId);
}
