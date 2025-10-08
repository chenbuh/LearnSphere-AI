package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.AIGenerationLog;
import com.learnsphere.entity.SystemPrompt;
import com.learnsphere.service.IAIGenerationLogService;
import com.learnsphere.service.ISystemPromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * AI Governance Controller
 */
@RestController
@RequestMapping("/api/admin/ai")
public class AdminAIController {

    @Autowired
    private ISystemPromptService systemPromptService;

    @Autowired
    private IAIGenerationLogService aiGenerationLogService;

    /**
     * Get all prompts
     */
    @GetMapping("/prompts")
    public Result<?> getPrompts() {
        return Result.success(systemPromptService.list());
    }

    /**
     * Add new prompt
     */
    @PostMapping("/prompts")
    public Result<?> addPrompt(@RequestBody SystemPrompt prompt) {
        if (prompt.getPromptKey() == null || prompt.getPromptKey().isEmpty()) {
            return Result.error("Prompt Key cannot be empty");
        }
        // Check duplicate
        long count = systemPromptService.count(new LambdaQueryWrapper<SystemPrompt>()
                .eq(SystemPrompt::getPromptKey, prompt.getPromptKey()));
        if (count > 0) {
            return Result.error("Prompt Key already exists");
        }

        prompt.setCreateTime(LocalDateTime.now());
        prompt.setUpdateTime(LocalDateTime.now());
        systemPromptService.save(prompt);
        return Result.success("Prompt created successfully");
    }

    /**
     * Update prompt
     */
    @PutMapping("/prompts/{id}")
    public Result<?> updatePrompt(@PathVariable Long id, @RequestBody SystemPrompt prompt) {
        SystemPrompt existing = systemPromptService.getById(id);
        if (existing == null) {
            return Result.error("Prompt not found");
        }
        existing.setDescription(prompt.getDescription());
        existing.setContent(prompt.getContent());
        existing.setUpdateTime(LocalDateTime.now());
        systemPromptService.updateById(existing);
        return Result.success("Update successful");
    }

    /**
     * Delete prompt
     */
    @DeleteMapping("/prompts/{id}")
    public Result<?> deletePrompt(@PathVariable Long id) {
        systemPromptService.removeById(id);
        return Result.success("Delete successful");
    }

    /**
     * Get AI logs
     */
    @GetMapping("/logs")
    public Result<?> getLogs(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String actionType) {

        Page<AIGenerationLog> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AIGenerationLog> query = new LambdaQueryWrapper<>();

        if (status != null && !status.isEmpty()) {
            query.eq(AIGenerationLog::getStatus, status);
        }

        if (actionType != null && !actionType.isEmpty()) {
            query.eq(AIGenerationLog::getActionType, actionType);
        }

        query.orderByDesc(AIGenerationLog::getCreateTime);

        return Result.success(aiGenerationLogService.page(pageParam, query));
    }
}
