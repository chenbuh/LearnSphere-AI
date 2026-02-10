package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.SystemPrompt;
import com.learnsphere.entity.SystemPromptHistory;
import com.learnsphere.mapper.SystemPromptMapper;
import com.learnsphere.mapper.SystemPromptHistoryMapper;
import com.learnsphere.service.ISystemPromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (prompt == null) {
            prompt = new SystemPrompt();
            prompt.setPromptKey(key);
            prompt.setContent(defaultContent);
            prompt.setDescription(description);
            prompt.setCreateTime(LocalDateTime.now());
            prompt.setUpdateTime(LocalDateTime.now());
            this.save(prompt);
            return defaultContent;
        }

        return prompt.getContent();
    }

    @Override
    @Transactional
    public void updateWithHistory(Long id, String content, String remark) {
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
        updateWithHistory(promptId, history.getContent(), "回滚自版本 V" + history.getVersion());
    }
}
