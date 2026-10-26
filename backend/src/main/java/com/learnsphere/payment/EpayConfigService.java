package com.learnsphere.payment;

import com.learnsphere.service.ISystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 易支付运行时配置解析。
 *
 * <p>配置来源有两层，优先级从高到低：
 * <ol>
 *   <li>数据库 {@code system_config} 表（后台「系统设置 → 易支付」可视化配置）；</li>
 *   <li>配置文件 {@code application-secret.properties}（部署时写入，作为兜底默认值）。</li>
 * </ol>
 *
 * <p>这样后台改完配置即时生效，不必改配置文件再重启服务；
 * 而数据库里没有记录时（比如刚部署、还没进后台配置）仍能沿用配置文件的值。
 *
 * <p>商户密钥属于敏感信息，写入数据库时用 Jasypt 加密，
 * 读取时解密；接口返回给前端时一律脱敏，只回传「是否已配置」。
 */
@Slf4j
@Service
public class EpayConfigService {

    /** 数据库配置键前缀 */
    private static final String PREFIX = "epay.";

    public static final String KEY_ENABLED = PREFIX + "enabled";
    public static final String KEY_API_URL = PREFIX + "apiUrl";
    public static final String KEY_PID = PREFIX + "pid";
    public static final String KEY_KEY = PREFIX + "key";
    public static final String KEY_NOTIFY_URL = PREFIX + "notifyUrl";
    public static final String KEY_RETURN_URL = PREFIX + "returnUrl";
    public static final String KEY_SITENAME = PREFIX + "sitename";
    public static final String KEY_UNIFIED_ORDER_PATH = PREFIX + "unifiedOrderPath";
    public static final String KEY_QUERY_PATH = PREFIX + "queryPath";

    private final ISystemConfigService store;
    private final StringEncryptor encryptor;
    private final EpayProperties defaults;

    public EpayConfigService(ISystemConfigService store,
            @Qualifier("lazyJasyptStringEncryptor") StringEncryptor encryptor,
            EpayProperties defaults) {
        this.store = store;
        this.encryptor = encryptor;
        this.defaults = defaults;
    }

    /**
     * 解析出当前生效的易支付配置。
     *
     * <p>每次调用都读数据库（{@code system_config} 有索引且行数很少），
     * 保证后台改完立刻生效，不引入缓存一致性问题。
     */
    public ResolvedConfig resolve() {
        boolean enabled = readBoolean(KEY_ENABLED, defaults.isEnabled());
        String apiUrl = readString(KEY_API_URL, defaults.getApiUrl());
        String pid = readString(KEY_PID, defaults.getPid());
        String key = readSecret(KEY_KEY, defaults.getKey());
        String notifyUrl = readString(KEY_NOTIFY_URL, defaults.getNotifyUrl());
        String returnUrl = readString(KEY_RETURN_URL, defaults.getReturnUrl());
        String sitename = readString(KEY_SITENAME, defaults.getSitename());
        String unifiedOrderPath = readString(KEY_UNIFIED_ORDER_PATH, defaults.getUnifiedOrderPath());
        String queryPath = readString(KEY_QUERY_PATH, defaults.getQueryPath());

        return new ResolvedConfig(enabled, apiUrl, pid, key, notifyUrl, returnUrl,
                sitename, unifiedOrderPath, queryPath);
    }

    /**
     * 后台读取配置：密钥不回传明文，只告知是否已配置。
     */
    public Map<String, Object> describeForAdmin() {
        ResolvedConfig cfg = resolve();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enabled", cfg.enabled());
        data.put("apiUrl", nullToEmpty(cfg.apiUrl()));
        data.put("pid", nullToEmpty(cfg.pid()));
        data.put("notifyUrl", nullToEmpty(cfg.notifyUrl()));
        data.put("returnUrl", nullToEmpty(cfg.returnUrl()));
        data.put("sitename", nullToEmpty(cfg.sitename()));
        data.put("unifiedOrderPath", nullToEmpty(cfg.unifiedOrderPath()));
        data.put("queryPath", nullToEmpty(cfg.queryPath()));
        // 密钥只回传是否已设置，避免明文出现在响应体与浏览器网络面板里
        data.put("keyConfigured", cfg.key() != null && !cfg.key().isBlank());
        data.put("ready", cfg.isReady());
        data.put("missing", cfg.missingFields());
        return data;
    }

