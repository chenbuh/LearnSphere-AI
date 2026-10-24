package com.learnsphere.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.learnsphere.service.AIProviderConfigService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * {@link SpeakingEvaluationService} 的单元测试。
 *
 * <p>覆盖从 {@code AIGenerationServiceImpl} 抽出的口语评分逻辑：
 * 兜底路径、模型结果归一化、切题度启发式、反馈与建议容错解析。
 *
 * <p>重点保护两类易回归的行为：
 * <ol>
 *   <li>未配置 API Key 或调用异常时必须走兜底，不能让异常抛到控制层；</li>
 *   <li>切题度对总分的压制规则（0 / 25 / 40 / 55 四档），
 *       这是防止模型给明显跑题的回答打高分的关键约束。</li>
 * </ol>
 */
class SpeakingEvaluationServiceTest {

    private SpeakingEvaluationService service;
    private AIProviderConfigService providerConfig;
    private AiModelInvocationService modelInvocationService;
    private AiFallbackContentGenerator fallbackGenerator;

    @BeforeEach
    void setUp() {
        service = new SpeakingEvaluationService();
        providerConfig = mock(AIProviderConfigService.class);
        modelInvocationService = mock(AiModelInvocationService.class);
        fallbackGenerator = mock(AiFallbackContentGenerator.class);

        ReflectionTestUtils.setField(service, "providerConfig", providerConfig);
        ReflectionTestUtils.setField(service, "aiModelInvocationService", modelInvocationService);
        ReflectionTestUtils.setField(service, "aiFallbackContentGenerator", fallbackGenerator);
    }

    @Nested
    @DisplayName("兜底路径")
    class FallbackPaths {

        @Test
        @DisplayName("未配置 API Key 时不调用模型，直接返回兜底结果")
        void returnsFallbackWhenNoApiKey() {
            Map<String, Object> mockResult = Map.of("score", 60, "source", "mock");
            when(providerConfig.hasApiKey()).thenReturn(false);
            when(fallbackGenerator.generateMockSpeakingEvaluation()).thenReturn(mockResult);

            Map<String, Object> result = service.evaluateSpeaking("Topic: environment", "some answer");

            assertThat(result).isEqualTo(mockResult);
            verify(modelInvocationService, never()).callLLM(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("模型调用抛异常时兜底，不向上抛")
        void returnsFallbackWhenModelThrows() {
            Map<String, Object> mockResult = Map.of("score", 55, "source", "mock");
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), eq("EVALUATE_SPEAKING")))
                    .thenThrow(new RuntimeException("模型超时"));
            when(fallbackGenerator.generateMockSpeakingEvaluation()).thenReturn(mockResult);

            Map<String, Object> result = service.evaluateSpeaking("Topic: travel", "I like travel.");

            assertThat(result).isEqualTo(mockResult);
        }

