package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.entity.*;
import com.learnsphere.mapper.SystemPromptHistoryMapper;
import com.learnsphere.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * AI 治理控制器
 */
@RestController
@RequestMapping("/api/admin/ai")
public class AdminAIController {

    @Autowired
    private ISystemPromptService systemPromptService;

    @Autowired
    private IAIGenerationLogService aiGenerationLogService;

    @Autowired
    private SystemPromptHistoryMapper historyMapper;

    @Autowired
    private IAIGenerationService aiGenerationService;

    @Autowired
    private IAIExperimentService experimentService;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 测试 AI Prompt (沙箱)
     */
    @PostMapping("/test")
    @AdminOperation(module = "AI治理", action = "沙箱测试Prompt")
    public Result<?> testPrompt(@RequestBody Map<String, String> params) {
        String systemPrompt = params.get("systemPrompt");
        String userPrompt = params.get("userPrompt");
        if (userPrompt == null || userPrompt.isEmpty()) {
            return Result.error("用户提示词不能为空");
        }
        return Result.success(aiGenerationService.testPrompt(systemPrompt, userPrompt));
    }

    /**
     * 获取所有提示词
     */
    @GetMapping("/prompts")
    public Result<?> getPrompts() {
        return Result.success(systemPromptService.list());
    }

    /**
     * 新增提示词
     */
    @PostMapping("/prompts")
    @AdminOperation(module = "AI治理", action = "新增系统提示词")
    public Result<?> addPrompt(@RequestBody SystemPrompt prompt) {
        if (prompt.getPromptKey() == null || prompt.getPromptKey().isEmpty()) {
            return Result.error("提示词 Key 不能为空");
        }
        long count = systemPromptService.count(new LambdaQueryWrapper<SystemPrompt>()
                .eq(SystemPrompt::getPromptKey, prompt.getPromptKey()));
        if (count > 0) {
            return Result.error("提示词 Key 已存在");
        }

        prompt.setCreateTime(LocalDateTime.now());
        prompt.setUpdateTime(LocalDateTime.now());
        systemPromptService.save(prompt);
        return Result.success("创建成功");
    }

    /**
     * 更新提示词
     */
    @PutMapping("/prompts/{id}")
    @AdminOperation(module = "AI治理", action = "修改系统提示词")
    public Result<?> updatePrompt(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        SystemPrompt existing = systemPromptService.getById(id);
        if (existing == null) {
            return Result.error("提示词不存在");
        }

        String content = (String) params.get("content");
        String remark = (String) params.get("remark");
        systemPromptService.updateWithHistory(id, content, remark != null ? remark : "手动更新");
        return Result.success("更新成功");
    }

    /**
     * 获取版本历史
     */
    @GetMapping("/prompts/{id}/history")
    public Result<?> getPromptHistory(@PathVariable Long id) {
        List<SystemPromptHistory> history = historyMapper.selectList(new LambdaQueryWrapper<SystemPromptHistory>()
                .eq(SystemPromptHistory::getPromptId, id)
                .orderByDesc(SystemPromptHistory::getVersion));
        return Result.success(history);
    }

    /**
     * 回滚版本
     */
    @PostMapping("/prompts/{id}/rollback")
    @AdminOperation(module = "AI治理", action = "回滚系统提示词")
    public Result<?> rollbackPrompt(@PathVariable Long id, @RequestBody Map<String, Long> params) {
        Long historyId = params.get("historyId");
        if (historyId == null) {
            return Result.error("历史 ID 必填");
        }
        systemPromptService.rollback(id, historyId);
        return Result.success("回滚成功");
    }

