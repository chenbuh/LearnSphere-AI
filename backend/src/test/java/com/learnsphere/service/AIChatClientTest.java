package com.learnsphere.service;

import com.alibaba.dashscope.common.Message;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.Flow;
import java.io.ByteArrayOutputStream;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AIChatClientTest {
    @Test
    void usesConfiguredEndpointKeyModelAndReadsCompatibleResponseAndUsage() throws Exception {
        AIProviderConfigService config = mock(AIProviderConfigService.class);
        when(config.resolve()).thenReturn(new AIProviderConfigService.ResolvedConfig(
                "https://gateway.example.test/v1", "sk-test-secret", "custom-model"));
        HttpClient http = mock(HttpClient.class);
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(200);
        when(response.body()).thenReturn("""
                {"id":"request-1","choices":[{"message":{"role":"assistant","content":"hello"}}],
                "usage":{"prompt_tokens":12,"completion_tokens":8,"total_tokens":20}}
                """);
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenAnswer(call -> {
            HttpRequest request = call.getArgument(0);
            assertThat(request.uri().toString()).isEqualTo("https://gateway.example.test/v1/chat/completions");
            assertThat(request.headers().firstValue("Authorization")).contains("Bearer sk-test-secret");
            var body = new ObjectMapper().readTree(readBody(request));
            assertThat(body.path("model").asText()).isEqualTo("custom-model");
            assertThat(body.path("messages").get(0).path("content").asText()).isEqualTo("test question");
            return response;
        });
        var result = new AIChatClient(config, new ObjectMapper(), http).chat(null,
                List.of(Message.builder().role("user").content("test question").build()));
        assertThat(result.getOutput().getChoices().get(0).getMessage().getContent()).isEqualTo("hello");
        assertThat(result.getUsage().getInputTokens()).isEqualTo(12);
        assertThat(result.getUsage().getOutputTokens()).isEqualTo(8);
        assertThat(result.getUsage().getTotalTokens()).isEqualTo(20);
    }

    @Test
    void fullCompletionUrlIsNotAppendedAgainAndErrorsNeverEchoProviderBody() throws Exception {
        AIProviderConfigService config = mock(AIProviderConfigService.class);
        when(config.resolve()).thenReturn(new AIProviderConfigService.ResolvedConfig(
                "https://gateway.example.test/v1/chat/completions", "sk-test-secret", "custom-model"));
        HttpClient http = mock(HttpClient.class);
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(401);
        when(response.body()).thenReturn("Invalid key sk-test-secret");
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenAnswer(call -> {
            assertThat(((HttpRequest) call.getArgument(0)).uri().toString())
                    .isEqualTo("https://gateway.example.test/v1/chat/completions");
            return response;
        });
        assertThatThrownBy(() -> new AIChatClient(config, new ObjectMapper(), http).chat(null, List.of()))
                .hasMessageContaining("401").hasMessageNotContaining("sk-test-secret");
    }

    private static String readBody(HttpRequest request) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        request.bodyPublisher().orElseThrow().subscribe(new Flow.Subscriber<ByteBuffer>() {
            public void onSubscribe(Flow.Subscription subscription) { subscription.request(Long.MAX_VALUE); }
            public void onNext(ByteBuffer buffer) { while (buffer.hasRemaining()) bytes.write(buffer.get()); }
            public void onError(Throwable error) { throw new RuntimeException(error); }
            public void onComplete() { }
        });
        return bytes.toString(StandardCharsets.UTF_8);
    }

    // ---------- 推理强度：厂商参数映射 ----------

    /** 构造一个只回 200 的最小响应，用于让请求真正发出去以便检查请求体。 */
    private static HttpResponse<String> okResponse() {
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(200);
        when(response.body()).thenReturn("{\"choices\":[{\"message\":{\"content\":\"ok\"}}]}");
        return response;
    }

    /** 发一次请求，返回实际发出的 JSON 请求体。 */
    private static com.fasterxml.jackson.databind.JsonNode captureBody(
            String model, String effort) throws Exception {
        AIProviderConfigService config = mock(AIProviderConfigService.class);
        when(config.resolve()).thenReturn(new AIProviderConfigService.ResolvedConfig(
                "https://gateway.example.test/v1", "sk-test", model, effort));
        HttpClient http = mock(HttpClient.class);
        var captured = new java.util.concurrent.atomic.AtomicReference<String>();
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenAnswer(call -> {
            captured.set(readBody(call.getArgument(0)));
            return okResponse();
        });
        new AIChatClient(config, new ObjectMapper(), http).chat(null,
                List.of(Message.builder().role("user").content("q").build()));
        return new ObjectMapper().readTree(captured.get());
    }

    @Test
    void dashScopeThinkingModelGetsEnableThinkingAndBudgetForEachLevel() throws Exception {
        var low = captureBody("qwen3-max", "low");
        assertThat(low.path("enable_thinking").asBoolean()).isTrue();
        assertThat(low.path("thinking_budget").asInt()).isEqualTo(1024);

        var medium = captureBody("qwen3-max", "medium");
        assertThat(medium.path("enable_thinking").asBoolean()).isTrue();
        assertThat(medium.path("thinking_budget").asInt()).isEqualTo(4096);

        var high = captureBody("qwen3-max", "high");
        assertThat(high.path("enable_thinking").asBoolean()).isTrue();
        assertThat(high.path("thinking_budget").asInt()).isEqualTo(16384);
    }

    @Test
    void offDisablesThinkingExplicitlyForQwen3BecauseItDefaultsToOn() throws Exception {
        var body = captureBody("qwen3-max", "off");
        assertThat(body.path("enable_thinking").asBoolean()).isFalse();
        // off 不应带预算字段，否则语义矛盾
        assertThat(body.has("thinking_budget")).isFalse();
    }

    @Test
    void openAiReasoningModelsUseReasoningEffortString() throws Exception {
        var high = captureBody("o3-mini", "high");
        assertThat(high.path("reasoning_effort").asText()).isEqualTo("high");
        assertThat(high.has("enable_thinking")).isFalse();
        assertThat(high.has("thinking_budget")).isFalse();

        var low = captureBody("gpt-5", "low");
        assertThat(low.path("reasoning_effort").asText()).isEqualTo("low");
    }

    @Test
    void offOmitsReasoningEffortForOpenAiBecauseThereIsNoOffValue() throws Exception {
        var body = captureBody("o3-mini", "off");
        assertThat(body.has("reasoning_effort")).isFalse();
    }

    @Test
    void nonThinkingModelsGetNoReasoningParametersAtAll() throws Exception {
        // 给不支持的模型硬塞参数会被厂商忽略或直接 400，所以必须一个都不发
        for (String model : List.of("qwen-turbo", "gpt-4o", "deepseek-chat")) {
            var body = captureBody(model, "high");
            assertThat(body.has("enable_thinking"))
                    .as("%s 不应收到 enable_thinking", model).isFalse();
            assertThat(body.has("thinking_budget"))
                    .as("%s 不应收到 thinking_budget", model).isFalse();
            assertThat(body.has("reasoning_effort"))
                    .as("%s 不应收到 reasoning_effort", model).isFalse();
        }
    }

    @Test
    void unknownEffortLevelIsTreatedAsOffRatherThanSentToProvider() throws Exception {
        var body = captureBody("qwen3-max", "turbo");
        assertThat(body.path("enable_thinking").asBoolean()).isFalse();
        assertThat(body.path("reasoning_effort").asText()).isEmpty();
    }

    @Test
    void thinkingModelDetectionIsCaseInsensitive() throws Exception {
        assertThat(captureBody("Qwen3-Max", "low").path("enable_thinking").asBoolean()).isTrue();
        assertThat(captureBody("Qwen-Plus-Thinking", "low").path("enable_thinking").asBoolean()).isTrue();
    }
}
