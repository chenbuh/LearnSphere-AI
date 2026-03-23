package com.learnsphere.util;

import com.learnsphere.entity.SystemPrompt;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.Locale;

/**
 * 统一整理 system_prompt 在后台展示时的说明和排序规则。
 */
public final class SystemPromptMetadataHelper {

    private SystemPromptMetadataHelper() {
    }

    /**
     * 持久化时优先保留人工填写的描述，空描述再回退到自动说明。
     */
    public static String resolveDescription(String promptKey, String fallbackDescription) {
        if (StringUtils.hasText(fallbackDescription)) {
            return fallbackDescription;
        }
        String derived = buildDescription(promptKey);
        if (StringUtils.hasText(derived)) {
            return derived;
        }
        return promptKey;
    }

    /**
     * 列表展示时优先展示结构化说明，保证运营页排序和文案稳定。
     */
    public static String resolveDisplayDescription(String promptKey, String fallbackDescription) {
        String derived = buildDescription(promptKey);
        if (StringUtils.hasText(derived)) {
            return derived;
        }
        if (StringUtils.hasText(fallbackDescription)) {
            return fallbackDescription;
        }
        return promptKey;
    }

    public static Comparator<SystemPrompt> promptComparator() {
        return Comparator
                .comparingInt((SystemPrompt prompt) -> moduleOrder(prompt.getPromptKey()))
                .thenComparingInt(prompt -> roleOrder(prompt.getPromptKey()))
                .thenComparingInt(prompt -> stageOrder(prompt.getPromptKey()))
                .thenComparing(SystemPrompt::getPromptKey, String.CASE_INSENSITIVE_ORDER);
    }

    private static String buildDescription(String promptKey) {
        if (!StringUtils.hasText(promptKey)) {
            return null;
        }
        String module = moduleLabel(promptKey);
        if (!StringUtils.hasText(module)) {
            return null;
        }
        return module + " / " + roleLabel(promptKey) + " / " + stageLabel(promptKey);
    }

    private static String moduleLabel(String promptKey) {
        String normalized = normalize(promptKey);
        if (startsWithAny(normalized, "READING_")) {
            return "阅读理解";
        }
        if (startsWithAny(normalized, "WRITING_GEN")) {
            return "写作题目";
        }
        if (startsWithAny(normalized, "EVALUATE_WRITING")) {
            return "写作批改";
        }
        if (startsWithAny(normalized, "LISTENING_")) {
            return "听力练习";
        }
        if (startsWithAny(normalized, "VOCAB_")) {
            return "词汇学习";
        }
        if (startsWithAny(normalized, "MOCK_EXAM_")) {
            return "模拟考试";
        }
        if (startsWithAny(normalized, "GRAMMAR_")) {
            return "语法练习";
        }
        if (startsWithAny(normalized, "SPEAKING_GEN")) {
            return "口语题目";
        }
        if (startsWithAny(normalized, "SPEAKING_EVAL", "EVALUATE_SPEAKING")) {
            return "口语评测";
        }
        if (startsWithAny(normalized, "SPEAKING_MOCK")) {
            return "口语模考";
        }
        if (startsWithAny(normalized, "SPEAKING_REPORT")) {
            return "口语报告";
        }
        if (startsWithAny(normalized, "AI_TUTOR_")) {
            return "AI 助教";
        }
        if (startsWithAny(normalized, "LEARNING_ADVICE_")) {
            return "AI 助教";
        }
        if (startsWithAny(normalized, "DEEP_ANALYZE_")) {
            return "深度分析";
        }
        if (startsWithAny(normalized, "REC_ENGINE_")) {
            return "推荐引擎";
        }
        if (startsWithAny(normalized, "AI_BRIEFING")) {
            return "AI 简报";
        }
        if (startsWithAny(normalized, "CONTENT_AUDIT")) {
            return "内容审核";
        }
        return null;
    }

    private static String roleLabel(String promptKey) {
        String normalized = normalize(promptKey);
        if (containsRoleToken(normalized, "_SYSTEM")) {
            return "系统角色";
        }
        if (containsRoleToken(normalized, "_ADVICE_RULES")) {
            return "回答规范";
        }
        if (containsRoleToken(normalized, "_USER")) {
            return "用户指令";
        }
        return "配置项";
    }

    private static String stageLabel(String promptKey) {
        String normalized = normalize(promptKey);
        if (normalized.endsWith("_PRIMARY")) {
            return "小学";
        }
        if (normalized.endsWith("_MIDDLE")) {
            return "中考";
        }
        if (normalized.endsWith("_HIGH")) {
            return "高考";
        }
        return "通用";
    }

    private static int moduleOrder(String promptKey) {
        String normalized = normalize(promptKey);
        if (startsWithAny(normalized, "READING_")) {
            return 10;
        }
        if (startsWithAny(normalized, "WRITING_GEN")) {
            return 20;
        }
        if (startsWithAny(normalized, "EVALUATE_WRITING")) {
            return 21;
        }
        if (startsWithAny(normalized, "LISTENING_")) {
            return 30;
        }
        if (startsWithAny(normalized, "VOCAB_")) {
            return 40;
        }
        if (startsWithAny(normalized, "MOCK_EXAM_")) {
            return 50;
        }
        if (startsWithAny(normalized, "GRAMMAR_")) {
            return 60;
        }
        if (startsWithAny(normalized, "SPEAKING_GEN")) {
            return 70;
        }
        if (startsWithAny(normalized, "SPEAKING_EVAL", "EVALUATE_SPEAKING")) {
            return 71;
        }
        if (startsWithAny(normalized, "SPEAKING_MOCK")) {
            return 72;
        }
        if (startsWithAny(normalized, "SPEAKING_REPORT")) {
            return 73;
        }
        if (startsWithAny(normalized, "AI_TUTOR_")) {
            return 80;
        }
        if (startsWithAny(normalized, "LEARNING_ADVICE_")) {
            return 80;
        }
        if (startsWithAny(normalized, "DEEP_ANALYZE_")) {
            return 90;
        }
        if (startsWithAny(normalized, "REC_ENGINE_")) {
            return 91;
        }
        if (startsWithAny(normalized, "AI_BRIEFING")) {
            return 92;
        }
        if (startsWithAny(normalized, "CONTENT_AUDIT")) {
            return 93;
        }
        return 999;
    }

    private static int roleOrder(String promptKey) {
        String normalized = normalize(promptKey);
        if (containsRoleToken(normalized, "_SYSTEM")) {
            return 10;
        }
        if (containsRoleToken(normalized, "_USER")) {
            return 20;
        }
        if (containsRoleToken(normalized, "_ADVICE_RULES")) {
            return 30;
        }
        return 99;
    }

    private static int stageOrder(String promptKey) {
        String normalized = normalize(promptKey);
        if (normalized.endsWith("_PRIMARY")) {
            return 10;
        }
        if (normalized.endsWith("_MIDDLE")) {
            return 20;
        }
        if (normalized.endsWith("_HIGH")) {
            return 30;
        }
        return 0;
    }

    private static String normalize(String promptKey) {
        return promptKey == null ? "" : promptKey.trim().toUpperCase(Locale.ROOT);
    }

    private static boolean startsWithAny(String promptKey, String... prefixes) {
        for (String prefix : prefixes) {
            if (promptKey.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    private static boolean containsRoleToken(String promptKey, String token) {
        return promptKey.endsWith(token) || promptKey.contains(token + "_");
    }
}
