package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.CheckSensitive;
import com.learnsphere.entity.User;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.ICheckinService;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户相关接口
 * 包括个人信息、统计、打卡、排行榜
 */
@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "用户信息接口", description = "个人中心、配额查询、打卡及排行榜")
public class UserController {

    private final ICheckinService checkinService;
    private final IUserService userService;
    private final UserMapper userMapper;
    private final StringRedisTemplate redisTemplate;

    /**
     * 获取用户个人信息及统计数据
     */
    @Operation(summary = "获取个人资料及统计")
    @GetMapping("/info")
    public Result<Map<String, Object>> getUserInfo() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userMapper.selectById(userId);

        if (user == null) {
            return Result.error("用户不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("nickname", user.getNickname());
        data.put("bio", user.getBio() == null ? "这家伙很懒，什么都没留下" : user.getBio());
        data.put("avatar", user.getAvatar());
        data.put("consecutiveDays", user.getConsecutiveDays() == null ? 0 : user.getConsecutiveDays());
        data.put("totalCheckinDays", user.getTotalCheckinDays() == null ? 0 : user.getTotalCheckinDays());
        data.put("lastCheckinDate", user.getLastCheckinDate());
        // 实际上 checkinService 的 getConsecutiveDays 会判断中断情况，更准确
        data.put("realConsecutiveDays", checkinService.getConsecutiveDays(userId));

        // VIP 信息
        data.put("vipLevel", user.getVipLevel() != null ? user.getVipLevel() : 0);
        data.put("vipExpireTime", user.getVipExpireTime());
        data.put("dailyAiQuota", user.getDailyAiQuota() != null ? user.getDailyAiQuota() : 0);
        data.put("dailyTutorQuota", user.getDailyTutorQuota() != null ? user.getDailyTutorQuota() : 0);
        data.put("points", user.getPoints() == null ? 0 : user.getPoints());

        // 判断是否是有效 VIP
        boolean isVip = user.getVipExpireTime() != null &&
                user.getVipExpireTime().isAfter(LocalDateTime.now());
        data.put("isVip", isVip);

        return Result.success(data);
    }

    /**
     * 获取今日配额使用情况
     */
    @Operation(summary = "获取今日 AI 配额")
    @GetMapping("/quota")
    public Result<Map<String, Object>> getQuotaInfo() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userMapper.selectById(userId);

        if (user == null) {
            return Result.error("用户不存在");
        }

        Map<String, Object> data = new HashMap<>();

        // 判断是否是有效 VIP
        boolean isVip = user.getVipExpireTime() != null &&
                user.getVipExpireTime().isAfter(LocalDateTime.now());
        Integer vipLevel = user.getVipLevel() != null ? user.getVipLevel() : 0;

        // 根据用户状态确定每日配额
        int dailyQuota;
        if (isVip) {
            // VIP用户从数据库获取配额，若未设置则按等级给予默认值
            if (user.getDailyAiQuota() != null && user.getDailyAiQuota() > 0) {
                dailyQuota = user.getDailyAiQuota();
            } else {
                // 默认配额：月度50，季度100，年度200
                switch (vipLevel) {
                    case 1:
                        dailyQuota = 50;
                        break;
                    case 2:
                        dailyQuota = 100;
                        break;
                    case 3:
                        dailyQuota = 200;
                        break;
                    default:
                        dailyQuota = 50;
                }
            }
        } else {
            // 普通用户每天5次免费额度
            dailyQuota = 5;
        }

        data.put("dailyQuota", dailyQuota);
        data.put("isVip", isVip);
        data.put("vipLevel", vipLevel);

        // 从 Redis 获取今日已使用次数
        String quotaKey = "quota:user:" + userId + ":" + LocalDate.now();
        String usedStr = redisTemplate.opsForValue().get(quotaKey);
        int usedToday = usedStr != null ? Integer.parseInt(usedStr) : 0;

        data.put("usedToday", usedToday);
        data.put("remainingToday", Math.max(0, dailyQuota - usedToday));

        // 计算使用百分比
        // 计算使用百分比
        double usagePercent = dailyQuota > 0 ? (usedToday * 100.0 / dailyQuota) : 0;
        data.put("usagePercent", Math.round(usagePercent * 10.0) / 10.0);

        // --- AI 助教专项配额 ---
        int dailyTutorQuota;
        if (user.getDailyTutorQuota() != null && user.getDailyTutorQuota() >= 0) {
            dailyTutorQuota = user.getDailyTutorQuota();
        } else if (isVip) {
            dailyTutorQuota = switch (vipLevel) {
                case 1 -> 400;
                case 2 -> 800;
                case 3 -> 1500;
                default -> 400;
            };
        } else {
            dailyTutorQuota = 200; // 普通用户默认 200 次
        }

        String tutorQuotaKey = "quota:user:" + userId + ":" + LocalDate.now() + ":AI 助教提问";
        String tutorUsedStr = redisTemplate.opsForValue().get(tutorQuotaKey);
        int tutorUsedToday = tutorUsedStr != null ? Integer.parseInt(tutorUsedStr) : 0;

        data.put("dailyTutorQuota", dailyTutorQuota);
        data.put("tutorUsedToday", tutorUsedToday);
        data.put("tutorRemainingToday", Math.max(0, dailyTutorQuota - tutorUsedToday));

        double tutorUsagePercent = dailyTutorQuota > 0 ? (tutorUsedToday * 100.0 / dailyTutorQuota) : 0;
        data.put("tutorUsagePercent", Math.round(tutorUsagePercent * 10.0) / 10.0);

        return Result.success(data);
    }

