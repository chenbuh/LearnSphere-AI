package com.learnsphere.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.learnsphere.service.AIChatClient;
import com.learnsphere.service.AIContentFeedbackService;
import com.learnsphere.service.IAIExperimentService;
import com.learnsphere.service.IAIGenerationLogService;
import io.github.resilience4j.bulkhead.BulkheadRegistry;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryRegistry;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Arrays;

/**
 * 大模型调用服务。
 *
 * <p>从 {@link AIGenerationServiceImpl}（原 3367 行）中抽出的第三块职责：
 * 模型路由、缓存、限流熔断重试、A/B 实验、降级对冲，以及调用日志与指标埋点。
 *
 * <p>这块逻辑被原类中 20 处业务方法复用，是本项目最核心的基础设施。
 * 抽出后业务类只需关注「提示词怎么写、结果怎么解析」，不再关心
 * 「调用失败怎么办、指标怎么记、成本怎么算」。
 *
 * <p>调用链路：
 * <pre>
 *   callLLM
 *     ├─ few-shot 注入（feedbackService）
 *     ├─ A/B 实验分流（experimentService）→ 可能替换 systemPrompt
 *     ├─ 结果缓存命中判断（cacheUtil，仅非 GENERATE 类任务）
 *     ├─ 预算检查（AiQuotaAndBudgetService）
 *     ├─ Resilience4j 装饰：Retry → CircuitBreaker → Bulkhead → doInternalCallLLM
 *     ├─ 失败时降级对冲到备用模型
 *     └─ finally：写调用日志、Redis 指标、成本累计、Micrometer 指标
 * </pre>
 *
 * <p>降级策略：仅当当前模型就是 application.yml 的默认值、且后台未强制覆盖模型时，
 * 才切到备用模型（plus ↔ turbo）。这样后台配置了新模型时不会被硬编码的旧模型顶掉。
 *
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class AiModelInvocationService {

    /** 缓存 TTL（小时） */
    private static final long CACHE_TTL_HOURS = 24L;

    /** 熔断器名称 */
    private static final String CIRCUIT_BREAKER_NAME = "aiService";

    /** 重试器名称 */
    private static final String RETRY_NAME = "aiService";

    /**
     * 当前线程最近一次 AI 调用的日志 ID。
     *
     * <p>由 {@link #callLLM} 在 finally 中写入，供上层在需要时关联反馈数据。
     * 使用 ThreadLocal 是因为一次请求内可能发生多次 AI 调用，需要按线程隔离。
     */
    private static final ThreadLocal<Long> LAST_LOG_ID = new ThreadLocal<>();

    @Value("${ai.model:qwen-plus}")
    private String modelName;

    @Autowired
    private com.learnsphere.service.AIProviderConfigService providerConfig;

    @Autowired
    private AIChatClient aiChatClient;

    @Autowired
    private AiQuotaAndBudgetService aiQuotaAndBudgetService;

    @Autowired
    private AIContentFeedbackService feedbackService;

    @Autowired
    private IAIExperimentService experimentService;

    @Autowired
    private IAIGenerationLogService aiGenerationLogService;

    @Autowired
    private com.learnsphere.util.CacheUtil cacheUtil;

    @Autowired
    private BulkheadRegistry bulkheadRegistry;

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @Autowired
    private RetryRegistry retryRegistry;

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 返回当前线程最近一次 AI 调用的日志 ID。
     */
    public Long getLastLogId() {
        return LAST_LOG_ID.get();
    }

    /**
     * 调用大模型，带缓存、限流、熔断、重试、降级与指标埋点。
     *
     * @param systemPrompt 系统提示词
     * @param userPrompt   用户提示词
     * @param actionType   动作类型，用于 few-shot 选择、缓存策略与指标标签
     * @return 模型返回的原始文本
     * @throws RuntimeException 主备模型均失败时抛出，消息对用户友好
     */
    public String callLLM(String systemPrompt, String userPrompt, String actionType) {
        // 加入 Few-shot 示例（自动化持续学习）
        String fewShot = feedbackService.getFewShotExamples(actionType);
        final String fSystemPrompt = (fewShot != null && !fewShot.isEmpty())
                ? systemPrompt + "\n" + fewShot
                : systemPrompt;
        final String fUserPrompt = userPrompt;

        Long userId = null;
        try {
            if (StpUtil.isLogin()) {
                userId = StpUtil.getLoginIdAsLong();
            }
        } catch (Exception e) {
            // Ignore
        }

        long start = System.currentTimeMillis();
        String status = "SUCCESS";
        String error = null;
        Integer inputTokens = null;
        Integer outputTokens = null;
        Integer totalTokens = null;
        String[] finalResponseArr = new String[1];
        final Integer[] tokens = new Integer[3]; // [input, output, total]

        Timer.Sample sample = Timer.start(meterRegistry);
        String cacheStatus = actionType.contains("GENERATE") ? "skip" : "miss";

        // 动态模型路由
        String activeModel = resolveActiveModel();
        final String fActiveModel = activeModel;

        LAST_LOG_ID.remove();

        // A/B Experiment Check
        com.learnsphere.entity.AIExperiment experiment = experimentService.getActiveExperiment(actionType);
        final String fVariant = experimentService.allocateTraffic(experiment);
        final Long fExperimentId = experiment != null ? experiment.getId() : null;

        String effectiveSystemPrompt = fSystemPrompt;
        if (experiment != null && "VARIANT_B".equals(fVariant) && experiment.getSystemPromptB() != null) {
            effectiveSystemPrompt = experiment.getSystemPromptB();
            // Add few-shot if needed, or assume systemPromptB is complete.
            // Ideally we should append few-shot to variant B as well if it's dynamic.
            // For now, let's keep it simple and just use B.
            if (feedbackService.getFewShotExamples(actionType) != null
                    && !feedbackService.getFewShotExamples(actionType).isEmpty()) {
                effectiveSystemPrompt += "\n" + feedbackService.getFewShotExamples(actionType);
            }
        }
        final String fEffectiveSystemPrompt = effectiveSystemPrompt;

        // 效能优化：AI 结果缓存 (Cost Control)
        String cacheKey = "ai:cache:"
                + cn.hutool.crypto.digest.DigestUtil
                        .md5Hex(providerConfig.cacheIdentity() + fActiveModel + fEffectiveSystemPrompt + fUserPrompt);
        try {
            if (!actionType.contains("GENERATE")) { // Avoid caching for random generation tasks
                String cachedResponse = cacheUtil.getOrCompute(cacheKey, () -> null, CACHE_TTL_HOURS,
                        java.util.concurrent.TimeUnit.HOURS);
                if (cachedResponse != null) {
                    cacheStatus = "hit";
                    log.info("AI cache hit (Cost Saved): {}", actionType);
                    finalResponseArr[0] = cachedResponse;
                    return cachedResponse;
                }
            }

            if (aiQuotaAndBudgetService.isBudgetExceeded()) {
                log.warn("AI budget exceeded, block action: {}", actionType);
                throw new RuntimeException("AI budget exceeded");
            }

            String bName = actionType.contains("GENERATE") && !actionType.contains("GRAMMAR") ? "slowTask"
                    : "fastTask";
            io.github.resilience4j.bulkhead.Bulkhead bulkhead = bulkheadRegistry.bulkhead(bName);
            io.github.resilience4j.circuitbreaker.CircuitBreaker cb = circuitBreakerRegistry
                    .circuitBreaker(CIRCUIT_BREAKER_NAME);
            io.github.resilience4j.retry.Retry retry = retryRegistry.retry(RETRY_NAME);

            // 装饰顺序：Bulkhead -> CircuitBreaker -> Retry
            finalResponseArr[0] = io.github.resilience4j.retry.Retry.decorateSupplier(retry,
                    io.github.resilience4j.circuitbreaker.CircuitBreaker.decorateSupplier(cb,
                            io.github.resilience4j.bulkhead.Bulkhead.decorateSupplier(bulkhead, () -> {
                                return doInternalCallLLM(fActiveModel, fEffectiveSystemPrompt, fUserPrompt, tokens);
                            })))
                    .get();

            inputTokens = tokens[0];
            outputTokens = tokens[1];
            totalTokens = tokens[2];

            // 写入缓存 (仅非随机生成类任务)
            if (!actionType.contains("GENERATE") && finalResponseArr[0] != null) {
                cacheUtil.getOrCompute(cacheKey, () -> finalResponseArr[0], CACHE_TTL_HOURS,
                        java.util.concurrent.TimeUnit.HOURS);
            }

            return finalResponseArr[0];
        } catch (Exception e) {
            log.warn("AI 服务主模型调用失败 [{}], 尝试容灾对冲: {}", fActiveModel, e.getMessage());
            // 容灾对冲 (Failover): 如果用户在后台强制覆盖了模型 (比如填写了新申请的 qwen-max)，
            // 那么就不应该使用硬编码的 qwen-turbo/qwen-plus 作为备用，否则又会切回没钱的模型。
            String fallbackModel = fActiveModel;
            if (fActiveModel.equals(modelName) && !providerConfig.isOverridden()) {
                // 只有在没有被覆盖（使用 application.yml 默认值）的情况下，才使用默认的降级逻辑
                fallbackModel = fActiveModel.contains("plus") ? "qwen-turbo" : "qwen-plus";
            }
            try {
                if (!fallbackModel.equals(fActiveModel)) {
                    log.info("尝试切换到备用模型 [{}]", fallbackModel);
                }
                finalResponseArr[0] = doInternalCallLLM(fallbackModel, fEffectiveSystemPrompt, fUserPrompt, tokens);
                status = "SUCCESS";
                inputTokens = tokens[0];
                outputTokens = tokens[1];
                totalTokens = tokens[2];
                log.info("AI 服务通过备用模型 [{}] 成功恢复", fallbackModel);
                return finalResponseArr[0];
            } catch (Exception fatal) {
                status = "FAIL";
                error = fatal.getMessage();
                log.error("AI 服务全链路崩溃 (主/备模型均失败): {}", fatal.getMessage());
                throw new RuntimeException("AI 服务暂时不可用，请稍后再试", fatal);
            }
        } finally {

            // 记录日志并获取 ID
            Long logId = aiGenerationLogService.log(userId, actionType, fActiveModel, fEffectiveSystemPrompt,
                    fUserPrompt,
                    finalResponseArr[0],
                    status,
                    error, System.currentTimeMillis() - start, inputTokens, outputTokens, totalTokens,
                    fExperimentId, fVariant);

            if (logId != null) {
                LAST_LOG_ID.set(logId);
            }

            // 实时记录 Metrics 到 Redis (for Admin Dashboard)
            try {
                String today = java.time.LocalDate.now().toString();
                String modelKey = fActiveModel.toLowerCase();

                // 1. 总调用次数
                redisTemplate.opsForValue().increment("metrics:ai:calls:total:" + today);

                // 2. 失败次数
                if ("FAIL".equals(status)) {
                    redisTemplate.opsForValue().increment("metrics:ai:calls:failed:" + today);
                }

                // 3. Token 消耗 (按模型统计)
                if (inputTokens != null && inputTokens > 0) {
                    redisTemplate.opsForValue().increment("metrics:model:" + modelKey + ":tokens:input:" + today,
                            inputTokens);
                }
                if (outputTokens != null && outputTokens > 0) {
                    redisTemplate.opsForValue().increment("metrics:model:" + modelKey + ":tokens:output:" + today,
                            outputTokens);
                }
            } catch (Exception e) {
                log.warn("Failed to record AI metrics to Redis: {}", e.getMessage());
            }

            // Micrometer metrics
            // Cost metrics & budget tracking
            try {
                if (totalTokens != null && totalTokens > 0) {
                    double costPer1k = aiQuotaAndBudgetService.getCostPer1kTokens(fActiveModel);
                    double cost = (totalTokens / 1000.0) * costPer1k;
                    String costKey = aiQuotaAndBudgetService.getDailyCostKey();
                    if (redisTemplate != null) {
                        redisTemplate.opsForValue().increment(costKey, cost);
                    }
                    if (meterRegistry != null) {
                        meterRegistry.counter("ai.cost.usd", "model", fActiveModel)
                                .increment(cost);
                    }
                    aiQuotaAndBudgetService.maybeWarnBudget(costKey);
                }
            } catch (Exception e) {
                log.warn("Failed to record AI cost metrics: {}", e.getMessage());
            }

            try {
                if (meterRegistry != null) {
                    Timer timer = Timer.builder("ai.request.latency")
                            .tags("action", actionType, "model", fActiveModel, "status", status, "cache", cacheStatus)
                            .register(meterRegistry);
                    sample.stop(timer);
                    meterRegistry
                            .counter("ai.request.total", "action", actionType, "model", fActiveModel, "status", status)
                            .increment();
                    if (inputTokens != null && inputTokens > 0) {
                        meterRegistry.counter("ai.tokens.total", "model", fActiveModel, "type", "input")
                                .increment(inputTokens);
                    }
                    if (outputTokens != null && outputTokens > 0) {
                        meterRegistry.counter("ai.tokens.total", "model", fActiveModel, "type", "output")
                                .increment(outputTokens);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to record AI metrics to Micrometer: {}", e.getMessage());
            }
        }
    }

    /**
     * 解析当前生效的模型名（后台覆盖优先，其次配置文件默认值）。
     */
    public String resolveActiveModel() {
        return providerConfig.resolve().model();
    }

    /**
     * 内部原始调用方法，由 Resilience 控制器进行包装。
     *
     * <p>{@code tokens} 为出参数组，按 [input, output, total] 顺序回填用量，
     * 便于调用方在装饰器外层读取。
     */
    private String doInternalCallLLM(String model, String systemPrompt, String userPrompt, Integer[] tokens) {
        Message systemMsg = Message.builder().role(Role.SYSTEM.getValue()).content(systemPrompt).build();
        Message userMsg = Message.builder().role(Role.USER.getValue()).content(userPrompt).build();
        try {
            GenerationResult result = aiChatClient.chat(model, Arrays.asList(systemMsg, userMsg), 0.85f, 0.8);
            if (result.getUsage() != null) {
                tokens[0] = result.getUsage().getInputTokens();
                tokens[1] = result.getUsage().getOutputTokens();
                tokens[2] = result.getUsage().getTotalTokens();
            }
            return result.getOutput().getChoices().get(0).getMessage().getContent();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
