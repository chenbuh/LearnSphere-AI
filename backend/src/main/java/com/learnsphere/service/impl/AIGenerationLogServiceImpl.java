package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.AIGenerationLog;
import com.learnsphere.mapper.AIGenerationLogMapper;
import com.learnsphere.service.IAIGenerationLogService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AIGenerationLogServiceImpl extends ServiceImpl<AIGenerationLogMapper, AIGenerationLog>
        implements IAIGenerationLogService {

    @Async
    @Override
    public void log(Long userId, String action, String model, String prompt, String status, String error,
            Long durationMs, Integer inputTokens, Integer outputTokens, Integer totalTokens) {
        try {
            AIGenerationLog log = new AIGenerationLog();
            log.setUserId(userId);
            log.setActionType(action);
            log.setModelName(model);

            // Limit prompt preview length to avoid too long text
            if (prompt != null && prompt.length() > 500) {
                log.setPromptPreview(prompt.substring(0, 500) + "...");
            } else {
                log.setPromptPreview(prompt);
            }

            log.setStatus(status);
            log.setErrorMessage(error);
            log.setDurationMs(durationMs);

            // 设置 token 使用信息
            log.setInputTokens(inputTokens != null ? inputTokens : 0);
            log.setOutputTokens(outputTokens != null ? outputTokens : 0);
            log.setTotalTokens(totalTokens != null ? totalTokens : 0);

            log.setCreateTime(LocalDateTime.now());

            this.save(log);
        } catch (Exception e) {
            // Ignore logging errors to avoid impacting main business logic
            e.printStackTrace();
        }
    }
}
