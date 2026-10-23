package com.learnsphere.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.jasypt.encryption.StringEncryptor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;

/** Persistent connection settings shared by text-generation features. */
@Service
public class AIProviderConfigService {
    public static final String CONFIG_KEY = "internal.ai.provider";
    private final ISystemConfigService store;
    private final StringEncryptor encryptor;
    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;

    @Value("${ai.api-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String defaultApiUrl;
    @Value("${ai.api-key:}")
    private String defaultApiKey;
    @Value("${ai.model:qwen-turbo}")
    private String defaultModel;

    public AIProviderConfigService(ISystemConfigService store,
            @Qualifier("lazyJasyptStringEncryptor") StringEncryptor encryptor,
            StringRedisTemplate redis, ObjectMapper mapper) {
        this.store = store;
        this.encryptor = encryptor;
        this.redis = redis;
        this.mapper = mapper;
    }

    public record ResolvedConfig(String apiUrl, String apiKey, String model) {
        @Override
        public String toString() {
            return "AIProviderConfig[apiUrl=" + apiUrl + ", model=" + model + ", keyConfigured="
                    + (apiKey != null && !apiKey.isBlank()) + "]";
        }
    }

    public ResolvedConfig resolve() {
        ObjectNode saved = readSaved();
        String key = defaultApiKey;
        if (saved.hasNonNull("encryptedApiKey")) {
            try {
                key = encryptor.decrypt(saved.path("encryptedApiKey").asText());
            } catch (RuntimeException error) {
                throw new IllegalStateException("AI 密钥解密失败，请检查部署加密设置");
            }
        }
        return new ResolvedConfig(normalizeApiUrl(saved.path("apiUrl").asText(defaultApiUrl)), key, modelFor(saved));
    }

    public boolean hasApiKey() {
        String key = resolve().apiKey();
        return key != null && !key.isBlank();
    }

    public Map<String, Object> adminView() {
        ObjectNode saved = readSaved();
        Map<String, Object> result = new LinkedHashMap<>();
        // Reading metadata must still work if an older key cannot be decrypted,
        // so an administrator can replace it or restore deployment defaults.
        result.put("apiUrl", normalizeApiUrl(saved.path("apiUrl").asText(defaultApiUrl)));
        result.put("activeModel", modelFor(saved));
        result.put("apiKeyConfigured", saved.hasNonNull("encryptedApiKey")
                || (defaultApiKey != null && !defaultApiKey.isBlank()));
        result.put("apiKeySource", saved.hasNonNull("encryptedApiKey") ? "saved" : "deployment");
        result.put("isOverridden", !saved.isEmpty() || legacyModel() != null);
        return result;
    }

    @Transactional
    public void update(String apiUrl, String apiKey, String model) {
        ObjectNode next = readSaved().deepCopy();
        if (apiUrl != null) next.put("apiUrl", normalizeApiUrl(apiUrl));
        if (model != null) {
            String value = model.trim();
            if (value.isEmpty() || value.length() > 200 || value.chars().anyMatch(Character::isISOControl)) {
                throw new IllegalArgumentException("请输入有效的模型 ID");
            }
            if ("default".equals(value)) next.remove("model");
            else next.put("model", value);
        }
        if (apiKey != null && !apiKey.isBlank()) {
            String key = apiKey.trim();
            if (key.length() > 4096 || key.chars().anyMatch(character -> character <= 32 || character > 126)) {
                throw new IllegalArgumentException("API Key 格式不正确");
            }
            next.put("encryptedApiKey", encryptor.encrypt(key));
        }
        if (!next.hasNonNull("encryptedApiKey") && (defaultApiKey == null || defaultApiKey.isBlank())) {
            throw new IllegalArgumentException("请填写 API Key");
        }
        store.setConfigValue(CONFIG_KEY, next.toString());
        clearLegacyOverrides();
    }

    @Transactional
    public void reset() {
        store.setConfigValue(CONFIG_KEY, "");
        clearLegacyOverrides();
    }

    public boolean isOverridden() {
        return !readSaved().isEmpty();
    }

    public String cacheIdentity() {
        ResolvedConfig config = resolve();
        try {
            String identity = config.apiUrl() + "|" + config.model() + "|" + config.apiKey();
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(identity.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 unavailable", impossible);
        }
    }

    public static String normalizeApiUrl(String value) {
        try {
            if (value == null || value.isBlank()) throw new IllegalArgumentException();
            URI uri = URI.create(value.trim());
            if (!("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                    || uri.getHost() == null || uri.getUserInfo() != null || uri.getQuery() != null
                    || uri.getFragment() != null) throw new IllegalArgumentException();
            String normalized = uri.toString().replaceAll("/+$", "");
            if (uri.getPath() == null || uri.getPath().isBlank() || "/".equals(uri.getPath())) normalized += "/v1";
            return normalized;
        } catch (IllegalArgumentException error) {
            throw new IllegalArgumentException("API URL 需为有效的 HTTP/HTTPS 地址，可填写 /v1 或完整 /chat/completions 地址");
        }
    }

    private ObjectNode readSaved() {
        String value = store.getConfigValue(CONFIG_KEY, "");
        if (value == null || value.isBlank()) return mapper.createObjectNode();
        try {
            var parsed = mapper.readTree(value);
            if (parsed instanceof ObjectNode object) return object;
        } catch (Exception ignored) { }
        throw new IllegalStateException("AI 服务配置格式异常");
    }

    private String legacyModel() {
        try {
            String value = redis.opsForValue().get("config:ai:model_override");
            return value == null || value.isBlank() ? null : value;
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private String modelFor(ObjectNode saved) {
        String model = saved.path("model").asText("");
        if (model.isBlank()) model = legacyModel();
        return model == null || model.isBlank() ? defaultModel : model;
    }

    private void clearLegacyOverrides() {
        redis.delete("config:ai:model_override");
        redis.delete("config:ai:tutor:model_override");
    }
}
