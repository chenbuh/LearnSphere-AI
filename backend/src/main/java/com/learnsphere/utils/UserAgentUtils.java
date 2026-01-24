package com.learnsphere.utils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 用户代理（User-Agent）解析工具类
 * 用于识别浏览器、操作系统、设备类型等信息
 */
public class UserAgentUtils {

    /**
     * 获取浏览器类型
     */
    public static String getBrowser(HttpServletRequest request) {
        String userAgent = getUserAgent(request);
        if (userAgent == null) {
            return "Unknown";
        }

        if (userAgent.contains("Edg")) {
            return "Edge";
        } else if (userAgent.contains("Chrome")) {
            return "Chrome";
        } else if (userAgent.contains("Firefox")) {
            return "Firefox";
        } else if (userAgent.contains("Safari") && !userAgent.contains("Chrome")) {
            return "Safari";
        } else if (userAgent.contains("Opera") || userAgent.contains("OPR")) {
            return "Opera";
        } else if (userAgent.contains("MSIE") || userAgent.contains("Trident")) {
            return "IE";
        }

        return "Other";
    }

    /**
     * 获取操作系统
     */
    public static String getOperatingSystem(HttpServletRequest request) {
        String userAgent = getUserAgent(request);
        if (userAgent == null) {
            return "Unknown";
        }

        if (userAgent.contains("Windows NT 10.0")) {
            return "Windows 10/11";
        } else if (userAgent.contains("Windows NT 6.3")) {
            return "Windows 8.1";
        } else if (userAgent.contains("Windows NT 6.2")) {
            return "Windows 8";
        } else if (userAgent.contains("Windows NT 6.1")) {
            return "Windows 7";
        } else if (userAgent.contains("Windows")) {
            return "Windows";
        } else if (userAgent.contains("Mac OS X")) {
            return "macOS";
        } else if (userAgent.contains("Android")) {
            return "Android";
        } else if (userAgent.contains("iPhone") || userAgent.contains("iPad")) {
            return "iOS";
        } else if (userAgent.contains("Linux")) {
            return "Linux";
        }

        return "Other";
    }

    /**
     * 获取设备类型
     */
    public static String getDeviceType(HttpServletRequest request) {
        String userAgent = getUserAgent(request);
        if (userAgent == null) {
            return "Unknown";
        }

        // 移动设备
        if (userAgent.contains("Mobile") ||
                userAgent.contains("Android") ||
                userAgent.contains("iPhone")) {
            return "Mobile";
        }

        // 平板设备
        if (userAgent.contains("iPad") ||
                userAgent.contains("Tablet")) {
            return "Tablet";
        }

        // 默认为桌面设备
        return "Desktop";
    }

    /**
     * 获取User-Agent字符串
     */
    private static String getUserAgent(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        return request.getHeader("User-Agent");
    }

    /**
     * 获取完整的User-Agent信息
     */
    public static UserAgentInfo getUserAgentInfo(HttpServletRequest request) {
        UserAgentInfo info = new UserAgentInfo();
        info.setBrowser(getBrowser(request));
        info.setOs(getOperatingSystem(request));
        info.setDeviceType(getDeviceType(request));
        info.setUserAgent(getUserAgent(request));
        return info;
    }

    /**
     * User-Agent 信息封装类
     */
    public static class UserAgentInfo {
        private String browser;
        private String os;
        private String deviceType;
        private String userAgent;

        public String getBrowser() {
            return browser;
        }

        public void setBrowser(String browser) {
            this.browser = browser;
        }

        public String getOs() {
            return os;
        }

        public void setOs(String os) {
            this.os = os;
        }

        public String getDeviceType() {
            return deviceType;
        }

        public void setDeviceType(String deviceType) {
            this.deviceType = deviceType;
        }

        public String getUserAgent() {
            return userAgent;
        }

        public void setUserAgent(String userAgent) {
            this.userAgent = userAgent;
        }
    }
}
