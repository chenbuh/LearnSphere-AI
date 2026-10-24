package com.learnsphere.service.impl;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * {@link AnalysisMathUtils} 的单元测试。
 *
 * <p>这些方法从 AIGenerationServiceImpl 抽出后由学习分析、推荐、简报等多个
 * 模块共用，属于纯函数，直接验证边界行为。
 */
class AnalysisMathUtilsTest {

    @Test
    void safeInt_handlesNumbersStringsAndNull() {
        assertEquals(42, AnalysisMathUtils.safeInt(42));
        assertEquals(42, AnalysisMathUtils.safeInt(42.9));
        assertEquals(42, AnalysisMathUtils.safeInt("42"));
        assertEquals(0, AnalysisMathUtils.safeInt(null));
        assertEquals(0, AnalysisMathUtils.safeInt("not-a-number"));
        assertEquals(0, AnalysisMathUtils.safeInt(new Object()));
    }

    @Test
    void safeLong_handlesNumbersStringsAndNull() {
        assertEquals(9007199254740993L, AnalysisMathUtils.safeLong("9007199254740993"));
        assertEquals(7L, AnalysisMathUtils.safeLong(7));
        assertEquals(0L, AnalysisMathUtils.safeLong(null));
        assertEquals(0L, AnalysisMathUtils.safeLong("x"));
    }

    @Test
    void safeDouble_handlesNumbersStringsAndNull() {
        assertEquals(3.14, AnalysisMathUtils.safeDouble("3.14"), 1e-9);
        assertEquals(2.0, AnalysisMathUtils.safeDouble(2), 1e-9);
        assertEquals(0.0, AnalysisMathUtils.safeDouble(null), 1e-9);
        assertEquals(0.0, AnalysisMathUtils.safeDouble("abc"), 1e-9);
    }

    @Test
    void roundToOneDecimal_roundsHalfUp() {
        assertEquals(1.3, AnalysisMathUtils.roundToOneDecimal(1.25), 1e-9);
        assertEquals(1.2, AnalysisMathUtils.roundToOneDecimal(1.24), 1e-9);
        assertEquals(0.0, AnalysisMathUtils.roundToOneDecimal(0.0), 1e-9);
    }

    @Test
    void calculateAccuracyPercent_returnsZeroForEmptyOrInvalidStats() {
        assertEquals(0.0, AnalysisMathUtils.calculateAccuracyPercent(null), 1e-9);
        assertEquals(0.0, AnalysisMathUtils.calculateAccuracyPercent(new HashMap<>()), 1e-9);

        Map<String, Object> zeroTotal = new HashMap<>();
        zeroTotal.put("totalCount", 0);
        zeroTotal.put("correctCount", 0);
        assertEquals(0.0, AnalysisMathUtils.calculateAccuracyPercent(zeroTotal), 1e-9);
    }

    @Test
    void calculateAccuracyPercent_computesRoundedPercent() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", 3);
        stats.put("correctCount", 2);
        // 2/3 = 66.666... → 66.7
        assertEquals(66.7, AnalysisMathUtils.calculateAccuracyPercent(stats), 1e-9);
    }

    @Test
    void calculateGrowth_returnsZeroWhenEitherWindowEmpty() {
        Map<String, Object> recent = new HashMap<>();
        recent.put("totalCount", 10);
        recent.put("correctCount", 8);

        assertEquals(0, AnalysisMathUtils.calculateGrowth(recent, null));
        assertEquals(0, AnalysisMathUtils.calculateGrowth(null, recent));
        assertEquals(0, AnalysisMathUtils.calculateGrowth(null, null));
    }

    @Test
    void calculateGrowth_returnsPercentagePointDelta() {
        Map<String, Object> recent = new HashMap<>();
        recent.put("totalCount", 10);
        recent.put("correctCount", 8); // 80%

        Map<String, Object> previous = new HashMap<>();
        previous.put("totalCount", 10);
        previous.put("correctCount", 6); // 60%

        assertEquals(20, AnalysisMathUtils.calculateGrowth(recent, previous));
    }

    @Test
    void calculateGrowth_reportsNegativeWhenDeclining() {
        Map<String, Object> recent = new HashMap<>();
        recent.put("totalCount", 10);
        recent.put("correctCount", 5); // 50%

        Map<String, Object> previous = new HashMap<>();
        previous.put("totalCount", 10);
        previous.put("correctCount", 9); // 90%

        assertEquals(-40, AnalysisMathUtils.calculateGrowth(recent, previous));
    }

    @Test
    void calculatePredictScore_mapsAbilityToCetScale() {
        // 换算公式：425 + (overall - 60) * 5.625
        // 60 能力值 = 425（及格线）
        assertEquals(425, AnalysisMathUtils.calculatePredictScore(60));
        // 80 能力值 = 425 + 20*5.625 = 537.5 → 538
        assertEquals(538, AnalysisMathUtils.calculatePredictScore(80));
        // 100 能力值 = 425 + 40*5.625 = 650
        assertEquals(650, AnalysisMathUtils.calculatePredictScore(100));
    }

    @Test
    void calculatePredictScore_clampsToValidRange() {
        assertEquals(0, AnalysisMathUtils.calculatePredictScore(0));
        assertEquals(0, AnalysisMathUtils.calculatePredictScore(-10));
        // 极高能力值不应超过满分 710
        assertEquals(710, AnalysisMathUtils.calculatePredictScore(200));
    }
}
