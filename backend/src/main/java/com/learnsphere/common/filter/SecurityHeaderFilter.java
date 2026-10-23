package com.learnsphere.common.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 安全响应头 + 词汇接口防盗链。
 *
 * 修复（2026-10）：
 * 本类名为 SecurityHeaderFilter，但原实现没有设置任何安全响应头，
 * 只做了一次 Referer 存在性判断。实测站点响应里 X-Content-Type-Options /
 * X-Frame-Options / Referrer-Policy 全部缺失，浏览器因此无法防御
 * MIME 类型嗅探与点击劫持。现补齐这三项，且对所有响应生效（含 HTML 页面）。
 *
 * 说明：下面的 Referer 判断只校验「是否存在」，不校验主机是否为本服务，
 * 因此它挡不住伪造请求头的调用方，不构成有效的安全边界。真正的访问控制
 * 依赖 Sa-Token 登录校验与限流。之所以暂不改严，是因为线上可能经过反向代理，
 * 若 Host 未被正确透传，严格比对主机名会误伤正常浏览器请求 —— 需要结合
 * 实际部署拓扑再决定。
 */
@Component
public class SecurityHeaderFilter implements Filter {

    /** 需要防盗链保护的接口前缀 */
    private static final String GUARDED_PREFIX = "/vocabulary/";

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 安全响应头：阻止 MIME 嗅探、禁止跨源 iframe 嵌套、限制 Referer 泄露范围。
        // 注意 Referrer-Policy 用 strict-origin-when-cross-origin 而非 no-referrer，
        // 同源请求仍会带完整 Referer，不影响下面词汇接口的判断。
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "SAMEORIGIN");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // 仅拦截 API 请求
        if (request.getRequestURI().startsWith("/api/")) {
            String referer = request.getHeader("Referer");
            String origin = request.getHeader("Origin");

            // 既没有 Referer 也没有 Origin，说明是地址栏直连或脚本直连
            if (referer == null && origin == null
                    && request.getRequestURI().contains(GUARDED_PREFIX)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN,
                        "Access Denied: Direct API access is blocked.");
                return;
            }
        }

        chain.doFilter(servletRequest, servletResponse);
    }
}
