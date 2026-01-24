package com.learnsphere.common.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 全局 XSS 过滤器
 */
@Component
public class XssFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        // 包装请求，过滤 XSS
        XssHttpServletRequestWrapper xssRequest = new XssHttpServletRequestWrapper(req);
        chain.doFilter(xssRequest, response);
    }
}
