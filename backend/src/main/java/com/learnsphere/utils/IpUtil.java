package com.learnsphere.utils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * IP 地址工具类
 */
public class IpUtil {

    /**
     * 获取客户端真实IP地址
     * 支持通过代理、负载均衡等方式获取真实IP
     * 
     * @param request HTTP请求对象
     * @return 格式化后的IP地址
     */
    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Real-IP");

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Forwarded-For");
            if (ip != null && !ip.isEmpty()) {
                // X-Forwarded-For可能包含多个IP，取第一个
                int index = ip.indexOf(',');
                if (index != -1) {
                    ip = ip.substring(0, index);
                }
            }
        }

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // 格式化IP地址
        return formatIp(ip);
    }

    /**
     * 格式化IP地址
     * 将IPv6的本地地址转换为IPv4格式，使其更易读
     * 
     * @param ip 原始IP地址
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
