package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.SystemPrompt;
import com.learnsphere.mapper.SystemPromptMapper;
import com.learnsphere.service.ISystemPromptService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SystemPromptServiceImpl extends ServiceImpl<SystemPromptMapper, SystemPrompt>
        implements ISystemPromptService {

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
}
