package com.learnsphere.config;

import cn.dev33.satoken.context.SaHolder;
import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.AdminRole;
import com.learnsphere.common.OnlineUserTracker;
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
    private final OnlineUserTracker onlineUserTracker;
    private final StpInterfaceImpl stpInterface;

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
                checkAdminRolePermission(path);
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
                        "/api/auth/email-code", // 发送邮箱验证码（注册 / 找回密码）
                        "/api/auth/email-status", // 邮件服务是否开启

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
                        "/api/payment/epay/notify", // 易支付异步通知（靠验签保证安全）
                        "/api/payment/status", // 在线支付是否开启（只读）

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
            // 后台账号被禁用或删除后，已签发的 token 立即失效
            if (stpInterface.resolveAdminRole(loginId).isEmpty()) {
                StpUtil.logout();
                throw new BusinessException("管理员账号已被禁用或不存在");
            }
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

        onlineUserTracker.touch(userId);
    }

    /**
     * 按后台角色限制可访问的接口前缀，超级管理员不受限
     */
    private void checkAdminRolePermission(String path) {
        AdminRole role = stpInterface.resolveAdminRole(StpUtil.getLoginId())
                .orElseThrow(() -> new cn.dev33.satoken.exception.NotRoleException("admin"));
        if (!role.canAccess(path)) {
            throw new cn.dev33.satoken.exception.NotPermissionException("admin:" + path);
        }
    }

    /**
     * 判断路径是否属于后台/运维管理面。
     *
     * 安全加固（2026-03）：
     * - 使用「精确前缀 + 边界」判断，避免 /api/admin-x、/api/diagnosticX 之类
     *   同前缀但非管理面的路径被误判为需要或不需要 admin。
     * - 该判断仅作为第二道防线：所有后台控制器已统一加类级 @SaCheckRole("admin")，
     *   注解鉴权先于本方法执行（SaInterceptor 默认 isAnnotation=true）。
     *
     * @param path 请求路径
     * @return true 表示该路径需要 admin 权限
     */
    static boolean requiresAdminAccess(String path) {
        if (path == null) {
            return false;
        }
        return matchesPrefix(path, "/api/admin") && !matchesPrefix(path, "/api/admin/auth")
                || matchesPrefix(path, "/api/actuator")
                || matchesPrefix(path, "/api/diagnostic");
    }

    /**
     * 前缀匹配：要求命中处为路径分隔符或字符串结尾，
     * 使 "/api/admin" 能匹配 "/api/admin" 与 "/api/admin/users"，
     * 但不匹配 "/api/admin-x"。
     */
    private static boolean matchesPrefix(String path, String prefix) {
        if (!path.startsWith(prefix)) {
            return false;
        }
        if (path.length() == prefix.length()) {
            return true;
        }
        char next = path.charAt(prefix.length());
        return next == '/';
    }

    static boolean requiresAdminRole(String path) {
        return requiresAdminAccess(path);
    }
}
