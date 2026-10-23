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
}
