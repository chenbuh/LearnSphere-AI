package com.learnsphere.service.impl;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * {@link AiFallbackContentGenerator} 的单元测试。
 *
 * <p>这些方法在 AI 不可用时提供兜底内容，属于「最后一道防线」，
 * 因此测试重点不是内容质量，而是<b>结构契约</b>：
 * 返回的 Map 必须包含前端渲染所需的全部字段，且取值在合理范围内。
 * 一旦字段名或结构变化，前端会直接白屏，比内容不好更严重。
 */
class AiFallbackContentGeneratorTest {

    private final AiFallbackContentGenerator generator = new AiFallbackContentGenerator();

    // ==================== 阅读 ====================

    @Test
    void generateMockReading_containsRenderableFields() {
        Map<String, Object> result = generator.generateMockReading("medium");

        assertNotNull(result.get("title"));
        assertNotNull(result.get("passage"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) result.get("questions");
        assertNotNull(questions);
        assertFalse(questions.isEmpty(), "阅读题至少要有 1 道题，否则前端无法渲染");

        Map<String, Object> first = questions.get(0);
        assertNotNull(first.get("text"));
        assertNotNull(first.get("options"));
        assertTrue(first.containsKey("correct"));
        assertNotNull(first.get("explanation"));
    }

    // ==================== 写作 ====================

    @Test
    void generateMockWriting_returnsMinWordsWithinReasonableRange() {
        for (String examType : List.of("primary", "middle", "high", "cet4", "cet6")) {
            Map<String, Object> result = generator.generateMockWriting(examType, "medium");

            assertNotNull(result.get("title"), examType + " 缺少 title");
            assertNotNull(result.get("prompt"), examType + " 缺少 prompt");
            assertNotNull(result.get("tips"), examType + " 缺少 tips");

            Object minWords = result.get("minWords");
            assertNotNull(minWords, examType + " 缺少 minWords");
            int words = ((Number) minWords).intValue();
            assertTrue(words >= 60 && words <= 300,
                    examType + " 的 minWords 应在 60-300 之间，实际: " + words);
        }
    }

    @Test
    void generateMockWriting_hardDifficultyRequiresMoreWords() {
        Map<String, Object> medium = generator.generateMockWriting("primary", "medium");
        Map<String, Object> hard = generator.generateMockWriting("primary", "hard");

        int mediumWords = ((Number) medium.get("minWords")).intValue();
        int hardWords = ((Number) hard.get("minWords")).intValue();
        assertTrue(hardWords > mediumWords,
                "hard 难度要求词数应更多，实际 medium=" + mediumWords + " hard=" + hardWords);
    }

    @Test
    void generateMockWriting_defaultsBlankDifficultyToMedium() {
        Map<String, Object> nullDiff = generator.generateMockWriting("primary", null);
        Map<String, Object> blankDiff = generator.generateMockWriting("primary", "   ");
        Map<String, Object> medium = generator.generateMockWriting("primary", "medium");

        assertEquals(medium.get("minWords"), nullDiff.get("minWords"));
        assertEquals(medium.get("minWords"), blankDiff.get("minWords"));
    }

    // ==================== 听力 ====================

    @Test
    void generateMockListening_returnsRequestedNumberOfPassages() {
        Map<String, Object> result = generator.generateMockListening("medium", 3);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> passages = (List<Map<String, Object>>) result.get("passages");
        assertNotNull(passages, "听力兜底数据应使用 passages 字段");
        assertEquals(3, passages.size(), "应返回请求的条数");

        // 每篇听力都要有题目，否则前端无法渲染作答区
        Map<String, Object> first = passages.get(0);
        assertNotNull(first.get("title"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) first.get("questions");
        assertNotNull(questions);
        assertFalse(questions.isEmpty());
    }

    @Test
    void generateMockListening_handlesNullCountGracefully() {
        // count 为 null 时不应抛异常，应回退到合理默认值
        Map<String, Object> result = generator.generateMockListening("medium", null);
        assertNotNull(result.get("passages"));
    }

    // ==================== 语法 / 口语 ====================

    @Test
    void generateMockGrammar_containsQuestions() {
        Map<String, Object> result = generator.generateMockGrammar("tense", "medium");

        assertNotNull(result.get("questions"));
        assertNotNull(result.get("topic"));
    }

    @Test
    void generateMockSpeaking_returnsTopicWithRequiredParts() {
        Map<String, Object> result = generator.generateMockSpeaking("part2");

        // 口语题兜底用的是 topic/description 字段，而非 title/prompt
        assertNotNull(result.get("topic"));
        assertNotNull(result.get("description"));
        assertNotNull(result.get("keywords"));
        assertNotNull(result.get("hints"));

        Object timeLimit = result.get("timeLimit");
        assertNotNull(timeLimit);
        assertTrue(((Number) timeLimit).intValue() > 0, "答题时限应为正数");
    }

    // ==================== 评估 ====================

    @Test
    void generateMockEvaluation_scoreWithinValidRange() {
        Map<String, Object> result = generator.generateMockEvaluation();

        int score = ((Number) result.get("score")).intValue();
        assertTrue(score >= 0 && score <= 100, "分数应在 0-100，实际: " + score);
        assertNotNull(result.get("feedback"));
        assertNotNull(result.get("suggestions"));
    }

    @Test
    void generateMockSpeakingEvaluation_allDimensionsWithinValidRange() {
        Map<String, Object> result = generator.generateMockSpeakingEvaluation();

        for (String dimension : List.of("score", "pronunciation", "fluency", "grammar",
                "vocabulary", "relevance")) {
            Object value = result.get(dimension);
            assertNotNull(value, "口语评估缺少维度: " + dimension);
            int score = ((Number) value).intValue();
            assertTrue(score >= 0 && score <= 100,
                    dimension + " 应在 0-100，实际: " + score);
        }
        assertNotNull(result.get("feedback"));
        assertNotNull(result.get("suggestions"));
    }

    @Test
    void generateMockSpeakingEvaluation_feedbackIsNonEmptyChinese() {
        Map<String, Object> result = generator.generateMockSpeakingEvaluation();
        String feedback = String.valueOf(result.get("feedback"));

        assertFalse(feedback.isBlank(), "口语反馈不应为空");
        assertTrue(feedback.chars().anyMatch(c -> c >= 0x4E00 && c <= 0x9FFF),
                "口语反馈应为中文，实际: " + feedback);
    }
}
