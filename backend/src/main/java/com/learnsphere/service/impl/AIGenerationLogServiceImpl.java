package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.AIGenerationLog;
import com.learnsphere.mapper.AIGenerationLogMapper;
import com.learnsphere.service.IAIGenerationLogService;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;

@Slf4j
@Service
public class AIGenerationLogServiceImpl extends ServiceImpl<AIGenerationLogMapper, AIGenerationLog>
        implements IAIGenerationLogService {

    /**
     * 异步记录 AI 生成日志
     * 用于追踪 AI 接口的调用情况、Token 消耗以及错误排查。
     * 使用 @Async 注解确保日志入库操作不阻塞主业务线程。
     *
     * @param userId       调用用户的 ID
     * @param action       操作类型 (e.g., "GENERATE_READING", "EVALUATE_WRITING")
     * @param model        使用的模型名称 (e.g., "qwen-plus")
     * @param prompt       发送给 AI 的提示词（过长会被自动截断）
     * @param status       执行状态 ("SUCCESS" / "FAIL")
     * @param error        错误信息（如果有）
     * @param durationMs   耗时（毫秒）
     * @param inputTokens  输入 Token 数
     * @param outputTokens 输出 Token 数
     * @param totalTokens  总 Token 数
     */
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
            // Log error properly instead of printStackTrace
            log.error("Failed to save AI generation log", e);
        }
    }
}
