package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.service.IAchievementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/achievement")
@RequiredArgsConstructor
public class AchievementController {

    private final IAchievementService achievementService;

    @GetMapping("/list")
    public Result<List<Map<String, Object>>> getMyAchievements() {
        Long userId = StpUtil.getLoginIdAsLong();
        return Result.success(achievementService.getUserAchievements(userId));
    }
}
