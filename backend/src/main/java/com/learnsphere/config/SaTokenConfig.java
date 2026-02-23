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
     * 注册 Sa-Token 拦截器
     * 通过拦截器实现路由级的权限认证。
     * 只拦截 /api/** 接口，静态资源放行。
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 拦截器，校验规则为 StpUtil.checkLogin() 登录校验
        // 核心修正：只拦截 /api/** 接口，前端页面和静态资源完全放行，避免死循环
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        // === 用户认证接口 (无需登录) ===
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/captcha",
                        "/api/auth/captcha/required", // 检查是否需要验证码
                        "/api/auth/check",
                        "/api/auth/logout", // 登出也不需要拦截（防止没登录时登出报错）
                        "/api/auth/reset-password", // 找回密码

                        // === 管理员认证接口 ===
                        "/api/admin/auth/login",
                        "/api/admin/auth/logout",
                        "/api/admin/auth/info",

                        // === 公开业务接口 (无需鉴权的只读数据) ===
                        "/api/test/**",
                        "/api/health/**",
                        "/api/diagnostic/**",
                        "/api/user/leaderboard", // 积分排行榜公开可见
                        "/api/user/stats", // 统计信息（如果公开）

                        // === 通用接口/回调 ===
                        "/api/common/**",
                        "/api/vocabulary/import/**", // 临时开放的数据导入接口

                        // === 前端监控上报（无需鉴权，sendBeacon 无法携带 Token）===
                        "/api/metrics/**");
    }
}
