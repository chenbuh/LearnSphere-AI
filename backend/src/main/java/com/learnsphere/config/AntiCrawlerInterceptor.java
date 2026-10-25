package com.learnsphere.config;

import com.learnsphere.utils.ClientIpResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * API 防爬拦截器 —— 基于 IP 的请求频率限制。
 *
 * ============================================================================
 * 安全修复（2026-03）：
 *
 * 1) 客户端 IP 可伪造
 *    原实现优先读取 X-Real-IP，其次 X-Forwarded-For，两者均为客户端可设置的
 *    请求头。攻击者只需自设该头即可伪装成不同 IP，绕过本拦截器的计数与黑名单。
 *    ➜ 现统一走 ClientIpResolver，仅在显式配置可信代理层数时采信转发头。
 *
 * 2) 计数窗口可被对齐绕过
 *    原实现 cleanupExpiredData() 使用 IP_REQUEST_COUNT.clear() 每分钟全量清空，
 *    使统计窗口与「整数分钟」绑定。攻击者按分钟边界发送请求即可让计数反复归零，
 *    实质绕过每分钟 60 次的限制。
 *    ➜ 现改为固定窗口 + 每 IP 窗口起点记录，仅淘汰已过期条目。
 *
 * 说明：本拦截器为单机内存实现，重启即失效，且多实例部署时各自计数。
 * 生产环境若需严格限流，应使用 Redis 集中计数（项目已有 @RateLimit + Redis 实现）。
 * ============================================================================
 */
@Slf4j
@Component
public class AntiCrawlerInterceptor implements HandlerInterceptor {

    /** IP -> 当前窗口内的请求计数 */
    private static final ConcurrentHashMap<String, AtomicInteger> IP_REQUEST_COUNT = new ConcurrentHashMap<>();

    /** IP -> 当前计数窗口的起始时间戳（毫秒） */
    private static final ConcurrentHashMap<String, Long> IP_WINDOW_START = new ConcurrentHashMap<>();

    /** IP 黑名单：IP -> 封禁截止时间戳 */
    private static final ConcurrentHashMap<String, Long> IP_BLACKLIST = new ConcurrentHashMap<>();

    /**
     * 每分钟最大请求数。
     *
     * <p>原值 60 是按「一个人手动点页面」估的，但管理后台一个页面加载就会
     * 并发请求十几个接口（统计、列表、配置、清理状态…），翻两页就超限，
     * 正常管理员会被当成爬虫封掉。改为可配置，默认 300。
     */
    @Value("${app.security.anti-crawler.max-requests-per-minute:300}")
    private int maxRequestsPerMinute = 300;

    /** 计数窗口长度 */
    private static final long WINDOW_MS = 60 * 1000L;

    /**
     * 封禁时长。
     *
     * <p>原值 10 分钟过长：误判一次就要干等十分钟，且期间页面完全不可用。
     * 降到 1 分钟，既能拦住持续刷接口的脚本，又不至于误伤正常用户。
     */
    @Value("${app.security.anti-crawler.block-duration-ms:60000}")
    private long blockDurationMs = 60_000L;

    /** 清理间隔 */
    private static final long CLEANUP_INTERVAL_MS = 60 * 1000L;

    private static volatile long lastCleanupTime = System.currentTimeMillis();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String ip = ClientIpResolver.resolve(request);
        long currentTime = System.currentTimeMillis();

        // 定期清理过期数据
        if (currentTime - lastCleanupTime > CLEANUP_INTERVAL_MS) {
            cleanupExpiredData(currentTime);
            lastCleanupTime = currentTime;
        }

        // 1. 黑名单检查
        Long blockEndTime = IP_BLACKLIST.get(ip);
        if (blockEndTime != null) {
            if (currentTime < blockEndTime) {
                log.warn("🚫 Blocked IP attempting access: {}", ip);
                reject(response, "请求过于频繁，稍后再试");
                return false;
            }
            IP_BLACKLIST.remove(ip);
        }

        // 2. 固定窗口计数：窗口过期则重置起点与计数
        Long windowStart = IP_WINDOW_START.get(ip);
        if (windowStart == null || currentTime - windowStart >= WINDOW_MS) {
            IP_WINDOW_START.put(ip, currentTime);
            IP_REQUEST_COUNT.put(ip, new AtomicInteger(0));
        }

        AtomicInteger counter = IP_REQUEST_COUNT.computeIfAbsent(ip, k -> new AtomicInteger(0));
        int currentCount = counter.incrementAndGet();

        // 3. 超限则封禁
        if (currentCount > maxRequestsPerMinute) {
            log.warn("⚠️  IP {} exceeded rate limit: {} requests/minute", ip, currentCount);
            IP_BLACKLIST.put(ip, currentTime + blockDurationMs);
            reject(response, "请求过于频繁，已被暂时封禁");
            return false;
        }

        return true;
    }

    private void reject(HttpServletResponse response, String message) throws Exception {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":429,\"message\":\"" + message + "\"}");
    }

    /**
     * 清理过期的计数与黑名单。
     *
     * 仅淘汰窗口已过期的条目，保留窗口内的统计，避免原实现
     * 「每分钟全量清空」带来的窗口对齐绕过。
     */
    private void cleanupExpiredData(long currentTime) {
        IP_WINDOW_START.entrySet().removeIf(entry -> {
            boolean expired = currentTime - entry.getValue() >= WINDOW_MS;
            if (expired) {
                IP_REQUEST_COUNT.remove(entry.getKey());
            }
            return expired;
        });

        IP_BLACKLIST.entrySet().removeIf(entry -> entry.getValue() < currentTime);

        log.debug("🧹 Cleaned up expired data. Active IPs: {}, Blacklisted: {}",
                IP_REQUEST_COUNT.size(), IP_BLACKLIST.size());
    }
}
