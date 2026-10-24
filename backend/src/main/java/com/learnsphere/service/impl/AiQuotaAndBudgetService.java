package com.learnsphere.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.entity.User;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.exception.QuotaExceededException;
import com.learnsphere.service.IUserService;
import com.learnsphere.service.ISystemConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

/**
 * AI 配额与预算服务。
 *
 * <p>从 {@link AIGenerationServiceImpl}（原 3367 行）中抽出的独立职责：
 * 用户每日 AI 调用配额的预占/提交/回滚、配额数值解析，以及每日成本预算的
 * 检查与告警。这部分逻辑不依赖任何内容生成流程，仅依赖用户服务、系统配置
 * 与 Redis，因此可以独立演进与测试。
 *
 * <p>配额键格式：{@code quota:user:{userId}:{yyyy-MM-dd}}，TTL 1 天。
 * 预算键格式：{@code ai:cost:daily:{yyyy-MM-dd}}。
 *
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class AiQuotaAndBudgetService {

    /** 每日预算配置键（美元） */
    private static final String BUDGET_CONFIG_KEY = "ai_daily_budget_usd";

    /** 预算默认值（美元/天） */
    private static final String BUDGET_DEFAULT = "5.0";

    @Autowired
    private IUserService userService;

    @Autowired
    private ISystemConfigService systemConfigService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 配额预占凭证。
     *
     * <p>{@code active} 表示该笔配额仍处于「已预占未结算」状态：调用成功时由
     * {@link #commitAiQuota} 置为 false 完成结算；调用失败时由
     * {@link #rollbackAiQuota} 置为 false 并退还配额。重复提交/回滚会被忽略。
     */
    public static final class AiQuotaReservation {
        private final Long userId;
        private final String quotaKey;
        private final int quotaCost;
        private final int dailyQuota;
        private final int usedToday;
        private boolean active;

        private AiQuotaReservation(Long userId, String quotaKey, int quotaCost, int dailyQuota, int usedToday) {
            this.userId = userId;
            this.quotaKey = quotaKey;
            this.quotaCost = quotaCost;
            this.dailyQuota = dailyQuota;
            this.usedToday = usedToday;
            this.active = true;
        }

        public boolean isActive() {
            return active;
        }
    }

    /**
     * 预占一次 AI 调用的配额。
     *
     * <p>先原子自增计数，若超出当日额度则立即回退并抛出
     * {@link QuotaExceededException}，由上层捕获后走本地降级逻辑。
     *
     * @param feature     功能名称（用于解析配额单价与日志）
     * @param defaultCost 配置缺失时的默认配额消耗
     * @return 预占凭证，调用方必须在成功/失败后分别 commit 或 rollback
     * @throws BusinessException     未登录或用户不存在
     * @throws QuotaExceededException 当日配额不足
     */
    public AiQuotaReservation reserveAiQuota(String feature, int defaultCost) {
        if (!StpUtil.isLogin()) {
            throw new BusinessException(401, "请先登录");
        }

        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);
        if (user == null) {
            throw new BusinessException(401, "用户不存在，请重新登录");
        }

        int quotaCost = resolveAiQuotaCost(feature, defaultCost);
        int dailyQuota = resolveDailyAiQuota(user);
        String quotaKey = "quota:user:" + userId + ":" + LocalDate.now();

        Long usedAfterReserve = redisTemplate.opsForValue().increment(quotaKey, quotaCost);
        redisTemplate.expire(quotaKey, 1, TimeUnit.DAYS);

        int usedToday = usedAfterReserve == null ? quotaCost : usedAfterReserve.intValue();
        if (usedToday > dailyQuota) {
            redisTemplate.opsForValue().increment(quotaKey, -quotaCost);
            throw new QuotaExceededException(
                    String.format("AI 配额不足 (已用 %d/%d)，将尝试本地降级", Math.max(0, usedToday - quotaCost), dailyQuota));
        }

        return new AiQuotaReservation(userId, quotaKey, quotaCost, dailyQuota, usedToday);
    }

    /**
     * 结算配额：调用成功，预占的配额正式计入当日消耗。
     */
    public void commitAiQuota(AiQuotaReservation reservation, String feature) {
        if (reservation == null || !reservation.active) {
            return;
        }
        reservation.active = false;
        log.info("用户 {} 调用 AI 功能【{}】，消耗配额 {}，今日已用 {}/{}",
                reservation.userId, feature, reservation.quotaCost, reservation.usedToday, reservation.dailyQuota);
    }

    /**
     * 回滚配额：调用失败，退还已预占的配额。
     */
    public void rollbackAiQuota(AiQuotaReservation reservation, String feature) {
        if (reservation == null || !reservation.active) {
            return;
        }

        redisTemplate.opsForValue().increment(reservation.quotaKey, -reservation.quotaCost);
        reservation.active = false;
        log.info("用户 {} 调用 AI 功能【{}】失败，已回滚配额 {}",
                reservation.userId, feature, reservation.quotaCost);
    }

    /**
     * 解析用户当日 AI 配额上限。
     *
     * <p>优先级：用户表显式配置的 {@code dailyAiQuota}（&gt;= 0 时生效）&gt;
     * VIP 等级对应配置 &gt; 免费用户默认值。
     */
    public int resolveDailyAiQuota(User user) {
        LocalDateTime vipExpireTime = user.getVipExpireTime();
        boolean isVip = vipExpireTime != null && vipExpireTime.isAfter(LocalDateTime.now());
        int userVipLevel = user.getVipLevel() != null ? user.getVipLevel() : 0;

        if (user.getDailyAiQuota() != null && user.getDailyAiQuota() >= 0) {
            return user.getDailyAiQuota();
        }

        if (isVip) {
            String configKey = "ai.limit.daily." + userVipLevel;
            String defaultConfig = switch (userVipLevel) {
                case 1 -> "100";
                case 2 -> "120";
                case 3 -> "150";
                default -> "100";
            };
            return Integer.parseInt(systemConfigService.getConfigValue(configKey, defaultConfig));
        }

        return Integer.parseInt(systemConfigService.getConfigValue("ai.limit.daily.0", "15"));
    }

    /**
     * 解析某个 AI 功能的配额单价，配置缺失或非法时回退到 {@code defaultCost}。
     */
    public int resolveAiQuotaCost(String feature, int defaultCost) {
        String configKey = switch (feature) {
            case "AI 阅读理解生成" -> "quota_cost_reading";
            case "AI 写作题目生成" -> "quota_cost_writing_topic";
            case "AI 写作批改" -> "quota_cost_writing_eval";
            case "AI 听力生成" -> "quota_cost_listening";
            case "AI 语法生成" -> "quota_cost_grammar";
            case "AI 口语生成" -> "quota_cost_speaking_topic";
            case "AI 口语评测" -> "quota_cost_speaking_eval";
            case "AI 错题深度分析" -> "quota_cost_error_analysis";
            case "AI 口语1V1模考" -> "quota_cost_speaking_mock";
            case "AI 模拟考试生成" -> "quota_cost_mock_exam";
            case "AI 助教提问" -> "quota_cost_ai_tutor";
            default -> null;
        };

        if (configKey == null) {
            return defaultCost;
        }

        String configValue = systemConfigService.getConfigValue(configKey, String.valueOf(defaultCost));
        try {
            return Integer.parseInt(configValue);
        } catch (NumberFormatException e) {
            log.warn("配额配置 {} 的值 {} 无效，使用默认值 {}", configKey, configValue, defaultCost);
            return defaultCost;
        }
    }

    /**
     * 按模型名返回每 1K token 的成本（美元）。
     *
     * <p>前缀匹配覆盖 Qwen3.5 系列的 -latest / -instruct / 规模后缀等变体，
     * 精确匹配兜底 Qwen 经典系列，未知模型返回 0.001。
     */
    public double getCostPer1kTokens(String modelString) {
        if (modelString == null) {
            return 0.0;
        }
        String model = modelString.toLowerCase(Locale.ROOT).trim();

        // Qwen3.5 系列（覆盖 -latest / -instruct / 规模后缀等变体）
        if (model.startsWith("qwen3.5-max")) {
            return 0.012;
        }
        if (model.startsWith("qwen3.5-plus") || model.startsWith("qwen3.5-coder-plus")) {
            return 0.002;
        }
        if (model.startsWith("qwen3.5-turbo") || model.startsWith("qwen3.5-coder-turbo")
                || model.startsWith("qwen3.5-audio-turbo")) {
            return 0.0003;
        }
        if (model.startsWith("qwen3.5-long")) {
            return 0.002;
        }
        if (model.startsWith("qwen3.5-vl") || model.startsWith("qwen3.5-omni")) {
            return 0.003;
        }

        switch (model) {
            case "qwen-max":
            case "qwen-max-latest":
                return 0.012;
            case "qwen-plus":
            case "qwen-plus-latest":
                return 0.002;
            case "qwen-turbo":
            case "qwen-turbo-latest":
                return 0.0003;
            default:
                return 0.001;
        }
    }

    /**
     * 判断当日 AI 成本是否已超出预算。
     *
     * <p>预算检查失败时放行请求（返回 false），避免因配置或 Redis 异常
     * 导致整个 AI 功能不可用。
     */
    public boolean isBudgetExceeded() {
        try {
            String budgetStr = systemConfigService.getConfigValue(BUDGET_CONFIG_KEY, BUDGET_DEFAULT);
            double budget = Double.parseDouble(budgetStr);
            String costKey = getDailyCostKey();
            Object costObj = redisTemplate.opsForValue().get(costKey);
            if (costObj != null) {
                double currentCost = Double.parseDouble(costObj.toString());
                return currentCost >= budget;
            }
        } catch (Exception e) {
            log.warn("Budget check failed, allowing request: {}", e.getMessage());
        }
        return false;
    }

    /**
     * 当日成本在 Redis 中的键。
     */
    public String getDailyCostKey() {
        return "ai:cost:daily:" + LocalDate.now();
    }

    /**
     * 成本达到预算 80% / 90% 时输出告警日志。
     */
    public void maybeWarnBudget(String costKey) {
        if (redisTemplate == null) {
            return;
        }
        try {
            String budgetStr = systemConfigService.getConfigValue(BUDGET_CONFIG_KEY, BUDGET_DEFAULT);
            double budget = Double.parseDouble(budgetStr);
            Object costObj = redisTemplate.opsForValue().get(costKey);
            if (costObj != null) {
                double currentCost = Double.parseDouble(costObj.toString());
                if (currentCost >= budget * 0.9) {
                    log.error("CRITICAL: AI daily budget reached 90%! Current: ${}, Budget: ${}", currentCost, budget);
                } else if (currentCost >= budget * 0.8) {
                    log.warn("WARNING: AI daily budget reached 80%.");
                }
            }
        } catch (Exception e) {
            log.warn("Budget check failed: {}", e.getMessage());
        }
    }
}
