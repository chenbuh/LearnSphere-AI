package com.learnsphere.payment;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.function.IntFunction;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class VipUpgradeCalculatorTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 11, 12, 0);
    private static final Map<Integer, BigDecimal> PRICES = Map.of(
            1, new BigDecimal("29.00"), 2, new BigDecimal("69.00"), 3, new BigDecimal("199.00"));
    private static final IntFunction<BigDecimal> PRICE_OF = PRICES::get;

    @Test
    void nonMemberOrExpiredPaysFullPrice() {
        var q = VipUpgradeCalculator.quote(0, null, NOW, 2, PRICE_OF);
        assertEquals(VipUpgradeCalculator.NEW, q.type());
        assertEquals(new BigDecimal("69.00"), q.payable());
        assertNull(q.fromLevel());

        var expired = VipUpgradeCalculator.quote(1, NOW.minusDays(1), NOW, 1, PRICE_OF);
        assertEquals(VipUpgradeCalculator.NEW, expired.type());
    }

    @Test
    void sameLevelIsRenewAndLowerIsDowngrade() {
        assertEquals(VipUpgradeCalculator.RENEW,
                VipUpgradeCalculator.quote(2, NOW.plusDays(10), NOW, 2, PRICE_OF).type());
        assertEquals(VipUpgradeCalculator.DOWNGRADE,
                VipUpgradeCalculator.quote(3, NOW.plusDays(10), NOW, 1, PRICE_OF).type());
    }

    @Test
    void upgradeDeductsRemainingValue() {
        // 月度剩 15 天：29 * 15/30 = 14.50，年度应付 199 - 14.50 = 184.50
        var q = VipUpgradeCalculator.quote(1, NOW.plusDays(15), NOW, 3, PRICE_OF);
        assertEquals(VipUpgradeCalculator.UPGRADE, q.type());
        assertEquals(new BigDecimal("14.50"), q.credit());
        assertEquals(new BigDecimal("184.50"), q.payable());
        assertEquals(15, q.remainingDays());

        // 季度剩 45 天：69 * 45/90 = 34.50，年度应付 164.50
        var q2 = VipUpgradeCalculator.quote(2, NOW.plusDays(45), NOW, 3, PRICE_OF);
        assertEquals(new BigDecimal("34.50"), q2.credit());
        assertEquals(new BigDecimal("164.50"), q2.payable());
    }

    @Test
    void creditIsCappedAndPayableNeverZero() {
        // 后台叠加过很长时长：抵扣最多等于当前套餐价，应付至少 0.01
        var q = VipUpgradeCalculator.quote(1, NOW.plusDays(400), NOW, 2,
                level -> level == 1 ? new BigDecimal("69.00") : new BigDecimal("69.00"));
        assertEquals(new BigDecimal("69.00"), q.credit());
        assertEquals(new BigDecimal("0.01"), q.payable());
    }
}
