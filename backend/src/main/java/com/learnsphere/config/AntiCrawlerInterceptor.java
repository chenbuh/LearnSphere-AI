package com.learnsphere.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * API 防爬拦截器
 * 基于 IP 的请求频率限制
 */
@Slf4j
@Component
public class AntiCrawlerInterceptor implements HandlerInterceptor {

    // IP 请求计数：IP -> 计数
    private static final ConcurrentHashMap<String, AtomicInteger> IP_REQUEST_COUNT = new ConcurrentHashMap<>();

    // IP 黑名单（被封禁的 IP）
    private static final ConcurrentHashMap<String, Long> IP_BLACKLIST = new ConcurrentHashMap<>();

    // 配置参数
    private static final int MAX_REQUESTS_PER_MINUTE = 60; // 每分钟最大请求数
    private static final long BLOCK_DURATION_MS = 10 * 60 * 1000; // 封禁时长 10分钟
    private static final long CLEANUP_INTERVAL_MS = 60 * 1000; // 清理间隔 1分钟

    private static long lastCleanupTime = System.currentTimeMillis();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String ip = getClientIp(request);
        long currentTime = System.currentTimeMillis();

        // 定期清理过期数据
        if (currentTime - lastCleanupTime > CLEANUP_INTERVAL_MS) {
            cleanupExpiredData(currentTime);
            lastCleanupTime = currentTime;
        }

        // 1. 查是否在黑名单中
        if (IP_BLACKLIST.containsKey(ip)) {
            Long blockEndTime = IP_BLACKLIST.get(ip);
            if (currentTime < blockEndTime) {
                log.warn("🚫 Blocked IP attempting access: {}", ip);
                response.setStatus(429); // Too Many Requests
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":429,\"message\":\"请求过于频繁，稍后再试\"}");
                return false;
            } else {
                // 封禁时间已过，移除黑名单
                IP_BLACKLIST.remove(ip);
            }
        }

        // 2. 增加请求计数
        AtomicInteger count = IP_REQUEST_COUNT.computeIfAbsent(ip, k -> new AtomicInteger(0));
        int currentCount = count.incrementAndGet();

        // 3. 检查是否超过限制
        if (currentCount > MAX_REQUESTS_PER_MINUTE) {
            log.warn("⚠️  IP {} exceeded rate limit: {} requests/minute", ip, currentCount);
            // 加入黑名单
            IP_BLACKLIST.put(ip, currentTime + BLOCK_DURATION_MS);
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":429,\"message\":\"请求过于频繁，已被暂时封禁\"}");
            return false;
        }

        return true;
    }

    /**
     * 清理过期的计数器
     */
    private void cleanupExpiredData(long currentTime) {
        IP_REQUEST_COUNT.clear(); // 简单粗暴：每分钟清空一次

        // 清理过期的黑名单
        IP_BLACKLIST.entrySet().removeIf(entry -> entry.getValue() < currentTime);

        log.debug("🧹 Cleaned up expired data. Active IPs: {}, Blacklisted: {}",
                IP_REQUEST_COUNT.size(), IP_BLACKLIST.size());
    }

    /**
     * 获取客户端真实IP
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Forwarded-For");
            if (ip != null && !ip.isEmpty()) {
                int index = ip.indexOf(',');
                if (index != -1) {
                    ip = ip.substring(0, index);
                }
            }
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 格式化IPv6本地地址
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }
}
