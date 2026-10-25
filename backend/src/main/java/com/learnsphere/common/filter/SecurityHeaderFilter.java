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

        /*
         * Content-Security-Policy：XSS 的最后一道浏览器侧防线。
         *
         * 之所以要加：前端有若干 v-html 渲染点（AI 回复、题目正文）。
         * 虽然已经把渲染改成「先转义再替换」，但只要有新增的 v-html 忘记转义，
         * 没有 CSP 就等于裸奔。CSP 能在浏览器层拦住内联脚本执行。
         *
         * 各指令的取舍：
         * - script-src 'self'：只允许本站脚本。构建产物没有内联 script，
         *   所以不需要 'unsafe-inline'。这是拦住 XSS 的关键一条。
         * - style-src 'self' 'unsafe-inline'：Naive UI / Vue 会在运行时写内联
         *   style 属性，去掉 unsafe-inline 会直接破坏主题与布局，只能保留。
         *   内联样式无法执行脚本，风险远低于内联脚本。
         * - img-src 'self' data: blob:：头像与图表会用到 data:/blob: URL。
         * - connect-src 'self'：API 与监控上报都同源；如需接第三方统计，
         *   必须在这里显式加域名，否则上报会被静默拦截。
         * - worker-src 'self' blob:：vosk 离线语音识别用 Blob 创建 Worker。
         * - object-src 'none' / base-uri 'self'：封掉插件与 base 标签劫持。
         * - frame-ancestors 'self'：与 X-Frame-Options 双重保险，防点击劫持。
         */
        response.setHeader("Content-Security-Policy",
                "default-src 'self'; "
                        + "script-src 'self'; "
                        + "style-src 'self' 'unsafe-inline'; "
                        + "img-src 'self' data: blob:; "
                        + "font-src 'self' data:; "
                        + "media-src 'self' data: blob:; "
                        + "connect-src 'self'; "
                        + "worker-src 'self' blob:; "
                        + "object-src 'none'; "
                        + "base-uri 'self'; "
                        + "form-action 'self'; "
                        + "frame-ancestors 'self'");

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
