package com.learnsphere.utils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 用户代理（User-Agent）解析工具类
 * 用于识别浏览器、操作系统、设备类型等信息
 */
public class UserAgentUtils {

    /**
     * 获取浏览器类型
     * 注意：检测顺序很重要！
     * 必须先检测更具体的浏览器（如夸克、Edge、QQ浏览器），再检测通用的Chrome
     * 因为这些浏览器的UA中通常也包含"Chrome"
     */
    public static String getBrowser(HttpServletRequest request) {
        String userAgent = getUserAgent(request);
        if (userAgent == null) {
            return "Unknown";
        }

        // 转换为小写以便不区分大小写匹配
        String ua = userAgent.toLowerCase();

        // 1. 先检测国产浏览器（通常基于Chromium，但有自己的标识）
        if (ua.contains("quark")) {
            return "夸克浏览器";
        } else if (ua.contains("ucbrowser") || ua.contains("uc browser")) {
            return "UC浏览器";
        } else if (ua.contains("qqbrowser") || ua.contains("qq/")) {
            return "QQ浏览器";
        } else if (ua.contains("baidubrowser") || ua.contains("baiduboxapp")) {
            return "百度浏览器";
        } else if (ua.contains("sogou")) {
            return "搜狗浏览器";
        } else if (ua.contains("360se")) {
            return "360安全浏览器";
        } else if (ua.contains("360ee")) {
            return "360极速浏览器";
        } else if (ua.contains("maxthon")) {
            return "傲游浏览器";
        } else if (ua.contains("huaweibrowser")) {
            return "华为浏览器";
        } else if (ua.contains("miuibrowser") || ua.contains("xiaomi")) {
            return "小米浏览器";
        } else if (ua.contains("vivo")) {
            return "Vivo浏览器";
        } else if (ua.contains("oppo")) {
            return "OPPO浏览器";
        }

        // 2. 检测国际主流浏览器
        else if (ua.contains("edg/") || ua.contains("edge/") || ua.contains("edga/") || ua.contains("edgios/")) {
            return "Microsoft Edge";
        } else if (ua.contains("opr/") || ua.contains("opera")) {
            return "Opera";
        } else if (ua.contains("brave")) {
            return "Brave";
        } else if (ua.contains("vivaldi")) {
            return "Vivaldi";
        } else if (ua.contains("yabrowser")) {
            return "Yandex Browser";
        } else if (ua.contains("samsungbrowser")) {
            return "Samsung Browser";
        }

        // 3. 检测主流浏览器引擎
        else if (ua.contains("firefox") || ua.contains("fxios")) {
            return "Firefox";
        } else if (ua.contains("safari") && !ua.contains("chrome") && !ua.contains("chromium")) {
            // 必须确保不包含chrome，因为Chrome的UA也包含Safari
            return "Safari";
        } else if (ua.contains("chrome") || ua.contains("crios")) {
            // Chrome 或 基于 Chromium 的其他未识别浏览器
            return "Chrome";
        }

        // 4. 旧版浏览器
        else if (ua.contains("msie") || ua.contains("trident")) {
            return "Internet Explorer";
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
