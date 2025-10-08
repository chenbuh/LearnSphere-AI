package com.learnsphere.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.learnsphere.common.Result;
import com.learnsphere.entity.User;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.mapper.VipOrderMapper;
import com.learnsphere.service.IUserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private VipOrderMapper vipOrderMapper;

    /**
     * 设置用户 VIP
     */
    @SaCheckRole("admin")
    @PostMapping("/grant")
    public Result<?> grantVip(@RequestBody GrantVipRequest request) {
        User user = userService.getById(request.getUserId());
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 计算金额 (简单模拟)
        BigDecimal amount = BigDecimal.ZERO;
        LocalDateTime expireTime = LocalDateTime.now();
        switch (request.getVipLevel()) {
            case 1: // 月度会员
                amount = new BigDecimal("29.9");
                expireTime = expireTime.plusMonths(request.getDuration());
                break;
            case 2: // 季度会员
                amount = new BigDecimal("79.9");
                expireTime = expireTime.plusMonths(request.getDuration() * 3);
                break;
            case 3: // 年度会员
                amount = new BigDecimal("299.9");
                expireTime = expireTime.plusYears(request.getDuration());
                break;
            default:
                return Result.error("无效的 VIP 等级");
        }

        user.setVipLevel(request.getVipLevel());
        user.setVipExpireTime(expireTime);
        user.setDailyAiQuota(request.getDailyQuota() != null ? request.getDailyQuota() : 200);
        userService.updateById(user);

        // 创建仿真订单用于财务统计
        VipOrder order = new VipOrder();
        order.setUserId(user.getId());
        order.setVipLevel(request.getVipLevel());
        order.setDuration(request.getDuration());
        order.setAmount(amount);
        order.setStatus("PAID");
        order.setCreateTime(LocalDateTime.now());
        order.setPayTime(LocalDateTime.now());
        vipOrderMapper.insert(order);

        return Result.success("VIP 设置成功");
    }

    /**
     * 取消用户 VIP
     */
    @SaCheckRole("admin")
    @PostMapping("/revoke/{userId}")
    public Result<?> revokeVip(@PathVariable Long userId) {
        User user = userService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        user.setVipLevel(0);
        user.setVipExpireTime(null);
        user.setDailyAiQuota(0);

        userService.updateById(user);
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
    public static class VipStatusVO {
        private Long userId;
        private String username;
        private Integer vipLevel;
        private LocalDateTime vipExpireTime;
        private Integer dailyAiQuota;
        private Boolean isActive;
    }
}
