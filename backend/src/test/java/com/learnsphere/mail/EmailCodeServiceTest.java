package com.learnsphere.mail;

import com.learnsphere.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EmailCodeServiceTest {

    private static final String EMAIL = "user@example.com";

    private final Map<String, String> store = new HashMap<>();
    private MailService mailService;
    private EmailCodeService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() throws Exception {
        // 用内存 Map 模拟 Redis 的字符串操作
        StringRedisTemplate redis = mock(StringRedisTemplate.class);
        ValueOperations<String, String> ops = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(ops);
        when(ops.setIfAbsent(anyString(), anyString(), any(Duration.class)))
                .thenAnswer(inv -> store.putIfAbsent(inv.getArgument(0), inv.getArgument(1)) == null);
        doAnswer(inv -> store.put(inv.getArgument(0), inv.getArgument(1)))
                .when(ops).set(anyString(), anyString(), any(Duration.class));
        when(ops.get(anyString())).thenAnswer(inv -> store.get((String) inv.getArgument(0)));
        when(ops.increment(anyString())).thenAnswer(inv -> {
            String k = inv.getArgument(0);
            long v = Long.parseLong(store.getOrDefault(k, "0")) + 1;
            store.put(k, String.valueOf(v));
            return v;
        });
        when(redis.delete(anyString())).thenAnswer(inv -> store.remove((String) inv.getArgument(0)) != null);

        mailService = mock(MailService.class);
        when(mailService.isEnabled()).thenReturn(true);
        service = new EmailCodeService(redis, mailService);
    }

    private String sentCode() {
        return store.get("email_code:reset:" + EMAIL);
    }

    @Test
    void sendThenVerifyConsumesCode() throws Exception {
        service.send("reset", EMAIL, true, false);
        String code = sentCode();
        assertNotNull(code);
        assertTrue(code.matches("[0-9]{6}"));
        verify(mailService).sendHtml(eq(EMAIL), contains("找回密码"), contains(code));

        service.verify("reset", EMAIL, code);
        // 验证码只能使用一次
        assertThrows(BusinessException.class, () -> service.verify("reset", EMAIL, code));
    }

    @Test
    void resendWithinCooldownIsRejected() {
        service.send("reset", EMAIL, true, false);
        BusinessException e = assertThrows(BusinessException.class, () -> service.send("reset", EMAIL, true, false));
        assertEquals(429, e.getCode());
    }

    @Test
    void tooManyWrongAttemptsInvalidatesCode() {
        service.send("reset", EMAIL, true, false);
        String code = sentCode();
        for (int i = 1; i < EmailCodeService.MAX_ATTEMPTS; i++) {
            BusinessException e = assertThrows(BusinessException.class, () -> service.verify("reset", EMAIL, "000000x"));
            assertEquals("验证码错误", e.getMessage());
        }
        BusinessException last = assertThrows(BusinessException.class, () -> service.verify("reset", EMAIL, "000000x"));
        assertTrue(last.getMessage().contains("次数过多"));
        // 作废后正确的验证码也不再可用
        assertThrows(BusinessException.class, () -> service.verify("reset", EMAIL, code));
    }

    @Test
    void unregisteredEmailIsRateLimitedButNotDelivered() throws Exception {
        service.send("reset", EMAIL, false, true);
        assertNull(sentCode());
        verify(mailService, never()).sendHtmlAsync(anyString(), anyString(), anyString());
        // 未注册邮箱同样受冷却限制，对外表现一致
        assertThrows(BusinessException.class, () -> service.send("reset", EMAIL, false, true));
    }

    @Test
    void failedDeliveryAllowsImmediateRetry() throws Exception {
        doThrow(new RuntimeException("smtp down")).when(mailService).sendHtml(anyString(), anyString(), anyString());
        assertThrows(BusinessException.class, () -> service.send("register", EMAIL, true, false));
        doNothing().when(mailService).sendHtml(anyString(), anyString(), anyString());
        assertDoesNotThrow(() -> service.send("register", EMAIL, true, false));
    }

    @Test
    void emailValidationAndNormalize() {
        assertEquals(EMAIL, EmailCodeService.normalize("  User@Example.COM "));
        assertTrue(EmailCodeService.isValidEmail("a.b+c@qq.com"));
        assertFalse(EmailCodeService.isValidEmail("not-an-email"));
        assertFalse(EmailCodeService.isValidEmail("a@b"));
    }
}
