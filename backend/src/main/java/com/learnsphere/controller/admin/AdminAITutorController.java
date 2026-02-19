package com.learnsphere.controller.admin;

import com.learnsphere.common.Result;
import com.learnsphere.task.AITutorCleanupTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * AI Tutor 数据管理控制器（管理员）
 * 
 * @author LearnSphere Team
 * @since 3.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/ai-tutor")
@RequiredArgsConstructor
public class AdminAITutorController {

    private final com.learnsphere.mapper.AITutorConversationMapper conversationMapper;
    private final com.learnsphere.mapper.SensitiveLogMapper sensitiveLogMapper;
    private final AITutorCleanupTask cleanupTask;
    private final StringRedisTemplate redisTemplate;

    /**
     * 获取 AI 助教仪表盘统计数据
     */
    @cn.dev33.satoken.annotation.SaCheckRole("admin")
    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        try {
            java.time.LocalDateTime todayStart = java.time.LocalDateTime.now().withHour(0).withMinute(0).withSecond(0)
                    .withNano(0);
            Map<String, Object> stats = conversationMapper.getAITutorStats(todayStart);

            // 补偿基础统计
            if (stats == null) {
                stats = new HashMap<>();
                stats.put("totalMessages", 0);
                stats.put("activeSessions", 0);
                stats.put("todayQuestions", 0);
            }

            // 获取敏感拦截总数 (针对 AI 助教)
            long sensitiveTotal = sensitiveLogMapper.selectCount(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.SensitiveLog>()
                            .and(w -> w.like(com.learnsphere.entity.SensitiveLog::getAction, "AITutor")
                                    .or().like(com.learnsphere.entity.SensitiveLog::getContent, "AITutor")));
            stats.put("sensitiveIntercepts", sensitiveTotal);

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取 AI 助教统计失败", e);
            return Result.error("获取统计失败");
        }
    }

    /**
     * 分页查询对话历史
     */
    @cn.dev33.satoken.annotation.SaCheckRole("admin")
    @GetMapping("/messages")
    public Result<com.baomidou.mybatisplus.core.metadata.IPage<Map<String, Object>>> getMessages(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role) {
        try {
            com.baomidou.mybatisplus.extension.plugins.pagination.Page<Map<String, Object>> pageParam = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(
                    page, size);
            return Result.success(conversationMapper.getConversationList(pageParam, keyword, role));
        } catch (Exception e) {
            log.error("获取对话历史失败", e);
            return Result.error("获取记录失败");
        }
    }

    /**
     * 获取指定会话的完整详情
     */
    @cn.dev33.satoken.annotation.SaCheckRole("admin")
    @GetMapping("/session/{sessionId}")
    public Result<java.util.List<com.learnsphere.entity.AITutorConversation>> getSessionDetail(
            @PathVariable String sessionId) {
        return Result.success(conversationMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.AITutorConversation>()
                        .eq(com.learnsphere.entity.AITutorConversation::getSessionId, sessionId)
                        .orderByAsc(com.learnsphere.entity.AITutorConversation::getCreateTime)));
    }

    /**
     * 获取待清理的对话历史统计
     */
    @GetMapping("/cleanup/stats")
    public Result<Map<String, Object>> getCleanupStats() {
        try {
            long expiredCount = cleanupTask.getExpiredCount();

            Map<String, Object> stats = new HashMap<>();
            stats.put("expiredCount", expiredCount);
            stats.put("message", expiredCount > 0
                    ? String.format("有 %d 条过期对话记录待清理", expiredCount)
                    : "暂无过期记录需要清理");

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取清理统计失败", e);
            return Result.error("获取统计信息失败");
        }
    }

    /**
     * 手动触发清理任务
     * 
     * @param daysToKeep 保留天数（可选，默认使用配置值）
     */
    @PostMapping("/cleanup/trigger")
    public Result<Map<String, Object>> triggerCleanup(
            @RequestParam(required = false, defaultValue = "30") int daysToKeep) {
        try {
            if (daysToKeep < 1 || daysToKeep > 365) {
                return Result.error("保留天数必须在 1-365 之间");
            }

            int deletedCount = cleanupTask.manualCleanup(daysToKeep);

            Map<String, Object> result = new HashMap<>();
            result.put("deletedCount", deletedCount);
            result.put("daysToKeep", daysToKeep);
            result.put("message", String.format("成功清理 %d 条对话记录", deletedCount));

            return Result.success(result);
        } catch (Exception e) {
            log.error("手动清理失败", e);
            return Result.error("清理失败: " + e.getMessage());
        }
    }

    /**
     * 获取 AI 助教专项配置
     */
    @cn.dev33.satoken.annotation.SaCheckRole("admin")
    @GetMapping("/config")
    public Result<Map<String, Object>> getAIConfig() {
        Map<String, Object> config = new HashMap<>();
        String override = redisTemplate.opsForValue().get("config:ai:tutor:model_override");
        config.put("activeModel", override != null ? override : "default");
        config.put("isOverridden", override != null);
        return Result.success(config);
    }

    /**
     * 更新 AI 助教专项配置
     */
    @cn.dev33.satoken.annotation.SaCheckRole("admin")
    @PostMapping("/config")
    public Result<String> updateAIConfig(@RequestBody Map<String, String> body) {
        String model = body.get("model");
        if (model == null || model.isEmpty() || "default".equals(model)) {
            redisTemplate.delete("config:ai:tutor:model_override");
            return Result.success("已恢复系统默认设置");
        }
        redisTemplate.opsForValue().set("config:ai:tutor:model_override", model);
        return Result.success("AI 助教模型已切换为: " + model);
    }
}
