package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.entity.User;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.mapper.VipOrderMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户支付控制器 (模拟安全支付)
 */
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final UserMapper userMapper;
    private final VipOrderMapper vipOrderMapper;
    private final StringRedisTemplate redisTemplate;

    /**
     * 获取支付幂等性 Token
     */
    @GetMapping("/token")
    public Result<String> getPaymentToken() {
        String token = UUID.randomUUID().toString();
        Long userId = StpUtil.getLoginIdAsLong();
        // 存储 Token，5分钟内有效
        Duration duration = Duration.ofMinutes(5);
        java.util.Objects.requireNonNull(duration);
        redisTemplate.opsForValue().set("pay_token:" + userId + ":" + token, "1", duration);
        return Result.success(token);
    }

    /**
     * 模拟安全支付请求
     */
    @RateLimit(time = 60, count = 3, limitType = RateLimit.LimitType.USER)
    @PostMapping("/checkout")
    public Result<Void> checkout(@RequestBody CheckoutRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();

        // 1. 幂等性检查
        String tokenKey = "pay_token:" + userId + ":" + request.getPaymentToken();
        Boolean deleted = redisTemplate.delete(tokenKey);
        if (Boolean.FALSE.equals(deleted)) {
            return Result.error("支付请求已处理或已过期，请勿重复提交");
        }

        // 2. 模拟防重放 & 验证逻辑 (演示目的)
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error("无效的支付金额");
        }

        // 3. 处理订单与 VIP 升级
        User user = userMapper.selectById(userId);
        if (user == null)
            return Result.error("用户不存在");

        LocalDateTime expireTime = user.getVipExpireTime() != null
                && user.getVipExpireTime().isAfter(LocalDateTime.now())
                        ? user.getVipExpireTime()
                        : LocalDateTime.now();

        int dailyQuota;
        switch (request.getVipLevel()) {
            case 1:
                expireTime = expireTime.plusMonths(1);
                dailyQuota = 50;
                break;
            case 2:
                expireTime = expireTime.plusMonths(3);
                dailyQuota = 100;
                break;
            case 3:
                expireTime = expireTime.plusYears(1);
                dailyQuota = 200;
                break;
            default:
                return Result.error("无效的方案");
        }

        user.setVipLevel(request.getVipLevel());
        user.setVipExpireTime(expireTime);
        user.setDailyAiQuota(dailyQuota);
        userMapper.updateById(user);

        // 4. 记录订单
        VipOrder order = new VipOrder();
        order.setUserId(userId);
        order.setVipLevel(request.getVipLevel());
        order.setAmount(request.getAmount());
        order.setStatus("PAID");
        order.setCreateTime(LocalDateTime.now());
        order.setPayTime(LocalDateTime.now());
        vipOrderMapper.insert(order);

        return Result.successMessage("支付成功，VIP 权益已解锁");
    }

    @Data
    public static class CheckoutRequest {
        private String paymentToken;
        private Integer vipLevel;
        private BigDecimal amount;
    }
}
