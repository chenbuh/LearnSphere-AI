package com.learnsphere.mail;

import com.learnsphere.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 邮箱验证码：6 位数字，Redis 保存 10 分钟，60 秒内不可重发，
 * 单邮箱每天最多发送 10 次，连续输错 5 次作废。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailCodeService {

    public static final String SCENE_REGISTER = "register";
    public static final String SCENE_RESET = "reset";
    public static final String SCENE_BIND = "bind";

    static final Duration CODE_TTL = Duration.ofMinutes(10);
    static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);
    static final int DAILY_LIMIT = 10;
    static final int MAX_ATTEMPTS = 5;

    private static final Map<String, String> SCENE_TITLES = Map.of(
            SCENE_REGISTER, "注册账号",
            SCENE_RESET, "找回密码",
            SCENE_BIND, "绑定新邮箱");
    private static final Pattern EMAIL = Pattern.compile("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$");
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate redis;
    private final MailService mailService;

    public static boolean isValidScene(String scene) {
        return SCENE_TITLES.containsKey(scene);
    }

    public static String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isValidEmail(String email) {
        return email != null && email.length() <= 100 && EMAIL.matcher(email).matches();
    }

    /**
     * 生成并发送验证码。
     *
     * @param deliver false 时只走频控、不真正发信（找回密码时邮箱未注册，对外表现保持一致）
     * @param async   true 时异步发信，响应耗时与是否真正发信无关
     */
    public void send(String scene, String email, boolean deliver, boolean async) {
        if (!mailService.isEnabled()) {
            throw new BusinessException("邮件服务暂未开启，请联系管理员");
        }
        String key = scene + ":" + email;
        Boolean first = redis.opsForValue().setIfAbsent("email_code:cd:" + key, "1", RESEND_COOLDOWN);
        if (!Boolean.TRUE.equals(first)) {
            throw new BusinessException(429, "验证码发送太频繁，请 60 秒后再试");
        }
        String dailyKey = "email_code:daily:" + email;
        Long sent = redis.opsForValue().increment(dailyKey);
        if (sent != null && sent == 1) {
            redis.expire(dailyKey, Duration.ofDays(1));
        }
        if (sent != null && sent > DAILY_LIMIT) {
            throw new BusinessException(429, "该邮箱今日验证码发送次数已达上限");
        }
        if (!deliver) {
            return;
        }

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        redis.opsForValue().set("email_code:" + key, code, CODE_TTL);
        redis.delete("email_code:fail:" + key);

        // 换绑场景带用户 ID 后缀（bind:123），标题按前缀取
        String title = SCENE_TITLES.getOrDefault(scene.split(":", 2)[0], "身份验证");
        String subject = "【LearnSphere AI】" + title + "验证码";
        String html = buildHtml(title, code);
        if (async) {
            mailService.sendHtmlAsync(email, subject, html);
            return;
        }
        try {
            mailService.sendHtml(email, subject, html);
        } catch (Exception e) {
            // 发信失败时撤销本次验证码与冷却，允许用户立即重试
            redis.delete("email_code:" + key);
            redis.delete("email_code:cd:" + key);
            log.warn("验证码邮件发送失败 scene={} to={}: {}", scene, MailService.mask(email), e.getMessage());
            throw new BusinessException("验证码邮件发送失败，请检查邮箱地址或稍后再试");
        }
    }

    /** 校验并消费验证码，失败直接抛出业务异常 */
    public void verify(String scene, String email, String code) {
        String key = scene + ":" + email;
        String codeKey = "email_code:" + key;
        String expected = redis.opsForValue().get(codeKey);
        if (expected == null) {
            throw new BusinessException("验证码已过期或未发送，请重新获取");
        }
        if (code == null || !MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8), code.trim().getBytes(StandardCharsets.UTF_8))) {
            String failKey = "email_code:fail:" + key;
            Long fails = redis.opsForValue().increment(failKey);
            if (fails != null && fails == 1) {
                redis.expire(failKey, CODE_TTL);
            }
            if (fails != null && fails >= MAX_ATTEMPTS) {
                redis.delete(codeKey);
                redis.delete(failKey);
                throw new BusinessException("验证码错误次数过多，请重新获取");
            }
            throw new BusinessException("验证码错误");
        }
        redis.delete(codeKey);
        redis.delete("email_code:fail:" + key);
    }

    private static String buildHtml(String sceneTitle, String code) {
        return """
                <div style="max-width:480px;margin:0 auto;padding:32px 28px;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;color:#1f2937;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px">
                  <h2 style="margin:0 0 16px;font-size:20px;color:#4f46e5">LearnSphere AI</h2>
                  <p style="margin:0 0 12px;font-size:14px">您正在进行<strong>%s</strong>操作，验证码为：</p>
                  <p style="margin:0 0 16px;font-size:32px;font-weight:700;letter-spacing:8px;color:#111827">%s</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#6b7280">验证码 10 分钟内有效，请勿泄露给他人。</p>
                  <p style="margin:0;font-size:13px;color:#6b7280">如非本人操作，请忽略本邮件。</p>
                </div>
                """.formatted(sceneTitle, code);
    }
}
