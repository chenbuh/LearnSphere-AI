package com.learnsphere.common.aspect;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
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

        Long currentCount = redisTemplate.opsForValue().increment(finalKey);

        if (currentCount != null && currentCount == 1) {
            // 第一次访问，设置过期时间
            Duration duration = Duration.ofSeconds(time + 2);
            java.util.Objects.requireNonNull(duration);
            redisTemplate.expire(finalKey, duration);
        }

        if (currentCount != null && currentCount > count) {
            log.warn("Rate limit exceeded for key: {}", finalKey);
            throw new BusinessException(429, "访问过于频繁，请稍后再试");
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

    private String getIpAddr() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes == null) {
                return "unknown";
            }
            HttpServletRequest request = attributes.getRequest();
            String ip = request.getHeader("x-forwarded-for");
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("Proxy-Client-IP");
            }
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
                ip = request.getRemoteAddr();
            }
            return ip;
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
