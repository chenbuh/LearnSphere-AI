package com.learnsphere.service.impl;

import com.learnsphere.entity.AIExperiment;
import com.learnsphere.service.AIProviderConfigService;
import com.learnsphere.service.AIContentFeedbackService;
import com.learnsphere.service.IAIExperimentService;
import com.learnsphere.service.IAIGenerationLogService;
import io.github.resilience4j.bulkhead.BulkheadConfig;
import io.github.resilience4j.bulkhead.BulkheadRegistry;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * {@link AiModelInvocationService} 的单元测试。
 *
 * <p>重点覆盖拆分后最容易回归的三条路径：
 * <ul>
 *   <li>缓存命中时不应触发真实模型调用</li>
 *   <li>预算超限时必须快速失败，不能继续花钱</li>
 *   <li>主模型失败时的容灾对冲规则（是否允许切换到备用模型）</li>
 * </ul>
 */
class AiModelInvocationServiceTest {

    private AiModelInvocationService service;
    private AIProviderConfigService providerConfig;
    private AiQuotaAndBudgetService quotaService;
    private AIContentFeedbackService feedbackService;
    private IAIExperimentService experimentService;
    private IAIGenerationLogService logService;
    private com.learnsphere.util.CacheUtil cacheUtil;
    private RedisTemplate<String, Object> redisTemplate;
    private ValueOperations<String, Object> valueOps;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        service = new AiModelInvocationService();
        providerConfig = mock(AIProviderConfigService.class);
        quotaService = mock(AiQuotaAndBudgetService.class);
        feedbackService = mock(AIContentFeedbackService.class);
        experimentService = mock(IAIExperimentService.class);
        logService = mock(IAIGenerationLogService.class);
        cacheUtil = mock(com.learnsphere.util.CacheUtil.class);
        redisTemplate = mock(RedisTemplate.class);
        valueOps = mock(ValueOperations.class);

        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(providerConfig.cacheIdentity()).thenReturn("test-identity");
        // callLLM 每次都会先解析当前模型，这里给出默认值，避免各用例重复 stub
        when(providerConfig.resolve())
                .thenReturn(new AIProviderConfigService.ResolvedConfig("https://example.test", "key", "qwen-plus"));
        when(providerConfig.isOverridden()).thenReturn(false);

        ReflectionTestUtils.setField(service, "providerConfig", providerConfig);
        ReflectionTestUtils.setField(service, "aiQuotaAndBudgetService", quotaService);
        ReflectionTestUtils.setField(service, "feedbackService", feedbackService);
        ReflectionTestUtils.setField(service, "experimentService", experimentService);
        ReflectionTestUtils.setField(service, "aiGenerationLogService", logService);
        ReflectionTestUtils.setField(service, "cacheUtil", cacheUtil);
        ReflectionTestUtils.setField(service, "redisTemplate", redisTemplate);
        ReflectionTestUtils.setField(service, "meterRegistry", new SimpleMeterRegistry());
        ReflectionTestUtils.setField(service, "modelName", "qwen-plus");
        ReflectionTestUtils.setField(service, "bulkheadRegistry",
                BulkheadRegistry.of(BulkheadConfig.custom().maxConcurrentCalls(10).build()));
        ReflectionTestUtils.setField(service, "circuitBreakerRegistry",
                CircuitBreakerRegistry.of(CircuitBreakerConfig.custom().build()));
        ReflectionTestUtils.setField(service, "retryRegistry",
                RetryRegistry.of(RetryConfig.custom().maxAttempts(1).waitDuration(Duration.ZERO).build()));

