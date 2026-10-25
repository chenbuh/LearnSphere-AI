package com.learnsphere.common.aspect;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.annotation.RequireVip;
import com.learnsphere.entity.User;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * VIP 权限校验切面
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class VipCheckAspect {

    /**
     * 降级标记键。业务方法在「AI 调用失败但已回退到本地内容」时会把这个键设为降级来源。
     * 切面据此判断本次是否真的消耗了 AI 额度——没调用成功就不该扣。
     */
    private static final String FALLBACK_FLAG = "_from";

    /**
     * 所有表示「非 AI 产出」的来源标记。
     *
     * <p>目前代码里有两个：{@code local}（本地题库）和 {@code mock}（兜底生成器）。
     * 两者都意味着 AI 没有真正返回内容，都不应消耗额度。
     *
     * <p>这个集合必须与业务侧实际写入的值保持同步——漏掉一个就会导致
     * 该降级路径下用户被白扣额度。新增降级来源时记得同步这里。
     */
    private static final java.util.Set<String> FALLBACK_SOURCES =
            java.util.Set.of("local", "mock");

    private final IUserService userService;
    private final StringRedisTemplate redisTemplate;
    private final ISystemConfigService configService;

    /**
     * 校验 VIP 与配额，并在业务执行失败时退还已扣额度。
     *
     * <p>为什么从 {@code @Before} 改成 {@code @Around}：配额是前置扣减的，
     * 原实现无论业务是否成功都不退还，导致 AI 上游超时/报错时用户白掉次数。
     * 现在只有两种情况保留扣减：
     * <ol>
     *   <li>方法正常返回，且返回值<b>没有</b>标记为本地降级；</li>
     *   <li>方法正常返回，且返回值不是 Map（无法判断降级，按成功处理）。</li>
     * </ol>
     * 其余情况（抛异常、或返回 {@code _from=local} 的降级结果）一律退还。
     */
    @Around("@annotation(requireVip)")
    public Object checkVip(ProceedingJoinPoint point, RequireVip requireVip) throws Throwable {
        QuotaCharge charge = reserveQuota(requireVip);
        boolean success = false;
        try {
            Object result = point.proceed();
            // 降级到本地题库说明 AI 没有真正产出，不该扣额度
            success = !isLocalFallback(result);
            if (!success) {
                log.info("功能【{}】本次走本地降级，未消耗 AI 额度", requireVip.feature());
            }
            return result;
        } finally {
            if (!success) {
                refundQuota(charge, requireVip.feature());
            }
        }
    }

    /**
     * 判断返回值是否表示「已降级到本地内容」。
     *
     * <p>只认显式标记 {@code _from}。之所以不猜别的字段：
     * 猜错会导致本该收费的成功调用被退款，属于资金方向的风险，必须保守。
     *
     * <p>注意 {@code _from} 有两个降级取值 {@code local} 与 {@code mock}，
     * 两者都代表 AI 没真正产出。只判断其中一个会漏掉另一条降级路径。
     */
    private boolean isLocalFallback(Object result) {
        if (!(result instanceof Map<?, ?> map)) return false;
        Object from = map.get(FALLBACK_FLAG);
        return from != null && FALLBACK_SOURCES.contains(String.valueOf(from).toLowerCase(java.util.Locale.ROOT));
    }

    /** 已扣额度的凭据，用于失败时精确退还。 */
    private record QuotaCharge(String quotaKey, int cost, Long userId, String feature) {
        boolean charged() {
            return quotaKey != null && cost > 0;
        }
    }

    /**
     * 退还额度。用 decrement 而非 delete，避免把当天其它成功调用累积的计数一起清掉。
     */
    private void refundQuota(QuotaCharge charge, String feature) {
        if (charge == null || !charge.charged()) return;
        try {
            Long after = redisTemplate.opsForValue().decrement(charge.quotaKey(), charge.cost());
            if (after != null && after <= 0) {
                // 回退到 0 或以下，说明当天没有其它消费，直接清理键
                redisTemplate.delete(charge.quotaKey());
            }
            log.info("用户 {} 的功能【{}】执行失败，已退还配额 {}，当前已用 {}",
                    charge.userId(), feature, charge.cost(), Math.max(0L, after == null ? 0L : after));
        } catch (RuntimeException error) {
            // 退款失败不能影响业务异常向上抛，但必须留下明确日志供人工补偿
            log.error("退还配额失败，需人工核对：userId={}, feature={}, cost={}, key={}",
                    charge.userId(), feature, charge.cost(), charge.quotaKey(), error);
        }
    }

    private QuotaCharge reserveQuota(RequireVip requireVip) {
        // 1. 获取当前登录 ID
        Object loginIdObj = StpUtil.getLoginId();
        if (loginIdObj == null) {
            throw new BusinessException(401, "请先登录");
        }

        String loginId = String.valueOf(loginIdObj);

        // 2. 超级权限：管理员标识符处理 (格式如 admin:1)
        if (loginId.startsWith("admin:")) {
            log.info("【管理后台】检测到管理员身份 [{}]，跳过 AI 配额与 VIP 校检", loginId);
            return null;
        }

        // 3. 普通用户流程
        Long userId = Long.valueOf(loginId);
        User user = userService.getById(userId);

        if (user == null) {
            throw new BusinessException(401, "用户不存在，请重新登录");
        }

        // 2. 检查是否是 VIP
        LocalDateTime vipExpireTime = user.getVipExpireTime();
        boolean isVip = vipExpireTime != null && vipExpireTime.isAfter(LocalDateTime.now());
        Integer userVipLevel = user.getVipLevel() != null ? user.getVipLevel() : 0;

        // 3. 检查 VIP 等级（如果要求必须是VIP才能使用，即minLevel >= 1）
        if (requireVip.minLevel() >= 1 && !isVip) {
            throw new BusinessException(403,
                    String.format("此功能仅限 VIP 会员使用，请升级会员以解锁【%s】功能", requireVip.feature()));
        }

        if (isVip && userVipLevel < requireVip.minLevel()) {
            throw new BusinessException(403,
                    String.format("此功能需要更高等级的 VIP 会员，当前等级：%d，所需等级：%d",
                            userVipLevel, requireVip.minLevel()));
        }

        // 4. 检查每日配额
        if (requireVip.checkQuota()) {
            // 根据功能类别选择配额字段
            boolean isTutor = "AI 助教提问".equals(requireVip.feature());

            // 普通 AI 功能共享同一个每日总额度；AI 助教使用独立额度
            String quotaKey = isTutor
                    ? "quota:user:" + userId + ":" + LocalDate.now() + ":" + requireVip.feature()
                    : "quota:user:" + userId + ":" + LocalDate.now();

            Integer userQuota = isTutor ? user.getDailyTutorQuota() : user.getDailyAiQuota();
            String configKeyPrefix = isTutor ? "ai.tutor.limit.daily." : "ai.limit.daily.";

            int dailyQuota;
            if (userQuota != null && userQuota >= 0) {
                // 1. 优先使用账户级独立配额
                dailyQuota = userQuota;
            } else if (isVip) {
                // 2. VIP 从系统配置获取对应等级的配额
                String configKey = configKeyPrefix + userVipLevel;
                String defaultConfig = switch (userVipLevel) {
                    case 1 -> isTutor ? "100" : "100";
                    case 2 -> isTutor ? "150" : "120";
                    case 3 -> isTutor ? "200" : "150";
                    default -> isTutor ? "100" : "100";
                };
                dailyQuota = Integer.parseInt(configService.getConfigValue(configKey, defaultConfig));
            } else {
                // 3. 普通用户从系统设置获取
                String configKey = configKeyPrefix + "0";
                dailyQuota = Integer.parseInt(configService.getConfigValue(configKey, isTutor ? "20" : "15"));
            }

            // 5. 获取该功能的配额消耗（从系统配置读取，fallback到注解）
            int quotaCost = getQuotaCostForFeature(requireVip.feature(), requireVip.quotaCost());
            if (quotaCost < 0) {
                // 配额消耗为负值会导致「越用越多」，是配置错误，直接拒绝
                log.error("功能【{}】的配额消耗配置为负数({})，已拒绝本次调用",
                        requireVip.feature(), quotaCost);
                throw new BusinessException(500, "配额配置异常，请联系管理员");
            }

            /*
             * ================================================================
             * 安全修复（2026-03）：配额扣减竞态条件（TOCTOU）
             * ----------------------------------------------------------------
             * 原实现为非原子的「读-判-写」三步：
             *
             *     int usedCount = opsForValue().get(quotaKey);       // ① 读
             *     if (usedCount >= dailyQuota) throw ...;            // ② 判
             *     opsForValue().set(quotaKey, usedCount + cost);     // ③ 写（覆盖）
             *
             * 并发场景下，两个线程会读到同一个 usedCount，各自加 1 后先后
             * set 写回相同值，后写覆盖先写 —— N 个并发请求只扣 1 次配额。
             * 攻击者据此可并发调用 AI 接口无限消费，直接造成上游 API 计费损失。
             *
             * 修复：改用 Redis 原子自增（与 RateLimitAspect 的做法保持一致）。
             *   - increment() 在 Redis 端单线程执行，并发安全；
             *   - 首次递增时（返回值为本次增量）补设过期时间；
             *   - 若递增后超过配额，则回滚（decrement）并抛异常，
             *     避免「超额请求」把计数永久推高从而锁死当日剩余额度。
             * ================================================================
             */
            Long newCount = redisTemplate.opsForValue().increment(quotaKey, quotaCost);

            if (newCount == null) {
                // Redis 异常，按保守策略拒绝（宁可少放行，不可超发）
                log.error("配额计数失败：quotaKey={}，已拒绝本次调用以保护配额", quotaKey);
                throw new BusinessException(500, "配额服务暂时不可用，请稍后重试");
            }

            if (newCount == quotaCost) {
                // 本次为当日首次递增，补设过期时间，保证次日自动重置
                redisTemplate.expire(quotaKey, Duration.ofDays(1));
            }

            if (newCount > dailyQuota) {
                // 超限：回滚本次预扣，避免计数被超额请求推高
                Long rolledBack = redisTemplate.opsForValue().decrement(quotaKey, quotaCost);
                if (rolledBack != null && rolledBack <= 0) {
                    // 已回滚至 0 或以下，清理键
                    redisTemplate.delete(quotaKey);
                }
                // 抛出特定异常，以便上层捕获并降级
                throw new com.learnsphere.exception.QuotaExceededException(
                        String.format("AI 配额不足 (已用 %d/%d)，将尝试本地降级",
                                Math.max(0L, newCount - quotaCost), dailyQuota));
            }

            log.info("用户 {} ({}) 调用 AI 功能【{}】，消耗配额 {}，今日已用 {}/{}",
                    userId, isVip ? "VIP" : "普通", requireVip.feature(),
                    quotaCost, newCount, dailyQuota);
            return new QuotaCharge(quotaKey, quotaCost, userId, requireVip.feature());
        }
        return null;
    }

    /**
     * 根据功能名称获取配额消耗值
     * 优先从系统配置读取，若未配置则使用注解的默认值
     */
    private int getQuotaCostForFeature(String feature, int defaultCost) {
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

        if (configKey != null) {
            String value = configService.getConfigValue(configKey, String.valueOf(defaultCost));
            try {
                return Integer.parseInt(value);
            } catch (NumberFormatException e) {
                log.warn("配额配置 {} 的值 {} 无效，使用默认值 {}", configKey, value, defaultCost);
                return defaultCost;
            }
        }

        return defaultCost;
    }
}
