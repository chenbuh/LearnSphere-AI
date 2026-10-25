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
        applyReasoningEffort(body, effectiveModel, settings.reasoningEffort());
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

    /**
     * 按模型名把统一的推理强度档位翻译成对应厂商的请求参数。
     *
     * <p>为什么要按模型名分派：不同厂商的参数名和语义都不一样，把 A 家的字段
     * 发给 B 家，轻则被忽略、重则直接 400。所以这里只对「认识的模型」下发参数，
     * 不认识的模型一律不下发——保持原行为，不引入新的失败可能。
     *
     * <ul>
     *   <li><b>qwen3 / qwen-plus-thinking 等 DashScope 思考模型</b>：
     *       {@code enable_thinking} 布尔开关，{@code thinking_budget} 控制思考 token 上限。</li>
     *   <li><b>DeepSeek</b>：{@code reasoning_effort} 取 none / low / high / max
     *       （<b>没有 medium</b>，中档映射为 high）。</li>
     *   <li><b>o 系列 / gpt-5 系列</b>：{@code reasoning_effort} 字符串，
     *       官方取值为 low / medium / high。</li>
     *   <li><b>其它模型</b>（qwen-turbo、gpt-4o 等）：不下发任何参数。
     *       这些模型本身不支持思考，传了反而可能报错。</li>
     * </ul>
     *
     * <p>注意 off 档位的处理：qwen3 系列与 DeepSeek 默认都是开启思考的，所以 off
     * 必须显式下发关闭信号才能真的关掉；而 OpenAI 侧没有「关闭」取值，off 时不传字段。
     */
    private void applyReasoningEffort(Map<String, Object> body, String model, String effort) {
        String level = AIProviderConfigService.normalizeEffort(effort);
        String name = model == null ? "" : model.toLowerCase(java.util.Locale.ROOT);

        if (isDashScopeThinkingModel(name)) {
            boolean thinking = !AIProviderConfigService.EFFORT_OFF.equals(level);
            body.put("enable_thinking", thinking);
            if (thinking) {
                Integer budget = dashScopeBudget(level);
                if (budget != null) body.put("thinking_budget", budget);
            }
            return;
        }

        if (isDeepSeekModel(name)) {
            applyDeepSeekEffort(body, level);
            return;
        }

        if (isOpenAiReasoningModel(name)) {
            // OpenAI 没有「关闭」档位，off 时不传该字段，走模型默认行为
            if (!AIProviderConfigService.EFFORT_OFF.equals(level)) {
                body.put("reasoning_effort", level);
            }
        }
    }

    /**
     * DeepSeek 的推理强度映射。
     *
     * <p>DeepSeek 的 {@code reasoning_effort} 只接受 none / low / high / max，
     * <b>没有 medium</b>。官方说明里 medium 会被静默映射为 high，但我们不依赖这个
     * 兼容行为——显式映射，避免将来兼容层变化时行为漂移。
     *
     * <p>关闭思考有两种写法：{@code thinking.type=disabled} 或 {@code reasoning_effort=none}。
     * 这里同时下发两者，因为 DeepSeek 文档明确 none 等价于关闭思考，
     * 而 thinking 对象是更结构化的表达，两者并存不冲突。
     */
    private void applyDeepSeekEffort(Map<String, Object> body, String level) {
        if (AIProviderConfigService.EFFORT_OFF.equals(level)) {
            body.put("thinking", Map.of("type", "disabled"));
            body.put("reasoning_effort", "none");
            return;
        }
        body.put("thinking", Map.of("type", "enabled"));
        // medium 在 DeepSeek 侧没有对应取值，向上取到 high
        String mapped = switch (level) {
            case AIProviderConfigService.EFFORT_LOW -> "low";
            case AIProviderConfigService.EFFORT_HIGH -> "high";
            default -> "high";
        };
        body.put("reasoning_effort", mapped);
    }

    /** DeepSeek 模型。用前缀匹配覆盖 deepseek-chat / deepseek-reasoner / deepseek-flash 等。 */
    private static boolean isDeepSeekModel(String name) {
        return name.startsWith("deepseek");
    }

    /** DashScope 侧支持思考开关的模型。用前缀/包含匹配覆盖 qwen3 全系及 plus-thinking 变体。 */
    private static boolean isDashScopeThinkingModel(String name) {
        return name.startsWith("qwen3") || name.contains("-thinking");
    }

    /** OpenAI 侧支持 reasoning_effort 的模型。 */
    private static boolean isOpenAiReasoningModel(String name) {
        return name.startsWith("o1") || name.startsWith("o3") || name.startsWith("o4")
                || name.startsWith("gpt-5");
    }

    /**
     * 档位到思考 token 预算的映射。
     *
     * <p>取值的考量：low 只给够做简单推理的量，避免小问题也长篇思考拖慢响应；
     * high 给到接近常见上限，用于作文批改、口语评估这类需要细想的场景。
     * 不设「无限」——没有上限时模型可能思考很久，前端会等到超时。
     */
    private static Integer dashScopeBudget(String level) {
        return switch (level) {
            case AIProviderConfigService.EFFORT_LOW -> 1024;
            case AIProviderConfigService.EFFORT_MEDIUM -> 4096;
            case AIProviderConfigService.EFFORT_HIGH -> 16384;
            default -> null;
        };
    }
}
