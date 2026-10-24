package com.learnsphere.service.impl;

import java.util.Map;

/**
 * 学习分析相关的数值与文本工具方法。
 *
 * <p>这些方法原本散落在 {@code AIGenerationServiceImpl} 中，既被学习分析模块
 * 使用，也被推荐、简报等模块使用，因此抽为无状态工具类由双方共用，
 * 避免拆分后出现重复实现。
 *
 * <p>设计约束：本类不依赖任何 Spring Bean，全部方法为静态纯函数，便于单独测试。
 *
 * @author LearnSphere Team
 * @since 1.0.0
 */
public final class AnalysisMathUtils {

    private AnalysisMathUtils() {
        // 工具类不允许实例化
    }

    /**
     * 宽松地把任意对象转为 int。
     *
     * <p>Number 直接取值；字符串尝试解析；null 或解析失败一律返回 0。
     * 用于处理来自 JSON / Map 的松散数值，避免上游类型不一致导致 NPE。
     */
    public static int safeInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value == null) {
            return 0;
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception ignored) {
            return 0;
        }
    }

    /**
     * 宽松地把任意对象转为 long，语义同 {@link #safeInt(Object)}。
     */
    public static long safeLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value == null) {
            return 0L;
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ignored) {
            return 0L;
        }
    }

    /**
     * 宽松地把任意对象转为 double，语义同 {@link #safeInt(Object)}。
     */
    public static double safeDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value == null) {
            return 0.0;
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return 0.0;
        }
    }

    /**
     * 四舍五入保留一位小数。
     */
    public static double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    /**
     * 从统计 Map 计算正确率百分比（保留一位小数）。
     *
     * <p>读取 {@code totalCount} 与 {@code correctCount}；总数非正时返回 0，
     * 避免除零。
     */
    public static double calculateAccuracyPercent(Map<String, Object> stats) {
        int total = safeInt(stats == null ? null : stats.get("totalCount"));
        int correct = safeInt(stats == null ? null : stats.get("correctCount"));
        if (total <= 0) {
            return 0.0;
        }
        return roundToOneDecimal(correct * 100.0 / total);
    }

    /**
     * 计算近 7 天相对前 7 天的正确率变化（百分点，四舍五入取整）。
     *
     * <p>任一侧无记录时返回 0，表示无可比数据，避免用空窗口得出虚假增长。
     */
    public static int calculateGrowth(Map<String, Object> recentPeriodStats,
            Map<String, Object> previousPeriodStats) {
        int recentRecords = safeInt(recentPeriodStats == null ? null : recentPeriodStats.get("totalCount"));
        int previousRecords = safeInt(previousPeriodStats == null ? null : previousPeriodStats.get("totalCount"));
        if (recentRecords <= 0 || previousRecords <= 0) {
            return 0;
        }
        double recentAccuracy = calculateAccuracyPercent(recentPeriodStats);
        double previousAccuracy = calculateAccuracyPercent(previousPeriodStats);
        return (int) Math.round(recentAccuracy - previousAccuracy);
    }

    /**
     * 由综合能力值（0-100）预测 CET 分数（满分 710）。
     *
     * <p>换算公式 {@code 425 + (overall - 60) * 5.625}，即 60 分能力值对应
     * 425 分及格线、100 分对应 650 分，结果夹在 [0, 710]。
     */
    public static int calculatePredictScore(int overall) {
        if (overall <= 0) {
            return 0;
        }
        int predictScore = (int) Math.round(425 + (overall - 60) * 5.625);
        return Math.max(0, Math.min(710, predictScore));
    }
}
