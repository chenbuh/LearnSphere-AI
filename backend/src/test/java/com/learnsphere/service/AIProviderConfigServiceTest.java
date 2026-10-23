package com.learnsphere.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.jasypt.encryption.StringEncryptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AIProviderConfigServiceTest {
    private AIProviderConfigService service;
    private final AtomicReference<String> stored = new AtomicReference<>("");
    private StringRedisTemplate redis;

    @BeforeEach
    void setup() {
        ISystemConfigService store = mock(ISystemConfigService.class);
        when(store.getConfigValue(eq(AIProviderConfigService.CONFIG_KEY), anyString())).thenAnswer(call -> stored.get());
        doAnswer(call -> { stored.set(call.getArgument(1)); return null; })
                .when(store).setConfigValue(eq(AIProviderConfigService.CONFIG_KEY), anyString());
        StringEncryptor encryptor = mock(StringEncryptor.class);
        when(encryptor.encrypt("sk-test-secret")).thenReturn("encrypted-test-value");
        when(encryptor.decrypt("encrypted-test-value")).thenReturn("sk-test-secret");
        redis = mock(StringRedisTemplate.class);
        ValueOperations<String, String> values = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        service = new AIProviderConfigService(store, encryptor, redis, new ObjectMapper());
        ReflectionTestUtils.setField(service, "defaultApiUrl", "https://dashscope.aliyuncs.com/compatible-mode/v1");
        ReflectionTestUtils.setField(service, "defaultApiKey", "deployment-key");
        ReflectionTestUtils.setField(service, "defaultModel", "qwen-turbo");
    }

    @Test
    void savesEncryptedKeyAndMakesUrlAndModelAvailableWithoutExposingTheKey() {
        service.update("https://gateway.example.test/v1/", "sk-test-secret", "custom-model");
        assertThat(stored.get()).contains("encrypted-test-value").doesNotContain("sk-test-secret");
        var resolved = service.resolve();
        assertThat(resolved.apiUrl()).isEqualTo("https://gateway.example.test/v1");
        assertThat(resolved.model()).isEqualTo("custom-model");
        assertThat(resolved.apiKey()).isEqualTo("sk-test-secret");
        assertThat(service.adminView()).containsEntry("apiKeyConfigured", true);
        assertThat(service.adminView().toString()).doesNotContain("sk-test-secret", "deployment-key", "encrypted-test-value");
        assertThat(resolved.toString()).doesNotContain("sk-test-secret");
    }

    @Test
    void blankKeyRetainsSavedKeyAndModelOnlyUpdatesRetainTheProvider() {
        service.update("https://gateway.example.test/v1", "sk-test-secret", "first-model");
        service.update(null, "", "second-model");
        assertThat(service.resolve().apiKey()).isEqualTo("sk-test-secret");
        assertThat(service.resolve().apiUrl()).isEqualTo("https://gateway.example.test/v1");
        assertThat(service.resolve().model()).isEqualTo("second-model");
    }

    @Test
    void resetRestoresDeploymentSettingsAndClearsLegacyOverrides() {
        service.update("https://gateway.example.test/v1", "sk-test-secret", "custom-model");
        service.reset();
        assertThat(service.resolve().apiKey()).isEqualTo("deployment-key");
        assertThat(service.resolve().model()).isEqualTo("qwen-turbo");
        assertThat(service.adminView()).containsEntry("isOverridden", false);
        verify(redis, atLeastOnce()).delete("config:ai:model_override");
        verify(redis, atLeastOnce()).delete("config:ai:tutor:model_override");
    }

    @Test
    void invalidUrlIsRejectedBeforeChangingSavedSettings() {
        service.update("https://gateway.example.test/v1", "sk-test-secret", "first-model");
        String before = stored.get();
        assertThatThrownBy(() -> service.update("file:///secret", "", "new-model"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(stored.get()).isEqualTo(before);
        assertThatThrownBy(() -> service.update("https://user:password@example.test/v1", "", "new-model"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void firstConfigurationRequiresAKeyAndRejectsControlCharacters() {
        ReflectionTestUtils.setField(service, "defaultApiKey", "");
        assertThatThrownBy(() -> service.update("https://gateway.example.test/v1", "", "model"))
                .hasMessageContaining("API Key");
        assertThat(stored.get()).isEmpty();
        assertThatThrownBy(() -> service.update("https://gateway.example.test/v1", "sk-test\nother\nvalue", "model"))
                .hasMessage("API Key 格式不正确");
        assertThat(stored.get()).isEmpty();
    }

    @Test
    void metadataRemainsReadableSoAnUnreadableOldKeyCanBeReplaced() {
        stored.set("{\"apiUrl\":\"https://gateway.example.test/v1\",\"model\":\"custom-model\",\"encryptedApiKey\":\"old-cipher\"}");
        StringEncryptor encryptor = (StringEncryptor) ReflectionTestUtils.getField(service, "encryptor");
        when(encryptor.decrypt("old-cipher")).thenThrow(new IllegalStateException("old encryption settings"));
        assertThat(service.adminView()).containsEntry("activeModel", "custom-model").containsEntry("apiKeyConfigured", true);
        service.update(null, "sk-test-secret", null);
        assertThat(service.resolve().apiKey()).isEqualTo("sk-test-secret");
    }

    @Test
    void cacheIdentityChangesWhenConnectionSettingsChange() {
        String before = service.cacheIdentity();
        service.update("https://gateway.example.test/v1", "sk-test-secret", "qwen-turbo");
        assertThat(service.cacheIdentity()).isNotEqualTo(before).doesNotContain("sk-test-secret");
    }
}
