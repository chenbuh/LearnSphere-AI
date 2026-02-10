package com.learnsphere.controller.admin;

import cn.dev33.satoken.secure.SaSecureUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.dto.UserUpdateDTO;
import com.learnsphere.entity.AIGenerationLog;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.entity.User;
import com.learnsphere.service.IAIGenerationLogService;
import com.learnsphere.service.ILearningRecordService;
import com.learnsphere.service.IUserService;
import com.learnsphere.vo.UserDetailVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Advanced User Management Controller
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private IUserService userService;

    @Autowired
    private ILearningRecordService learningRecordService;

    @Autowired
    private IAIGenerationLogService aiGenerationLogService;

    /**
     * Get user list
     */
    @GetMapping
    public Result<?> getUserList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {

        Page<User> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.and(wrapper -> wrapper
                    .like(User::getUsername, keyword)
                    .or().like(User::getEmail, keyword)
                    .or().like(User::getNickname, keyword));
        }

        if (status != null) {
            query.eq(User::getStatus, status);
        }

        query.orderByDesc(User::getCreateTime);
        Page<User> result = userService.page(pageParam, query);

        return Result.success(result);
    }

    /**
     * Get user details
     */
    @GetMapping("/{id}")
    public Result<?> getUserDetails(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.error("User not found");
        }

        UserDetailVO vo = new UserDetailVO();
        vo.setUser(user);

        // Stats
        long records = learningRecordService
                .count(new LambdaQueryWrapper<LearningRecord>().eq(LearningRecord::getUserId, id));
        vo.setTotalWordsLearned(records); // Simplified as records count for demo

        long aiUsage = aiGenerationLogService
                .count(new LambdaQueryWrapper<AIGenerationLog>().eq(AIGenerationLog::getUserId, id));
        vo.setTotalAiUsage(aiUsage);

        // VIP Info (Assuming user.vipExpireTime field exists or similar logic)
        // Checking User entity fields in Step 255/120... Listing fields: ...
        // Actually I need to check User entity to see if it has Vip info directly
        if (user.getVipExpireTime() != null && user.getVipExpireTime().isAfter(LocalDateTime.now())) {
            vo.setVip(true);
            vo.setVipExpireTime(user.getVipExpireTime().toString());
        } else {
            vo.setVip(false);
        }

        // --- Behavioral Profiling ---

        // 1. Skill Scores (Radar Chart)
        java.util.Map<String, Integer> skillScores = new java.util.HashMap<>();
        String[] types = { "vocabulary", "grammar", "reading", "listening", "speaking", "writing" };
        for (String type : types) {
            QueryWrapper<LearningRecord> qw = new QueryWrapper<>();
            qw.eq("user_id", id).eq("content_type", type).select("AVG(score) as avgScore");
            Map<String, Object> map = learningRecordService.getMap(qw);
            Object avg = map != null ? map.get("avgScore") : null;
            skillScores.put(type, avg != null ? Double.valueOf(avg.toString()).intValue() : 0);
        }
        vo.setSkillScores(skillScores);

        // 2. Usage Trend (Last 7 Days AI Tokens)
        java.util.List<java.util.Map<String, Object>> trend = new java.util.ArrayList<>();
        int highUsageDays = 0;
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
            QueryWrapper<AIGenerationLog> logQw = new QueryWrapper<>();
            logQw.eq("user_id", id)
                    .ge("create_time", date.atStartOfDay())
                    .lt("create_time", date.plusDays(1).atStartOfDay())
                    .select("SUM(total_tokens) as dailyTokens");
            Map<String, Object> logMap = aiGenerationLogService.getMap(logQw);
            Object tokens = logMap != null ? logMap.get("dailyTokens") : null;
            Integer tokenVal = tokens != null ? Double.valueOf(tokens.toString()).intValue() : 0;

            java.util.Map<String, Object> dayData = new java.util.HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("value", tokenVal);
            trend.add(dayData);

            if (tokenVal > 20000)
                highUsageDays++; // Threshold for high usage
        }
        vo.setUsageTrend(trend);

        // 3. Risk Level & Tags
        if (highUsageDays >= 3) {
            vo.setRiskLevel("HIGH");
            vo.setUserTag("潜在爬虫/重度用户");
        } else if (records > 100) {
            vo.setRiskLevel("LOW");
            vo.setUserTag("英语学霸");
        } else if (aiUsage > 50) {
            vo.setRiskLevel("LOW");
            vo.setUserTag("AI探索者");
        } else {
            vo.setRiskLevel("LOW");
            vo.setUserTag("普通学员");
        }

        return Result.success(vo);
    }

    /**
     * Update user profile
     */
    @PutMapping("/{id}")
    @com.learnsphere.common.annotation.AdminOperation(module = "用户管理", action = "更新用户资料")
    public Result<?> updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO dto) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.error("User not found");
        }

        if (dto.getNickname() != null)
            user.setNickname(dto.getNickname());
        if (dto.getEmail() != null)
            user.setEmail(dto.getEmail());
        if (dto.getPhone() != null)
            user.setPhone(dto.getPhone());
        // Avatar...

        userService.updateById(user);
        return Result.success("Profile updated");
    }

    /**
     * Update user status
     */
    @PutMapping("/{id}/status")
    @com.learnsphere.common.annotation.AdminOperation(module = "用户管理", action = "切换用户状态")
    public Result<?> updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        User user = userService.getById(id);
        if (user == null)
            return Result.error("User not found");

        user.setStatus(status);
        userService.updateById(user);
        return Result.success("Status updated");
    }

    /**
     * Reset password
     */
    @PutMapping("/{id}/password")
    @com.learnsphere.common.annotation.AdminOperation(module = "用户管理", action = "重置用户密码")
    public Result<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        if (newPassword == null || newPassword.length() < 6) {
            return Result.error("Password must be at least 6 characters");
        }

        User user = userService.getById(id);
        if (user == null)
            return Result.error("User not found");

        // MD5 encryption using SaToken's utility or similar
        user.setPassword(SaSecureUtil.md5(newPassword));
        userService.updateById(user);

        return Result.success("Password reset successfully");
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{id}")
    @com.learnsphere.common.annotation.AdminOperation(module = "用户管理", action = "删除用户")
    public Result<?> deleteUser(@PathVariable Long id) {
        userService.removeById(id);
        return Result.success("User deleted");
    }

    /**
     * 获取用户完整档案（增强版）
     * 包含学习轨迹、AI使用画像、活跃度分析、价值分层
     */
    @GetMapping("/{id}/profile")
    public Result<?> getUserProfile(@PathVariable Long id) {
        try {
            com.learnsphere.dto.UserProfileDTO profile = userService.getUserCompleteProfile(id);
            return Result.success(profile);
        } catch (Exception e) {
            return Result.error("获取用户档案失败: " + e.getMessage());
        }
    }

    /**
     * 批量发送通知（站内信/邮件）
     */
    @PostMapping("/batch/notify")
    @com.learnsphere.common.annotation.AdminOperation(module = "用户运营", action = "批量发送通知")
    public Result<?> batchNotify(@RequestBody com.learnsphere.dto.BatchNotifyDTO dto) {
        try {
            userService.batchNotifyUsers(dto);
            return Result.success("通知发送成功");
        } catch (Exception e) {
            return Result.error("发送失败: " + e.getMessage());
        }
    }

    /**
     * 批量赠送VIP
     */
    @PostMapping("/batch/grant-vip")
    @com.learnsphere.common.annotation.AdminOperation(module = "用户运营", action = "批量赠送VIP")
    public Result<?> batchGrantVip(@RequestBody com.learnsphere.dto.BatchVipDTO dto) {
        try {
            userService.batchGrantVip(dto);
            return Result.success("VIP赠送成功");
        } catch (Exception e) {
            return Result.error("赠送失败: " + e.getMessage());
        }
    }

    /**
     * 高级筛选用户
     */
    @PostMapping("/filter")
    public Result<?> filterUsers(
            @RequestBody com.learnsphere.dto.FilterCriteriaDTO criteria,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            Page<User> result = userService.filterUsers(criteria, page, size);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("筛选失败: " + e.getMessage());
        }
    }
}
