package com.learnsphere.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Resilience4j 熔断器配置
 * 防止 AI 服务故障拖垮整个后端
 *
 * @author LearnSphere Team
 * @since 2.4.0
 */
@Configuration
public class CircuitBreakerConfiguration {

        @Bean
        public CircuitBreakerRegistry circuitBreakerRegistry() {
                CircuitBreakerConfig circuitBreakerConfig = CircuitBreakerConfig.custom()
                                .failureRateThreshold(50) // 失败率达到 50% 时打开熔断器
                                .waitDurationInOpenState(Duration.ofMinutes(1)) // 熔断器打开后等待 1 分钟
                                .slidingWindowSize(10) // 滑动窗口大小为 10 次调用
                                .minimumNumberOfCalls(5) // 最少 5 次调用后才开始计算失败率
                                .permittedNumberOfCallsInHalfOpenState(3) // 半开状态允许 3 次调用
                                .automaticTransitionFromOpenToHalfOpenEnabled(true) // 自动从打开状态转为半开状态
                                .build();

                return CircuitBreakerRegistry.of(circuitBreakerConfig);
        }
}
