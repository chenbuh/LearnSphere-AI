package com.learnsphere.common.aspect;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.cache.CacheUtil;
import cn.hutool.cache.impl.TimedCache;
import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Slf4j
@Aspect
@Component
public class RateLimitAspect {

    /**
     * 使用 Hutool 的 TimedCache 作为本地缓存
     * key: limit:method:ip/user:window
     * value: count
     * 默认过期时间设置为最大可能的限流时间，实际插入时会指定
     */
    private static final TimedCache<String, Integer> DATA_CACHE = CacheUtil.newTimedCache(60 * 60 * 1000);

    // 开启定时清理过期缓存
    static {
        DATA_CACHE.schedulePrune(30 * 1000);
    }

    @Before("@annotation(rateLimit)")
    public void doBefore(JoinPoint point, RateLimit rateLimit) {
        int time = rateLimit.time();
        int count = rateLimit.count();

        String keyPrefix = getCombineKey(rateLimit, point);

        // 使用固定窗口算法
        // current_time / time -> window index
        long currentWindow = System.currentTimeMillis() / 1000 / time;
        String finalKey = keyPrefix + ":" + currentWindow;

        Integer currentCount = DATA_CACHE.get(finalKey, false);
        if (currentCount == null) {
            currentCount = 0;
        }

        if (currentCount >= count) {
            throw new BusinessException(429, "访问过于频繁，请稍后再试");
        }

        // 更新计数，过期时间设为窗口时间 + 缓冲 (e.g. time * 2 * 1000)
        DATA_CACHE.put(finalKey, currentCount + 1, time * 2 * 1000L);
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
