package com.learnsphere.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.AITutorConversation;
import com.learnsphere.mapper.AITutorConversationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * AI Tutor 数据清理定时任务
 * 
 * 定期清理过期的对话历史数据，防止数据库膨胀
 * 
 * @author LearnSphere Team
 * @since 3.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AITutorCleanupTask {

    private final AITutorConversationMapper conversationMapper;

    /**
     * 对话历史保留天数（默认30天）
     */
    @Value("${ai.tutor.history.retention-days:30}")
    private int retentionDays;

    /**
     * 是否启用自动清理（默认true）
     */
    @Value("${ai.tutor.history.auto-cleanup:true}")
    private boolean autoCleanup;

    /**
     * 定时清理过期对话历史
     * 
     * Cron 表达式: 每天凌晨 2 点执行
     * 秒 分 时 日 月 周
     * 0 0 2 * * ?
     */
    @Scheduled(cron = "${ai.tutor.cleanup.cron:0 0 2 * * ?}")
    public void cleanupExpiredConversations() {
        if (!autoCleanup) {
            log.info("AI Tutor 自动清理已禁用");
            return;
        }

        try {
            log.info("开始清理过期的 AI Tutor 对话历史，保留天数: {}", retentionDays);

            // 计算截止日期
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
            log.info("清理截止日期: {}", cutoffDate);

            // 查询需要删除的记录数（用于日志）
            LambdaQueryWrapper<AITutorConversation> countWrapper = new LambdaQueryWrapper<>();
            countWrapper.lt(AITutorConversation::getCreateTime, cutoffDate)
                    .eq(AITutorConversation::getDeleted, 0);
            long countToDelete = conversationMapper.selectCount(countWrapper);

            if (countToDelete == 0) {
                log.info("没有需要清理的对话历史");
                return;
            }

            // 执行逻辑删除（软删除）
            LambdaQueryWrapper<AITutorConversation> deleteWrapper = new LambdaQueryWrapper<>();
            deleteWrapper.lt(AITutorConversation::getCreateTime, cutoffDate)
                    .eq(AITutorConversation::getDeleted, 0);

            AITutorConversation updateEntity = new AITutorConversation();
            updateEntity.setDeleted(1);

            int deletedCount = conversationMapper.update(updateEntity, deleteWrapper);

            log.info("AI Tutor 对话历史清理完成，共清理 {} 条记录", deletedCount);

            // 记录清理统计信息
            logCleanupStats(deletedCount, cutoffDate);

        } catch (Exception e) {
            log.error("清理 AI Tutor 对话历史时发生错误", e);
        }
    }

    /**
     * 物理删除已标记为删除的记录
     * 
     * Cron 表达式: 每周日凌晨 3 点执行
     * 0 0 3 ? * SUN
     */
    @Scheduled(cron = "${ai.tutor.purge.cron:0 0 3 ? * SUN}")
    public void purgeDeletedConversations() {
        if (!autoCleanup) {
            return;
        }

        try {
            log.info("开始物理删除已标记删除的 AI Tutor 对话记录");

            // 查询已逻辑删除超过 7 天的记录
            LocalDateTime purgeDate = LocalDateTime.now().minusDays(7);

            LambdaQueryWrapper<AITutorConversation> purgeWrapper = new LambdaQueryWrapper<>();
            purgeWrapper.eq(AITutorConversation::getDeleted, 1)
                    .lt(AITutorConversation::getUpdateTime, purgeDate);

            long countToPurge = conversationMapper.selectCount(purgeWrapper);

            if (countToPurge == 0) {
                log.info("没有需要物理删除的记录");
                return;
            }

            // 物理删除
            int purgedCount = conversationMapper.delete(purgeWrapper);

            log.info("AI Tutor 对话记录物理删除完成，共删除 {} 条记录", purgedCount);

        } catch (Exception e) {
            log.error("物理删除 AI Tutor 对话记录时发生错误", e);
        }
    }

    /**
     * 记录清理统计信息
     */
    private void logCleanupStats(int deletedCount, LocalDateTime cutoffDate) {
        // 统计当前数据库中的记录总数
        long totalCount = conversationMapper.selectCount(
                new LambdaQueryWrapper<AITutorConversation>()
                        .eq(AITutorConversation::getDeleted, 0));

        log.info("===== AI Tutor 清理统计 =====");
        log.info("清理截止日期: {}", cutoffDate);
        log.info("本次清理记录数: {}", deletedCount);
        log.info("剩余有效记录数: {}", totalCount);
        log.info("保留天数设置: {} 天", retentionDays);
        log.info("============================");
    }

    /**
     * 手动触发清理任务（供管理员使用）
     * 
     * @return 清理的记录数
     */
    public int manualCleanup(int daysToKeep) {
        log.info("手动触发 AI Tutor 对话历史清理，保留天数: {}", daysToKeep);

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);

        LambdaQueryWrapper<AITutorConversation> wrapper = new LambdaQueryWrapper<>();
        wrapper.lt(AITutorConversation::getCreateTime, cutoffDate)
                .eq(AITutorConversation::getDeleted, 0);

        AITutorConversation updateEntity = new AITutorConversation();
        updateEntity.setDeleted(1);

        int deletedCount = conversationMapper.update(updateEntity, wrapper);

        log.info("手动清理完成，共清理 {} 条记录", deletedCount);

        return deletedCount;
    }

    /**
     * 获取待清理的记录统计
     * 
     * @return 待清理记录数
     */
    public long getExpiredCount() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);

        LambdaQueryWrapper<AITutorConversation> wrapper = new LambdaQueryWrapper<>();
        wrapper.lt(AITutorConversation::getCreateTime, cutoffDate)
                .eq(AITutorConversation::getDeleted, 0);

        return conversationMapper.selectCount(wrapper);
    }
}