    /**
     * 删除提示词
     */
    @DeleteMapping("/prompts/{id}")
    @AdminOperation(module = "AI治理", action = "删除系统提示词")
    public Result<?> deletePrompt(@PathVariable Long id) {
        systemPromptService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 获取健康报告
     */
    @GetMapping("/health")
    public Result<?> getAIHealth() {
        return Result.success(aiGenerationLogService.analyzeHealth());
    }

    /**
     * 获取日志列表
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

    /**
     * 获取总体统计
     */
    @GetMapping("/stats")
    public Result<?> getAIStats() {
        try {
            return Result.success(aiGenerationLogService.getStats());
        } catch (Exception e) {
            return Result.error("获取统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取趋势数据
     */
    @GetMapping("/trends")
    public Result<?> getAITrends(@RequestParam(defaultValue = "7") Integer days) {
        try {
            return Result.success(aiGenerationLogService.analyzeTrend(days));
        } catch (Exception e) {
            return Result.success(Collections.emptyList());
        }
    }

    /**
     * 获取 AI 配置
     */
    @GetMapping("/config")
    public Result<?> getAIConfig() {
        Map<String, Object> config = new HashMap<>();
        String override = stringRedisTemplate.opsForValue().get("config:ai:model_override");
        config.put("activeModel", override != null ? override : "系统默认");
        config.put("isOverridden", override != null);
        return Result.success(config);
    }

    /**
     * 更新 AI 配置
     */
    @PostMapping("/config")
    public Result<?> updateAIConfig(@RequestBody Map<String, String> body) {
        String model = body.get("model");
        if (model == null || model.isEmpty() || "default".equals(model)) {
            stringRedisTemplate.delete("config:ai:model_override");
            return Result.success("已恢复系统默认设置");
        }
        stringRedisTemplate.opsForValue().set("config:ai:model_override", model);
        return Result.success("AI 模型已切换为: " + model);
    }

    /**
     * 获取实验列表
     */
    @GetMapping("/experiments")
    public Result<?> listExperiments() {
        return Result.success(experimentService.list(
                new LambdaQueryWrapper<AIExperiment>().orderByDesc(AIExperiment::getCreateTime)));
    }

    /**
     * 开启 A/B 实验
     */
    @PostMapping("/experiments")
    public Result<?> startExperiment(@RequestBody AIExperiment experiment) {
        LambdaUpdateWrapper<AIExperiment> update = new LambdaUpdateWrapper<>();
        update.eq(AIExperiment::getActionType, experiment.getActionType())
                .eq(AIExperiment::getStatus, "RUNNING")
                .set(AIExperiment::getStatus, "STOPPED")
                .set(AIExperiment::getEndTime, LocalDateTime.now());
        experimentService.update(update);

        experiment.setStatus("RUNNING");
        experiment.setCreateTime(LocalDateTime.now());
        experiment.setStartTime(LocalDateTime.now());
        experimentService.save(experiment);
        return Result.success(experiment);
    }

    /**
     * 获取实验报告
     */
    @GetMapping("/experiments/{id}/report")
    public Result<?> getExperimentReport(@PathVariable Long id) {
        return Result.success(experimentService.getExperimentReport(id));
    }

    /**
     * 停止实验
     */
    @PostMapping("/experiments/{id}/stop")
    public Result<?> stopExperiment(@PathVariable Long id) {
        AIExperiment exp = experimentService.getById(id);
        if (exp != null) {
            exp.setStatus("STOPPED");
            exp.setEndTime(LocalDateTime.now());
            experimentService.updateById(exp);
        }
        return Result.success("实验已停止");
    }

    /**
     * 获取闭环统计数据
     */
    @GetMapping("/loop-stats")
    public Result<?> getAILoopStats() {
        Map<String, Object> stats = new HashMap<>();

        String summarySql = """
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as postives,
                    SUM(CASE WHEN rating = -1 THEN 1 ELSE 0 END) as negatives,
                    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as processed
                FROM ai_content_feedback
                WHERE create_time > NOW() - INTERVAL 30 DAY
                """;
        List<Map<String, Object>> summaryList = jdbcTemplate.queryForList(summarySql);
        stats.put("summary", summaryList.isEmpty() ? Collections.emptyMap() : summaryList.get(0));

        String anomalySql = """
                SELECT
                    l.action_type,
                    COUNT(*) as total,
                    SUM(CASE WHEN f.rating = -1 THEN 1 ELSE 0 END) as negatives,
                    ROUND(SUM(CASE WHEN f.rating = -1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as fail_rate
                FROM ai_content_feedback f
                JOIN ai_generation_log l ON f.log_id = l.id
                GROUP BY l.action_type
                HAVING total >= 5 AND fail_rate > 15
                ORDER BY fail_rate DESC
                """;
        stats.put("anomalies", jdbcTemplate.queryForList(anomalySql));

        String fewShotSql = """
                SELECT
                    l.action_type,
                    COUNT(*) as example_count,
                    MAX(f.create_time) as last_update
                FROM ai_content_feedback f
                JOIN ai_generation_log l ON f.log_id = l.id
                WHERE f.status = 1 AND f.corrected_content IS NOT NULL
                GROUP BY l.action_type
                """;
        stats.put("fewShotCoverage", jdbcTemplate.queryForList(fewShotSql));

        return Result.success(stats);
    }

    /**
     * 生成 AI 每日简报
     */
    @GetMapping("/briefing")
    @AdminOperation(module = "AI治理", action = "生成每日简报")
    public Result<?> getAIBriefing() {
        return Result.success(aiGenerationService.generateAIBriefing());
    }
}
