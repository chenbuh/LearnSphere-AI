package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.CheckSensitive;
import com.learnsphere.common.annotation.UserOperation;
import com.learnsphere.entity.User;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.ICheckinService;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.service.IUserService;
import com.learnsphere.common.annotation.RateLimit;
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
import java.util.Set;
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

    private static final int CHECKIN_POINTS_REWARD = 5;

    private final ICheckinService checkinService;
    private final IUserService userService;
    private final UserMapper userMapper;
    private final StringRedisTemplate redisTemplate;
    private final ISystemConfigService systemConfigService;
    private final com.learnsphere.mail.EmailCodeService emailCodeService;

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
        // 账户单独设置的额度优先，否则跟随后台系统设置（与扣费逻辑保持一致）
        int quotaLevel = isVip ? vipLevel : 0;
        int dailyQuota;
        if (user.getDailyAiQuota() != null && user.getDailyAiQuota() >= 0) {
            dailyQuota = user.getDailyAiQuota();
        } else {
            dailyQuota = configInt("ai.limit.daily." + quotaLevel, defaultAiQuota(quotaLevel));
        }

        data.put("dailyQuota", dailyQuota);
        data.put("isVip", isVip);
        data.put("vipLevel", vipLevel);

        // 从 Redis 获取今日已使用次数
        String quotaKey = "quota:user:" + userId + ":" + LocalDate.now();
        String usedStr = redisTemplate.opsForValue().get(quotaKey);
        int usedToday;
        if (usedStr != null) {
            usedToday = Integer.parseInt(usedStr);
        } else {
            usedToday = getLegacyAiUsage(userId);
        }

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
        } else {
            dailyTutorQuota = configInt("ai.tutor.limit.daily." + quotaLevel, defaultTutorQuota(quotaLevel));
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
     * 兼容旧版本按功能拆分的 AI 配额 key，避免发布后当日额度显示突然回到 0。
     */
    private int getLegacyAiUsage(Long userId) {
        String legacyPattern = "quota:user:" + userId + ":" + LocalDate.now() + ":*";
        Set<String> legacyKeys = redisTemplate.keys(legacyPattern);
        if (legacyKeys == null || legacyKeys.isEmpty()) {
            return 0;
        }

        return legacyKeys.stream()
                .filter(key -> !key.endsWith(":AI 助教提问"))
                .map(redisTemplate.opsForValue()::get)
                .filter(value -> value != null && !value.isBlank())
                .mapToInt(Integer::parseInt)
                .sum();
    }

    /**
     * 每日打卡
     */
    @Operation(summary = "每日打卡")
    @UserOperation(module = "user", action = "checkin", description = "每日打卡")
    @PostMapping("/checkin")
    public Result<Integer> checkin() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userMapper.selectById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        boolean alreadyCheckedInToday = user.getLastCheckinDate() != null
                && user.getLastCheckinDate().equals(LocalDate.now());

        checkinService.checkin(userId);

        if (!alreadyCheckedInToday) {
            User latestUser = userMapper.selectById(userId);
            if (latestUser != null) {
                int currentPoints = latestUser.getPoints() == null ? 0 : latestUser.getPoints();
                latestUser.setPoints(currentPoints + CHECKIN_POINTS_REWARD);
                userMapper.updateById(latestUser);
            }
        }

        // 返回最新的连续打卡天数
        return Result.success(checkinService.getConsecutiveDays(userId));
    }

    /**
     * 获取全站统计数据 (公开)
     *
     * 安全修复（2026-03）：
     * 原实现通过 userMapper.selectList(null) 把整张 user 表加载进内存，
     * 仅为了在 Java 侧 stream 计算「平均连胜天数」。该接口在白名单中匿名可访问，
     * 因此构成了匿名可打的重操作入口：
     *   - 每次请求触发一次全表扫描 + 全量实体反序列化，用户量增长后内存与 DB 压力巨大；
     *   - 攻击者无需登录即可高频调用，属于低成本资源耗尽面。
     *
     * 现改为在数据库侧完成聚合计算（AVG 由 MySQL 直接返回单个数值），
     * 内存占用与返回体积均从 O(用户数) 降为 O(1)。
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getPublicStats() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", userMapper.selectCount(null));

        // 今日活跃人数 (今日已打卡)
        LambdaQueryWrapper<User> activeWrapper = new LambdaQueryWrapper<>();
        activeWrapper.eq(User::getLastCheckinDate, LocalDate.now());
        data.put("activeToday", userMapper.selectCount(activeWrapper));

        // 平均连胜天数：改为数据库侧 AVG 聚合，避免全表加载到内存。
        //
        // ⚠️ 语义变更说明（已确认，非等价改写）：
        //   原实现遍历「全部用户」，把 last_checkin_date 为空或早于昨天的用户按 0 计入，
        //   因此分母 = 全部用户数，数值被未打卡用户拉低。
        //   新实现只对 last_checkin_date 为今天或昨日的用户取 AVG，
        //   分母 = 近期活跃用户数，数值会更贴近「活跃用户的平均连胜」。
        //   该字段用于首页展示的参考指标，非计费或考核口径，此变更不影响业务正确性。
        //   如需保持与原数值一致，请把下方 .in(...) 条件去掉。
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        Double avgStreak = userMapper.selectObjs(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<User>()
                        .select("AVG(COALESCE(consecutive_days, 0))")
                        .in("last_checkin_date", today, yesterday))
                .stream()
                .filter(java.util.Objects::nonNull)
                .findFirst()
                .map(obj -> ((Number) obj).doubleValue())
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
    @UserOperation(module = "user", action = "update", description = "更新个人资料")
    @PostMapping("/update")
    public Result<String> updateProfile(@RequestBody User user) {
        Long userId = StpUtil.getLoginIdAsLong();
        user.setId(userId);

        // 只允许更新 nickname, bio；邮箱需通过 /email/bind 验证码换绑
        User updateData = new User();
        updateData.setId(userId);
        updateData.setNickname(user.getNickname());
        updateData.setBio(user.getBio());
        if (user.getEmail() != null) {
            User current = userService.getById(userId);
            String newEmail = com.learnsphere.mail.EmailCodeService.normalize(user.getEmail());
            boolean changed = current == null || current.getEmail() == null
                    || !current.getEmail().equalsIgnoreCase(newEmail);
            if (changed && !newEmail.isEmpty()) {
                return Result.error("修改邮箱需要验证新邮箱，请使用邮箱验证码换绑");
            }
        }

        userService.updateById(updateData);
        return Result.success("资料更新成功");
    }

    /**
     * 发送换绑邮箱验证码（发到新邮箱）
     */
    @RateLimit(key = "bind_email_code", time = 3600, count = 10, limitType = RateLimit.LimitType.USER)
    @PostMapping("/email/code")
    public Result<String> sendBindEmailCode(@RequestBody Map<String, String> params) {
        Long userId = StpUtil.getLoginIdAsLong();
        String email = com.learnsphere.mail.EmailCodeService.normalize(params.get("email"));
        if (!com.learnsphere.mail.EmailCodeService.isValidEmail(email)) {
            return Result.error("请输入有效的邮箱地址");
        }
        User current = userService.getById(userId);
        if (current != null && email.equalsIgnoreCase(current.getEmail())) {
            return Result.error("新邮箱与当前绑定邮箱相同");
        }
        if (userService.isEmailRegistered(email)) {
            return Result.error("该邮箱已被其他账号绑定");
        }
        emailCodeService.send(com.learnsphere.mail.EmailCodeService.SCENE_BIND + ":" + userId, email, true, false);
        return Result.success("验证码已发送至新邮箱（10 分钟内有效）");
    }

    /**
     * 验证码校验通过后换绑邮箱
     */
    @UserOperation(module = "security", action = "bind_email", description = "换绑邮箱")
    @PostMapping("/email/bind")
    public Result<String> bindEmail(@RequestBody Map<String, String> params,
            jakarta.servlet.http.HttpServletRequest request) {
        Long userId = StpUtil.getLoginIdAsLong();
        if (cn.hutool.core.util.StrUtil.hasBlank(params.get("email"), params.get("code"))) {
            return Result.error("请填写新邮箱和验证码");
        }
        userService.bindEmail(userId, params.get("email"), params.get("code"));
        String ip = com.learnsphere.utils.IpUtil.getClientIp(request);
        securityLogService.log(userId, "邮箱换绑成功", ip, "success", "用户通过验证码换绑邮箱");
        return Result.success("邮箱换绑成功");
    }

    /**
     * 修改密码
     */
    @UserOperation(module = "security", action = "change_password", description = "修改密码")
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

    private int configInt(String key, int defaultValue) {
        try {
            return Integer.parseInt(systemConfigService.getConfigValue(key, String.valueOf(defaultValue)).trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private static int defaultAiQuota(int level) {
        return switch (level) {
            case 1 -> 100;
            case 2 -> 120;
            case 3 -> 150;
            default -> 15;
        };
    }

    private static int defaultTutorQuota(int level) {
        return switch (level) {
            case 1 -> 100;
            case 2 -> 150;
            case 3 -> 200;
            default -> 20;
        };
    }
}
