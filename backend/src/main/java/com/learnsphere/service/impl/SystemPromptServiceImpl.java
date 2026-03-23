package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.SystemPrompt;
import com.learnsphere.entity.SystemPromptHistory;
import com.learnsphere.mapper.SystemPromptMapper;
import com.learnsphere.mapper.SystemPromptHistoryMapper;
import com.learnsphere.service.ISystemPromptService;
import com.learnsphere.util.SystemPromptMetadataHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class SystemPromptServiceImpl extends ServiceImpl<SystemPromptMapper, SystemPrompt>
        implements ISystemPromptService {

    @Autowired
    private SystemPromptHistoryMapper historyMapper;

    @Override
    public String getPromptTemplate(String key, String defaultContent, String description) {
        LambdaQueryWrapper<SystemPrompt> query = new LambdaQueryWrapper<>();
        query.eq(SystemPrompt::getPromptKey, key);
        SystemPrompt prompt = this.baseMapper.selectOne(query);
        String resolvedDescription = SystemPromptMetadataHelper.resolveDescription(key, description);

        if (prompt == null) {
            prompt = new SystemPrompt();
            prompt.setPromptKey(key);
            prompt.setContent(defaultContent);
            prompt.setDescription(resolvedDescription);
            prompt.setCreateTime(LocalDateTime.now());
            prompt.setUpdateTime(LocalDateTime.now());
            this.save(prompt);
            return defaultContent;
        }

        if (!StringUtils.hasText(prompt.getDescription()) && StringUtils.hasText(resolvedDescription)) {
            prompt.setDescription(resolvedDescription);
            prompt.setUpdateTime(LocalDateTime.now());
            this.updateById(prompt);
        }

        return prompt.getContent();
    }

    @Override
    @Transactional
    public void updateWithHistory(Long id, String content, String description, String remark) {
        SystemPrompt prompt = this.getById(id);
        if (prompt == null)
            return;

        // 1. 保存历史记录
        SystemPromptHistory history = new SystemPromptHistory();
        history.setPromptId(id);
        history.setPromptKey(prompt.getPromptKey());
        history.setContent(prompt.getContent()); // 保存旧内容

        // 计算版本号
        Long count = historyMapper.selectCount(new QueryWrapper<SystemPromptHistory>().eq("prompt_id", id));
        history.setVersion(count.intValue() + 1);
        history.setRemark(remark);
        history.setCreateTime(LocalDateTime.now());
        historyMapper.insert(history);

        // 2. 更新当前内容
        prompt.setContent(content);
        prompt.setDescription(SystemPromptMetadataHelper.resolveDescription(prompt.getPromptKey(), description));
        prompt.setUpdateTime(LocalDateTime.now());
        this.updateById(prompt);
    }

    @Override
    @Transactional
    public void rollback(Long promptId, Long historyId) {
        SystemPromptHistory history = historyMapper.selectById(historyId);
        if (history == null)
            return;

        SystemPrompt prompt = this.getById(promptId);
        if (prompt == null)
            return;

        // 回滚前先备份当前版本
        updateWithHistory(promptId, history.getContent(), prompt.getDescription(), "回滚至版本 V" + history.getVersion());
    }
}