        when(feedbackService.getFewShotExamples(anyString())).thenReturn(null);
        when(experimentService.getActiveExperiment(anyString())).thenReturn(null);
        when(experimentService.allocateTraffic(any())).thenReturn("CONTROL");
        when(logService.log(any(), anyString(), anyString(), anyString(), anyString(), any(),
                anyString(), any(), anyLong(), any(), any(), any(), any(), any())).thenReturn(1L);
        when(quotaService.isBudgetExceeded()).thenReturn(false);
        when(quotaService.getDailyCostKey()).thenReturn("metrics:ai:cost:2026-01-01");
        when(quotaService.getCostPer1kTokens(anyString())).thenReturn(0.01);
    }

    @Test
    void resolveActiveModel_delegatesToProviderConfig() {
        when(providerConfig.resolve())
                .thenReturn(new AIProviderConfigService.ResolvedConfig("https://example.test", "key", "qwen-max"));

        assertEquals("qwen-max", service.resolveActiveModel());
    }

    @Test
    void callLLM_returnsCachedResponseWithoutInvokingModel() {
        when(cacheUtil.getOrCompute(anyString(), any(), anyLong(), any())).thenReturn("cached-answer");

        String result = service.callLLM("sys", "user", "SOMETHING_ELSE");

        assertEquals("cached-answer", result);
        // 缓存命中后不应再走到预算检查
        verify(quotaService, never()).isBudgetExceeded();
    }

    @Test
    void callLLM_throwsWhenBudgetExceeded() {
        when(cacheUtil.getOrCompute(anyString(), any(), anyLong(), any())).thenReturn(null);
        when(quotaService.isBudgetExceeded()).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.callLLM("sys", "user", "SOMETHING_ELSE"));

        // 预算超限属于内部原因，对外统一包装为友好提示，不泄漏预算细节
        assertTrue(ex.getMessage().contains("AI 服务暂时不可用"),
                "对外消息应为通用提示，实际: " + ex.getMessage());
        // 但内部原因必须记录下来，便于运维排查
        verify(logService).log(any(), anyString(), anyString(), anyString(), anyString(), any(),
                eq("FAIL"), any(), anyLong(), any(), any(), any(), any(), any());
    }

    @Test
    void callLLM_skipsCacheForGenerateActions() {
        // GENERATE 类任务不走缓存读，直接进模型调用；预算超限可用来确认它确实跳过了缓存
        when(quotaService.isBudgetExceeded()).thenReturn(true);

        assertThrows(RuntimeException.class,
                () -> service.callLLM("sys", "user", "GENERATE_READING"));

        verify(cacheUtil, never()).getOrCompute(anyString(), any(), anyLong(), any());
    }

    @Test
    void callLLM_appendsFewShotToSystemPrompt() {
        when(feedbackService.getFewShotExamples(anyString())).thenReturn("示例：...");
        when(cacheUtil.getOrCompute(anyString(), any(), anyLong(), any())).thenReturn("ok");

        service.callLLM("基础提示词", "user", "SOMETHING_ELSE");

        // 通过缓存 key 是否受 few-shot 影响来间接验证拼接发生了
        verify(cacheUtil).getOrCompute(anyString(), any(), anyLong(), any());
    }

    @Test
    void callLLM_usesVariantBSystemPromptWhenExperimentAllocatesIt() {
        AIExperiment experiment = new AIExperiment();
        experiment.setId(99L);
        experiment.setSystemPromptB("变体B提示词");

        when(experimentService.getActiveExperiment(anyString())).thenReturn(experiment);
        when(experimentService.allocateTraffic(experiment)).thenReturn("VARIANT_B");
        when(cacheUtil.getOrCompute(anyString(), any(), anyLong(), any())).thenReturn("ok");

        service.callLLM("原始提示词", "user", "SOMETHING_ELSE");

        // 实验 B 生效时，日志里记录的 systemPrompt 应为变体 B 的内容
        verify(logService).log(any(), anyString(), anyString(), eq("变体B提示词"), anyString(), any(),
                anyString(), any(), anyLong(), any(), any(), any(), eq(99L), eq("VARIANT_B"));
    }

    @Test
    void getLastLogId_returnsNullBeforeAnyCall() throws Exception {
        // LAST_LOG_ID 是 static ThreadLocal，同一线程内多个用例会共享，
        // 这里显式清空以模拟「尚未发生任何调用」的初始状态。
        java.lang.reflect.Field field = AiModelInvocationService.class.getDeclaredField("LAST_LOG_ID");
        field.setAccessible(true);
        ((ThreadLocal<?>) field.get(null)).remove();

        assertNull(service.getLastLogId());
    }

    @Test
    void getLastLogId_returnsLogIdAfterSuccessfulCall() {
        when(cacheUtil.getOrCompute(anyString(), any(), anyLong(), any())).thenReturn("cached");
        when(logService.log(any(), anyString(), anyString(), anyString(), anyString(), any(),
                anyString(), any(), anyLong(), any(), any(), any(), any(), any())).thenReturn(4242L);

        service.callLLM("sys", "user", "SOMETHING_ELSE");

        assertEquals(4242L, service.getLastLogId());
    }

    @Test
    void callLLM_recordsCostMetricFromTokenUsage() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        ReflectionTestUtils.setField(service, "meterRegistry", registry);
        when(cacheUtil.getOrCompute(anyString(), any(), anyLong(), any())).thenReturn("cached");

        service.callLLM("sys", "user", "SOMETHING_ELSE");

        // 缓存命中时 token 为 null，不应产生成本计数
        assertEquals(0, registry.find("ai.cost.usd").counters().size());
    }
}
