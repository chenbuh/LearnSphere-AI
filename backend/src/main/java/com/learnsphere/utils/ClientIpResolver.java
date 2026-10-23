package com.learnsphere.utils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

/**
 * 客户端 IP 解析器（统一入口）。
 *
 * ============================================================================
 * 安全修复（2026-03）—— 修复 IP 伪造导致的限流/风控/审计失效
 * ----------------------------------------------------------------------------
 * 问题：项目中曾存在 4 处独立的 IP 解析实现，均无条件信任客户端可设置的请求头
 * （X-Forwarded-For / X-Real-IP / Proxy-Client-IP 等），且取代理链中的「第一个」
 * 地址。而 X-Forwarded-For 的语义是「客户端 → 代理1 → 代理2」，最左侧正是
 * 客户端可任意伪造的值。攻击者只需发送：
 *
 *     X-Forwarded-For: 1.2.3.4
 *
 * 即可让每次请求呈现为不同 IP，从而：
 *   - 绕过 @RateLimit(limitType = IP)（登录、注册、验证码、管理员登录等）；
 *   - 绕过 AntiCrawlerInterceptor 的 IP 计数与黑名单；
 *   - 污染 user_log / security_log 中的来源 IP 与地理位置。
 *
 * 修复原则：
 *   1. X-Forwarded-For 从「右侧」按可信代理跳数取值——最右侧由最近的
 *      可信代理写入，是唯一无法被客户端伪造的位置。
 *   2. 通过 trusted-proxy-count 配置可信代理层数；未配置（默认 0）时
 *      完全忽略所有转发头，只使用 request.getRemoteAddr()。
 *   3. 取到的值必须通过格式校验，非法内容回退为 remoteAddr。
 *
 * 部署要求：
 *   若服务位于 Nginx / 网关之后，必须设置 trusted-proxy-count 为实际代理层数，
 *   否则所有请求会呈现为代理机 IP，导致限流误伤（可接受的安全侧降级）。
 *   配置项：app.security.trusted-proxy-count（或环境变量 TRUSTED_PROXY_COUNT）
 * ============================================================================
 */
@Slf4j
public final class ClientIpResolver {

    /**
     * 可信代理层数。0 表示不信任任何转发头，直接使用 TCP 对端地址。
     */
    private static volatile int trustedProxyCount = 0;

    private ClientIpResolver() {
    }

    /**
     * 由配置注入可信代理层数。非法值按 0 处理（安全侧降级）。
     */
    public static void setTrustedProxyCount(int count) {
        trustedProxyCount = Math.max(0, count);
        log.info("客户端 IP 解析已配置可信代理层数: {}", trustedProxyCount);
    }

    public static int getTrustedProxyCount() {
        return trustedProxyCount;
    }

    /**
     * 解析客户端 IP（可信版本）。
     *
     * @param request HTTP 请求
     * @return 客户端 IP；无法确定时返回 remoteAddr；request 为空时返回 "unknown"
     */
    public static String resolve(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        String remoteAddr = normalize(request.getRemoteAddr());

        // 未配置可信代理时，只认 TCP 对端地址，忽略全部转发头
        if (trustedProxyCount <= 0) {
            return remoteAddr;
        }

        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded == null || forwarded.isBlank()) {
            return remoteAddr;
        }

        String[] chain = forwarded.split(",");
        // X-Forwarded-For 的语义：每经过一层代理，该代理会把「它收到的对端地址」
        // 追加到列表末尾。因此列表形如：[客户端, 代理1, 代理2, ..., 代理N]，
        // 其中末尾的 N 项由可信代理写入，无法被客户端伪造。
        //
        // 真实客户端地址位于「从右往左数第 trustedProxyCount 个」位置：
        //   index = chain.length - trustedProxyCount
        //
        // 校验示例（trustedProxyCount = 1，即 客户端 -> Nginx -> 应用）：
        //   "C"        (len=1) -> index 0 -> C   （Nginx 写入的客户端地址）
        //   "F, C"     (len=2) -> index 1 -> C   （忽略客户端伪造的前缀 F）
        // 校验示例（trustedProxyCount = 2，即 客户端 -> CDN -> Nginx -> 应用）：
        //   "C, CDN"      (len=2) -> index 0 -> C
        //   "F, C, CDN"   (len=3) -> index 1 -> C
        int index = chain.length - trustedProxyCount;
        if (index < 0 || index >= chain.length) {
            // 链长度小于可信代理层数，说明请求未经过预期代理，不可信
            log.debug("X-Forwarded-For 链长度({})小于可信代理层数({})，回退 remoteAddr",
                    chain.length, trustedProxyCount);
            return remoteAddr;
        }

        String candidate = normalize(chain[index]);
        return isValidIp(candidate) ? candidate : remoteAddr;
    }

    /**
     * 保留原有重载命名，便于渐进替换。
     */
    public static String getIpAddress(HttpServletRequest request) {
        return resolve(request);
    }

    private static String normalize(String value) {
        if (value == null) {
            return "unknown";
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return "unknown";
        }
        // IPv6 回环与未指定地址统一表示
        if ("0:0:0:0:0:0:0:1".equals(trimmed) || "::1".equals(trimmed)) {
            return "127.0.0.1";
        }
        // 去除 IPv4:port
        int colon = trimmed.lastIndexOf(':');
        if (colon > 0 && trimmed.indexOf('.') > 0) {
            String maybeIpv4 = trimmed.substring(0, colon);
            if (isValidIpv4(maybeIpv4)) {
                return maybeIpv4;
            }
        }
        // 去除 IPv6 的方括号
        if (trimmed.startsWith("[") && trimmed.contains("]")) {
            return trimmed.substring(1, trimmed.indexOf(']'));
        }
        return trimmed;
    }

    /**
     * 严格的 IP 格式校验，拒绝任意字符串（防止把攻击载荷写入日志与限流键）。
     */
    private static boolean isValidIp(String ip) {
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            return false;
        }
        return isValidIpv4(ip) || isValidIpv6(ip);
    }

    private static boolean isValidIpv4(String ip) {
        String[] parts = ip.split("\\.", -1);
        if (parts.length != 4) {
            return false;
        }
        for (String part : parts) {
            if (part.isEmpty() || part.length() > 3) {
                return false;
            }
            for (int i = 0; i < part.length(); i++) {
                if (!Character.isDigit(part.charAt(i))) {
                    return false;
                }
            }
            int num = Integer.parseInt(part);
            if (num < 0 || num > 255) {
                return false;
            }
        }
        return true;
    }

    private static boolean isValidIpv6(String ip) {
        if (ip.indexOf(':') < 0) {
            return false;
        }
        // 仅接受 16 进制字符、冒号与点（IPv4-mapped），避免放行任意字符串
        for (int i = 0; i < ip.length(); i++) {
            char c = ip.charAt(i);
            boolean hex = (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
            if (!hex && c != ':' && c != '.') {
                return false;
            }
        }
        return true;
    }
}
