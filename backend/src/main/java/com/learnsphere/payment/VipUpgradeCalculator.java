package com.learnsphere.payment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.function.IntFunction;

/**
 * 会员购买报价：新开 / 续费 / 升级（按剩余天数折算补差价）。
 * <p>
 * 升级时把当前套餐剩余时长按「当前套餐价格 ÷ 套餐天数」折算成抵扣金额，
 * 应付 = 新套餐价格 − 抵扣；支付成功后新套餐从支付时刻重新计时。
 */
public final class VipUpgradeCalculator {

    public static final String NEW = "NEW";
    public static final String RENEW = "RENEW";
    public static final String UPGRADE = "UPGRADE";
    public static final String DOWNGRADE = "DOWNGRADE";

    /** 折算用的套餐天数 */
    public static final Map<Integer, Integer> PLAN_DAYS = Map.of(1, 30, 2, 90, 3, 365);

    private static final BigDecimal MIN_PAYABLE = new BigDecimal("0.01");
    private static final BigDecimal SECONDS_PER_DAY = BigDecimal.valueOf(86_400);

    private VipUpgradeCalculator() {
    }

    public record Quote(String type, int targetLevel, Integer fromLevel, BigDecimal originalPrice,
                        BigDecimal credit, BigDecimal payable, long remainingDays) {
    }

    /**
     * @param currentLevel 当前会员等级（null / 0 表示非会员）
     * @param expireTime   当前会员到期时间
     * @param priceOf      套餐价格（已保留两位小数）
     */
    public static Quote quote(Integer currentLevel, LocalDateTime expireTime, LocalDateTime now,
                              int targetLevel, IntFunction<BigDecimal> priceOf) {
        BigDecimal price = priceOf.apply(targetLevel);
        int level = currentLevel == null ? 0 : currentLevel;
        boolean active = level > 0 && expireTime != null && expireTime.isAfter(now);
        if (!active) {
            return new Quote(NEW, targetLevel, null, price, zero(), price, 0);
        }

        long remainingSeconds = Duration.between(now, expireTime).getSeconds();
        long remainingDays = remainingSeconds / 86_400;
        if (targetLevel == level) {
            return new Quote(RENEW, targetLevel, level, price, zero(), price, remainingDays);
        }
        if (targetLevel < level) {
            return new Quote(DOWNGRADE, targetLevel, level, price, zero(), price, remainingDays);
        }

        BigDecimal currentPrice = priceOf.apply(level);
        BigDecimal planSeconds = BigDecimal.valueOf(PLAN_DAYS.get(level)).multiply(SECONDS_PER_DAY);
        // 剩余价值按秒折算，向下取整到分，且不超过当前套餐价格
        BigDecimal credit = currentPrice.multiply(BigDecimal.valueOf(remainingSeconds))
                .divide(planSeconds, 2, RoundingMode.DOWN)
                .min(currentPrice);
        BigDecimal payable = price.subtract(credit).max(MIN_PAYABLE).setScale(2, RoundingMode.HALF_UP);
        return new Quote(UPGRADE, targetLevel, level, price, credit, payable, remainingDays);
    }

    private static BigDecimal zero() {
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
}
