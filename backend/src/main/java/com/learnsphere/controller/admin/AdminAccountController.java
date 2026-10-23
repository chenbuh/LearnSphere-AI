package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.AdminRole;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.entity.Admin;
import com.learnsphere.service.IAdminService;
import com.learnsphere.utils.PasswordUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * 后台管理员账号管理，仅超级管理员可访问（见 AdminRole.SUPER_ONLY_PREFIXES）
 */
@RestController
@RequestMapping("/api/admin/accounts")
@SaCheckRole("admin")
@RequiredArgsConstructor
public class AdminAccountController {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,32}$");


    private final IAdminService adminService;

    @GetMapping
    public Result<?> list(@RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "20") int size,
                          @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<Admin> query = new LambdaQueryWrapper<Admin>().orderByAsc(Admin::getId);
        if (StringUtils.hasText(keyword)) {
            String kw = keyword.trim();
            query.and(w -> w.like(Admin::getUsername, kw).or().like(Admin::getNickname, kw));
        }
        Page<Admin> result = adminService.page(new Page<>(page, Math.min(size, 100)), query);
        result.getRecords().forEach(this::stripSecrets);
        return Result.success(result);
    }

    @GetMapping("/roles")
    public Result<?> roles() {
        List<Map<String, String>> roles = Arrays.stream(AdminRole.values()).map(role -> {
            Map<String, String> item = new HashMap<>();
            item.put("value", role.getCode());
            item.put("label", role.getLabel());
            return item;
        }).toList();
        return Result.success(roles);
    }

    @PostMapping
    @AdminOperation(module = "管理员账号", action = "新增管理员")
    public Result<?> create(@RequestBody AccountRequest request) {
        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            return Result.error("账号只能包含字母、数字和下划线，长度 3-32 位");
        }
        String passwordError = validatePassword(request.getPassword());
        if (passwordError != null) {
            return Result.error(passwordError);
        }
        if (AdminRole.fromCode(request.getRole()).isEmpty()) {
            return Result.error("请选择有效的角色");
        }
        if (adminService.count(new LambdaQueryWrapper<Admin>().eq(Admin::getUsername, username)) > 0) {
            return Result.error("账号已存在");
        }

        Admin admin = new Admin();
        admin.setUsername(username);
        admin.setNickname(StringUtils.hasText(request.getNickname()) ? request.getNickname().trim() : username);
        admin.setRole(request.getRole());
        admin.setPassword(PasswordUtil.encode(request.getPassword()));
        admin.setSalt("");
        admin.setStatus(1);
        adminService.save(admin);
        return Result.success("管理员已创建");
    }

    @PutMapping("/{id}")
    @AdminOperation(module = "管理员账号", action = "修改管理员")
    public Result<?> update(@PathVariable Long id, @RequestBody AccountRequest request) {
        Admin admin = adminService.getById(id);
        if (admin == null) {
            return Result.error("管理员不存在");
        }
        if (request.getRole() != null && AdminRole.fromCode(request.getRole()).isEmpty()) {
            return Result.error("请选择有效的角色");
        }
        boolean demotingSelf = isCurrentAdmin(id) && request.getRole() != null
                && !AdminRole.SUPER_ADMIN.getCode().equals(request.getRole());
        if (demotingSelf) {
            return Result.error("不能修改自己的超级管理员角色");
        }
        if (isLastActiveSuperAdmin(admin) && request.getRole() != null
                && !AdminRole.SUPER_ADMIN.getCode().equals(request.getRole())) {
            return Result.error("至少需要保留一个可用的超级管理员");
        }

        Admin update = new Admin();
        update.setId(id);
        if (request.getNickname() != null) {
            update.setNickname(request.getNickname().trim());
        }
        if (request.getRole() != null) {
            update.setRole(request.getRole());
        }
        adminService.updateById(update);
        return Result.success("已保存");
    }

    @PutMapping("/{id}/status")
    @AdminOperation(module = "管理员账号", action = "启用/停用管理员")
    public Result<?> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        if (status == null || (status != 0 && status != 1)) {
            return Result.error("无效的状态");
        }
        Admin admin = adminService.getById(id);
        if (admin == null) {
            return Result.error("管理员不存在");
        }
        if (status == 0 && isCurrentAdmin(id)) {
            return Result.error("不能停用当前登录的账号");
        }
        if (status == 0 && isLastActiveSuperAdmin(admin)) {
            return Result.error("至少需要保留一个可用的超级管理员");
        }

        Admin update = new Admin();
        update.setId(id);
        update.setStatus(status);
        adminService.updateById(update);
        if (status == 0) {
            // 停用后立即踢下线
            StpUtil.logout("admin:" + id);
        }
        return Result.success(status == 1 ? "已启用" : "已停用");
    }

    @PutMapping("/{id}/password")
    @AdminOperation(module = "管理员账号", action = "重置管理员密码")
    public Result<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String password = body == null ? null : body.get("password");
        String passwordError = validatePassword(password);
        if (passwordError != null) {
            return Result.error(passwordError);
        }
        if (adminService.getById(id) == null) {
            return Result.error("管理员不存在");
        }

        Admin update = new Admin();
        update.setId(id);
        update.setPassword(PasswordUtil.encode(password));
        update.setSalt("");
        adminService.updateById(update);
        if (!isCurrentAdmin(id)) {
            StpUtil.logout("admin:" + id);
        }
        return Result.success("密码已重置");
    }

    @DeleteMapping("/{id}")
    @AdminOperation(module = "管理员账号", action = "删除管理员")
    public Result<?> delete(@PathVariable Long id) {
        Admin admin = adminService.getById(id);
        if (admin == null) {
            return Result.error("管理员不存在");
        }
        if (isCurrentAdmin(id)) {
            return Result.error("不能删除当前登录的账号");
        }
        if (isLastActiveSuperAdmin(admin)) {
            return Result.error("至少需要保留一个可用的超级管理员");
        }
        adminService.removeById(id);
        StpUtil.logout("admin:" + id);
        return Result.success("已删除");
    }

    private String validatePassword(String password) {
        // 与普通用户共用同一套策略，避免管理员规则更松或更严
        return com.learnsphere.utils.PasswordPolicy.validate(password);
    }

    private boolean isCurrentAdmin(Long id) {
        return ("admin:" + id).equals(String.valueOf(StpUtil.getLoginIdDefaultNull()));
    }

    private boolean isLastActiveSuperAdmin(Admin admin) {
        boolean isSuper = admin.getRole() == null || admin.getRole().isBlank()
                || AdminRole.SUPER_ADMIN.getCode().equals(admin.getRole());
        if (!isSuper || admin.getStatus() == null || admin.getStatus() != 1) {
            return false;
        }
        long activeSupers = adminService.count(new LambdaQueryWrapper<Admin>()
                .eq(Admin::getStatus, 1)
                .and(w -> w.eq(Admin::getRole, AdminRole.SUPER_ADMIN.getCode())
                        .or().isNull(Admin::getRole).or().eq(Admin::getRole, "")));
        return activeSupers <= 1;
    }

    private void stripSecrets(Admin admin) {
        admin.setPassword(null);
        admin.setSalt(null);
    }

    @Data
    public static class AccountRequest {
        private String username;
        private String nickname;
        private String password;
        private String role;
    }
}
