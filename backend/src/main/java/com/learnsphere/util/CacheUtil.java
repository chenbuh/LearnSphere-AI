package com.learnsphere.util;

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

    public CacheUtil(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
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

        try {
            // 1. 先查 Redis
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                // 记录缓存命中次数
                redisTemplate.opsForValue().increment("metrics:cache:hit:" + today);
                log.debug("Cache hit: {}", key);
                return (T) cached;
            }

            // 2. 缓存未命中，执行 supplier 获取数据
            log.debug("Cache miss: {}, computing...", key);
            T result = supplier.get();

            // 3. 将结果写入 Redis
            if (result != null) {
                redisTemplate.opsForValue().set(key, result, timeout, unit);
            }

            return result;
        } catch (Exception e) {
            log.error("Cache operation failed for key: {}, falling back to direct computation", key, e);
            // 如果 Redis 操作失败，直接返回计算结果
            return supplier.get();
        }
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
}