    /**
     * 保存配置。密钥为空表示「不修改」，避免后台表单留空时把已存密钥清掉。
     */
    public void save(Map<String, String> form) {
        if (form.containsKey("enabled")) {
            store.setConfigValue(KEY_ENABLED, Boolean.toString(parseBoolean(form.get("enabled"), false)));
        }
        putIfPresent(form, "apiUrl", KEY_API_URL);
        putIfPresent(form, "pid", KEY_PID);
        putIfPresent(form, "notifyUrl", KEY_NOTIFY_URL);
        putIfPresent(form, "returnUrl", KEY_RETURN_URL);
        putIfPresent(form, "sitename", KEY_SITENAME);
        putIfPresent(form, "unifiedOrderPath", KEY_UNIFIED_ORDER_PATH);
        putIfPresent(form, "queryPath", KEY_QUERY_PATH);

        String key = form.get("key");
        if (key != null && !key.isBlank()) {
            store.setConfigValue(KEY_KEY, encryptSecret(key.trim()));
        }
        log.info("易支付配置已更新（密钥{}）", key == null || key.isBlank() ? "未变更" : "已重新设置");
    }

    private void putIfPresent(Map<String, String> form, String formKey, String configKey) {
        if (!form.containsKey(formKey)) {
            return;
        }
        String value = form.get(formKey);
        store.setConfigValue(configKey, value == null ? "" : value.trim());
    }

    // ==================== 读值辅助 ====================

    private String readString(String key, String fallback) {
        String value = store.getConfigValue(key, null);
        // 数据库里存空串表示「显式清空」，此时不回退到配置文件，避免清不干净
        if (value == null) {
            return fallback;
        }
        return value.trim();
    }

    private boolean readBoolean(String key, boolean fallback) {
        String value = store.getConfigValue(key, null);
        if (value == null) {
            return fallback;
        }
        return parseBoolean(value, fallback);
    }

    private static boolean parseBoolean(String value, boolean fallback) {
        if (value == null) {
            return fallback;
        }
        String v = value.trim().toLowerCase();
        if ("true".equals(v) || "1".equals(v) || "yes".equals(v)) {
            return true;
        }
        if ("false".equals(v) || "0".equals(v) || "no".equals(v)) {
            return false;
        }
        return fallback;
    }

    /**
     * 读取并解密密钥。历史数据可能是明文（直接写库），解密失败时按明文使用。
     */
    private String readSecret(String key, String fallback) {
        String value = store.getConfigValue(key, null);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String trimmed = value.trim();
        try {
            return encryptor.decrypt(trimmed);
        } catch (Exception e) {
            // 不是密文（历史明文数据或配置文件来源），按原值使用
            return trimmed;
        }
    }

    private String encryptSecret(String plain) {
        try {
            return encryptor.encrypt(plain);
        } catch (Exception e) {
            log.warn("易支付密钥加密失败，将以明文写入数据库: {}", e.getMessage());
            return plain;
        }
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }

    /**
     * 已解析的易支付配置快照。
     */
    public record ResolvedConfig(boolean enabled, String apiUrl, String pid, String key,
            String notifyUrl, String returnUrl, String sitename,
            String unifiedOrderPath, String queryPath) {

        /** 配置是否完整可用（缺任何一项都不能下单） */
        public boolean isReady() {
            return enabled && notBlank(apiUrl) && notBlank(pid) && notBlank(key)
                    && notBlank(notifyUrl) && notBlank(returnUrl);
        }

        /** 列出缺失的必填项，供后台提示用户还差什么 */
        public java.util.List<String> missingFields() {
            java.util.List<String> missing = new java.util.ArrayList<>();
            if (!enabled) {
                missing.add("未启用在线支付");
            }
            if (!notBlank(apiUrl)) {
                missing.add("网关地址");
            }
            if (!notBlank(pid)) {
                missing.add("商户 ID");
            }
            if (!notBlank(key)) {
                missing.add("商户密钥");
            }
            if (!notBlank(notifyUrl)) {
                missing.add("异步通知地址");
            }
            if (!notBlank(returnUrl)) {
                missing.add("同步跳转地址");
            }
            return missing;
        }

        private static boolean notBlank(String s) {
            return s != null && !s.isBlank();
        }
    }
}
