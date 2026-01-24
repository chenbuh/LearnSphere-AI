package com.learnsphere.common.aspect;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.annotation.RequireVip;
import com.learnsphere.entity.User;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

/**
 * VIP 权限校验切面
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class VipCheckAspect {

    private final IUserService userService;
    private final StringRedisTemplate redisTemplate;
    private final ISystemConfigService configService;

    @Before("@annotation(requireVip)")
    public void checkVip(JoinPoint point, RequireVip requireVip) {
        // 1. 获取当前用户
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);

        if (user == null) {
            throw new BusinessException(401, "请先登录");
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
            String quotaKey = "quota:user:" + userId + ":" + LocalDate.now();
            String usedCountStr = redisTemplate.opsForValue().get(quotaKey);
            int usedCount = usedCountStr != null ? Integer.parseInt(usedCountStr) : 0;

            // 根据用户VIP等级确定每日配额
            int dailyQuota;
            if (isVip) {
                // VIP用户从数据库获取配额，若未设置则从系统配置获取
                if (user.getDailyAiQuota() != null && user.getDailyAiQuota() > 0) {
                    dailyQuota = user.getDailyAiQuota();
                } else {
                    // 从系统配置获取对应等级的配额
                    String configKey = "ai.limit.daily." + userVipLevel;
                    String defaultConfig = switch (userVipLevel) {
                        case 1 -> "50";
                        case 2 -> "100";
                        case 3 -> "200";
                        default -> "50";
                    };
                    dailyQuota = Integer.parseInt(configService.getConfigValue(configKey, defaultConfig));
                }
            } else {
                // 普通用户从规格配置获取 lv0 的额度
                dailyQuota = Integer.parseInt(configService.getConfigValue("ai.limit.daily.0", "5"));
            }

            if (usedCount >= dailyQuota) {
                // 抛出特定异常，以便上层捕获并降级
                throw new com.learnsphere.exception.QuotaExceededException(
                        String.format("AI 配额不足 (已用 %d/%d)，将尝试本地降级", usedCount, dailyQuota));
            }

            // 5. 获取该功能的配额消耗（从系统配置读取，fallback到注解）
            int quotaCost = getQuotaCostForFeature(requireVip.feature(), requireVip.quotaCost());

            // 6. 扣除配额
            int newCount = usedCount + quotaCost;
            String newCountStr = String.valueOf(newCount);
            redisTemplate.opsForValue().set(quotaKey, newCountStr, 1, TimeUnit.DAYS);

            log.info("用户 {} ({}) 调用 AI 功能【{}】，消耗配额 {}，今日已用 {}/{}",
                    userId, isVip ? "VIP" : "普通", requireVip.feature(),
                    quotaCost, newCount, dailyQuota);
        }
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
