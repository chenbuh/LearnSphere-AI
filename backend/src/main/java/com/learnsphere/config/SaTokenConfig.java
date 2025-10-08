package com.learnsphere.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token配置类
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {

    /**
     * 注册Sa-Token拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 拦截器，校验规则为 StpUtil.checkLogin() 登录校验
        // 核心修正：只拦截 /api/** 接口，前端页面和静态资源完全放行，避免死循环
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        // === 用户认证接口 ===
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/captcha",
                        "/api/auth/check",
                        "/api/auth/logout", // 登出也不需要拦截（防止没登录时登出报错）

                        // === 管理员认证接口 ===
                        "/api/admin/auth/login",
                        "/api/admin/auth/logout",
                        "/api/admin/auth/info",

                        // === 公开业务接口 ===
                        "/api/test/**",
                        "/api/health/**",
                        "/api/diagnostic/**",
                        "/api/user/leaderboard", // 排行榜
                        "/api/user/stats", // 统计信息（如果公开）

                        // === 通用接口 ===
                        "/api/vocabulary/import/**" // 临时开放
                );
    }
}
