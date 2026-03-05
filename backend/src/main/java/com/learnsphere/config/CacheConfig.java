package com.learnsphere.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Caffeine local cache configuration (L2 cache).
 * Used for high-frequency data with low mutation rates to reduce Redis network IO.
 *
 * @author LearnSphere Team
 * @since 2.7.0
 */
@Configuration
public class CacheConfig {

    @Bean(name = "cacheManager")
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setAllowNullValues(false);
        cacheManager.setCacheNames(List.of(
                "contentHeatAnalysis",
                "contentHotList"));
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(500)
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .recordStats());
        return cacheManager;
    }
}
