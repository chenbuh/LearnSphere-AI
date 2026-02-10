package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.entity.User;
import com.learnsphere.service.IUserService;
import com.learnsphere.utils.MfaUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 安全行为控制器 (MFA 绑定与自动化解封)
 */
@Slf4j
@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@Tag(name = "系统安全接口", description = "MFA 绑定、风险状态查询及自动化解封流程")
public class SecurityController {

    private final IUserService userService;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 获取 MFA 初始化信息
     */
    @Operation(summary = "初始化 MFA 绑定", description = "生成新的密钥和绑定 URL")
    @GetMapping("/mfa/setup")
    public Result<Map<String, String>> setupMfa() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);

        String secret = MfaUtil.generateSecret();
        String qrCodeUrl = MfaUtil.getOtpAuthUrl(user.getUsername(), secret);

        Map<String, String> result = new HashMap<>();
        result.put("secret", secret);
        result.put("qrCodeUrl", qrCodeUrl);
        return Result.success(result);
    }

    /**
     * 绑定 MFA
     */
    @Operation(summary = "完成 MFA 绑定", description = "验证第一个六位验证码并保存密钥")
    @PostMapping("/mfa/bind")
    public Result<Void> bindMfa(@RequestBody Map<String, String> body) {
        String secret = body.get("secret");
        String code = body.get("code");

        if (!MfaUtil.verifyCode(secret, code)) {
            return Result.error("验证码校验失败，请重试");
        }

        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);
        user.setMfaSecret(secret);
        user.setMfaEnabled(1);
        userService.updateById(user);

        return Result.successMessage("MFA 绑定成功");
    }

    /**
     * 使用 MFA 自动化解封
     */
    @Operation(summary = "自动化风险解封", description = "通过 MFA 校验后，清空 Redis 中的违规计数，重置账户状态")
    @PostMapping("/unlock")
    public Result<Void> unlock(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);

        if (user.getMfaEnabled() == null || user.getMfaEnabled() == 0) {
            return Result.error("账户未绑定 MFA，请联系管理员手动解锁");
        }

        if (!MfaUtil.verifyCode(user.getMfaSecret(), code)) {
            return Result.error("MFA 验证码错误");
        }

        // 核心逻辑：清空 Redis 违规计数
        String key = "security:violation:" + userId;
        redisTemplate.delete(key);

        log.info("用户 {} 已通过 MFA 成功解除风险锁定", userId);
        return Result.successMessage("风险限制已解除，当前功能已恢复正常");
    }

    /**
     * 获取当前风险状态
     */
    @GetMapping("/risk-status")
    public Result<Map<String, Object>> getRiskStatus() {
        Long userId = StpUtil.getLoginIdAsLong();
        String key = "security:violation:" + userId;
        Object violations = redisTemplate.opsForValue().get(key);

        Map<String, Object> result = new HashMap<>();
        result.put("violations", violations == null ? 0 : Integer.parseInt(violations.toString()));
        result.put("isLocked", violations != null && Integer.parseInt(violations.toString()) >= 10);

        User user = userService.getById(userId);
        result.put("mfaEnabled", user.getMfaEnabled() != null && user.getMfaEnabled() == 1);

        return Result.success(result);
    }
}
