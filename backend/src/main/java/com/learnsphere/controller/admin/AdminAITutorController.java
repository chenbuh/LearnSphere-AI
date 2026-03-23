package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.AITutorConversation;
import com.learnsphere.entity.SensitiveLog;
import com.learnsphere.mapper.AITutorConversationMapper;
import com.learnsphere.mapper.SensitiveLogMapper;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.task.AITutorCleanupTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    private static final int DEFAULT_MEMORY_DEPTH = 10;
    private static final int DEFAULT_CLEANUP_DAYS = 30;

    private final AITutorConversationMapper conversationMapper;
    private final SensitiveLogMapper sensitiveLogMapper;
    private final AITutorCleanupTask cleanupTask;
    private final StringRedisTemplate redisTemplate;
    private final ISystemConfigService systemConfigService;

    /**
     * 获取 AI 助教仪表盘统计数据
     */
    @SaCheckRole("admin")
    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        try {
            LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0)
                    .withNano(0);
            Map<String, Object> stats = conversationMapper.getAITutorStats(todayStart);

            if (stats == null) {
                stats = new HashMap<>();
                stats.put("totalMessages", 0);
                stats.put("activeSessions", 0);
                stats.put("todayQuestions", 0);
            }

            long sensitiveTotal = sensitiveLogMapper.selectCount(
                    new LambdaQueryWrapper<SensitiveLog>()
                            .and(wrapper -> wrapper.likeRight(SensitiveLog::getAction, "AITutorController")));
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
    @SaCheckRole("admin")
    @GetMapping("/messages")
    public Result<IPage<Map<String, Object>>> getMessages(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean resolved) {
        try {
            Page<Map<String, Object>> pageParam = new Page<>(page, size);
            return Result.success(conversationMapper.getConversationList(pageParam, keyword, role, resolved));
        } catch (Exception e) {
            log.error("获取对话历史失败", e);
            return Result.error("获取记录失败");
        }
    }

    /**
     * 获取指定会话的完整详情
     */
    @SaCheckRole("admin")
    @GetMapping("/session/{sessionId}")
    public Result<java.util.List<AITutorConversation>> getSessionDetail(@PathVariable String sessionId) {
        return Result.success(conversationMapper.selectList(
                new LambdaQueryWrapper<AITutorConversation>()
                        .eq(AITutorConversation::getSessionId, sessionId)
                        .eq(AITutorConversation::getDeleted, 0)
                        .orderByAsc(AITutorConversation::getCreateTime)));
    }

    /**
     * 更新会话处理状态
     */
    @SaCheckRole("admin")
    @PostMapping("/session/{sessionId}/resolved")
    public Result<Map<String, Object>> updateSessionResolved(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> body) {
        try {
            Boolean resolved = parseBoolean(body.get("resolved"));
            if (resolved == null) {
                return Result.error("缺少 resolved 参数");
            }

            LambdaUpdateWrapper<AITutorConversation> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(AITutorConversation::getSessionId, sessionId)
                    .eq(AITutorConversation::getDeleted, 0)
                    .set(AITutorConversation::getResolved, resolved)
                    .set(AITutorConversation::getUpdateTime, LocalDateTime.now());

            int affected = conversationMapper.update(null, updateWrapper);

            Map<String, Object> payload = new HashMap<>();
            payload.put("sessionId", sessionId);
            payload.put("resolved", resolved);
            payload.put("affectedRows", affected);
            return Result.success(payload);
        } catch (Exception e) {
            log.error("更新 AI 助教会话状态失败: sessionId={}", sessionId, e);
            return Result.error("更新会话状态失败");
        }
    }

    /**
     * 删除整个会话
     */
    @SaCheckRole("admin")
    @DeleteMapping("/session/{sessionId}")
    public Result<Map<String, Object>> deleteSession(@PathVariable String sessionId) {
        try {
            LambdaUpdateWrapper<AITutorConversation> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(AITutorConversation::getSessionId, sessionId)
                    .eq(AITutorConversation::getDeleted, 0)
                    .set(AITutorConversation::getDeleted, 1)
                    .set(AITutorConversation::getUpdateTime, LocalDateTime.now());

            int affected = conversationMapper.update(null, updateWrapper);

            Map<String, Object> payload = new HashMap<>();
            payload.put("sessionId", sessionId);
            payload.put("affectedRows", affected);
            return Result.success(payload);
        } catch (Exception e) {
            log.error("删除 AI 助教会话失败: sessionId={}", sessionId, e);
            return Result.error("删除会话失败");
        }
    }

    /**
     * 获取 AI 助教专项敏感审计日志
     */
    @SaCheckRole("admin")
    @GetMapping("/audit-logs")
    public Result<IPage<SensitiveLog>> getAuditLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        try {
            Page<SensitiveLog> pageParam = new Page<>(page, size);
            LambdaQueryWrapper<SensitiveLog> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.and(wrapper -> wrapper.likeRight(SensitiveLog::getAction, "AITutorController"));

            if (keyword != null && !keyword.isBlank()) {
                queryWrapper.and(wrapper -> wrapper
                        .like(SensitiveLog::getUsername, keyword)
                        .or()
                        .like(SensitiveLog::getContent, keyword)
                        .or()
                        .like(SensitiveLog::getMatchedWord, keyword));
            }

            queryWrapper.orderByDesc(SensitiveLog::getCreateTime);
            return Result.success(sensitiveLogMapper.selectPage(pageParam, queryWrapper));
        } catch (Exception e) {
            log.error("获取 AI 助教审计日志失败", e);
            return Result.error("获取审计日志失败");
        }
    }

    /**
     * 获取待清理的对话历史统计
     */
    @SaCheckRole("admin")
    @GetMapping("/cleanup/stats")
    public Result<Map<String, Object>> getCleanupStats() {
        try {
            long expiredCount = cleanupTask.getExpiredCount();
            int retentionDays = getIntConfig("ai_tutor_cleanup_days", DEFAULT_CLEANUP_DAYS, 1, 365);
            boolean autoCleanupEnabled = cleanupTask.isAutoCleanupEnabled();

            Map<String, Object> stats = new HashMap<>();
            stats.put("expiredCount", expiredCount);
            stats.put("retentionDays", retentionDays);
            stats.put("autoCleanupEnabled", autoCleanupEnabled);
            stats.put("message", expiredCount > 0
                    ? String.format("有 %d 条超过 %d 天的对话记录待清理", expiredCount, retentionDays)
                    : String.format("暂无超过 %d 天的过期记录需要清理", retentionDays));

            return Result.success(stats);
        } catch (Exception e) {
            log.error("获取清理统计失败", e);
            return Result.error("获取统计信息失败");
        }
    }

    /**
     * 手动触发清理任务
     */
    @SaCheckRole("admin")
    @PostMapping("/cleanup/trigger")
    public Result<Map<String, Object>> triggerCleanup(
            @RequestParam(required = false) Integer daysToKeep) {
        try {
            int effectiveDays = daysToKeep != null
                    ? Math.max(1, Math.min(daysToKeep, 365))
                    : getIntConfig("ai_tutor_cleanup_days", DEFAULT_CLEANUP_DAYS, 1, 365);

            int deletedCount = cleanupTask.manualCleanup(effectiveDays);

            Map<String, Object> result = new HashMap<>();
            result.put("deletedCount", deletedCount);
            result.put("daysToKeep", effectiveDays);
            result.put("message", String.format("成功清理 %d 条超过 %d 天的对话记录", deletedCount, effectiveDays));

            return Result.success(result);
        } catch (Exception e) {
            log.error("手动清理失败", e);
            return Result.error("清理失败: " + e.getMessage());
        }
    }

    /**
     * 获取 AI 助教专项配置
     */
    @SaCheckRole("admin")
    @GetMapping("/config")
    public Result<Map<String, Object>> getAIConfig() {
        return Result.success(buildConfigPayload());
    }

    /**
     * 更新 AI 助教专项配置
     */
    @SaCheckRole("admin")
    @PostMapping("/config")
    public Result<Map<String, Object>> updateAIConfig(@RequestBody Map<String, Object> body) {
        try {
            if (body.containsKey("model") || body.containsKey("activeModel")) {
                String model = parseString(body.containsKey("model") ? body.get("model") : body.get("activeModel"));
                if (model == null || model.isBlank() || "default".equals(model)) {
                    redisTemplate.delete("config:ai:tutor:model_override");
                } else {
                    redisTemplate.opsForValue().set("config:ai:tutor:model_override", model);
                }
            }

            if (body.containsKey("memoryDepth")) {
                int memoryDepth = getSafeInt(body.get("memoryDepth"), DEFAULT_MEMORY_DEPTH, 1, 30);
                systemConfigService.setConfigValue("ai_tutor_memory_depth", String.valueOf(memoryDepth));
            }

            if (body.containsKey("fewShotEnabled")) {
                boolean fewShotEnabled = Boolean.TRUE.equals(parseBoolean(body.get("fewShotEnabled")));
                systemConfigService.setConfigValue("ai_tutor_few_shot_enabled", String.valueOf(fewShotEnabled));
            }

            if (body.containsKey("fallbackEnabled")) {
                boolean fallbackEnabled = Boolean.TRUE.equals(parseBoolean(body.get("fallbackEnabled")));
                systemConfigService.setConfigValue("ai_tutor_fallback_enabled", String.valueOf(fallbackEnabled));
            }

            if (body.containsKey("cleanupDaysToKeep")) {
                int cleanupDays = getSafeInt(body.get("cleanupDaysToKeep"), DEFAULT_CLEANUP_DAYS, 1, 365);
                systemConfigService.setConfigValue("ai_tutor_cleanup_days", String.valueOf(cleanupDays));
            }

            if (body.containsKey("autoCleanup")) {
                boolean autoCleanupEnabled = Boolean.TRUE.equals(parseBoolean(body.get("autoCleanup")));
                systemConfigService.setConfigValue("ai_tutor_auto_cleanup_enabled", String.valueOf(autoCleanupEnabled));
            }

            return Result.success(buildConfigPayload());
        } catch (Exception e) {
            log.error("更新 AI 助教配置失败", e);
            return Result.error("更新配置失败");
        }
    }

    private Map<String, Object> buildConfigPayload() {
        Map<String, Object> config = new HashMap<>();
        String tutorOverride = redisTemplate.opsForValue().get("config:ai:tutor:model_override");
        String globalOverride = redisTemplate.opsForValue().get("config:ai:model_override");
        String effectiveModel = (tutorOverride != null && !tutorOverride.isBlank()) ? tutorOverride
                : (globalOverride != null && !globalOverride.isBlank() ? globalOverride : "default");

        config.put("activeModel", effectiveModel);
        config.put("isOverridden", tutorOverride != null && !tutorOverride.isBlank());
        config.put("memoryDepth", getIntConfig("ai_tutor_memory_depth", DEFAULT_MEMORY_DEPTH, 1, 30));
        config.put("fewShotEnabled", getBooleanConfig("ai_tutor_few_shot_enabled", true));
        config.put("fallbackEnabled", getBooleanConfig("ai_tutor_fallback_enabled", true));
        config.put("cleanupDaysToKeep", getIntConfig("ai_tutor_cleanup_days", DEFAULT_CLEANUP_DAYS, 1, 365));
        config.put("autoCleanup", getBooleanConfig("ai_tutor_auto_cleanup_enabled", true));
        return config;
    }

    private int getIntConfig(String key, int defaultValue, int min, int max) {
        try {
            String value = systemConfigService.getConfigValue(key, String.valueOf(defaultValue));
            int parsed = Integer.parseInt(value);
            return Math.max(min, Math.min(parsed, max));
        } catch (Exception e) {
            log.warn("读取配置 {} 失败，使用默认值 {}", key, defaultValue);
            return defaultValue;
        }
    }

    private int getSafeInt(Object rawValue, int defaultValue, int min, int max) {
        try {
            if (rawValue == null) {
                return defaultValue;
            }
            int parsed = Integer.parseInt(String.valueOf(rawValue));
            return Math.max(min, Math.min(parsed, max));
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private boolean getBooleanConfig(String key, boolean defaultValue) {
        try {
            String value = systemConfigService.getConfigValue(key, String.valueOf(defaultValue));
            return Boolean.parseBoolean(value);
        } catch (Exception e) {
            log.warn("读取配置 {} 失败，使用默认值 {}", key, defaultValue);
            return defaultValue;
        }
    }

    private Boolean parseBoolean(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        String normalized = String.valueOf(value).trim().toLowerCase();
        if ("true".equals(normalized) || "1".equals(normalized)) {
            return true;
        }
        if ("false".equals(normalized) || "0".equals(normalized)) {
            return false;
        }
        return null;
    }

    private String parseString(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }
}
