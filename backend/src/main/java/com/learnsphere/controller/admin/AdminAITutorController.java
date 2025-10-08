package com.learnsphere.controller.admin;

import com.learnsphere.common.Result;
import com.learnsphere.task.AITutorCleanupTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private final AITutorCleanupTask cleanupTask;

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
}
