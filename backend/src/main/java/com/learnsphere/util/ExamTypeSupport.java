package com.learnsphere.util;

import java.util.Locale;
import java.util.Map;

/**
 * 统一维护考试类型的显示名称、提示词键和阶段化说明。
 */
public final class ExamTypeSupport {

    private static final Map<String, String> DISPLAY_LABELS = Map.ofEntries(
            Map.entry("primary", "小学英语"),
            Map.entry("middle", "中考英语"),
            Map.entry("high", "高考英语"),
            Map.entry("cet4", "CET-4"),
            Map.entry("cet6", "CET-6"),
            Map.entry("ielts", "IELTS"),
            Map.entry("toefl", "TOEFL"),
            Map.entry("gre", "GRE"),
            Map.entry("postgraduate", "考研英语"),
            Map.entry("tem4", "TEM-4"),
            Map.entry("tem8", "TEM-8"));

    private ExamTypeSupport() {
    }

    public static String normalize(String examType) {
        if (examType == null || examType.isBlank()) {
            return "";
        }
        return examType.trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizeOrDefault(String examType, String fallback) {
        String normalized = normalize(examType);
        return normalized.isBlank() ? normalize(fallback) : normalized;
    }

    public static String getDisplayLabel(String examType) {
        String normalized = normalize(examType);
        if (normalized.isBlank()) {
            return "英语";
        }
        return DISPLAY_LABELS.getOrDefault(normalized, normalized.toUpperCase(Locale.ROOT));
    }

    public static String resolvePromptKey(String baseKey, String examType) {
        return switch (normalize(examType)) {
            case "primary" -> baseKey + "_PRIMARY";
            case "middle" -> baseKey + "_MIDDLE";
            case "high" -> baseKey + "_HIGH";
            default -> baseKey;
        };
    }

    public static String getPromptDescriptionSuffix(String examType) {
        return switch (normalize(examType)) {
            case "primary" -> "小学";
            case "middle" -> "中考";
            case "high" -> "高考";
            default -> getDisplayLabel(examType);
        };
    }

    public static String getWritingGuidance(String examType) {
        return switch (normalize(examType)) {
            case "primary" ->
                "面向小学英语学习者，题目聚焦校园、家庭、朋友、节日和兴趣等熟悉主题，语言要简洁直接，便于学生根据提示完成基础表达。";
            case "middle" ->
                "面向中考英语学习者，题目贴近校园生活、成长经历、活动安排、书信通知等中考高频场景，强调信息覆盖、结构完整和基本逻辑。";
            case "high" ->
                "面向高考英语学习者，题目应体现应用文写作、观点表达或情境任务特点，兼顾信息整合、篇章结构和较规范的书面表达。";
            default -> "题目需贴合该考试的常见命题方式、语篇风格和评分关注点。";
        };
    }

    public static String getListeningGuidance(String examType) {
        return switch (normalize(examType)) {
            case "primary" ->
                "语篇长度较短、语速偏慢，词汇以高频基础词为主，场景聚焦校园、家庭、天气、购物、兴趣等小学生熟悉情境。";
            case "middle" ->
                "语篇长度适中，内容围绕校园生活、活动安排、计划建议、社会常识等中考高频听力场景，题干要清晰直接。";
            case "high" ->
                "语篇贴近高考英语听力，覆盖校园通知、新闻简讯、活动安排、访谈片段等场景，强调关键信息定位与简单推断。";
            default -> "语篇内容和设问方式需符合该考试的常见听力命题风格。";
        };
    }

    public static String getVocabularyGuidance(String examType) {
        return switch (normalize(examType)) {
            case "primary" ->
                "优先给出基础、高频、具体可感的释义与例句，例句要短、易懂、贴近日常生活，避免生僻表达。";
            case "middle" ->
                "释义与例句要贴合中考高频语境，适度强调固定搭配、常见变形和容易混淆的用法。";
            case "high" ->
                "释义与例句要贴合高考语境，适度补充近义辨析、书面表达搭配和常见考法。";
            default -> "解析要贴合该考试或学习阶段的常见词汇要求和使用场景。";
        };
    }

    public static String getMockExamGuidance(String examType) {
        return switch (normalize(examType)) {
            case "primary" ->
                "整体难度贴近小学英语综合测评，题材聚焦校园、家庭、节日、兴趣与基础日常交流，指令更直接、语篇更短。";
            case "middle" ->
                "整体难度贴近中考英语，覆盖基础写作、听力理解、阅读理解和基础翻译表达，强调信息提取与综合运用。";
            case "high" ->
                "整体难度贴近高考英语，覆盖写作、听力、阅读和翻译表达，强调篇章理解、逻辑组织和较完整的语言输出。";
            default -> "整体结构和题目风格需贴合该考试的常见命题习惯。";
        };
    }

    public static int getMockExamDuration(String examType) {
        return switch (normalize(examType)) {
            case "primary" -> 45;
            case "middle" -> 90;
            case "high", "cet4", "cet6" -> 130;
            case "ielts" -> 60;
            case "toefl" -> 45;
            case "gre", "postgraduate" -> 120;
            default -> 60;
        };
    }

    public static String getMockExamName(String examType) {
        return switch (normalize(examType)) {
            case "primary" -> "小学英语";
            case "middle" -> "中考英语";
            case "high" -> "高考英语";
            case "cet4" -> "CET-4 大学英语四级";
            case "cet6" -> "CET-6 大学英语六级";
            case "ielts" -> "IELTS 雅思";
            case "toefl" -> "TOEFL 托福";
            case "gre" -> "GRE";
            case "postgraduate" -> "考研英语";
            default -> "英语";
        };
    }
}
