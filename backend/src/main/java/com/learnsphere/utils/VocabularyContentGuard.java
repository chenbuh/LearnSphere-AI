package com.learnsphere.utils;

import java.util.regex.Pattern;

/**
 * Guardrails for vocabulary text quality.
 */
public final class VocabularyContentGuard {

    private static final Pattern CHINESE_PATTERN = Pattern.compile("[\\u4e00-\\u9fff]");
    private static final Pattern QUESTION_MARK_ONLY = Pattern.compile("^\\?{3,}$");
    private static final Pattern EN_TOKEN_PATTERN = Pattern.compile("[A-Za-z]{3,}");
    private static final Pattern EN_FUNCTION_WORD_PATTERN = Pattern
            .compile("\\b(I|you|he|she|they|we|to|the|and|is|are|was|were)\\b", Pattern.CASE_INSENSITIVE);

    private VocabularyContentGuard() {
    }

    public static String normalize(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.trim().replaceAll("\\s+", " ");
    }

    public static String reasonBadExampleTranslation(String raw) {
        String text = normalize(raw);
        if (text.isEmpty()) {
            return "empty_value";
        }

        String lower = text.toLowerCase();

        if (text.startsWith("\u5355\u8BCD\u201C")) {
            return "template_prefix_word_quote";
        }
        if (text.startsWith("\u8FD9\u662F\u4E00\u4E2A\u5173\u4E8E")) {
            return "template_prefix_about";
        }
        if (text.contains("\u771F\u5B9E\u4F8B\u53E5")) {
            return "template_phrase_real_example";
        }
        if (text.contains("\u7FFB\u8BD1\u83B7\u53D6\u5931\u8D25")) {
            return "placeholder_translation_failed_cn";
        }
        if (text.equals("\u8FD9\u5BF9\u5B66\u4E60\u6709\u7528\u3002")) {
            return "placeholder_useful_for_study_cn";
        }
        if (text.equals("\u6682\u65E0\u4F8B\u53E5\u3002")) {
            return "placeholder_example_unavailable_cn";
        }

        if (text.contains("QUERY LENGTH LIMIT EXCEEDED")) {
            return "placeholder_query_length_limit";
        }
        if (lower.contains("translation failed")) {
            return "placeholder_translation_failed_en";
        }
        if (QUESTION_MARK_ONLY.matcher(text).matches()) {
            return "placeholder_question_marks";
        }

        if (text.contains("\u97F3\u4E50\u5BB6\u719F\u7EC3\u5730\u97A0\u8EAC\u62C9\u5C0F\u63D0\u7434")) {
            return "known_wrong_sense_bow_violin";
        }

        boolean hasChinese = CHINESE_PATTERN.matcher(text).find();
        if (hasChinese) {
            int enTokenCount = 0;
            var matcher = EN_TOKEN_PATTERN.matcher(text);
            while (matcher.find()) {
                String token = matcher.group();
                boolean isAcronym = token.equals(token.toUpperCase()) && token.length() <= 5;
                if (!isAcronym) {
                    enTokenCount += 1;
                }
            }
            if (enTokenCount >= 4 || EN_FUNCTION_WORD_PATTERN.matcher(text).find()) {
                return "mixed_language_artifact";
            }
        }

        if (!CHINESE_PATTERN.matcher(text).find()) {
            return "no_chinese";
        }

        return null;
    }

    public static boolean isBadExampleTranslation(String raw) {
        return reasonBadExampleTranslation(raw) != null;
    }

    public static String sanitizeExampleTranslation(String raw) {
        String text = normalize(raw);
        return isBadExampleTranslation(text) ? "" : text;
    }

    public static String pickValidExampleTranslation(String candidate, String fallback) {
        String candidateSanitized = sanitizeExampleTranslation(candidate);
        if (!candidateSanitized.isEmpty()) {
            return candidateSanitized;
        }

        String fallbackSanitized = sanitizeExampleTranslation(fallback);
        if (!fallbackSanitized.isEmpty()) {
            return fallbackSanitized;
        }

        return null;
    }
}
