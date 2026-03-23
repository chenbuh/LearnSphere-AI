package com.learnsphere.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * 跨域配置
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,https://localhost:5173,https://localhost:5174,https://localhost:5175,https://localhost:5176,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:5176,https://127.0.0.1:5173,https://127.0.0.1:5174,https://127.0.0.1:5175,https://127.0.0.1:5176,http://192.168.*:*,https://192.168.*:*,http://10.*:*,https://10.*:*,http://172.16.*:*,https://172.16.*:*,http://172.17.*:*,https://172.17.*:*,http://172.18.*:*,https://172.18.*:*,http://172.19.*:*,https://172.19.*:*,http://172.20.*:*,https://172.20.*:*,http://172.21.*:*,https://172.21.*:*,http://172.22.*:*,https://172.22.*:*,http://172.23.*:*,https://172.23.*:*,http://172.24.*:*,https://172.24.*:*,http://172.25.*:*,https://172.25.*:*,http://172.26.*:*,https://172.26.*:*,http://172.27.*:*,https://172.27.*:*,http://172.28.*:*,https://172.28.*:*,http://172.29.*:*,https://172.29.*:*,http://172.30.*:*,https://172.30.*:*,http://172.31.*:*,https://172.31.*:*}")
    private String allowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // 允许所有域名跨域
        for (String origin : allowedOrigins.split(",")) {
            String trimmed = origin.trim();
            if (!trimmed.isEmpty()) {
                config.addAllowedOriginPattern(trimmed);
            }
        }
        // 允许所有请求头
        config.addAllowedHeader("*");
        // 允许所有请求方法
        config.addAllowedMethod("*");
        // 允许携带认证凭证
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
