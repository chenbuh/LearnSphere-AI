package com.learnsphere.service.impl;

import cn.hutool.json.JSONUtil;
import com.learnsphere.service.AIProviderConfigService;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 口语评估服务。
 *
 * <p>从 {@code AIGenerationServiceImpl} 中抽出的口语评分区块，包含：
 * 调用模型评分、把模型返回的宽松结构归一化成固定契约、
 * 基于关键词重叠的切题度启发式计算、反馈与建议的容错解析。
 *
 * <p>抽出理由：这一整块（原约 260 行）高度内聚，所有辅助方法
 * 只在本区块内部互相调用，与类内其他生成逻辑没有交叉依赖。
 *
 * <p>其中「切题度」采用启发式规则而非纯模型判断：模型给出的 relevance
 * 会与基于题目关键词覆盖率的计算结果取较小值，避免模型对明显跑题的回答
 * 给出过高分数。当 relevance 低于阈值时还会对总分设上限。
 */
@Slf4j
@Service
public class SpeakingEvaluationService {

    /** 切题度计算时忽略的高频虚词，避免它们让无关回答看起来"命中"题目。 */
    private static final Set<String> RELEVANCE_STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "while",
            "is", "am", "are", "was", "were", "be", "been", "being",
            "do", "does", "did", "have", "has", "had",
            "to", "of", "in", "on", "at", "for", "with", "from", "by", "about", "as",
            "you", "your", "yours", "i", "me", "my", "mine", "we", "our", "ours",
            "he", "she", "it", "they", "them", "their", "this", "that", "these", "those",
            "who", "what", "which", "where", "why", "how",
            "should", "would", "could", "can", "will", "just", "very", "more", "most",
            "say", "talk", "describe", "tell", "explain", "mention");

    /** 无 API Key 或调用失败时的兜底评分配置。 */
    private static final String EVALUATE_SPEAKING_PROMPT_TYPE = "EVALUATE_SPEAKING";

    @Autowired
    private AIProviderConfigService providerConfig;

    @Autowired
    private AiModelInvocationService aiModelInvocationService;

    @Autowired
    private AiFallbackContentGenerator aiFallbackContentGenerator;

    /**
     * 评估一次口语作答。
     *
     * <p>未配置 API Key 时直接返回兜底评分；调用或解析失败时同样兜底，
     * 保证前端始终能拿到结构完整的评分结果。
     *
     * @param topic         题目文本，可能包含题干、关键词等上下文
     * @param transcription 学生的作答文本
     * @return 固定结构：score / pronunciation / fluency / grammar / vocabulary /
     *         relevance / feedback / suggestions
     */
    public Map<String, Object> evaluateSpeaking(String topic, String transcription) {
        log.info("评估口语: {}", topic);

        if (!providerConfig.hasApiKey()) {
            return aiFallbackContentGenerator.generateMockSpeakingEvaluation();
        }

        try {
            String systemPrompt = "你是一个专业的英语口语评分老师。";
            String userPrompt = String.format(
                    "请评估以下口语回答（题目：%s）：\n\n%s\n\n" +
                            "请重点判断回答是否围绕题目、表达是否自然、语法和词汇是否得当，并给出具体改进建议。" +
                            "返回JSON：{\"score\":80, \"pronunciation\":85, \"fluency\":75, \"grammar\":80, "
                            + "\"vocabulary\":85, \"relevance\":82, \"feedback\":\"详细反馈\", "
                            + "\"suggestions\":[\"建议1\",\"建议2\",\"建议3\"]}\n",
                    topic, transcription);

            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt,
                    EVALUATE_SPEAKING_PROMPT_TYPE);
            response = AiJsonResponseCleaner.clean(response);
            Map<String, Object> rawResult = JSONUtil.parseObj(response);
            return normalizeEvaluation(rawResult, topic, transcription);
        } catch (Exception e) {
            log.error("AI 评估口语失败，使用 Mock 数据", e);
            return aiFallbackContentGenerator.generateMockSpeakingEvaluation();
        }
    }

    /**
     * 把模型返回的宽松结构归一化为前端约定的固定字段。
     *
     * <p>模型可能把分数放在顶层，也可能塞进 dimensions 子对象，
     * 还可能用 lexicalResource 代替 vocabulary；这里逐项容错取值。
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> normalizeEvaluation(Map<String, Object> rawResult, String topic,
            String transcription) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> dimensions = rawResult.get("dimensions") instanceof Map<?, ?> dims
                ? (Map<String, Object>) dims
                : Collections.emptyMap();

        int pronunciation = pickScore(rawResult.get("pronunciation"), dimensions.get("pronunciation"), 78);
        int fluency = pickScore(rawResult.get("fluency"), dimensions.get("fluency"), 76);
        int grammar = pickScore(rawResult.get("grammar"), dimensions.get("grammar"), 75);
        int vocabulary = pickScore(rawResult.get("vocabulary"), rawResult.get("lexicalResource"),
                dimensions.get("vocabulary"), dimensions.get("lexicalResource"), 77);
        int relevance = pickScore(rawResult.get("relevance"), dimensions.get("relevance"), 80);
        int heuristicRelevance = computeRelevance(topic, transcription);
        relevance = Math.min(relevance, heuristicRelevance);

        int averagedScore = Math.round((pronunciation + fluency + grammar + vocabulary + relevance) / 5.0f);
        int score = pickScore(rawResult.get("score"), averagedScore);
        if (relevance <= 0) {
            score = 0;
        } else if (relevance <= 25) {
            score = Math.min(score, 45);
        } else if (relevance <= 40) {
            score = Math.min(score, 60);
        } else if (relevance <= 55) {
            score = Math.min(score, 75);
        }

        String feedback = extractFeedback(rawResult);
        if (feedback.isBlank()) {
            feedback = String.format(
                    "你的回答与题目“%s”基本相关，整体表达完成度较好。"
                            + "建议继续围绕题干补充细节，并提升语法准确性与表达连贯性。",
                    topic);
        }

        List<String> suggestions = extractSuggestions(rawResult);
        if (suggestions.isEmpty()) {
            suggestions = List.of(
                    "先用 2-3 句明确回应题目核心要求，再补充具体细节。",
                    "尽量减少停顿，使用 because, for example, however 等连接表达增强连贯性。",
                    "复述答案后检查时态、主谓一致和常见搭配，提升语法与词汇准确度。");
        }

        if (relevance <= 0) {
            feedback = "你的回答与题目要求完全不相干，本次作答按 0 分处理。"
                    + "当前最核心的问题不是语言形式，而是没有回应题目本身。"
                    + "请先围绕题干直接作答，再补充细节。";
            suggestions = List.of(
                    "先用一句话直接回答题目问的对象、事件或场景，不要先讲无关内容。",
                    "重新作答前，先划出题干里的 3 个关键词，并确保答案中明确覆盖它们。",
                    "如果不确定是否切题，先用中文确认题意，再用英文围绕题干组织回答。");
        } else if (relevance <= 25) {
            feedback = "你的回答与题目要求明显不相关，当前主要问题不是语言形式，而是没有围绕题干作答。"
                    + "请先准确回应题目核心，再展开细节。";
            suggestions = List.of(
                    "先复述题目关键词，确保回答对象、事件或场景与题干一致。",
                    "开头第一句直接回应题目要求，不要先讲无关经历。",
                    "重新作答前，先用 3 个要点列出你必须覆盖的题干信息。");
        } else if (relevance <= 40) {
            feedback = "你的回答只有部分内容贴合题目，存在明显跑题。"
                    + "建议先紧扣题目核心要求，再补充例子和细节。";
            suggestions = List.of(
                    "先回答题目最核心的问题，再补充 supporting details。",
                    "多使用题干中的人物、地点、时间或事件关键词，减少无关展开。",
                    "结尾回扣题目，说明你的回答为什么符合题干要求。");
        }

        result.put("score", score);
        result.put("pronunciation", pronunciation);
        result.put("fluency", fluency);
        result.put("grammar", grammar);
        result.put("vocabulary", vocabulary);
        result.put("relevance", relevance);
        result.put("feedback", feedback);
        result.put("suggestions", suggestions);
        return result;
    }

    /**
     * 用关键词覆盖率估算切题度，作为模型判断的下界约束。
     *
     * <p>题目词覆盖率权重 70%，回答词覆盖率权重 30%。
     * 回答为空直接 0 分；题目没有可用关键词时给中性分 75，不做惩罚。
     * 只命中 1 个词且题目较长、或双向覆盖率都极低时，额外压低上限。
     */
    private int computeRelevance(String topic, String transcription) {
        Set<String> promptTokens = extractTopicTokens(topic);
        Set<String> answerTokens = extractMeaningfulTokens(transcription);

        if (answerTokens.isEmpty()) {
            return 0;
        }
        if (promptTokens.isEmpty()) {
            return 75;
        }

        Set<String> overlap = new HashSet<>(promptTokens);
        overlap.retainAll(answerTokens);

        double promptCoverage = (double) overlap.size() / promptTokens.size();
        double answerCoverage = (double) overlap.size() / answerTokens.size();
        double score = promptCoverage * 70.0 + answerCoverage * 30.0;

        if (overlap.isEmpty()) {
            return 0;
        }
        if (overlap.size() == 1 && promptTokens.size() >= 4) {
            score = Math.min(score, 20);
        }
        if (promptCoverage < 0.15 && answerCoverage < 0.15) {
            score = Math.min(score, 20);
        }

        return clampScore(score);
    }

    /** 去掉题目里的中英文标签前缀，避免「题目:」这类词干扰覆盖率。 */
    private Set<String> extractTopicTokens(String topicContext) {
        if (topicContext == null || topicContext.isBlank()) {
            return Collections.emptySet();
        }

        String normalized = topicContext
                .replace("题目:", " ")
                .replace("题干:", " ")
                .replace("关键词:", " ")
                .replace("提示:", " ")
                .replace("Topic:", " ")
                .replace("Prompt:", " ")
                .replace("Keywords:", " ")
                .replace("Hints:", " ");
        return extractMeaningfulTokens(normalized);
    }

    /** 抽取长度不小于 3 的英文词，去掉停用词，保持出现顺序。 */
    private Set<String> extractMeaningfulTokens(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptySet();
        }

        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-z]+"))
                .map(String::trim)
                .filter(token -> token.length() >= 3)
                .filter(token -> !RELEVANCE_STOP_WORDS.contains(token))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    /**
     * 按优先级取第一个有效分数，全部无效时返回 75。
     *
     * <p>模型有时给 0 表示"未提供"而非"得 0 分"，因此 0 会被跳过、
     * 继续尝试后面的候选值；只有全部候选都为 0 或缺失时才用默认值。
     */
    private int pickScore(Object primary, Object... fallbacks) {
        double score = asScore(primary);
        if (score > 0) {
            return clampScore(score);
        }

        for (Object fallback : fallbacks) {
            score = asScore(fallback);
            if (score > 0) {
                return clampScore(score);
            }
        }

        return 75;
    }

    /** 把任意对象转成分数；非数值一律视为 0（即"未提供"）。 */
    private double asScore(Object scoreObj) {
        if (scoreObj instanceof Number number) {
            return number.doubleValue();
        }
        return 0.0;
    }

    private int clampScore(double score) {
        return Math.max(0, Math.min(100, (int) Math.round(score)));
    }

    /**
     * 容错提取反馈文本。
     *
     * <p>依次尝试 feedback / comment / comments / overallFeedback / summary /
     * evaluation；都没有时，用 strengths 与 weaknesses 拼出一段。
     */
    private String extractFeedback(Map<String, Object> rawResult) {
        String directFeedback = stringifyFeedback(rawResult.get("feedback"));
        if (!directFeedback.isBlank()) {
            return directFeedback;
        }

        for (String key : List.of("comment", "comments", "overallFeedback", "summary", "evaluation")) {
            String value = stringifyFeedback(rawResult.get(key));
            if (!value.isBlank()) {
                return value;
            }
        }

        List<String> strengths = extractSuggestions(
                Collections.singletonMap("suggestions", rawResult.get("strengths")));
        List<String> weaknesses = extractSuggestions(
                Collections.singletonMap("suggestions", rawResult.get("weaknesses")));
        if (!strengths.isEmpty() || !weaknesses.isEmpty()) {
            StringBuilder builder = new StringBuilder();
            if (!strengths.isEmpty()) {
                builder.append("优点：").append(String.join("；", strengths)).append("。");
            }
            if (!weaknesses.isEmpty()) {
                builder.append("可提升点：").append(String.join("；", weaknesses)).append("。");
            }
            return builder.toString().trim();
        }

        return "";
    }

    /** 反馈可能是字符串、字符串数组、或带 text 字段的对象数组，统一拼成一段。 */
    private String stringifyFeedback(Object feedback) {
        if (feedback == null) {
            return "";
        }
        if (feedback instanceof CharSequence sequence) {
            return sequence.toString().trim();
        }
        if (feedback instanceof Collection<?> collection) {
            return collection.stream()
                    .map(item -> {
                        if (item instanceof Map<?, ?> map) {
                            Object text = map.get("text");
                            return text == null ? "" : text.toString().trim();
                        }
                        return item == null ? "" : item.toString().trim();
                    })
                    .filter(value -> value != null && !value.isBlank())
                    .collect(Collectors.joining(" "));
        }
        return feedback.toString().trim();
    }

    /**
     * 容错提取建议列表。
     *
     * <p>依次尝试 suggestions / tips / advice / recommendations；
     * 集合直接逐项取文本，字符串则按换行或分号切分。
     */
    private List<String> extractSuggestions(Map<String, Object> rawResult) {
        for (String key : List.of("suggestions", "tips", "advice", "recommendations")) {
            Object value = rawResult.get(key);
            if (value instanceof Collection<?> collection) {
                List<String> result = collection.stream()
                        .map(item -> {
                            if (item instanceof Map<?, ?> map) {
                                Object text = map.get("text");
                                return text == null ? "" : text.toString().trim();
                            }
                            return item == null ? "" : item.toString().trim();
                        })
                        .filter(item -> item != null && !item.isBlank())
                        .collect(Collectors.toList());
                if (!result.isEmpty()) {
                    return result;
                }
            }
            if (value instanceof CharSequence sequence && !sequence.toString().isBlank()) {
                return Arrays.stream(sequence.toString().split("[\\r\\n;；]+"))
                        .map(String::trim)
                        .filter(item -> !item.isBlank())
                        .collect(Collectors.toList());
            }
        }
        return new ArrayList<>();
    }
}
