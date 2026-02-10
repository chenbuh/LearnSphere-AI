package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.AIContentFeedback;
import com.learnsphere.entity.AIGenerationLog;
import com.learnsphere.mapper.AIContentFeedbackMapper;
import com.learnsphere.mapper.AIGenerationLogMapper;
import com.learnsphere.service.AIContentFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import com.learnsphere.entity.Notification;
import com.learnsphere.service.INotificationService;
import com.learnsphere.util.CacheUtil;

/**
 * AI Content Feedback Service Implementation
 */
@Service
public class AIContentFeedbackServiceImpl extends ServiceImpl<AIContentFeedbackMapper, AIContentFeedback>
        implements AIContentFeedbackService {

    @Autowired
    private AIGenerationLogMapper logMapper;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private com.learnsphere.service.IAIGenerationService aiGenerationService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private CacheUtil cacheUtil;

    @Override
    public void submitFeedback(Long userId, Long logId, Integer rating, String feedbackText) {
        AIGenerationLog genLog = logMapper.selectById(logId);
        if (genLog == null) {
            throw new RuntimeException("Generation log not found");
        }

        AIContentFeedback feedback = new AIContentFeedback();
        feedback.setLogId(logId);
        feedback.setUserId(userId);
        feedback.setRating(rating);
        feedback.setFeedbackText(feedbackText);
        feedback.setOriginalContent(genLog.getResponseContent());
        feedback.setStatus(0); // Pending

        this.save(feedback);

        // 异步或同步检查异常监控
        monitorFeedbackAnomalies(genLog.getActionType());
    }

    @Override
    public String getFewShotExamples(String actionType) {
        String sql = """
                    SELECT l.prompt_preview, f.corrected_content
                    FROM ai_content_feedback f
                    JOIN ai_generation_log l ON f.log_id = l.id
                    WHERE l.action_type = ? AND f.status = 1 AND f.corrected_content IS NOT NULL
                    ORDER BY f.create_time DESC
                    LIMIT 3
                """;
        if (actionType == null)
            return "";
        List<Map<String, Object>> examples = jdbcTemplate.queryForList(sql, new Object[] { actionType });
        if (examples == null || examples.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder("\n以下是基于用户反馈订正的参考示例（Few-shot）：\n");
        for (Map<String, Object> ex : examples) {
            Object preview = ex.get("prompt_preview");
            Object corrected = ex.get("corrected_content");
            if (preview != null && corrected != null) {
                sb.append("输入: ").append(preview).append("\n");
                sb.append("优质输出建议: ").append(corrected).append("\n\n");
            }
        }
        return sb.toString();
    }

    @Override
    public void monitorFeedbackAnomalies(String actionType) {
        // 计算最近 20 条反馈的负评率
        String sql = """
                    SELECT COUNT(*) as total, SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END) as negatives
                    FROM (
                        SELECT f.rating
                        FROM ai_content_feedback f
                        JOIN ai_generation_log l ON f.log_id = l.id
                        WHERE l.action_type = ?
                        ORDER BY f.create_time DESC
                        LIMIT 20
                    ) t
                """;
        Map<String, Object> stats = jdbcTemplate.queryForMap(sql, actionType);
        long total = ((Number) stats.get("total")).longValue();
        long negatives = ((Number) stats.get("negatives")).longValue();

        if (total >= 10) { // 至少有 10 条数据才进行比例分析
            double rate = (double) negatives / total;
            String cacheKey = "ai:feedback:anomaly:count:" + actionType;
            if (rate > 0.20) {
                Long count = cacheUtil.increment(cacheKey);
                if (count != null && count >= 3) {
                    // 触发警报
                    Notification alert = new Notification();
                    alert.setTitle("AI 模块异常预警: " + actionType);
                    alert.setContent(String.format("模块 [%s] 的负评率已连续 %d 次超过 20%% (当前最近20条负评数: %d)。请及时检查提示词或模型策略。",
                            actionType, count, negatives));
                    alert.setType("warning");
                    alert.setPriority(2); // 紧急
                    alert.setTargetType("all"); // 简单处理，发送给所有人（包括管理员）
                    notificationService.sendNotification(alert);

                    // 重置计数器，避免持续刷屏
                    cacheUtil.evict(cacheKey);
                }
            } else {
                // 速率正常，重置连续计数
                cacheUtil.evict(cacheKey);
            }
        }
    }

    @Override
    public Page<Map<String, Object>> getFeedbackPage(int page, int size, Integer status, Integer rating) {
        StringBuilder sql = new StringBuilder("""
                    SELECT f.*, l.action_type, l.model_name, l.system_prompt, l.prompt_preview, u.username
                    FROM ai_content_feedback f
                    LEFT JOIN ai_generation_log l ON f.log_id = l.id
                    LEFT JOIN user u ON f.user_id = u.id
                    WHERE 1=1
                """);

        if (status != null) {
            sql.append(" AND f.status = ").append(status);
        }
        if (rating != null) {
            sql.append(" AND f.rating = ").append(rating);
        }
        sql.append(" ORDER BY f.create_time DESC");

        // Simple count for pagination
        String countSql = "SELECT COUNT(*) FROM (" + sql.toString() + ") AS t";
        Long total = jdbcTemplate.queryForObject(countSql, Long.class);

        sql.append(" LIMIT ").append((page - 1) * size).append(", ").append(size);
        List<Map<String, Object>> list = jdbcTemplate.queryForList(sql.toString());

        Page<Map<String, Object>> resultPage = new Page<>(page, size);
        resultPage.setRecords(list);
        resultPage.setTotal(total != null ? total : 0L);

        return resultPage;
    }

    @Override
    public void auditFeedback(Long id, Integer status, String correctedContent, String adminNotes) {
        AIContentFeedback feedback = this.getById(id);
        if (feedback == null) {
            throw new RuntimeException("Feedback record not found");
        }

        feedback.setStatus(status);
        if (correctedContent != null && !correctedContent.isEmpty()) {
            feedback.setCorrectedContent(correctedContent);
        }
        if (adminNotes != null) {
            feedback.setAdminNotes(adminNotes);
        }

        this.updateById(feedback);
    }

    @Override
    public String analyzeNegativeFeedback(Long feedbackId) {
        AIContentFeedback feedback = this.getById(feedbackId);
        if (feedback == null)
            return "Feedback not found";

        AIGenerationLog log = logMapper.selectById(feedback.getLogId());
        if (log == null)
            return "Log not found";

        String analysis = aiGenerationService.analyzeFeedback(
                log.getSystemPrompt(),
                log.getPromptPreview(), // Using preview as full prompt might be truncated or large
                feedback.getFeedbackText() != null ? feedback.getFeedbackText() : "User rated -1 (Negative)",
                log.getResponseContent());

        feedback.setAnalysisResult(analysis);
        this.updateById(feedback);
        return analysis;
    }
}
