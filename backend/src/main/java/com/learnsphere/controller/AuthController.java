package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.dto.LoginDTO;
import com.learnsphere.dto.RegisterDTO;
import com.learnsphere.entity.User;
import com.learnsphere.service.IUserService;
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
public class AuthController {

    private final IUserService userService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginDTO loginDTO) {
        // 验证用户名密码
        User user = userService.login(loginDTO);

        // 登录成功，生成token
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();

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
    public Result<Void> register(@RequestBody RegisterDTO registerDTO) {
        userService.register(registerDTO);
        return Result.successMessage("注册成功");
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        StpUtil.logout();
        return Result.successMessage("登出成功");
    }

    /**
     * 获取当前登录用户信息
     */
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
}
