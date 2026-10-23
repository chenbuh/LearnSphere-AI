package com.learnsphere.controller;

import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.common.annotation.RateLimit;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.learnsphere.common.AdminRole;
import com.learnsphere.common.Result;
import com.learnsphere.entity.Admin;
import com.learnsphere.entity.User;
import com.learnsphere.service.IAdminService;
import com.learnsphere.service.IUserService;
import com.learnsphere.utils.PasswordUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.learnsphere.common.AdminRole;



import java.time.LocalDateTime;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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

    @Autowired
    private IUserService userService;

    /**
     * 管理员登录
     */
    @Operation(summary = "管理员登录")
    @PostMapping("/login")
    @AdminOperation(module = "系统认证", action = "管理员登录")
    @RateLimit(key = "admin:login", time = 60, count = 10, limitType = RateLimit.LimitType.IP)
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

        // 账号不存在与密码错误返回相同提示，避免枚举管理员账号
        if (admin == null || !passwordMatches(password, admin.getPassword())) {
            return Result.error("账号或密码错误");
        }

        if (admin.getStatus() == null || admin.getStatus() != 1) {
            return Result.error("账号已被禁用");
        }

        if (admin.getRole() != null && !admin.getRole().isBlank() && AdminRole.fromCode(admin.getRole()).isEmpty()) {
            return Result.error("账号角色配置有误，请联系超级管理员");
        }

        // 登录成功，记录登录时间并生成token
        Admin loginUpdate = new Admin();
        loginUpdate.setId(admin.getId());
        loginUpdate.setLastLoginTime(LocalDateTime.now());
        adminService.updateById(loginUpdate);

        StpUtil.login("admin:" + admin.getId());
        String token = StpUtil.getTokenValue();
        admin.setPassword(null);
        admin.setSalt(null);

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("admin", toAdminView(admin));

        return Result.success(result);
    }

    /**
     * 校验 BCrypt 密码；旧的 MD5 哈希不再被接受，需通过 admin-init.sql 重置
     */
    private boolean passwordMatches(String rawPassword, String encodedPassword) {
        if (encodedPassword == null || !encodedPassword.startsWith("$2")) {
            return false;
        }
        try {
            return PasswordUtil.matches(rawPassword, encodedPassword);
        } catch (IllegalArgumentException e) {
            return false;
        }
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

        return Result.success(toAdminView(admin));
    }

    /**
     * 管理员进入前台学习中心：使用（必要时自动创建）关联的学习账号签发用户 token。
     * 学习数据记在关联账号下，与后台身份分开；当前请求的管理员 token 不受影响。
     */
    @Operation(summary = "管理员进入学习中心")
    @PostMapping("/learner-session")
    @AdminOperation(module = "系统认证", action = "管理员进入学习中心")
    public Result<?> learnerSession() {
        // 安全加固（2026-03）：本接口位于鉴权白名单内，未登录时必须显式判空，
        // 避免 getLoginId() 抛出 NotLoginException 造成 500 与异常日志噪音。
        Object currentLoginId = StpUtil.getLoginIdDefaultNull();
        if (currentLoginId == null) {
            return Result.error(401, "未登录");
        }
        String loginId = String.valueOf(currentLoginId);
        if (!loginId.startsWith("admin:")) {
            return Result.error("仅管理员账号可使用");
        }
        Admin admin = adminService.getById(Long.parseLong(loginId.substring("admin:".length())));
        if (admin == null || admin.getStatus() == null || admin.getStatus() != 1) {
            return Result.error("管理员账号已被禁用或不存在");
        }

        User user = admin.getUserId() == null ? null : userService.getById(admin.getUserId());
        if (user == null) {
            user = createLinkedLearner(admin);
            Admin link = new Admin();
            link.setId(admin.getId());
            link.setUserId(user.getId());
            adminService.updateById(link);
        } else if (user.getStatus() != null && user.getStatus() == 0) {
            return Result.error("关联的学习账号已被禁用");
        } else if (admin.getUsername().equals(user.getUsername())) {
            // 早期创建的关联账号与后台同名，会挡住前台登录页的管理员识别，改成独立用户名
            User rename = new User();
            rename.setId(user.getId());
            rename.setUsername(nextLearnerUsername(admin));
            userService.updateById(rename);
            user.setUsername(rename.getUsername());
        }

        // 只创建会话、不写入当前请求上下文，避免把管理员自己的 token 顶掉
        String token = StpUtil.createLoginSession(user.getId());
        user.setPassword(null);
        user.setSalt(null);
        user.setMfaSecret(null);

        Map<String, Object> data = new HashMap<>();
        data.put("satoken", token);
        data.put("user", user);
        return Result.success(data);
    }

    /**
     * 为管理员创建学习账号：用户名用 admin_{id}_learner，不能与后台用户名相同，
     * 否则前台登录页会把管理员账号当成学习账号校验；密码随机生成，只能通过管理员身份进入
     */
    private User createLinkedLearner(Admin admin) {
        User user = new User();
        user.setUsername(nextLearnerUsername(admin));
        user.setPassword(PasswordUtil.encode(UUID.randomUUID().toString()));
        user.setNickname(admin.getNickname() != null && !admin.getNickname().isBlank() ? admin.getNickname() : admin.getUsername());
        user.setStatus(1);
        user.setDeleted(0);
        userService.save(user);
        return user;
    }

    private String nextLearnerUsername(Admin admin) {
        String base = "admin_" + admin.getId() + "_learner";
        String username = base;
        for (int i = 2; userService.lambdaQuery().eq(User::getUsername, username).count() > 0; i++) {
            username = base + i;
        }
        return username;
    }

    /**
     * 管理员信息附带角色名称和可访问的后台菜单，前端据此隐藏无权限的页面
     */
    private Map<String, Object> toAdminView(Admin admin) {
        AdminRole role = admin.getRole() == null || admin.getRole().isBlank()
                ? AdminRole.SUPER_ADMIN
                : AdminRole.fromCode(admin.getRole()).orElse(null);
        Map<String, Object> view = new HashMap<>();
        view.put("id", admin.getId());
        view.put("username", admin.getUsername());
        view.put("nickname", admin.getNickname());
        view.put("status", admin.getStatus());
        view.put("role", role == null ? admin.getRole() : role.getCode());
        view.put("roleName", role == null ? "未知角色" : role.getLabel());
        view.put("lastLoginTime", admin.getLastLoginTime());
        return view;
    }
}
