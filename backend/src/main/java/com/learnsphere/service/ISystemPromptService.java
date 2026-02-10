package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.SystemPrompt;

public interface ISystemPromptService extends IService<SystemPrompt> {
    /**
     * Get prompt template by key. If not found, create one with default content.
     */
    String getPromptTemplate(String key, String defaultContent, String description);

    /**
     * Update prompt content and save to history
     */
    void updateWithHistory(Long id, String content, String remark);

    /**
     * Rollback to a specific version
     */
    void rollback(Long promptId, Long historyId);
}
