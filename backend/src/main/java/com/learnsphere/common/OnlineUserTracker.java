package com.learnsphere.common;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 在线用户统计：记录每个普通用户最近一次已登录请求的时间。
 * 最近 {@link #ONLINE_WINDOW_MS} 内有请求的用户视为在线。
 * 数据保存在当前实例内存中，多实例部署时只统计本实例。
 */
@Component
public class OnlineUserTracker {

    public static final long ONLINE_WINDOW_MS = 5 * 60 * 1000L;

    private final Map<Long, Long> lastSeen = new ConcurrentHashMap<>();

    public void touch(Long userId) {
        if (userId != null) {
            lastSeen.put(userId, System.currentTimeMillis());
        }
    }

    public long countOnline() {
        long threshold = System.currentTimeMillis() - ONLINE_WINDOW_MS;
        return lastSeen.values().stream().filter(time -> time >= threshold).count();
    }

    /**
     * 定期清理过期记录，避免长时间运行后 Map 无限增长
     */
    @Scheduled(fixedDelay = ONLINE_WINDOW_MS)
    public void evictExpired() {
        long threshold = System.currentTimeMillis() - ONLINE_WINDOW_MS;
        lastSeen.values().removeIf(time -> time < threshold);
    }
}
