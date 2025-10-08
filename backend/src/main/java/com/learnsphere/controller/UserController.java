package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.User;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.ICheckinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

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
public class UserController {

    private final ICheckinService checkinService;
    private final UserMapper userMapper;

    /**
     * 获取用户个人信息及统计数据
     */
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
        data.put("avatar", user.getAvatar());
        data.put("consecutiveDays", user.getConsecutiveDays() == null ? 0 : user.getConsecutiveDays());
        data.put("totalCheckinDays", user.getTotalCheckinDays() == null ? 0 : user.getTotalCheckinDays());
        data.put("lastCheckinDate", user.getLastCheckinDate());
        // 实际上 checkinService 的 getConsecutiveDays 会判断中断情况，更准确
        data.put("realConsecutiveDays", checkinService.getConsecutiveDays(userId));

        return Result.success(data);
    }

    /**
     * 每日打卡
     */
    @PostMapping("/checkin")
    public Result<Integer> checkin() {
        Long userId = StpUtil.getLoginIdAsLong();
        checkinService.checkin(userId);
        // 返回最新的连续打卡天数
        return Result.success(checkinService.getConsecutiveDays(userId));
    }

    /**
     * 获取排行榜 (按总打卡天数)
     */
    @GetMapping("/leaderboard")
    public Result<List<Map<String, Object>>> getLeaderboard() {
        // 取前 10 名
        Page<User> page = new Page<>(1, 10);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(User::getTotalCheckinDays)
                .orderByDesc(User::getConsecutiveDays)
                .select(User::getId, User::getNickname, User::getAvatar, User::getTotalCheckinDays,
                        User::getConsecutiveDays);

        userMapper.selectPage(page, wrapper);

        List<Map<String, Object>> list = page.getRecords().stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("nickname", u.getNickname() == null ? "这名用户很懒" : u.getNickname());
            map.put("avatar", u.getAvatar());
            map.put("totalDays", u.getTotalCheckinDays() == null ? 0 : u.getTotalCheckinDays());
            map.put("consecutiveDays", u.getConsecutiveDays() == null ? 0 : u.getConsecutiveDays());
            return map;
        }).collect(Collectors.toList());

        return Result.success(list);
    }
}
