package com.learnsphere.common.filter;

import cn.dev33.satoken.stp.StpUtil;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Actuator 端点访问控制。
 *
 * <h2>为什么需要这个 Filter</h2>
 *
 * {@link com.learnsphere.config.SaTokenConfig} 里已经用 {@code requiresAdminAccess}
 * 把 {@code /api/actuator} 划进「需要 admin」的范围，但实测**完全没生效**：
 * 未登录请求 {@code GET /api/actuator/prometheus} 返回 200 和完整指标。
 *
 * 实测定位（2026-10，带诊断日志跑出来的）：
 * <pre>
 *   GET /api/user/profile          → 拦截器日志有输出
 *   GET /api/actuator/prometheus   → 拦截器日志无输出
 *   GET /api/actuator/health       → 拦截器日志无输出
 * </pre>
 *
 * 原因是 actuator 端点由 {@code WebMvcEndpointHandlerMapping} 处理，
 * 它以独立、更高优先级的 HandlerMapping 注册；而 {@code SaInterceptor}
 * 是注册在 {@code InterceptorRegistry} 上的 MVC 拦截器，只对普通
 * {@code RequestMappingHandlerMapping} 解析出的 handler 生效。
 * 所以 actuator 的请求根本不经过 Sa-Token 拦截器链。
 *
 * 结论：actuator 的鉴权不能依赖 MVC 拦截器，必须在 **Servlet Filter 层**做，
 * 因为 Filter 在 DispatcherServlet 之前执行，对所有 HandlerMapping 一视同仁。
 *
 * <h2>策略</h2>
 *
 * 默认拒绝：只有持有有效 admin 会话的请求才放行。
 * 这里不提供「本机放行」之类的例外——生产环境走 Nginx 反代时，
 * 所有请求的来源地址都是 127.0.0.1，按 IP 判断等于对所有外部流量放行。
 */
@Slf4j
@Component
@Order(ActuatorAccessFilter.ORDER)
public class ActuatorAccessFilter implements Filter {

    /**
     * 必须早于业务 Filter 执行，避免先做无谓的解析。
     * 数值取 10，介于 Spring 内置 Filter 与业务 Filter 之间。
     */
    public static final int ORDER = 10;

    /** actuator 的挂载前缀，与 application.yml 的 management.endpoints.web.base-path 保持一致。 */
    private static final String ACTUATOR_PREFIX = "/api/actuator";

    /** 服务间认证用的请求头，值与 METRICS_TOKEN 环境变量比对。 */
    private static final String TOKEN_HEADER = "X-Metrics-Token";

    /**
     * 监控系统专用的静态令牌。
     *
     * <p>为什么需要它：Prometheus 定时抓取指标，它没有用户会话，
     * 无法走 admin 登录。只按会话判断的话，加了访问控制就等于把监控打断。
     *
     * <p>未配置时该通道自动关闭（只允许 admin 会话），这是安全默认值——
     * 不能让「忘了配」变成「人人可访问」。
     */
    private final String metricsToken;

    public ActuatorAccessFilter(
            @org.springframework.beans.factory.annotation.Value("${learnsphere.metrics.token:}")
            String metricsToken) {
        this.metricsToken = metricsToken == null ? "" : metricsToken.trim();
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse,
            FilterChain chain) throws IOException, ServletException {
        if (!(servletRequest instanceof HttpServletRequest request)
                || !(servletResponse instanceof HttpServletResponse response)) {
            chain.doFilter(servletRequest, servletResponse);
            return;
        }

        String path = request.getRequestURI();
        if (!isActuatorPath(path)) {
            chain.doFilter(servletRequest, servletResponse);
            return;
        }

        if (hasMetricsToken(request) || hasAdminSession()) {
            chain.doFilter(servletRequest, servletResponse);
            return;
        }

        log.warn("拒绝未授权访问 actuator：path={}, ip={}", path, request.getRemoteAddr());
        // 不返回 401/403 的具体原因，避免给探测者额外信息
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":404,\"message\":\"资源不存在\"}");
    }

    /**
     * 校验监控令牌。
     *
     * <p>用常量时间比较，避免通过响应时间差逐字节猜出令牌。
     * 未配置令牌时直接返回 false，关闭该通道。
     */
    private boolean hasMetricsToken(HttpServletRequest request) {
        if (metricsToken.isEmpty()) {
            return false;
        }
        String provided = request.getHeader(TOKEN_HEADER);
        if (provided == null || provided.isEmpty()) {
            return false;
        }
        return java.security.MessageDigest.isEqual(
                provided.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                metricsToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    /**
     * 判断请求路径是否落在 actuator 前缀下。
     *
     * <p>必须做「前缀 + 边界」判断：只写 {@code startsWith("/api/actuator")} 会把
     * {@code /api/actuator-x} 这种无关路径也算进来，误伤正常接口。
     */
    private boolean isActuatorPath(String path) {
        if (path == null || !path.startsWith(ACTUATOR_PREFIX)) {
            return false;
        }
        return path.length() == ACTUATOR_PREFIX.length()
                || path.charAt(ACTUATOR_PREFIX.length()) == '/';
    }

    /**
     * 是否持有有效的管理员会话。
     *
     * <p>用 try-catch 包住而不是先判断登录态：Sa-Token 在无上下文/未登录时
     * 抛的是异常而不是返回 null，直接调用更简洁。任何异常都按「未授权」处理，
     * 这是安全侧的默认值。
     */
    private boolean hasAdminSession() {
        try {
            Object loginId = StpUtil.getLoginIdDefaultNull();
            if (loginId == null) {
                return false;
            }
            if (!String.valueOf(loginId).startsWith("admin:")) {
                return false;
            }
            return StpUtil.hasRole("admin");
        } catch (RuntimeException e) {
            return false;
        }
    }
}
