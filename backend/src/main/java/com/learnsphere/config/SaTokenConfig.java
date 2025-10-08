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
        // 注册Sa-Token拦截器，校验规则为StpUtil.checkLogin()登录校验
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/**")
                .excludePathPatterns(
                        // 用户认证接口
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/auth/captcha",
                        "/api/auth/check",
                        // 管理员认证接口
                        "/api/admin/auth/**",
                        // 测试接口
                        "/api/test/**",
                        "/api/health/**",
                        "/api/diagnostic/**",
                        // 词汇导入接口（临时开放）
                        "/api/vocabulary/import/**",

                        // 错误页面
                        "/error",
                        // === 静态资源与页面转发（关键修复）===
                        "/",
                        "/index.html",
                        "/favicon.ico",
                        "/assets/**",
                        "/static/**",
                        "/admin",
                        "/admin/",
                        "/admin/index.html",
                        "/admin/assets/**",
                        "/admin/auth/login", // 后台登录接口
                        "/*.js",
                        "/*.css",
                        "/*.svg",
                        "/*.png",
                        "/*.jpg",
                        "/*.ico");
    }
}
