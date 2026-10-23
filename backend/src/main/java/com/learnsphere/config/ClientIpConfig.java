package com.learnsphere.config;

import com.learnsphere.utils.ClientIpResolver;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * 客户端 IP 解析配置。
 *
 * ============================================================================
 * 安全修复（2026-03）配套配置
 * ----------------------------------------------------------------------------
 * 用于告知应用「当前服务前面有几层可信代理」，这是安全解析客户端 IP 的前提：
 *
 *   - trusted-proxy-count = 0（默认）：完全不信任 X-Forwarded-For 等转发头，
 *     客户端 IP 一律取 TCP 对端地址。此设置下 IP 无法被伪造，但当服务位于
 *     Nginx / 网关之后时，所有请求会呈现为代理机 IP —— 这是安全侧的降级，
 *     限流会误伤（把所有用户视为同一 IP），需要按部署拓扑正确配置。
 *
 *   - trusted-proxy-count = N：信任最后 N 层代理写入的 X-Forwarded-For 记录，
 *     从代理链右侧按跳数取值。例如：
 *         客户端 -> Nginx -> 应用                  => N = 1
 *         客户端 -> CDN -> Nginx -> 应用           => N = 2
 *
 * 配置方式（application.yml 或环境变量）：
 *     app.security.trusted-proxy-count: 1
 *     TRUSTED_PROXY_COUNT=1
 *
 * ⚠️ 切勿为了「拿到真实 IP」而盲目调大该值：把不可信的跳数计入后，
 *    客户端即可通过自造 X-Forwarded-For 前缀重新获得伪造能力。
 * ============================================================================
 */
@Slf4j
@Configuration
public class ClientIpConfig {

    @Value("${app.security.trusted-proxy-count:0}")
    private int trustedProxyCount;

    @PostConstruct
    public void init() {
        ClientIpResolver.setTrustedProxyCount(trustedProxyCount);
        if (trustedProxyCount <= 0) {
            log.info("客户端 IP 解析：未配置可信代理，忽略所有转发头，仅使用 TCP 对端地址");
        } else {
            log.info("客户端 IP 解析：信任最后 {} 层代理写入的 X-Forwarded-For", trustedProxyCount);
        }
    }
}
