package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.AIGenerationLog;
import java.util.Map;

public interface IAIGenerationLogService extends IService<AIGenerationLog> {
    Long log(Long userId, String action, String model, String systemPrompt, String prompt, String response,
            String status,
            String error, Long durationMs, Integer inputTokens, Integer outputTokens, Integer totalTokens);

    /**
     * Log with Experiment Info
     */
    Long log(Long userId, String action, String model, String systemPrompt, String prompt, String response,
            String status, String error, Long durationMs, Integer inputTokens, Integer outputTokens,
            Integer totalTokens, Long experimentId, String variant);

    /**
     * 分析 AI 运行健康状况（失败率、常见错误、P95/P99 耗时）
     */
    Map<String, Object> analyzeHealth();

    /**
     * 获取 AI 调用的总体统计信息 (总数、Token、模型分布等)
     */
    Map<String, Object> getStats();

    /**
     * 分析 AI 调用趋势
     * 
     * @param days 最近天数
     * @return 每日统计列表
     */
    java.util.List<Map<String, Object>> analyzeTrend(Integer days);
}
