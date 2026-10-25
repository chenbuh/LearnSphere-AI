package com.learnsphere.common.aspect;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.annotation.RequireVip;
import com.learnsphere.entity.User;
import com.learnsphere.exception.QuotaExceededException;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.service.IUserService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 配额扣减与退款的行为测试。
 *
 * <p>这组测试保护的是资金方向的行为：不该扣的不能扣，该退的必须退。
 * 所以每条断言都写明「为什么」，避免以后有人为了让测试变绿而改错方向。
 *
 * <p>登录态用 {@link Mockito#mockStatic} 拦截 {@link StpUtil}，
 * 因为 Sa-Token 1.37 未提供 context mock 工具类。
 */
class VipCheckAspectTest {

    private IUserService userService;
    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOps;
    private VipCheckAspect aspect;
    private ProceedingJoinPoint point;
    private MockedStatic<StpUtil> stpUtil;

    private static final long USER_ID = 42L;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setup() {
        userService = mock(IUserService.class);
        redisTemplate = mock(StringRedisTemplate.class);
        valueOps = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);

        ISystemConfigService configService = mock(ISystemConfigService.class);
        when(configService.getConfigValue(anyString(), anyString()))
                .thenAnswer(call -> call.getArgument(1));

        aspect = new VipCheckAspect(userService, redisTemplate, configService);
        point = mock(ProceedingJoinPoint.class);

        User user = new User();
        user.setId(USER_ID);
        user.setVipLevel(0);
        user.setDailyAiQuota(100);
        when(userService.getById(USER_ID)).thenReturn(user);
    }

    @AfterEach
    void closeStaticMock() {
        if (stpUtil != null) {
            stpUtil.close();
            stpUtil = null;
        }
    }

    /** 以指定登录身份开启 StpUtil 静态 mock。 */
    private void loginAs(Object loginId) {
        stpUtil = Mockito.mockStatic(StpUtil.class);
        stpUtil.when(StpUtil::getLoginId).thenReturn(loginId);
    }

    /** 构造一个注解实例，避免每个测试重复写匿名类。 */
    private RequireVip vip(String feature, int cost, boolean checkQuota) {
        return new RequireVip() {
            @Override
            public Class<? extends java.lang.annotation.Annotation> annotationType() {
                return RequireVip.class;
            }

            @Override
            public String feature() {
                return feature;
            }

            @Override
            public int minLevel() {
                return 0;
            }

            @Override
            public boolean checkQuota() {
                return checkQuota;
            }

            @Override
            public int quotaCost() {
                return cost;
            }
        };
    }

    @Nested
    @DisplayName("业务成功时保留扣减")
    class SuccessKeepsCharge {

        @Test
        void normalReturnKeepsQuotaCharged() throws Throwable {
            loginAs(String.valueOf(USER_ID));
            when(valueOps.increment(anyString(), anyLong())).thenReturn(2L);
            Map<String, Object> ok = new HashMap<>();
            ok.put("passages", "content");
            when(point.proceed()).thenReturn(ok);

            Object result = aspect.checkVip(point, vip("AI 听力生成", 2, true));

            assertThat(result).isSameAs(ok);
            // 成功调用不该退款
            verify(valueOps, never()).decrement(anyString(), anyLong());
        }
    }

    @Nested
    @DisplayName("失败时退还额度")
    class FailureRefunds {

        @Test
        void exceptionTriggersRefundAndRethrows() throws Throwable {
            loginAs(String.valueOf(USER_ID));
            when(valueOps.increment(anyString(), anyLong())).thenReturn(2L);
            when(valueOps.decrement(anyString(), anyLong())).thenReturn(0L);
            when(point.proceed()).thenThrow(new IllegalStateException("AI 接口请求失败（HTTP 500）"));

            assertThatThrownBy(() -> aspect.checkVip(point, vip("AI 阅读理解生成", 2, true)))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("500");

            // 必须退款，否则用户白掉一次额度
            verify(valueOps).decrement(anyString(), eq(2L));
        }

        @Test
        void localFallbackCountsAsNoCharge() throws Throwable {
            loginAs(String.valueOf(USER_ID));
            when(valueOps.increment(anyString(), anyLong())).thenReturn(2L);
            when(valueOps.decrement(anyString(), anyLong())).thenReturn(0L);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("_from", "local");
            fallback.put("_fallbackReason", "api_error");
            when(point.proceed()).thenReturn(fallback);

            Object result = aspect.checkVip(point, vip("AI 听力生成", 2, true));

            // 降级内容仍要返回给用户，但额度必须退
            assertThat(result).isSameAs(fallback);
            verify(valueOps).decrement(anyString(), eq(2L));
        }

        @Test
        void mockFallbackAlsoCountsAsNoCharge() throws Throwable {
            // _from 有两个降级取值：local 与 mock。只认 local 会漏掉 mock 这条路径，
            // 导致 AI 失败走兜底生成器时用户仍被扣额度。
            loginAs(String.valueOf(USER_ID));
            when(valueOps.increment(anyString(), anyLong())).thenReturn(2L);
            when(valueOps.decrement(anyString(), anyLong())).thenReturn(0L);
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("_from", "mock");
            fallback.put("message", "AI quota exceeded, using local mock data");
            when(point.proceed()).thenReturn(fallback);

            Object result = aspect.checkVip(point, vip("AI 阅读理解生成", 2, true));

            assertThat(result).isSameAs(fallback);
            verify(valueOps).decrement(anyString(), eq(2L));
        }

        @Test
        void realAiResultIsChargedEvenThoughItHasOtherFields() throws Throwable {
            // 反向保护：真正的 AI 结果不应被误判为降级而退款
            loginAs(String.valueOf(USER_ID));
            when(valueOps.increment(anyString(), anyLong())).thenReturn(2L);
            Map<String, Object> real = new HashMap<>();
            real.put("passage", "A long article...");
            real.put("questions", java.util.List.of());
            when(point.proceed()).thenReturn(real);

            aspect.checkVip(point, vip("AI 阅读理解生成", 2, true));

            verify(valueOps, never()).decrement(anyString(), anyLong());
        }

        @Test
        void refundClearsKeyWhenCounterDropsToZero() throws Throwable {
            loginAs(String.valueOf(USER_ID));
            when(valueOps.increment(anyString(), anyLong())).thenReturn(2L);
            when(valueOps.decrement(anyString(), anyLong())).thenReturn(0L);
            when(point.proceed()).thenThrow(new RuntimeException("boom"));

            assertThatThrownBy(() -> aspect.checkVip(point, vip("AI 写作批改", 2, true)))
                    .isInstanceOf(RuntimeException.class);

            // 归零后清理键，避免残留 0 值影响当天判断
            verify(redisTemplate).delete(anyString());
        }

        @Test
        void refundFailureDoesNotMaskOriginalBusinessException() throws Throwable {
            loginAs(String.valueOf(USER_ID));
            when(valueOps.increment(anyString(), anyLong())).thenReturn(2L);
            when(valueOps.decrement(anyString(), anyLong())).thenThrow(new RuntimeException("redis down"));
            when(point.proceed()).thenThrow(new IllegalStateException("AI 接口请求失败（HTTP 503）"));

            // 退款失败不能让用户看到 redis 的错误，必须原样抛业务异常
            assertThatThrownBy(() -> aspect.checkVip(point, vip("AI 口语评测", 3, true)))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("503")
                    .hasMessageNotContaining("redis down");
        }
    }

    @Nested
    @DisplayName("不扣额度的场景")
    class NoCharge {

        @Test
        void checkQuotaFalseNeverTouchesRedis() throws Throwable {
            loginAs(String.valueOf(USER_ID));
            when(point.proceed()).thenThrow(new RuntimeException("boom"));

            assertThatThrownBy(() -> aspect.checkVip(point, vip("AI 听力生成", 2, false)))
                    .isInstanceOf(RuntimeException.class);

            // checkQuota=false 的功能自行管理额度，切面不应介入
            verify(valueOps, never()).increment(anyString(), anyLong());
            verify(valueOps, never()).decrement(anyString(), anyLong());
        }

        @Test
        void adminIdentitySkipsQuotaEntirely() throws Throwable {
            loginAs("admin:1");
            when(point.proceed()).thenThrow(new RuntimeException("boom"));

            assertThatThrownBy(() -> aspect.checkVip(point, vip("AI 写作批改", 3, true)))
                    .isInstanceOf(RuntimeException.class);

            verify(valueOps, never()).increment(anyString(), anyLong());
            verify(valueOps, never()).decrement(anyString(), anyLong());
        }
    }

    @Nested
    @DisplayName("配额超限")
    class QuotaExceeded {

        @Test
        void exceedingDailyQuotaRollsBackAndThrows() throws Throwable {
            loginAs(String.valueOf(USER_ID));
            when(valueOps.increment(anyString(), anyLong())).thenReturn(101L);

            assertThatThrownBy(() -> aspect.checkVip(point, vip("AI 阅读理解生成", 2, true)))
                    .isInstanceOf(QuotaExceededException.class);

            // 超限时要把这次预扣回滚，否则计数会被推高
            verify(valueOps).decrement(anyString(), eq(2L));
            // 业务方法不应被调用
            verify(point, never()).proceed();
        }
    }
}
