package com.learnsphere.payment;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 易支付商户配置，真实值写在 application-secret.properties（已 gitignore）
 */
@Data
@Component
@ConfigurationProperties(prefix = "epay")
public class EpayProperties {
    /** 是否启用在线支付 */
    private boolean enabled = false;
    /** 易支付网关根地址，如 https://pay.example.com/ */
    private String apiUrl;
    /** 统一下单接口路径（POST，返回 payurl / qrcode），可配置以便网关变更 */
    private String unifiedOrderPath = "mapi.php";
    /** 订单查询接口路径（POST 表单） */
    private String queryPath = "api.php";
    /** 商户 ID */
    private String pid;
    /** 商户密钥 */
    private String key;
    /** 异步通知地址（必须公网可访问），如 https://your-domain/api/payment/epay/notify */
    private String notifyUrl;
    /** 支付完成后浏览器跳回的前端地址，如 https://your-domain/payment/result */
    private String returnUrl;
    /** 订单名称前缀 */
    private String sitename = "LearnSphere";

    public boolean isReady() {
        return enabled && notBlank(apiUrl) && notBlank(pid) && notBlank(key)
                && notBlank(notifyUrl) && notBlank(returnUrl);
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
