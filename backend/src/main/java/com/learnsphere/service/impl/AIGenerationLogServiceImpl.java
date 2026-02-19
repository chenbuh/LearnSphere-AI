package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.AIGenerationLog;
import com.learnsphere.mapper.AIGenerationLogMapper;
import com.learnsphere.service.IAIGenerationLogService;
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
        @Override
        public Long log(Long userId, String action, String model, String systemPrompt, String prompt, String response,
                        String status, String error,
                        Long durationMs, Integer inputTokens, Integer outputTokens, Integer totalTokens) {
                return log(userId, action, model, systemPrompt, prompt, response, status, error, durationMs,
                                inputTokens, outputTokens, totalTokens, null, null);
        }

        @Override
        public Long log(Long userId, String action, String model, String systemPrompt, String prompt, String response,
                        String status, String error, Long durationMs, Integer inputTokens, Integer outputTokens,
                        Integer totalTokens, Long experimentId, String variant) {
                try {
                        AIGenerationLog log = new AIGenerationLog();
                        log.setUserId(userId);
                        log.setActionType(action);
                        log.setModelName(model);
                        log.setSystemPrompt(com.learnsphere.utils.DataMaskUtil.maskSensitiveInfo(systemPrompt));
                        log.setPromptPreview(com.learnsphere.utils.DataMaskUtil.maskSensitiveInfo(prompt));
                        log.setResponseContent(response);

                        log.setStatus(status);
                        log.setErrorMessage(error);
                        log.setDurationMs(durationMs);

                        // 设置 token 使用信息
                        log.setInputTokens(inputTokens != null ? inputTokens : 0);
                        log.setOutputTokens(outputTokens != null ? outputTokens : 0);
                        log.setTotalTokens(totalTokens != null ? totalTokens : 0);

                        // A/B Experiment
                        log.setExperimentId(experimentId);
                        log.setVariant(variant);

                        log.setCreateTime(LocalDateTime.now());

                        this.save(log);
                        return log.getId();
                } catch (Exception e) {
                        log.error("Failed to save AI generation log", e);
                        return null;
                }
        }

        @Override
        public java.util.Map<String, Object> analyzeHealth() {
                java.util.Map<String, Object> health = new java.util.HashMap<>();

                // 1. 常见错误分析 (Status = FAIL, Group by errorMessage)
                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog> errorQuery = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                errorQuery.select("error_message as error, COUNT(*) as count")
                                .eq("status", "FAIL")
                                .isNotNull("error_message")
                                .groupBy("error_message")
                                .orderByDesc("count")
                                .last("LIMIT 5");
                health.put("commonErrors", this.listMaps(errorQuery));

                // 2. 失败率最高的指令 (Group by actionType)
                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog> actionQuery = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                actionQuery.select("action_type as action, " +
                                "SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as failRate, " +
                                "COUNT(*) as total")
                                .groupBy("action_type")
                                .having("COUNT(*) > 0")
                                .orderByDesc("failRate")
                                .last("LIMIT 5");
                health.put("highFailureActions", this.listMaps(actionQuery));

                // 3. 响应耗时统计 (P95, P99)
                // 获取最近 1000 条记录的耗时进行计算
                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog> durationQuery = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                durationQuery.select("duration_ms").orderByDesc("create_time").last("LIMIT 1000");
                java.util.List<Object> durations = this.listObjs(durationQuery);

                if (!durations.isEmpty()) {
                        java.util.List<Long> sortedDurations = durations.stream()
                                        .filter(java.util.Objects::nonNull)
                                        .map(obj -> ((Number) obj).longValue())
                                        .sorted()
                                        .collect(java.util.stream.Collectors.toList());

                        int size = sortedDurations.size();
                        health.put("p95", sortedDurations.get((int) (size * 0.95)));
                        health.put("p99", sortedDurations.get((int) (size * 0.99)));
                        health.put("max", sortedDurations.get(size - 1));
                        health.put("min", sortedDurations.get(0));
                }

                return health;
        }

        @Override
        public java.util.Map<String, Object> getStats() {
                java.util.Map<String, Object> result = new java.util.HashMap<>();

                // 1. Total Calls
                long totalCalls = this.count();
                result.put("totalCalls", totalCalls);

                // 2. Failed Calls & Success Rate
                long failedCalls = this.count(
                                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog>()
                                                .eq("status", "FAIL"));
                double successRate = totalCalls > 0 ? (double) (totalCalls - failedCalls) / totalCalls * 100 : 100.0;
                result.put("successRate", Double.parseDouble(String.format("%.2f", successRate)));

                // 3. Avg Duration (ms)
                Object avgDurationObj = this
                                .getObj(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog>()
                                                .select("AVG(duration_ms)"), obj -> obj);
                double avgDuration = avgDurationObj != null ? ((Number) avgDurationObj).doubleValue() : 0.0;
                result.put("avgDuration", (long) avgDuration);

                // 4. Last 24h Calls
                long last24hCalls = this
                                .count(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog>()
                                                .ge("create_time", LocalDateTime.now().minusHours(24)));
                result.put("last24hCalls", last24hCalls);

                // 5. Total Tokens
                Object totalTokensObj = this
                                .getObj(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog>()
                                                .select("SUM(total_tokens)"), obj -> obj);
                long totalTokens = totalTokensObj != null ? ((Number) totalTokensObj).longValue() : 0;
                result.put("totalTokens", totalTokens);

                // 6. Avg Tokens per Call
                long avgTokens = totalCalls > 0 ? totalTokens / totalCalls : 0;
                result.put("avgTokens", avgTokens);

                // 7. Tokens used in last 24h
                Object tokens24hObj = this
                                .getObj(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog>()
                                                .select("SUM(total_tokens)")
                                                .ge("create_time", LocalDateTime.now().minusHours(24)), obj -> obj);
                long tokens24h = tokens24hObj != null ? ((Number) tokens24hObj).longValue() : 0;
                result.put("tokens24h", tokens24h);

                // 8. Model Usage Distribution
                java.util.List<java.util.Map<String, Object>> modelUsage = this.listMaps(
                                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog>()
                                                .select("model_name as model", "COUNT(*) as count",
                                                                "SUM(input_tokens) as input",
                                                                "SUM(output_tokens) as output")
                                                .groupBy("model_name")
                                                .orderByDesc("count"));
                result.put("modelUsage", modelUsage != null ? modelUsage : new java.util.ArrayList<>());

                // 9. AI 助教提问专项统计
                Object tutorTokensObj = this
                                .getObj(new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog>()
                                                .select("SUM(total_tokens)")
                                                .eq("action_type", "AI 助教提问"), obj -> obj);
                long tutorTokens = tutorTokensObj != null ? ((Number) tutorTokensObj).longValue() : 0;
                result.put("tutorTokens", tutorTokens);

                long tutorCalls = this.count(
                                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog>()
                                                .eq("action_type", "AI 助教提问"));
                result.put("tutorCalls", tutorCalls);

                return result;
        }

        @Override
        public java.util.List<java.util.Map<String, Object>> analyzeTrend(Integer days) {
                // SQL:
                // SELECT DATE(create_time) as date,
                // COUNT(*) as total,
                // SUM(CASE WHEN status='FAIL' THEN 1 ELSE 0 END) as fail,
                // SUM(total_tokens) as totalTokens,
                // AVG(duration_ms) as avgDuration
                // FROM ai_generation_log
                // WHERE create_time >= NOW() - INTERVAL N DAY
                // GROUP BY DATE(create_time)
                // ORDER BY date ASC

                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<AIGenerationLog> query = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();

                // 注意：H2/MySQL的日期函数可能不同，这里假设MySQL环境
                query.select("DATE_FORMAT(create_time, '%Y-%m-%d') as date",
                                "COUNT(*) as total",
                                "SUM(CASE WHEN status='FAIL' THEN 1 ELSE 0 END) as fail",
                                "SUM(total_tokens) as totalTokens",
                                "AVG(duration_ms) as avgDuration")
                                .ge("create_time", LocalDateTime.now().minusDays(days))
                                .groupBy("DATE_FORMAT(create_time, '%Y-%m-%d')")
                                .orderByAsc("date");

                return this.listMaps(query);
        }
}
