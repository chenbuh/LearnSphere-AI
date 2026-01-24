package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.AIGenerationLog;
import java.util.Map;

public interface IAIGenerationLogService extends IService<AIGenerationLog> {
    void log(Long userId, String action, String model, String systemPrompt, String prompt, String response,
            String status,
            String error, Long durationMs, Integer inputTokens, Integer outputTokens, Integer totalTokens);

    /**
     * 分析 AI 运行健康状况（失败率、常见错误、P95/P99 耗时）
     */
    Map<String, Object> analyzeHealth();
}
