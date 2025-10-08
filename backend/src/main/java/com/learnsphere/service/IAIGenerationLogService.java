package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.AIGenerationLog;

public interface IAIGenerationLogService extends IService<AIGenerationLog> {
    void log(Long userId, String action, String model, String prompt, String status, String error, Long durationMs,
            Integer inputTokens, Integer outputTokens, Integer totalTokens);
}
