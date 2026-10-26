package com.learnsphere.utils;

import jakarta.servlet.http.HttpServletRequest;

/**
 * 用户代理（User-Agent）解析工具类
 * 用于识别浏览器、操作系统、设备类型等信息
 */
public class UserAgentUtils {

    /**
     * 获取浏览器类型。
     *
     * <p>检测顺序至关重要，必须遵循「从具体到通用」：
     * <ol>
     *   <li>应用内置 WebView（微信、抖音、支付宝等）—— 它们的 UA 里同样带 Chrome/Safari 标记，
     *       若不先判定就会全部被识别成 Chrome；</li>
     *   <li>国产浏览器（夸克、UC、QQ、360 等）—— 同样基于 Chromium，UA 含 Chrome；</li>
     *   <li>国际衍生浏览器（Edge、Opera、Samsung 等）；</li>
     *   <li>iOS 上的第三方内核（CriOS/FxiOS/EdgiOS）—— iOS 强制 WebKit，
     *       但 UA 用 CriOS 而非 Chrome 标识，必须单独判定；</li>
     *   <li>最后才是 Firefox / Safari / Chrome 这些通用内核标记。</li>
     * </ol>
     *
     * <p>修复（2026-10）：原实现存在以下漏判，导致后台「用户日志」把大量非 Chrome
     * 访问显示成 Chrome ——
     * <ul>
     *   <li>微信/抖音/支付宝/微博/钉钉等 App 内置浏览器未识别；</li>
     *   <li>iOS 版 Chrome（CriOS）因不含 "chrome" 字样被误判成 Safari；</li>
     *   <li>搜狗浏览器新版 UA 用 "SE 2.X MetaSr" 而非 "sogou"；</li>
     *   <li>OPPO 浏览器新版 UA 用 "HeyTapBrowser" 而非 "oppo"；</li>
     *   <li>小米浏览器大小写敏感、"Electron" 桌面壳未识别。</li>
     * </ul>
     */
    public static String getBrowser(HttpServletRequest request) {
        return parseBrowser(getUserAgent(request));
    }

    /**
     * 纯字符串版本的浏览器解析，便于单元测试直接覆盖各种 UA。
     *
     * @param userAgent 原始 User-Agent 头
     * @return 可读的浏览器名称，无法识别时返回 "Other"
     */
    public static String parseBrowser(String userAgent) {
        if (userAgent == null || userAgent.trim().isEmpty()) {
            return "Unknown";
        }

        // 转换为小写以便不区分大小写匹配
        String ua = userAgent.toLowerCase();

        // ==================== 1. App 内置 WebView ====================
        // 这些 UA 一定同时含 Chrome 或 Safari，必须最先判定
        if (ua.contains("micromessenger")) {
            return "微信";
        } else if (ua.contains("bytedancewebview") || ua.contains("aweme") || ua.contains("douyin")) {
            return "抖音";
        } else if (ua.contains("alipayclient") || ua.contains("aliapp")) {
            return "支付宝";
        } else if (ua.contains("weibo")) {
            return "微博";
        } else if (ua.contains("dingtalk")) {
            return "钉钉";
        } else if (ua.contains("lark") || ua.contains("feishu")) {
            return "飞书";
        } else if (ua.contains("qq/") && !ua.contains("mqqbrowser")) {
            // 手机 QQ 内置浏览器；桌面 QQ 浏览器走下面的 qqbrowser 分支
            return "QQ";
        } else if (ua.contains("baiduboxapp")) {
            return "百度App";
        } else if (ua.contains("toutiao")) {
            return "今日头条";
        } else if (ua.contains("xiaohongshu") || ua.contains("xhs")) {
            return "小红书";
        } else if (ua.contains("zhihu")) {
            return "知乎";
        } else if (ua.contains("bilibili")) {
            return "哔哩哔哩";
        }

        // ==================== 2. 国产浏览器 ====================
        else if (ua.contains("quark")) {
            return "夸克浏览器";
        } else if (ua.contains("ucbrowser") || ua.contains("uc browser")) {
            // 注意不要用裸的 "ubrowser" 判断：baidubrowser 里也含该子串
            return "UC浏览器";
        } else if (ua.contains("qqbrowser") || ua.contains("mqqbrowser")) {
            return "QQ浏览器";
        } else if (ua.contains("baidubrowser")) {
            return "百度浏览器";
        } else if (ua.contains("sogou") || ua.contains("metasr")) {
            // 新版搜狗 UA 用 "SE 2.X MetaSr 1.0"，不含 sogou
            return "搜狗浏览器";
        } else if (ua.contains("360se")) {
            return "360安全浏览器";
        } else if (ua.contains("360ee")) {
            return "360极速浏览器";
        } else if (ua.contains("qihu 360")) {
            return "360浏览器";
        } else if (ua.contains("maxthon")) {
            return "傲游浏览器";
        } else if (ua.contains("huaweibrowser")) {
            return "华为浏览器";
        } else if (ua.contains("miuibrowser") || ua.contains("xiaomi")) {
            return "小米浏览器";
        } else if (ua.contains("vivobrowser")) {
            return "Vivo浏览器";
        } else if (ua.contains("heytapbrowser") || ua.contains("oppobrowser")) {
            // OPPO 新版 UA 用 HeyTapBrowser，不含 oppo
            return "OPPO浏览器";
        }

        // ==================== 3. 国际衍生浏览器 ====================
        else if (ua.contains("edg/") || ua.contains("edge/") || ua.contains("edga/") || ua.contains("edgios/")) {
            return "Microsoft Edge";
        } else if (ua.contains("opr/") || ua.contains("opera") || ua.contains("opios/")) {
            return "Opera";
        } else if (ua.contains("brave")) {
            return "Brave";
        } else if (ua.contains("vivaldi")) {
            return "Vivaldi";
        } else if (ua.contains("yabrowser")) {
            return "Yandex Browser";
        } else if (ua.contains("samsungbrowser")) {
            return "Samsung Browser";
        } else if (ua.contains("electron")) {
            // Electron 桌面壳（本项目可能的客户端形态）
            return "Electron";
        }

        // ==================== 4. iOS 上的第三方内核 ====================
        // iOS 强制 WebKit，但 UA 标识与桌面版不同：CriOS=Chrome、FxiOS=Firefox、EdgiOS=Edge
        // 注意：这些标识不含 "chrome"/"firefox" 字样，必须早于 Safari 判定
        else if (ua.contains("crios")) {
            return "Chrome";
        } else if (ua.contains("fxios")) {
            return "Firefox";
        }

        // ==================== 5. 通用内核 ====================
        else if (ua.contains("firefox")) {
            return "Firefox";
        } else if (ua.contains("chrome") || ua.contains("chromium")) {
            // Chrome 或基于 Chromium 的其他未识别浏览器
            return "Chrome";
        } else if (ua.contains("safari")) {
            // 放在 Chrome 之后：Chrome 的 UA 也含 Safari
            return "Safari";
        }

        // ==================== 6. 旧版浏览器与命令行工具 ====================
        else if (ua.contains("msie") || ua.contains("trident")) {
            return "Internet Explorer";
        } else if (ua.contains("curl")) {
            return "curl";
        } else if (ua.contains("python")) {
            return "Python";
        } else if (ua.contains("okhttp")) {
            return "OkHttp";
        } else if (ua.contains("postman")) {
            return "Postman";
        }

        return "Other";
    }