        @Test
        @DisplayName("模型返回无法解析的内容时兜底")
        void returnsFallbackWhenResponseUnparsable() {
            Map<String, Object> mockResult = Map.of("score", 50, "source", "mock");
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString()))
                    .thenReturn("这不是 JSON");
            when(fallbackGenerator.generateMockSpeakingEvaluation()).thenReturn(mockResult);

            Map<String, Object> result = service.evaluateSpeaking("Topic: food", "I eat rice.");

            assertThat(result).isEqualTo(mockResult);
        }
    }

    @Nested
    @DisplayName("正常评分")
    class NormalEvaluation {

        @Test
        @DisplayName("模型给出完整分数时按模型结果返回")
        void usesModelScores() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":88,\"pronunciation\":90,\"fluency\":85,\"grammar\":88,"
                            + "\"vocabulary\":92,\"relevance\":90,"
                            + "\"feedback\":\"表达流畅\",\"suggestions\":[\"保持语速\"]}");

            // 注意：题目与回答必须有足够的实词重叠，否则启发式切题度会判定为跑题，
            // 从而覆盖模型返回的 feedback（这是预期的业务规则，见 completelyOffTopicScoresZero）。
            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your favorite city",
                    "My favorite city is Beijing. Beijing is a beautiful city with long history.");

            assertThat(result.get("pronunciation")).isEqualTo(90);
            assertThat(result.get("fluency")).isEqualTo(85);
            assertThat(result.get("grammar")).isEqualTo(88);
            assertThat(result.get("vocabulary")).isEqualTo(92);
            assertThat(result.get("feedback")).isEqualTo("表达流畅");
            assertThat(result.get("suggestions")).isEqualTo(List.of("保持语速"));
        }

        @Test
        @DisplayName("分数放在 dimensions 子对象里也能取到")
        void readsScoresFromDimensions() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"dimensions\":{\"pronunciation\":70,\"fluency\":72,\"grammar\":74,"
                            + "\"vocabulary\":76,\"relevance\":80}}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe a book you read",
                    "I read a book about history and it was interesting.");

            assertThat(result.get("pronunciation")).isEqualTo(70);
            assertThat(result.get("fluency")).isEqualTo(72);
            assertThat(result.get("grammar")).isEqualTo(74);
            assertThat(result.get("vocabulary")).isEqualTo(76);
        }

        @Test
        @DisplayName("lexicalResource 作为 vocabulary 的别名被识别")
        void treatsLexicalResourceAsVocabulary() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"lexicalResource\":88,\"relevance\":85}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your hobby",
                    "My hobby is reading books about science and history.");

            assertThat(result.get("vocabulary")).isEqualTo(88);
        }

        @Test
        @DisplayName("返回结构包含全部约定字段")
        void returnsAllContractFields() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString()))
                    .thenReturn("{\"score\":80}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your school",
                    "My school is big and has a library and many classrooms.");

            assertThat(result).containsKeys(
                    "score", "pronunciation", "fluency", "grammar",
                    "vocabulary", "relevance", "feedback", "suggestions");
        }
    }

    @Nested
    @DisplayName("切题度启发式")
    class RelevanceHeuristic {

        @Test
        @DisplayName("完全跑题时 relevance 为 0，总分被压到 0")
        void completelyOffTopicScoresZero() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            // 模型给了高分，但回答与题目没有任何共同实词
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":95,\"pronunciation\":95,\"fluency\":95,\"grammar\":95,"
                            + "\"vocabulary\":95,\"relevance\":95}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your favorite season",
                    "Quantum mechanics describes subatomic particle behaviour.");

            assertThat(result.get("relevance")).isEqualTo(0);
            assertThat(result.get("score")).isEqualTo(0);
        }

        @Test
        @DisplayName("空回答时 relevance 为 0")
        void emptyAnswerScoresZeroRelevance() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString()))
                    .thenReturn("{\"score\":90,\"relevance\":90}");

            Map<String, Object> result = service.evaluateSpeaking("Topic: Describe your family", "   ");

            assertThat(result.get("relevance")).isEqualTo(0);
        }

        @Test
        @DisplayName("高度切题时 relevance 不被压低")
        void highlyRelevantAnswerKeepsScore() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString()))
                    .thenReturn("{\"score\":85,\"relevance\":85}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your favorite city Beijing",
                    "My favorite city is Beijing. Beijing has long history and Beijing food is delicious.");

            int relevance = (int) result.get("relevance");
            assertThat(relevance).isGreaterThan(40);
            assertThat((int) result.get("score")).isGreaterThan(0);
        }

        @Test
        @DisplayName("题目没有实词时给中性分 75，不惩罚")
        void neutralScoreWhenTopicHasNoContentWords() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString()))
                    .thenReturn("{\"score\":80,\"relevance\":80}");

            // 题目全是停用词，extractTopicTokens 返回空集合
            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: the a an",
                    "This is a meaningful answer with content words.");

            assertThat(result.get("relevance")).isEqualTo(75);
        }
    }

    @Nested
    @DisplayName("反馈与建议容错")
    class FeedbackParsing {

        @Test
        @DisplayName("feedback 缺失时回落到 comment")
        void fallsBackToComment() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":80,\"relevance\":80,\"comment\":\"来自 comment 的反馈\"}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your weekend",
                    "On weekend I usually go hiking with friends.");

            assertThat(result.get("feedback")).isEqualTo("来自 comment 的反馈");
        }

        @Test
        @DisplayName("feedback 是对象数组时取 text 字段拼接")
        void joinsFeedbackObjectArray() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":80,\"relevance\":80,"
                            + "\"feedback\":[{\"text\":\"第一点\"},{\"text\":\"第二点\"}]}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your teacher",
                    "My teacher is kind and helps me with English.");

            assertThat(result.get("feedback")).isEqualTo("第一点 第二点");
        }

        @Test
        @DisplayName("只有 strengths/weaknesses 时拼成优点与可提升点")
        void buildsFeedbackFromStrengthsAndWeaknesses() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":80,\"relevance\":80,"
                            + "\"strengths\":[\"发音清晰\"],\"weaknesses\":[\"语法错误较多\"]}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your hometown",
                    "My hometown is a small city near the mountain.");

            String feedback = (String) result.get("feedback");
            assertThat(feedback).contains("优点").contains("发音清晰");
            assertThat(feedback).contains("可提升点").contains("语法错误较多");
        }

        @Test
        @DisplayName("suggestions 是分号分隔字符串时能切开")
        void splitsSuggestionString() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":80,\"relevance\":80,\"suggestions\":\"多练习口语；注意时态；扩充词汇\"}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your study plan",
                    "I plan to study English every day and read more books.");

            @SuppressWarnings("unchecked")
            List<String> suggestions = (List<String>) result.get("suggestions");
            assertThat(suggestions).containsExactly("多练习口语", "注意时态", "扩充词汇");
        }

        @Test
        @DisplayName("建议全部缺失时给出默认三条")
        void usesDefaultSuggestions() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString()))
                    .thenReturn("{\"score\":80,\"relevance\":80}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your favorite food",
                    "My favorite food is noodles because it is delicious.");

            @SuppressWarnings("unchecked")
            List<String> suggestions = (List<String>) result.get("suggestions");
            assertThat(suggestions).hasSize(3);
        }
    }

    @Nested
    @DisplayName("边界与异常输入")
    class EdgeCases {

        @Test
        @DisplayName("分数为 0 时视为未提供，继续尝试后续候选")
        void treatsZeroAsMissing() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            // pronunciation 为 0，应回落到 dimensions 中的 72
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":80,\"pronunciation\":0,"
                            + "\"dimensions\":{\"pronunciation\":72},\"relevance\":80}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your best friend",
                    "My best friend is a person who always helps me.");

            assertThat(result.get("pronunciation")).isEqualTo(72);
        }

        @Test
        @DisplayName("超出范围的分数被夹到 0-100")
        void clampsOutOfRangeScores() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":150,\"pronunciation\":200,\"fluency\":-30,\"relevance\":90}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your favorite sport",
                    "My favorite sport is basketball and I play it every weekend.");

            assertThat((int) result.get("pronunciation")).isLessThanOrEqualTo(100);
            assertThat((int) result.get("fluency")).isGreaterThanOrEqualTo(0);
        }

        @Test
        @DisplayName("模型返回带代码块围栏的 JSON 也能解析")
        void parsesFencedJson() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "```json\n{\"score\":80,\"relevance\":80}\n```");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your morning routine",
                    "My morning routine is simple: I wake up early and have breakfast.");

            assertThat(result.get("score")).isEqualTo(80);
        }

        @Test
        @DisplayName("topic 为 null 时按无关键词处理")
        void handlesNullTopic() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString()))
                    .thenReturn("{\"score\":70,\"relevance\":70}");

            Map<String, Object> result = service.evaluateSpeaking(null, "Some answer here.");

            assertThat(result).containsKey("score");
        }

        @Test
        @DisplayName("dimensions 不是 Map 时忽略，不抛异常")
        void ignoresNonMapDimensions() {
            when(providerConfig.hasApiKey()).thenReturn(true);
            when(modelInvocationService.callLLM(anyString(), anyString(), anyString())).thenReturn(
                    "{\"score\":80,\"dimensions\":\"not-a-map\",\"relevance\":80}");

            Map<String, Object> result = service.evaluateSpeaking(
                    "Topic: Describe your favorite movie",
                    "My favorite movie is about space travel and friendship.");

            assertThat(result).containsKey("score");
        }
    }
}
