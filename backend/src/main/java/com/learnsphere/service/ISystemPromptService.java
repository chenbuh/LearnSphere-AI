package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.SystemPrompt;
import com.learnsphere.util.ExamTypeSupport;

public interface ISystemPromptService extends IService<SystemPrompt> {
    /**
     * Get prompt template by key. If not found, create one with default content.
     */
    String getPromptTemplate(String key, String defaultContent, String description);

    /**
     * 读取学段感知的提示词模板。
     *
     * <p>用户提示词早就按学段拆成了 {@code WRITING_GEN_USER_PRIMARY} 等三份，
     * 但系统提示词一直只有一份，于是「小学英语」的写作题仍然按四六级的口吻命题。
     * 这里把「学段存在就读 {@code *_PRIMARY}/{@code *_MIDDLE}/{@code *_HIGH}，
     * 否则回落到基础键」的规则收敛到一个默认方法，避免每个调用点各写一遍。
     *
     * <p>之所以放在接口里而不是各实现类里：这条规则必须和
     * {@link ExamTypeSupport#resolvePromptKey} 完全一致，否则同一份配置
     * 会在系统提示词和用户提示词两侧走到不同的键上，运营在后台看到的分组也会乱。
     *
     * @param baseKey        基础键，例如 {@code WRITING_GEN_SYSTEM}
     * @param defaultContent 键不存在时写入的默认内容
     * @param description    后台展示说明，学段键会自动补上「（小学）」这类后缀
     * @param examType       前端传入的考试/学段标识，可为 null
     * @return 命中的提示词内容
     */
    default String getStageAwarePromptTemplate(String baseKey, String defaultContent, String description,
            String examType) {
        String stageKey = ExamTypeSupport.resolvePromptKey(baseKey, examType);
        String resolvedDescription = stageKey.equals(baseKey)
                ? description
                : description + "（" + ExamTypeSupport.getPromptDescriptionSuffix(examType) + "）";
        return getPromptTemplate(stageKey, defaultContent, resolvedDescription);
    }

    /**
     * Update prompt content and save to history
     */
    void updateWithHistory(Long id, String content, String description, String remark);

    /**
     * Rollback to a specific version
     */
    void rollback(Long promptId, Long historyId);
}
