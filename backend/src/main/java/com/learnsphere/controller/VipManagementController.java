package com.learnsphere.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.learnsphere.common.Result;
import com.learnsphere.entity.User;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.mapper.VipOrderMapper;
import com.learnsphere.service.IUserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * VIP 管理控制器
 */
@RestController
@RequestMapping("/api/admin/vip")
@RequiredArgsConstructor
public class VipManagementController {

    private final IUserService userService;
    private final VipOrderMapper vipOrderMapper;

    /**
     * 设置用户 VIP
     */
    @SaCheckRole("admin")
    @PostMapping("/grant")
    @com.learnsphere.common.annotation.AdminOperation(module = "VIP管理", action = "授予VIP权限")
    public Result<?> grantVip(@RequestBody GrantVipRequest request) {
        User user = userService.getById(request.getUserId());
        if (user == null) {
            return Result.error("用户不存在");
        }

        int duration = request.getDuration() == null || request.getDuration() <= 0 ? 1 : request.getDuration();
        LocalDateTime expireTime = user.getVipExpireTime() != null
                && user.getVipExpireTime().isAfter(LocalDateTime.now())
                        ? user.getVipExpireTime()
                        : LocalDateTime.now();
        switch (request.getVipLevel()) {
            case 1: // 月度会员
                expireTime = expireTime.plusMonths(duration);
                break;
            case 2: // 季度会员
                expireTime = expireTime.plusMonths(duration * 3L);
                break;
            case 3: // 年度会员
                expireTime = expireTime.plusYears(duration);
                break;
            default:
                return Result.error("无效的 VIP 等级");
        }

        user.setVipLevel(request.getVipLevel());
        user.setVipExpireTime(expireTime);

        // 根据等级设置默认配额 (月:50, 季:100, 年:200)
        Integer defaultQuota = 50;
        Integer defaultTutorQuota = 400;
        if (request.getVipLevel() == 2)
            defaultQuota = 100;
        if (request.getVipLevel() == 3)
            defaultQuota = 200;
        if (request.getVipLevel() == 2)
            defaultTutorQuota = 800;
        if (request.getVipLevel() == 3)
            defaultTutorQuota = 1500;

        user.setDailyAiQuota(request.getDailyQuota() != null ? request.getDailyQuota() : defaultQuota);
        user.setDailyTutorQuota(defaultTutorQuota);
        userService.updateById(user);

        // 创建仿真订单用于财务统计
        VipOrder order = new VipOrder();
        order.setUserId(user.getId());
        order.setVipLevel(request.getVipLevel());
        order.setAmount(BigDecimal.ZERO);
        order.setStatus("MANUAL_GRANTED");
        order.setCreateTime(LocalDateTime.now());
        vipOrderMapper.insert(order);

        return Result.success("VIP 设置成功");
    }

    /**
     * 取消用户 VIP
     */
    @SaCheckRole("admin")
    @PostMapping("/revoke/{userId}")
    @com.learnsphere.common.annotation.AdminOperation(module = "VIP管理", action = "取消VIP权限")
    public Result<?> revokeVip(@PathVariable Long userId, @RequestBody(required = false) RevokeVipRequest request) {
        User user = userService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentExpireTime = user.getVipExpireTime();
        boolean isActiveVip = currentExpireTime != null && currentExpireTime.isAfter(now);
        String revokeType = request == null || request.getRevokeType() == null || request.getRevokeType().isBlank()
                ? "full"
                : request.getRevokeType().trim().toLowerCase();

        if (!"full".equals(revokeType) && !isActiveVip) {
            return Result.error("用户当前不是有效会员，无法按时长扣减");
        }

        if (!"full".equals(revokeType)) {
            int duration = request.getDuration() == null || request.getDuration() <= 0 ? 1 : request.getDuration();
            LocalDateTime nextExpireTime;
            switch (revokeType) {
                case "day":
                    nextExpireTime = currentExpireTime.minusDays(duration);
                    break;
                case "month":
                    nextExpireTime = currentExpireTime.minusMonths(duration);
                    break;
                case "quarter":
                    nextExpireTime = currentExpireTime.minusMonths(duration * 3L);
                    break;
                case "year":
                    nextExpireTime = currentExpireTime.minusYears(duration);
                    break;
                default:
                    return Result.error("无效的会员扣减方式");
            }

            if (nextExpireTime.isAfter(now)) {
                LambdaUpdateWrapper<User> reduceWrapper = new LambdaUpdateWrapper<>();
                reduceWrapper.eq(User::getId, userId)
                        .set(User::getVipExpireTime, nextExpireTime);

                userService.update(null, reduceWrapper);
                return Result.success("会员时长已扣减，新的到期时间为：" + nextExpireTime);
            }
        }

        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, userId)
                .set(User::getVipLevel, 0)
                .set(User::getVipExpireTime, null)
                .set(User::getDailyAiQuota, 5)
                .set(User::getDailyTutorQuota, 200);

        userService.update(null, updateWrapper);
        return Result.success("VIP 已取消");
    }

    /**
     * 查询用户 VIP 状态
     */
    @GetMapping("/status/{userId}")
    public Result<?> getVipStatus(@PathVariable Long userId) {
        User user = userService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        VipStatusVO status = new VipStatusVO();
        status.setUserId(user.getId());
        status.setUsername(user.getUsername());
        status.setVipLevel(user.getVipLevel());
        status.setVipExpireTime(user.getVipExpireTime());
        status.setDailyAiQuota(user.getDailyAiQuota());

        boolean isVip = user.getVipExpireTime() != null && user.getVipExpireTime().isAfter(LocalDateTime.now());
        status.setIsActive(isVip);

        return Result.success(status);
    }

    @Data
    public static class GrantVipRequest {
        private Long userId;
        private Integer vipLevel; // 1-月度，2-季度，3-年度
        private Integer duration; // 时长（月/季/年的数量）
        private Integer dailyQuota; // 可选，默认 200
    }

    @Data
    public static class RevokeVipRequest {
        private String revokeType; // full/day/month/quarter/year
        private Integer duration; // 扣减数量
    }

    @Data
    public static class VipStatusVO {
        private Long userId;
        private String username;
        private Integer vipLevel;
        private LocalDateTime vipExpireTime;
        private Integer dailyAiQuota;
        private Boolean isActive;
    }
}
