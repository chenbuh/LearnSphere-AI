package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.AIGenerationLog;
import com.learnsphere.entity.SystemPrompt;
import com.learnsphere.service.IAIGenerationLogService;
import com.learnsphere.service.IAIGenerationService;
import com.learnsphere.service.ISystemPromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

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

    @Autowired
    private IAIGenerationService aiGenerationService;

    /**
     * Test AI Prompt (Sandbox)
     */
    @PostMapping("/test")
    @com.learnsphere.common.annotation.AdminOperation(module = "AI治理", action = "沙箱测试Prompt")
    public Result<?> testPrompt(@RequestBody Map<String, String> params) {
        String systemPrompt = params.get("systemPrompt");
        String userPrompt = params.get("userPrompt");
        if (userPrompt == null || userPrompt.isEmpty()) {
            return Result.error("User prompt cannot be empty");
        }
        return Result.success(aiGenerationService.testPrompt(systemPrompt, userPrompt));
    }

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
    @com.learnsphere.common.annotation.AdminOperation(module = "AI治理", action = "新增系统提示词")
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
    @com.learnsphere.common.annotation.AdminOperation(module = "AI治理", action = "修改系统提示词")
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
    @com.learnsphere.common.annotation.AdminOperation(module = "AI治理", action = "删除系统提示词")
    public Result<?> deletePrompt(@PathVariable Long id) {
        systemPromptService.removeById(id);
        return Result.success("Delete successful");
    }

    /**
     * 获取 AI 运行健康报告 (P95/P99, 错误聚合)
     */
    @GetMapping("/health")
    public Result<?> getAIHealth() {
        return Result.success(aiGenerationLogService.analyzeHealth());
    }

    /**
     * Get AI logs
     */
    @GetMapping("/logs")
    public Result<?> getLogs(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) Long userId) {

        Page<AIGenerationLog> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AIGenerationLog> query = new LambdaQueryWrapper<>();

        if (status != null && !status.isEmpty()) {
            query.eq(AIGenerationLog::getStatus, status);
        }

        if (actionType != null && !actionType.isEmpty()) {
            query.eq(AIGenerationLog::getActionType, actionType);
        }

        if (userId != null) {
            query.eq(AIGenerationLog::getUserId, userId);
        }

        query.orderByDesc(AIGenerationLog::getCreateTime);

        return Result.success(aiGenerationLogService.page(pageParam, query));
    }

    @Autowired
    private org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    @GetMapping("/stats")
    public Result<?> getAIStats() {
        try {
            return Result.success(aiGenerationLogService.getStats());
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("Failed to get AI stats");
        }
    }

    @GetMapping("/trends")
    public Result<?> getAITrends(@RequestParam(defaultValue = "7") Integer days) {
        try {
            return Result.success(aiGenerationLogService.analyzeTrend(days));
        } catch (Exception e) {
            return Result.success(java.util.Collections.emptyList());
        }
    }
}
