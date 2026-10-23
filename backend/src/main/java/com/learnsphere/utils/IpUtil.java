package com.learnsphere.utils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * IP 地址工具类
 */
public class IpUtil {

    /**
     * 获取客户端真实IP地址。
     *
     * 安全修复（2026-03）：原实现无条件信任 X-Real-IP / X-Forwarded-For 并取
     * 代理链中的第一个值，而该值正是客户端可任意伪造的位置，会导致基于 IP 的
     * 限流、封禁与审计记录全部失效。现统一委托给 ClientIpResolver：
     * 仅在显式配置可信代理层数时才采信转发头，否则只使用 TCP 对端地址。
     *
     * @param request HTTP请求对象
     * @return 客户端 IP
     */
    public static String getClientIp(HttpServletRequest request) {
        return ClientIpResolver.resolve(request);
    }

    /**
     * 格式化IP地址
     * 将IPv6的本地地址转换为IPv4格式，使其更易读
     * 
     * @param ip 原IP地址
     * @return 格式化后的IP地址
     */
    private static String formatIp(String ip) {
        if (ip == null || ip.isEmpty()) {
            return "unknown";
        }

        // IPv6 本地回环地址转换为 IPv4
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return "127.0.0.1";
        }

        // 移除可能的端口号
        int colonIndex = ip.lastIndexOf(':');
        if (colonIndex > 0 && ip.indexOf('.') > 0) {
            // 如果同时包含冒号和点，可能是 IPv4:port 格式
            String possibleIp = ip.substring(0, colonIndex);
            if (isValidIpv4(possibleIp)) {
                return possibleIp;
            }
        }

        return ip.trim();
    }

    /**
     * 简单校验是否为有效的IPv4地址
     */
    private static boolean isValidIpv4(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }
        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            return false;
        }
        for (String part : parts) {
            try {
                int num = Integer.parseInt(part);
                if (num < 0 || num > 255) {
                    return false;
                }
            } catch (NumberFormatException e) {
                return false;
            }
        }
        return true;
    }
}
