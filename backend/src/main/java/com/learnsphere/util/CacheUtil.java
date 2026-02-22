package com.learnsphere.util;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 缓存工具类 - Cache-Aside 模式辅助类
 *
 * @author LearnSphere Team
 * @since 2.4.0
 */
@Slf4j
@Component
public class CacheUtil {

    private final RedisTemplate<String, Object> redisTemplate;
    private final MeterRegistry meterRegistry;

    public CacheUtil(RedisTemplate<String, Object> redisTemplate, MeterRegistry meterRegistry) {
        this.redisTemplate = redisTemplate;
        this.meterRegistry = meterRegistry;
    }

    /**
     * Cache-Aside 模式获取数据
     * 
     * @param key      Redis key
     * @param supplier 数据提供者（DB 或 AI）
     * @param timeout  缓存超时时间
     * @param unit     时间单位
     * @return 数据
     */
    /**
     * Cache-Aside 模式获取数据
     * 
     * @param key      Redis key
     * @param supplier 数据提供者（DB 或 AI）
     * @param timeout  缓存超时时间
     * @param unit     时间单位
     * @return 数据
     */
    public <T> T getOrCompute(String key, Supplier<T> supplier, long timeout, TimeUnit unit) {
        String today = java.time.LocalDate.now().toString();
        // 记录尝试读取缓存次数
        redisTemplate.opsForValue().increment("metrics:cache:attempt:" + today);
        recordCacheAccess("attempt");

        try {
            // 1. 先查 Redis
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                // 记录缓存命中次数
                redisTemplate.opsForValue().increment("metrics:cache:hit:" + today);
                recordCacheAccess("hit");
                log.debug("Cache hit: {}", key);
                return (T) cached;
            }

            // 2. 缓存未命中，执行 supplier 获取数据
            recordCacheAccess("miss");
            log.debug("Cache miss: {}, computing...", key);
            T result = supplier.get();

            // 3. 将结果写入 Redis
            if (result != null) {
                redisTemplate.opsForValue().set(key, result, timeout, unit);
            }

            return result;
        } catch (Exception e) {
            log.error("Cache operation failed for key: {}, falling back to direct computation", key, e);
            recordCacheAccess("error");
            // 如果 Redis 操作失败，直接返回计算结果
            return supplier.get();
        }
    }

    private void recordCacheAccess(String result) {
        if (meterRegistry == null) {
            return;
        }
        meterRegistry.counter("cache.access.total", "result", result).increment();
    }

    /**
     * 删除缓存
     */
    public void evict(String key) {
        try {
            redisTemplate.delete(key);
            log.debug("Cache evicted: {}", key);
        } catch (Exception e) {
            log.error("Failed to evict cache: {}", key, e);
        }
    }

    /**
     * 批量删除缓存（通配符）
     */
    public void evictPattern(String pattern) {
        try {
            var keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("Cache evicted with pattern: {}, count: {}", pattern, keys.size());
            }
        } catch (Exception e) {
            log.error("Failed to evict cache pattern: {}", pattern, e);
        }
    }

    /**
     * 设置数据
     */
    public void put(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }

    /**
     * 获取数据
     */
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * 增加自增
     */
    public Long increment(String key) {
        return redisTemplate.opsForValue().increment(key);
    }
}
