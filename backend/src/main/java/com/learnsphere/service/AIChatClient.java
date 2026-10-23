package com.learnsphere.service;

import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.DashScopeResult;
import com.alibaba.dashscope.common.Message;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

/** OpenAI-compatible chat transport, keeping existing result consumers unchanged. */
@Component
public class AIChatClient {
    private final AIProviderConfigService config;
    private final ObjectMapper mapper;
    private final HttpClient http;

    @Autowired
    public AIChatClient(AIProviderConfigService config, ObjectMapper mapper) {
        this(config, mapper, HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build());
    }

    AIChatClient(AIProviderConfigService config, ObjectMapper mapper, HttpClient http) {
        this.config = config;
        this.mapper = mapper;
        this.http = http;
    }

    public GenerationResult chat(String model, List<Message> messages) throws Exception {
        return chat(model, messages, null, null);
    }

    public GenerationResult chat(String model, List<Message> messages, Float temperature, Double topP) throws Exception {
        var settings = config.resolve();
        if (settings.apiKey() == null || settings.apiKey().isBlank()) throw new IllegalStateException("请先配置 AI API Key");
        String effectiveModel = model == null || model.isBlank() ? settings.model() : model;
        String url = settings.apiUrl().endsWith("/chat/completions")
                ? settings.apiUrl() : settings.apiUrl() + "/chat/completions";
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", effectiveModel);
        body.put("messages", messages.stream().map(message -> Map.of("role", message.getRole(),
                "content", message.getContent() == null ? "" : message.getContent())).toList());
        body.put("stream", false);
        if (temperature != null) body.put("temperature", temperature);
        if (topP != null) body.put("top_p", topP);
        if (effectiveModel.toLowerCase(java.util.Locale.ROOT).startsWith("qwen3")) body.put("enable_thinking", false);
        HttpRequest request;
        try {
            request = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(120))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + settings.apiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body))).build();
        } catch (IllegalArgumentException invalid) {
            throw new IllegalStateException("AI URL 或密钥格式不正确");
        }
        HttpResponse<String> response;
        try {
            response = http.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("AI 请求已中断");
        } catch (java.io.IOException unavailable) {
            throw new IllegalStateException("无法连接 AI 接口，请检查 API URL 和网络");
        }
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            // Provider error bodies can echo credentials; never log or return them.
            throw new IllegalStateException("AI 接口请求失败（HTTP " + response.statusCode() + "）");
        }
        try {
            var payload = mapper.readTree(response.body());
            var choices = payload.path("choices");
            if (!choices.isArray() || choices.isEmpty()) throw new IllegalStateException("AI 接口没有返回有效回复");
            var content = choices.get(0).path("message").path("content");
            String text = content.isTextual() ? content.asText() : "";
            if (content.isArray()) {
                StringBuilder builder = new StringBuilder();
                content.forEach(part -> builder.append(part.path("text").asText("")));
                text = builder.toString();
            }
            if (text.isBlank()) throw new IllegalStateException("AI 接口返回的回复为空");
            var output = mapper.createObjectNode();
            output.putArray("choices").addObject().putObject("message").put("role", "assistant").put("content", text);
            var usage = payload.path("usage");
            var translatedUsage = mapper.createObjectNode();
            translatedUsage.put("input_tokens", usage.path("prompt_tokens").asInt(0));
            translatedUsage.put("output_tokens", usage.path("completion_tokens").asInt(0));
            translatedUsage.put("total_tokens", usage.path("total_tokens").asInt(
                    usage.path("prompt_tokens").asInt(0) + usage.path("completion_tokens").asInt(0)));
            DashScopeResult bridge = new DashScopeResult();
            bridge.setRequestId(payload.path("id").asText(""));
            bridge.setOutput(JsonParser.parseString(output.toString()));
            bridge.setUsage(JsonParser.parseString(translatedUsage.toString()));
            return GenerationResult.fromDashScopeResult(bridge);
        } catch (com.fasterxml.jackson.core.JsonProcessingException malformed) {
            throw new IllegalStateException("AI 接口响应不是有效的兼容格式");
        }
    }
}
