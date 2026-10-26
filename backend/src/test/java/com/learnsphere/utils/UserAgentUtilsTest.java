package com.learnsphere.utils;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@link UserAgentUtils} 的单元测试。
 *
 * <p>覆盖后台「用户日志」曾经识别错误的所有场景：App 内置 WebView、
 * iOS 上的第三方内核、国产浏览器新版 UA 标识等。
 */
@DisplayName("UserAgentUtils - 浏览器/系统/设备识别")
class UserAgentUtilsTest {

    // ==================== 通用 UA 常量 ====================

    private static final String CHROME_WIN =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/141.0.0.0 Safari/537.36";

    private static final String EDGE_WIN =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0";

    private static final String FIREFOX_WIN =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0";

    private static final String SAFARI_MAC =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) "
                    + "Version/18.1 Safari/605.1.15";

    private static final String SAFARI_IOS =
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) "
                    + "Version/18.1 Mobile/15E148 Safari/604.1";

    private static final String CHROME_IOS =
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) "
                    + "CriOS/141.0.7390.56 Mobile/15E148 Safari/604.1";

    private static final String FIREFOX_IOS =
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) "
                    + "FxiOS/132.0 Mobile/15E148 Safari/605.1.15";

    private static final String EDGE_IOS =
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) "
                    + "Version/18.0 EdgiOS/141.0 Mobile/15E148 Safari/605.1.15";

    private static final String CHROME_ANDROID =
            "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/141.0.0.0 Mobile Safari/537.36";

    @Nested
    @DisplayName("App 内置 WebView")
    class EmbeddedWebView {

        @Test
        @DisplayName("微信 Android 应识别为「微信」，而不是 Chrome")
        void wechatAndroid() {
            String ua = "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) "
                    + "Chrome/141.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.50.2701";
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo("微信");
        }

        @Test
        @DisplayName("微信 iOS 应识别为「微信」，而不是 Other")
        void wechatIos() {
            String ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 "
                    + "(KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.50";
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo("微信");
        }

        @ParameterizedTest(name = "{0} → {1}")
        @CsvSource({
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 BytedanceWebview/d8a21c6', 抖音",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 AliApp(AP/10.5.36)', 支付宝",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 Weibo (Android)', 微博",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 DingTalk/7.6.0', 钉钉",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 baiduboxapp/13.50.0.10', 百度App",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 Lark/7.20.0', 飞书",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 xhs/8.30', 小红书",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 bilibili', 哔哩哔哩",
        })
        @DisplayName("其他 App 内置浏览器应被正确识别")
        void otherApps(String ua, String expected) {
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo(expected);
        }

        @Test
        @DisplayName("手机 QQ 内置浏览器应识别为「QQ」，而非 QQ浏览器")
        void mobileQq() {
            String ua = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 "
                    + "Mobile Safari/537.36 V1_AND_SQ_9.0.0 QQ/9.0.0";
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo("QQ");
        }
    }

    @Nested
    @DisplayName("iOS 第三方内核")
    class IosThirdParty {

        @Test
        @DisplayName("iOS Chrome（CriOS）应识别为 Chrome，而不是 Safari")
        void chromeIos() {
            assertThat(UserAgentUtils.parseBrowser(CHROME_IOS)).isEqualTo("Chrome");
        }

        @Test
        @DisplayName("iOS Firefox（FxiOS）应识别为 Firefox")
        void firefoxIos() {
            assertThat(UserAgentUtils.parseBrowser(FIREFOX_IOS)).isEqualTo("Firefox");
        }

        @Test
        @DisplayName("iOS Edge（EdgiOS）应识别为 Microsoft Edge")
        void edgeIos() {
            assertThat(UserAgentUtils.parseBrowser(EDGE_IOS)).isEqualTo("Microsoft Edge");
        }

        @Test
        @DisplayName("iOS Safari 应识别为 Safari")
        void safariIos() {
            assertThat(UserAgentUtils.parseBrowser(SAFARI_IOS)).isEqualTo("Safari");
        }
    }

    @Nested
    @DisplayName("国产浏览器")
    class DomesticBrowsers {

        @ParameterizedTest(name = "{0} → {1}")
        @CsvSource({
                "'Mozilla/5.0 (Linux; U; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 Quark/6.9.0.360', 夸克浏览器",
                "'Mozilla/5.0 (Linux; U; Android 14) AppleWebKit/537.36 Chrome/100.0.0.0 UCBrowser/15.5.9.1366 Mobile Safari/537.36', UC浏览器",
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 QQBrowser/10.8.4563.400', QQ浏览器",
                "'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 Chrome/86.0.4240.198 Safari/537.36 QIHU 360SE', 360安全浏览器",
                "'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 Chrome/86.0.4240.198 Safari/537.36 QIHU 360EE', 360极速浏览器",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/114.0.0.0 Mobile Safari/537.36 HuaweiBrowser/14.0.0.312', 华为浏览器",
                "'Mozilla/5.0 (Linux; U; Android 14) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 XiaoMi/MiuiBrowser/18.4.20', 小米浏览器",
                "'Mozilla/5.0 (Linux; Android 14; V2309A) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36 VivoBrowser/19.0.0.0', Vivo浏览器",
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/111.0.0.0 Safari/537.36 baidubrowser/13.0', 百度浏览器",
                "'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/108.0.0.0 Safari/537.36 Maxthon/7.0', 傲游浏览器",
        })
        @DisplayName("常见国产浏览器")
        void common(String ua, String expected) {
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo(expected);
        }

        @Test
        @DisplayName("搜狗新版 UA（SE 2.X MetaSr）应识别为搜狗浏览器，而不是 Chrome")
        void sogouNewUa() {
            String ua = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 SE 2.X MetaSr 1.0";
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo("搜狗浏览器");
        }

        @Test
        @DisplayName("OPPO 新版 UA（HeyTapBrowser）应识别为 OPPO浏览器，而不是 Chrome")
        void oppoNewUa() {
            String ua = "Mozilla/5.0 (Linux; Android 14; PHZ110) AppleWebKit/537.36 "
                    + "Chrome/111.0.0.0 Mobile Safari/537.36 HeyTapBrowser/45.10.1.1";
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo("OPPO浏览器");
        }
    }

    @Nested
    @DisplayName("国际主流浏览器")
    class International {

        @Test
        @DisplayName("桌面 Chrome")
        void chromeDesktop() {
            assertThat(UserAgentUtils.parseBrowser(CHROME_WIN)).isEqualTo("Chrome");
        }

        @Test
        @DisplayName("Android Chrome")
        void chromeAndroid() {
            assertThat(UserAgentUtils.parseBrowser(CHROME_ANDROID)).isEqualTo("Chrome");
        }

        @Test
        @DisplayName("桌面 Edge 不应被识别成 Chrome")
        void edgeDesktop() {
            assertThat(UserAgentUtils.parseBrowser(EDGE_WIN)).isEqualTo("Microsoft Edge");
        }

        @Test
        @DisplayName("桌面 Firefox")
        void firefoxDesktop() {
            assertThat(UserAgentUtils.parseBrowser(FIREFOX_WIN)).isEqualTo("Firefox");
        }

        @Test
        @DisplayName("macOS Safari")
        void safariMac() {
            assertThat(UserAgentUtils.parseBrowser(SAFARI_MAC)).isEqualTo("Safari");
        }

        @ParameterizedTest(name = "{0} → {1}")
        @CsvSource({
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36 OPR/119.0.0.0', Opera",
                "'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36', Samsung Browser",
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Vivaldi/6.9', Vivaldi",
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Brave/1.70', Brave",
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 YaBrowser/24.10', Yandex Browser",
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Electron/32.0.0', Electron",
        })
        @DisplayName("其他主流/衍生浏览器")
        void others(String ua, String expected) {
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo(expected);
        }
    }

    @Nested
    @DisplayName("边界与工具")
    class EdgeCases {

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = {"   "})
        @DisplayName("空 UA 返回 Unknown")
        void blank(String ua) {
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo("Unknown");
        }

        @Test
        @DisplayName("无法识别的 UA 返回 Other")
        void unknown() {
            assertThat(UserAgentUtils.parseBrowser("some-unknown-agent/1.0")).isEqualTo("Other");
        }

        @ParameterizedTest(name = "{0} → {1}")
        @CsvSource({
                "'curl/8.5.0', curl",
                "'python-requests/2.31.0', Python",
                "'okhttp/4.12.0', OkHttp",
                "'PostmanRuntime/7.39.0', Postman",
        })
        @DisplayName("命令行/工具类 UA")
        void tools(String ua, String expected) {
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo(expected);
        }

        @Test
        @DisplayName("旧版 IE")
        void ie() {
            String ua = "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko";
            assertThat(UserAgentUtils.parseBrowser(ua)).isEqualTo("Internet Explorer");
        }
    }

    @Nested
    @DisplayName("操作系统识别")
    class OperatingSystem {

        @ParameterizedTest(name = "{0} → {1}")
        @CsvSource({
                "'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15', iOS",
                "'Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15', iOS",
                "'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36', Android",
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', Windows 10/11",
                "'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36', Windows 7",
                "'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', macOS",
                "'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36', ChromeOS",
                "'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', Linux",
        })
        @DisplayName("各平台 OS")
        void os(String ua, String expected) {
            assertThat(UserAgentUtils.parseOperatingSystem(ua)).isEqualTo(expected);
        }

        @Test
        @DisplayName("iPhone 不应被误判为 macOS（UA 含 Mac OS X）")
        void iphoneNotMac() {
            assertThat(UserAgentUtils.parseOperatingSystem(SAFARI_IOS)).isEqualTo("iOS");
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("空 UA 返回 Unknown")
        void blank(String ua) {
            assertThat(UserAgentUtils.parseOperatingSystem(ua)).isEqualTo("Unknown");
        }
    }

    @Nested
    @DisplayName("设备类型识别")
    class DeviceType {

        @ParameterizedTest(name = "{0} → {1}")
        @CsvSource({
                "'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', Mobile",
                "'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 Chrome/141.0.0.0 Mobile Safari/537.36', Mobile",
                "'Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15', Tablet",
                "'Mozilla/5.0 (Linux; Android 14; SM-T870) AppleWebKit/537.36 Tablet Safari/537.36', Tablet",
                "'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141.0.0.0 Safari/537.36', Desktop",
                "'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15', Desktop",
        })
        @DisplayName("各设备类型")
        void device(String ua, String expected) {
            assertThat(UserAgentUtils.parseDeviceType(ua)).isEqualTo(expected);
        }

        @Test
        @DisplayName("iPad 应优先判定为平板，而不是手机")
        void ipadNotMobile() {
            String ua = "Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
            assertThat(UserAgentUtils.parseDeviceType(ua)).isEqualTo("Tablet");
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("空 UA 返回 Unknown")
        void blank(String ua) {
            assertThat(UserAgentUtils.parseDeviceType(ua)).isEqualTo("Unknown");
        }
    }
}