    /**
     * 每日打卡
     */
    @Operation(summary = "每日打卡")
    @PostMapping("/checkin")
    public Result<Integer> checkin() {
        Long userId = StpUtil.getLoginIdAsLong();
        checkinService.checkin(userId);
        // 返回最新的连续打卡天数
        return Result.success(checkinService.getConsecutiveDays(userId));
    }

    /**
     * 获取全站统计数据 (公开)
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getPublicStats() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", userMapper.selectCount(null));

        // 今日活跃人数 (今日已打卡)
        LambdaQueryWrapper<User> activeWrapper = new LambdaQueryWrapper<>();
        activeWrapper.eq(User::getLastCheckinDate, LocalDate.now());
        data.put("activeToday", userMapper.selectCount(activeWrapper));

        // 平均连胜天数 (真实计算 - 考虑中断)
        List<User> users = userMapper.selectList(null);
        LocalDate today = LocalDate.now();
        double avgStreak = users.stream()
                .mapToInt(u -> {
                    LocalDate last = u.getLastCheckinDate();
                    if (last == null || (!last.equals(today) && !last.equals(today.minusDays(1)))) {
                        return 0;
                    }
                    return u.getConsecutiveDays() == null ? 0 : u.getConsecutiveDays();
                })
                .average()
                .orElse(0.0);
        data.put("avgStreak", Math.round(avgStreak * 10.0) / 10.0);

        return Result.success(data);
    }

    /**
     * 获取当前用户的实时排名 (按积分)
     */
    @GetMapping("/my-rank")
    public Result<Map<String, Object>> getMyRank() {
        if (!StpUtil.isLogin()) {
            return Result.error("未登录");
        }
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userMapper.selectById(userId);
        if (user == null)
            return Result.error("用户不存在");

        int userPoints = user.getPoints() == null ? 0 : user.getPoints();

        // 计算排名: 积分比我多的人数 + 1
        LambdaQueryWrapper<User> rankWrapper = new LambdaQueryWrapper<>();
        rankWrapper.gt(User::getPoints, userPoints);
        long rank = userMapper.selectCount(rankWrapper) + 1;

        Map<String, Object> data = new HashMap<>();
        data.put("rank", rank);
        data.put("nickname", user.getNickname());
        data.put("avatar", user.getAvatar());
        data.put("points", userPoints);
        // 保留 checkin 数据，以便前端需要
        data.put("totalDays", user.getTotalCheckinDays() == null ? 0 : user.getTotalCheckinDays());
        data.put("consecutiveDays", checkinService.getConsecutiveDays(userId));

        return Result.success(data);
    }

    /**
     * 获取排行榜 (按积分)
     */
    @GetMapping("/leaderboard")
    public Result<List<Map<String, Object>>> getLeaderboard() {
        // 取前 50 名
        Page<User> page = new Page<>(1, 50);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(User::getPoints) // 按积分倒序
                .orderByDesc(User::getConsecutiveDays)
                .select(User::getId, User::getNickname, User::getAvatar, User::getPoints,
                        User::getTotalCheckinDays,
                        User::getConsecutiveDays, User::getLastCheckinDate);

        userMapper.selectPage(page, wrapper);

        LocalDate today = LocalDate.now();
        List<Map<String, Object>> list = page.getRecords().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("nickname", u.getNickname() == null ? "这名用户很懒" : u.getNickname());
            map.put("avatar", u.getAvatar());
            map.put("points", u.getPoints() == null ? 0 : u.getPoints());
            map.put("totalDays", u.getTotalCheckinDays() == null ? 0 : u.getTotalCheckinDays());

            // 实时判断连续天数是否中断
            LocalDate last = u.getLastCheckinDate();
            int consecutive = 0;
            if (last != null && (last.equals(today) || last.equals(today.minusDays(1)))) {
                consecutive = u.getConsecutiveDays() == null ? 0 : u.getConsecutiveDays();
            }
            map.put("consecutiveDays", consecutive);
            return map;
        }).collect(Collectors.toList());

        return Result.success(list);
    }

    private final com.learnsphere.service.ISecurityLogService securityLogService;

    /**
     * 更新个人资料
     */
    @CheckSensitive(fields = { "nickname", "bio" })
    @PostMapping("/update")
    public Result<String> updateProfile(@RequestBody User user) {
        Long userId = StpUtil.getLoginIdAsLong();
        user.setId(userId);

        // 只允许更新 nickname, email, bio
        User updateData = new User();
        updateData.setId(userId);
        updateData.setNickname(user.getNickname());
        updateData.setEmail(user.getEmail());
        updateData.setBio(user.getBio());

        userService.updateById(updateData);
        return Result.success("资料更新成功");
    }

    /**
     * 修改密码
     */
    @PostMapping("/password")
    public Result<String> changePassword(@RequestBody Map<String, String> params,
            jakarta.servlet.http.HttpServletRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        String currentPassword = params.get("current");
        String newPassword = params.get("new");

        userService.changePassword(userId, currentPassword, newPassword);

        // 记录安全日志
        String ip = com.learnsphere.utils.IpUtil.getClientIp(request);
        securityLogService.log(userId, "密码更新成功", ip, "success", "用户修改密码");

        return Result.success("密码修改成功");
    }

    /**
     * 获取用户安全日志
     */
    @GetMapping("/security/logs")
    public Result<List<com.learnsphere.entity.SecurityLog>> getSecurityLogs() {
        Long userId = StpUtil.getLoginIdAsLong();
        LambdaQueryWrapper<com.learnsphere.entity.SecurityLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(com.learnsphere.entity.SecurityLog::getUserId, userId);
        wrapper.orderByDesc(com.learnsphere.entity.SecurityLog::getCreateTime);
        wrapper.last("LIMIT 10"); // 只显示最近10条
        return Result.success(securityLogService.list(wrapper));
    }
}
