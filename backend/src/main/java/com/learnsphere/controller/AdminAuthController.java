package com.learnsphere.controller;

import com.learnsphere.common.annotation.AdminOperation;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.learnsphere.common.Result;
import com.learnsphere.entity.Admin;
import com.learnsphere.service.IAdminService;
import com.learnsphere.util.PasswordUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员登录控制器
 * 
 * @author LearnSphere Team
 */
@RestController
@RequestMapping("/api/admin/auth")
@Tag(name = "管理员认证接口", description = "管理员登录、登出及基本信息获取")
public class AdminAuthController {

    @Autowired
    private IAdminService adminService;

    /**
     * 管理员登录
     */
    @Operation(summary = "管理员登录")
    @PostMapping("/login")
    @AdminOperation(module = "系统认证", action = "管理员登录")
    public Result<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        if (username == null || password == null) {
            return Result.error("用户名或密码不能为空");
        }

        // 查询管理员
        QueryWrapper<Admin> query = new QueryWrapper<>();
        query.eq("username", username);
        Admin admin = adminService.getOne(query);

        if (admin == null) {
            return Result.error("账号不存在");
        }

        if (admin.getStatus() == 0) {
            return Result.error("账号已被禁用");
        }

        // 验证密码（使用盐加密）
        String hashedPassword = PasswordUtil.hashPassword(password, admin.getSalt());
        if (!hashedPassword.equals(admin.getPassword())) {
            return Result.error("密码错误");
        }

        // 登录成功，生成token
        StpUtil.login("admin:" + admin.getId());
        String token = StpUtil.getTokenValue();

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("admin", admin);

        return Result.success(result);
    }

    /**
     * 管理员登出
     */
    @Operation(summary = "管理员登出")
    @PostMapping("/logout")
    @AdminOperation(module = "系统认证", action = "管理员登出")
    public Result<?> logout() {
        StpUtil.logout();
        return Result.success("退出成功");
    }

    /**
     * 获取管理员信息
     */
    @Operation(summary = "获取当前管理员信息")
    @GetMapping("/info")
    public Result<?> getInfo() {
        if (!StpUtil.isLogin()) {
            return Result.error("未登录");
        }

        String loginId = (String) StpUtil.getLoginId();
        Long adminId = Long.parseLong(loginId.replace("admin:", ""));

        Admin admin = adminService.getById(adminId);
        if (admin == null) {
            return Result.error("管理员不存在");
        }

        // 不返回密码和盐值
        admin.setPassword(null);
        admin.setSalt(null);

        return Result.success(admin);
    }
}
