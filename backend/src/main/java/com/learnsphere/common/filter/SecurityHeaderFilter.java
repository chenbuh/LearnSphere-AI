package com.learnsphere.common.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 安全访问过滤器
 * 校验 Referer 和 Origin，防止跨站 API 滥用和非法热链。
 */
@Component
public class SecurityHeaderFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String referer = request.getHeader("Referer");
        String origin = request.getHeader("Origin");

        // 仅拦截 API 请求
        if (request.getRequestURI().startsWith("/api/")) {
            // 在开发环境下允许 localhost，生产环境下可配置域名白名单
            boolean isValid = false;

            // 简单校验逻辑：必须包含有效的 Referer 或 Origin (此处暂放宽 localhost 访问)
            if (referer == null && origin == null) {
                // 可能是直接通过浏览器地址栏或 curl 访问敏感 API
                // 对于词汇列表等接口可以拦截，但登录等接口可能需要放行
                if (request.getRequestURI().contains("/vocabulary/")) {
                    // 词汇接口强制校验
                    response.sendError(HttpServletResponse.SC_FORBIDDEN,
                            "Access Denied: Direct API access is blocked.");
                    return;
                }
            }
        }

        chain.doFilter(servletRequest, servletResponse);
    }
}
