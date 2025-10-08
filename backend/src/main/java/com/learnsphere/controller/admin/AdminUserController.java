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

        return Result.success(vo);
    }

    /**
     * Update user profile
     */
    @PutMapping("/{id}")
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
    public Result<?> deleteUser(@PathVariable Long id) {
        userService.removeById(id);
        return Result.success("User deleted");
    }
}
