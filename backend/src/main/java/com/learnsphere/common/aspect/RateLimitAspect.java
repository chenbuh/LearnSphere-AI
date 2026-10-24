package com.learnsphere.common.aspect;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.time.Duration;

@Slf4j
@Aspect
@Component
public class RateLimitAspect {

    private final RedisTemplate<String, Object> redisTemplate;

    public RateLimitAspect(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Before("@annotation(rateLimit)")
    public void doBefore(JoinPoint point, RateLimit rateLimit) {
        int time = rateLimit.time();
        int count = rateLimit.count();

        String keyPrefix = getCombineKey(rateLimit, point);

        // 使用固定窗口算法 + Redis 原子计数
        long currentWindow = System.currentTimeMillis() / 1000 / time;
        String finalKey = "ratelimit:" + keyPrefix + ":" + currentWindow;

        // 安全修复（2026-10）：原实现为「先 INCR，再在计数为 1 时 EXPIRE」。
        // 若进程在两步之间退出（或 Redis 连接中断），该 key 将永久没有 TTL，
        // 计数只增不减 —— 对应用户/ IP 会被永久限流，直到人工清理 Redis。
        // 现改为「先 SET NX 带上 TTL，再 INCR」：TTL 与 key 同时建立，
        // 不存在无过期时间的中间态；key 已存在时 SETNX 不改动其 TTL，
        // 固定窗口语义保持不变。
        Duration duration = Duration.ofSeconds(time + 2L);
        redisTemplate.opsForValue().setIfAbsent(finalKey, 0, duration);
        Long currentCount = redisTemplate.opsForValue().increment(finalKey);

        if (currentCount != null && currentCount > count) {
            log.warn("Rate limit exceeded for key: {}", finalKey);
            throw new BusinessException(429, "访问过于频繁，稍后再试");
        }
    }

    public String getCombineKey(RateLimit rateLimit, JoinPoint point) {
        StringBuilder stringBuffer = new StringBuilder(rateLimit.key());
        if (rateLimit.limitType() == RateLimit.LimitType.IP) {
            stringBuffer.append(getIpAddr()).append("-");
        } else if (rateLimit.limitType() == RateLimit.LimitType.USER) {
            stringBuffer.append(getUserId()).append("-");
        } else {
            // Default: try user, fallback to IP
            try {
                if (StpUtil.isLogin()) {
                    stringBuffer.append(getUserId()).append("-");
                } else {
                    stringBuffer.append(getIpAddr()).append("-");
                }
            } catch (Exception e) {
                stringBuffer.append(getIpAddr()).append("-");
            }
        }

        MethodSignature signature = (MethodSignature) point.getSignature();
        Method method = signature.getMethod();
        Class<?> targetClass = method.getDeclaringClass();
        stringBuffer.append(targetClass.getName()).append("-").append(method.getName());
        return stringBuffer.toString();
    }

    /**
     * 获取用于限流的客户端 IP。
     *
     * 安全修复（2026-03）：原实现直接读取 x-forwarded-for 等客户端可伪造的头，
     * 导致攻击者通过变换该头即可无限绕过限流（含管理员登录爆破防护）。
     * 现统一走 ClientIpResolver，仅在配置了可信代理层数时才采信转发头。
     */
    private String getIpAddr() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes == null) {
                return "unknown";
            }
            return com.learnsphere.utils.ClientIpResolver.resolve(attributes.getRequest());
        } catch (Exception e) {
            return "unknown";
        }
    }

    private String getUserId() {
        try {
            // 尝试获取登录用户ID
            return StpUtil.getLoginIdAsString();
        } catch (Exception e) {
            return "0";
        }
    }
}