    /**
     * 获取操作系统
     */
    public static String getOperatingSystem(HttpServletRequest request) {
        return parseOperatingSystem(getUserAgent(request));
    }

    /**
     * 纯字符串版本的操作系统解析，便于单元测试。
     */
    public static String parseOperatingSystem(String userAgent) {
        if (userAgent == null || userAgent.trim().isEmpty()) {
            return "Unknown";
        }

        // iOS 必须早于 macOS：iPhone/iPad 的 UA 里也含 "Mac OS X"
        if (userAgent.contains("iPhone") || userAgent.contains("iPad") || userAgent.contains("iPod")) {
            return "iOS";
        } else if (userAgent.contains("Android")) {
            return "Android";
        } else if (userAgent.contains("Windows NT 10.0")) {
            return "Windows 10/11";
        } else if (userAgent.contains("Windows NT 6.3")) {
            return "Windows 8.1";
        } else if (userAgent.contains("Windows NT 6.2")) {
            return "Windows 8";
        } else if (userAgent.contains("Windows NT 6.1")) {
            return "Windows 7";
        } else if (userAgent.contains("Windows")) {
            return "Windows";
        } else if (userAgent.contains("Mac OS X") || userAgent.contains("Macintosh")) {
            return "macOS";
        } else if (userAgent.contains("CrOS")) {
            return "ChromeOS";
        } else if (userAgent.contains("Linux")) {
            return "Linux";
        }

        return "Other";
    }

    /**
     * 获取设备类型
     */
    public static String getDeviceType(HttpServletRequest request) {
        return parseDeviceType(getUserAgent(request));
    }

    /**
     * 纯字符串版本的设备类型解析，便于单元测试。
     */
    public static String parseDeviceType(String userAgent) {
        if (userAgent == null || userAgent.trim().isEmpty()) {
            return "Unknown";
        }

        // 平板必须在手机之前判定：iPad 的 UA 同时满足部分移动端特征
        if (userAgent.contains("iPad") || userAgent.contains("Tablet")) {
            return "Tablet";
        }

        if (userAgent.contains("Mobile")
                || userAgent.contains("Android")
                || userAgent.contains("iPhone")
                || userAgent.contains("iPod")) {
            return "Mobile";
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
