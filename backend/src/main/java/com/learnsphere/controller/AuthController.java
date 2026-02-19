package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.dto.LoginDTO;
import com.learnsphere.dto.RegisterDTO;
import com.learnsphere.entity.User;
import com.learnsphere.service.IUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "用户认证接口", description = "用户注册、登录、登出及密码找回")
public class AuthController {

    private final IUserService userService;
    private final com.learnsphere.service.ISecurityLogService securityLogService;
    private final com.learnsphere.service.IUserLogService userLogService;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    /**
     * 用户登录 API
     * 集成了 Sa-Token 框架进行会话管理。
     * 登录成功后，会在服务端创建 Session，并返回一个 Token 给前端。
     * 前端需在后续请求的 Header 中携带此 Token (Key: satoken)。
     *
     * @param loginDTO 包含用户名和密码
     * @return 包含 Token 和用户信息的 Map
     */
    @Operation(summary = "用户登录", description = "登录成功后返回 satoken Header")
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginDTO loginDTO,
            jakarta.servlet.http.HttpServletRequest request) {
        // 验证用户名密码
        User user = userService.login(loginDTO);

        // 登录成功，生成token
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();

        // 记录安全日志
        String ip = com.learnsphere.utils.IpUtil.getClientIp(request);
        securityLogService.log(user.getId(), "登录成功", ip, "success", "用户正常登录");

        // 记录用户操作日志
        userLogService.logSuccess(user.getId(), user.getUsername(), "auth", "login", "用户登录成功", request);

        // 返回用户信息和token
        Map<String, Object> data = new HashMap<>();
        data.put("satoken", token);
        data.put("user", user);

        return Result.success(data);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Void> register(@RequestBody RegisterDTO registerDTO,
            jakarta.servlet.http.HttpServletRequest request) {
        userService.register(registerDTO);
        // 记录注册日志 (注册成功后 user 不一定立即可得 ID，如果 register 方法返回了 User 更好)
        userLogService.logSuccess(null, registerDTO.getUsername(), "auth", "register", "新用户注册", request);
        return Result.successMessage("注册成功");
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public Result<Void> logout(jakarta.servlet.http.HttpServletRequest request) {
        try {
            if (StpUtil.isLogin()) {
                Long userId = StpUtil.getLoginIdAsLong();
                User user = userService.getById(userId);
                userLogService.logSuccess(userId, user != null ? user.getUsername() : "Unknown", "auth", "logout",
                        "用户登出", request);
            }
        } catch (Exception e) {
            // Log silent fail
        }
        StpUtil.logout();
        return Result.successMessage("登出成功");
    }

    /**
     * 重置密码 (找回密码)
     */
    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String email = params.get("email");
        String newPassword = params.get("password");

        if (cn.hutool.core.util.StrUtil.isBlank(username) || cn.hutool.core.util.StrUtil.isBlank(email)
                || cn.hutool.core.util.StrUtil.isBlank(newPassword)) {
            return Result.error("所有字段均为必填项");
        }

        userService.resetPassword(username, email, newPassword);
        return Result.successMessage("密码重置成功，请使用新密码登录");
    }

    /**
     * 获取当前登录用户信息
     */
    @Operation(summary = "获取个人资料及统计")
    @GetMapping("/info")
    public Result<User> getUserInfo() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);
        if (user != null) {
            user.setPassword(null); // 不返回密码
        }
        return Result.success(user);
    }

    /**
     * 检查登录状态
     */
    @GetMapping("/check")
    public Result<Map<String, Object>> checkLogin() {
        Map<String, Object> data = new HashMap<>();
        data.put("isLogin", StpUtil.isLogin());
        if (StpUtil.isLogin()) {
            data.put("userId", StpUtil.getLoginIdAsLong());
        }
        return Result.success(data);
    }

    /**
     * 检查是否需要验证码
     */
    @GetMapping("/captcha/required")
    @Operation(summary = "检查是否需要验证码")
    public Result<Map<String, Object>> checkCaptchaRequired(@RequestParam String username) {
        String countStr = redisTemplate.opsForValue().get("login_fail_count:" + username);
        int count = countStr == null ? 0 : Integer.parseInt(countStr);
        Map<String, Object> data = new HashMap<>();
        data.put("required", count >= 3);
        return Result.success(data);
    }

    /**
     * 获取验证码
     */
    @GetMapping("/captcha")
    @Operation(summary = "获取验证码")
    public Result<Map<String, Object>> getCaptcha() {
        // 创建验证码 (线段干扰)
        cn.hutool.captcha.LineCaptcha captcha = cn.hutool.captcha.CaptchaUtil.createLineCaptcha(120, 40, 4, 10);
        String code = captcha.getCode();
        String imageBase64 = captcha.getImageBase64();

        // 生成唯一标识
        String key = cn.hutool.core.util.IdUtil.fastSimpleUUID();

        // 存入 Redis，有效期 2 分钟
        redisTemplate.opsForValue().set("login_captcha:" + key, code, 2, java.util.concurrent.TimeUnit.MINUTES);

        Map<String, Object> data = new HashMap<>();
        data.put("captchaKey", key);
        data.put("captchaImage", "data:image/png;base64," + imageBase64);

        return Result.success(data);
    }
}
