package com.learnsphere.utils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * 统一处理考试类型的新旧别名与学段映射。
 */
public final class ExamTypeAliasUtils {

    private ExamTypeAliasUtils() {
    }

    public static String normalize(String examType) {
        if (examType == null) {
            return null;
        }
        String normalized = examType.trim().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return null;
        }
        return switch (normalized) {
            case "小学英语", "小学", "primary_school" -> "primary";
            case "中考英语", "中考", "junior", "junior_high", "middle_school" -> "middle";
            case "高考英语", "高考", "senior", "senior_high", "high_school" -> "high";
            default -> normalized;
        };
    }

    public static String normalizeStage(String examType) {
        String normalized = normalize(examType);
        if (normalized == null) {
            return null;
        }
        return switch (normalized) {
            case "primary", "middle", "high" -> normalized;
            default -> null;
        };
    }

    public static List<String> expandAliases(String examType) {
        String normalized = normalize(examType);
        if (normalized == null) {
            return List.of();
        }

        Set<String> aliases = new LinkedHashSet<>();
        aliases.add(normalized);

        switch (normalized) {
            case "middle" -> aliases.add("middle_school");
            case "high" -> aliases.add("high_school");
            default -> {
            }
        }

        return new ArrayList<>(aliases);
    }

    public static String getStageLabel(String examType) {
        String stage = normalizeStage(examType);
        if (stage == null) {
            return "通用";
        }
        return switch (stage) {
            case "primary" -> "小学";
            case "middle" -> "中考";
            case "high" -> "高考";
            default -> "通用";
        };
    }

    public static String getExamDisplayName(String examType) {
        String normalized = normalize(examType);
        if (normalized == null) {
            return "英语";
        }
        return switch (normalized) {
            case "primary" -> "小学英语";
            case "middle" -> "中考英语";
            case "high" -> "高考英语";
            case "cet4" -> "CET-4";
            case "cet6" -> "CET-6";
            case "ielts" -> "IELTS";
            case "toefl" -> "TOEFL";
            case "gre" -> "GRE";
            case "tem4" -> "TEM-4";
            case "tem8" -> "TEM-8";
            case "postgraduate" -> "考研英语";
            case "coca" -> "COCA";
            default -> normalized.toUpperCase(Locale.ROOT);
        };
    }
}
