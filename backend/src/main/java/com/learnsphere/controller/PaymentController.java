package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.common.annotation.UserOperation;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.UUID;

/**
 * 用户支付控制器 (模拟安全支付)
 */
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final StringRedisTemplate redisTemplate;

    /**
     * 获取支付幂等性 Token
     */
    @GetMapping("/token")
    @UserOperation(module = "payment", action = "get_token", description = "获取支付令牌")
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
    @UserOperation(module = "payment", action = "checkout", description = "购买 VIP", detailKeys = {
            "request.vipLevel", "request.amount"
    })
    public Result<Void> checkout(@RequestBody CheckoutRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();

        // 1. 幂等性检查
        String tokenKey = "pay_token:" + userId + ":" + request.getPaymentToken();
        Boolean deleted = redisTemplate.delete(tokenKey);
        if (Boolean.FALSE.equals(deleted)) {
            return Result.error("支付请求已处理或已过期，请勿重复提交");
        }

        // 2. 基础参数校验
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return Result.error("无效的支付金额");
        }

        // 当前版本停用在线支付，仅允许管理员在后台手动开通 VIP。
        return Result.error("支付功能暂未开放，请联系管理员在后台手动开通会员");
    }

    @Data
    public static class CheckoutRequest {
        private String paymentToken;
        private Integer vipLevel;
        private BigDecimal amount;
    }
}
