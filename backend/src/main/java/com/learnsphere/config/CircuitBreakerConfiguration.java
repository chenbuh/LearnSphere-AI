package com.learnsphere.config;

import io.github.resilience4j.bulkhead.BulkheadConfig;
import io.github.resilience4j.bulkhead.BulkheadRegistry;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Resilience4j 稳定性配置
 * 集成 熔断 (CircuitBreaker)、重试 (Retry)、舱壁隔离 (Bulkhead)
 *
 * @author LearnSphere Team
 */
@Configuration
public class CircuitBreakerConfiguration {

        @Bean
        public CircuitBreakerRegistry circuitBreakerRegistry() {
                CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                                .failureRateThreshold(50)
                                .waitDurationInOpenState(Duration.ofMinutes(1))
                                .slidingWindowSize(10)
                                .minimumNumberOfCalls(5)
                                .permittedNumberOfCallsInHalfOpenState(3)
                                .automaticTransitionFromOpenToHalfOpenEnabled(true)
                                .build();

                return CircuitBreakerRegistry.of(circuitBreakerConfig);
        }

        @Bean
        public RetryRegistry retryRegistry() {
                RetryConfig retryConfig = RetryConfig.custom()
                                .maxAttempts(3) // 最多重试 3 次
                                .intervalFunction(io.github.resilience4j.core.IntervalFunction.ofExponentialBackoff(
                                                Duration.ofSeconds(2), 2.0)) // 初始 2s, 倍数 2.0
                                /*
                                 * 只重试「重试有可能成功」的异常。
                                 *
                                 * 原实现是 retryExceptions(Exception.class)，即所有异常都重试，
                                 * 包括 API Key 无效、余额不足、模型名不存在、请求体格式错误这类
                                 * 确定性失败。这类错误重试多少次结果都一样，只会让用户多等
                                 * 6 秒（2s + 4s）后才看到同样的报错，还额外消耗上游请求次数。
                                 *
                                 * 因此改为白名单：只重试网络层与上游临时性故障。
                                 * 注意 IllegalStateException 是我们自己抛的业务异常
                                 * （如「请先配置 AI API Key」「AI 接口请求失败（HTTP 401）」），
                                 * 必须排除，否则会被无意义地重试。
                                 */
                                .retryExceptions(
                                                java.io.IOException.class,
                                                java.util.concurrent.TimeoutException.class,
                                                java.net.http.HttpTimeoutException.class,
                                                java.net.ConnectException.class)
                                .ignoreExceptions(
                                                IllegalStateException.class,
                                                IllegalArgumentException.class,
                                                InterruptedException.class)
                                .build();

                return RetryRegistry.of(retryConfig);
        }

        @Bean
        public BulkheadRegistry bulkheadRegistry() {
                // 快任务舱壁 (如 Chat, Grammar)
                BulkheadConfig fastBulkheadConfig = BulkheadConfig.custom()
                                .maxConcurrentCalls(20) // 最大并发 20
                                .maxWaitDuration(Duration.ofMillis(500)) // 等待队列超时 500ms
                                .build();

                // 慢任务舱壁 (如 Article Generation)
                BulkheadConfig slowBulkheadConfig = BulkheadConfig.custom()
                                .maxConcurrentCalls(5) // 最大并发 5
                                .maxWaitDuration(Duration.ofSeconds(2)) // 等待队列超时 2s
                                .build();

                BulkheadRegistry registry = BulkheadRegistry.of(fastBulkheadConfig);
                registry.bulkhead("fastTask", fastBulkheadConfig);
                registry.bulkhead("slowTask", slowBulkheadConfig);
                return registry;
        }
}
