package com.learnsphere.config;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.entity.User;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class SaTokenConfig implements WebMvcConfigurer {

    private final IUserService userService;

    /**
     * 注册 Sa-Token 拦截器
     * 通过拦截器实现路由级的权限认证。
     * 只拦截 /api/** 接口，静态资源放行。
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 拦截器，先做登录校验，再对 /api/admin/** 做管理员角色校验
        // 核心修正：只拦截 /api/** 接口，前端页面和静态资源完全放行，避免死循环
        registry.addInterceptor(new SaInterceptor(handle -> {
            StpUtil.checkLogin();
            String path = SaHolder.getRequest().getRequestPath();
            validateCurrentAccount(path);
            if (requiresAdminAccess(path)) {
                StpUtil.checkRole("admin");
            }
        }))
                .addPathPatterns("/api/**", "/learning/**")
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
                        "/api/user/leaderboard", // 积分排行榜公开可见
                        "/api/user/stats", // 统计信息（如果公开）

                        // === 通用接口/回调 ===
                        "/api/common/**",

                        // === 前端监控上报（无需鉴权，sendBeacon 无法携带 Token）===
                        "/api/metrics/**");
    }

    private void validateCurrentAccount(String path) {
        Object loginId = StpUtil.getLoginIdDefaultNull();
        if (loginId == null) {
            return;
        }

        String authId = String.valueOf(loginId);
        if (authId.startsWith("admin:")) {
            return;
        }

        Long userId;
        try {
            userId = Long.valueOf(authId);
        } catch (NumberFormatException e) {
            StpUtil.logout();
            throw new BusinessException("登录状态异常，请重新登录");
        }

        User user = userService.getById(userId);
        if (user == null || (user.getDeleted() != null && user.getDeleted() == 1)) {
            StpUtil.logout();
            throw new BusinessException("账号不存在或已被删除");
        }

        if (user.getStatus() != null && user.getStatus() == 0) {
            StpUtil.logout();
            throw new BusinessException("账号已被禁用");
        }
    }

    static boolean requiresAdminAccess(String path) {
        return path != null
                && ((path.startsWith("/api/admin/") && !path.startsWith("/api/admin/auth/"))
                        || path.startsWith("/api/actuator/")
                        || path.startsWith("/api/diagnostic/"));
    }

    static boolean requiresAdminRole(String path) {
        return requiresAdminAccess(path);
    }
}
