package com.learnsphere.service.impl;

import com.learnsphere.entity.User;
import com.learnsphere.service.ISystemConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * {@link AiQuotaAndBudgetService} 的单元测试。
 *
 * <p>覆盖从 AIGenerationServiceImpl 拆出后需要保持不变的纯逻辑：
 * 配额单价解析、每日额度解析、模型成本表、预算判定。这些方法不涉及
 * 内容生成，可直接用 mock 依赖验证。
 */
class AiQuotaAndBudgetServiceTest {

    private AiQuotaAndBudgetService service;
    private ISystemConfigService systemConfigService;
    private RedisTemplate<String, Object> redisTemplate;
    private ValueOperations<String, Object> valueOperations;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        service = new AiQuotaAndBudgetService();
        systemConfigService = mock(ISystemConfigService.class);
        redisTemplate = mock(RedisTemplate.class);
        valueOperations = mock(ValueOperations.class);

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        ReflectionTestUtils.setField(service, "systemConfigService", systemConfigService);
        ReflectionTestUtils.setField(service, "redisTemplate", redisTemplate);
    }

    @Test
    void resolveAiQuotaCost_usesDefaultWhenFeatureUnknown() {
        // 未在映射表中的功能名应直接返回调用方给的默认值，不查配置
        assertEquals(3, service.resolveAiQuotaCost("未知功能", 3));
    }

    @Test
    void resolveAiQuotaCost_readsConfigForKnownFeature() {
        when(systemConfigService.getConfigValue("quota_cost_reading", "2")).thenReturn("7");
        assertEquals(7, service.resolveAiQuotaCost("AI 阅读理解生成", 2));
    }

    @Test
    void resolveAiQuotaCost_fallsBackOnInvalidConfigValue() {
        // 配置值非数字时应回退默认值，而不是抛异常中断 AI 功能
        when(systemConfigService.getConfigValue("quota_cost_grammar", "2")).thenReturn("not-a-number");
        assertEquals(2, service.resolveAiQuotaCost("AI 语法生成", 2));
    }

    @Test
    void resolveDailyAiQuota_prefersExplicitUserQuota() {
        User user = new User();
        user.setDailyAiQuota(42);
        // 显式配置优先，不应触达系统配置
        assertEquals(42, service.resolveDailyAiQuota(user));
    }

    @Test
    void resolveDailyAiQuota_usesFreeTierDefaultForNonVip() {
        User user = new User();
        user.setVipLevel(0);
        user.setVipExpireTime(null);
        when(systemConfigService.getConfigValue("ai.limit.daily.0", "15")).thenReturn("15");
        assertEquals(15, service.resolveDailyAiQuota(user));
    }

    @Test
    void resolveDailyAiQuota_usesVipTierConfig() {
        User user = new User();
        user.setVipLevel(2);
        user.setVipExpireTime(java.time.LocalDateTime.now().plusDays(10));
        when(systemConfigService.getConfigValue("ai.limit.daily.2", "120")).thenReturn("120");
        assertEquals(120, service.resolveDailyAiQuota(user));
    }

    @Test
    void getCostPer1kTokens_matchesQwen35Variants() {
        assertEquals(0.012, service.getCostPer1kTokens("qwen3.5-max-latest"), 1e-9);
        assertEquals(0.002, service.getCostPer1kTokens("qwen3.5-plus"), 1e-9);
        assertEquals(0.0003, service.getCostPer1kTokens("qwen3.5-turbo-instruct"), 1e-9);
        assertEquals(0.003, service.getCostPer1kTokens("qwen3.5-vl"), 1e-9);
    }

    @Test
    void getCostPer1kTokens_matchesLegacyModelsAndDefaults() {
        assertEquals(0.012, service.getCostPer1kTokens("qwen-max"), 1e-9);
        assertEquals(0.002, service.getCostPer1kTokens("qwen-plus-latest"), 1e-9);
        assertEquals(0.001, service.getCostPer1kTokens("some-unknown-model"), 1e-9);
        assertEquals(0.0, service.getCostPer1kTokens(null), 1e-9);
    }

    @Test
    void isBudgetExceeded_falseWhenNoCostRecorded() {
        when(systemConfigService.getConfigValue("ai_daily_budget_usd", "5.0")).thenReturn("5.0");
        when(valueOperations.get(anyString())).thenReturn(null);
        assertFalse(service.isBudgetExceeded());
    }

    @Test
    void isBudgetExceeded_trueWhenCostReachesBudget() {
        when(systemConfigService.getConfigValue("ai_daily_budget_usd", "5.0")).thenReturn("5.0");
        when(valueOperations.get(anyString())).thenReturn("5.00");
        assertTrue(service.isBudgetExceeded());
    }

    @Test
    void isBudgetExceeded_allowsRequestWhenCheckFails() {
        // 配置读取异常时必须放行，避免 Redis/配置故障导致 AI 功能整体不可用
        when(systemConfigService.getConfigValue(eq("ai_daily_budget_usd"), anyString()))
                .thenThrow(new RuntimeException("redis down"));
        assertFalse(service.isBudgetExceeded());
    }

    @Test
    void getDailyCostKey_isDateScoped() {
        String key = service.getDailyCostKey();
        assertTrue(key.startsWith("ai:cost:daily:"));
        assertTrue(key.endsWith(java.time.LocalDate.now().toString()));
    }
}
