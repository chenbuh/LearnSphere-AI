package com.learnsphere.controller;

import com.learnsphere.controller.admin.AdminAIController;
import com.learnsphere.service.AIProviderConfigService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdminAIConfigControllerTest {
    private AIProviderConfigService config;
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        config = mock(AIProviderConfigService.class);
        AdminAIController controller = new AdminAIController();
        ReflectionTestUtils.setField(controller, "providerConfigService", config);
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void configurationReadReturnsConnectionMetadataWithoutKey() throws Exception {
        when(config.adminView()).thenReturn(Map.of("apiUrl", "https://gateway.example.test/v1",
                "activeModel", "custom-model", "apiKeyConfigured", true));
        mvc.perform(get("/api/admin/ai/config")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.activeModel").value("custom-model"))
                .andExpect(jsonPath("$.data.apiKeyConfigured").value(true))
                .andExpect(jsonPath("$.data.apiKey").doesNotExist());
    }

    @Test
    void saveAndResetUseTheSharedProviderConfiguration() throws Exception {
        mvc.perform(post("/api/admin/ai/config").contentType("application/json")
                .content("{\"apiUrl\":\"https://gateway.example.test/v1\",\"apiKey\":\"sk-test\",\"model\":\"custom-model\"}"))
                .andExpect(jsonPath("$.code").value(200));
        // reasoningEffort 未传时为 null，表示「本次不修改该字段」
        verify(config).update("https://gateway.example.test/v1", "sk-test", "custom-model", null);
        mvc.perform(post("/api/admin/ai/config").contentType("application/json").content("{\"reset\":true}"))
                .andExpect(jsonPath("$.code").value(200));
        verify(config).reset();
    }

    @Test
    void reasoningEffortIsForwardedToTheProviderConfiguration() throws Exception {
        mvc.perform(post("/api/admin/ai/config").contentType("application/json")
                .content("{\"apiUrl\":\"https://gateway.example.test/v1\",\"apiKey\":\"sk-test\","
                        + "\"model\":\"qwen3-max\",\"reasoningEffort\":\"high\"}"))
                .andExpect(jsonPath("$.code").value(200));
        verify(config).update("https://gateway.example.test/v1", "sk-test", "qwen3-max", "high");
    }

    @Test
    void invalidFieldTypeIsRejectedWithoutSaving() throws Exception {
        mvc.perform(post("/api/admin/ai/config").contentType("application/json").content("{\"model\":42}"))
                .andExpect(jsonPath("$.message").value("AI 配置字段格式不正确"));
        verifyNoInteractions(config);
    }
}
