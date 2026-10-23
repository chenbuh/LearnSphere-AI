package com.learnsphere.config;

import cn.dev33.satoken.stp.StpInterface;
import com.learnsphere.common.AdminRole;
import com.learnsphere.entity.Admin;
import com.learnsphere.service.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * 自定义权限验证接口扩展
 */
@Component
@RequiredArgsConstructor
public class StpInterfaceImpl implements StpInterface {

    private final IAdminService adminService;

    /**
     * 返回账号所拥有的权限码集合
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        List<String> list = new ArrayList<>();
        resolveAdminRole(loginId).ifPresent(role -> {
            list.add("admin.role." + role.getCode());
            if (role == AdminRole.SUPER_ADMIN) {
                list.add("*");
            }
        });
        return list;
    }

    /**
     * 返回账号所拥有的角色标识集合 (权限与角色可分开校验)
     * 所有后台账号都带 admin 角色，再附加具体的后台角色码，例如 admin + content
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        List<String> list = new ArrayList<>();
        String authId = String.valueOf(loginId);

        if (authId.startsWith("admin:")) {
            list.add("admin");
            resolveAdminRole(loginId).ifPresent(role -> list.add(role.getCode()));
        } else {
            list.add("user"); // 普通用户
        }

        return list;
    }

    /**
     * 查询后台账号当前角色；账号不存在、被禁用或角色未知时返回空
     */
    Optional<AdminRole> resolveAdminRole(Object loginId) {
        String authId = String.valueOf(loginId);
        if (!authId.startsWith("admin:")) {
            return Optional.empty();
        }
        try {
            Admin admin = adminService.getById(Long.parseLong(authId.substring("admin:".length())));
            if (admin == null || admin.getStatus() == null || admin.getStatus() != 1) {
                return Optional.empty();
            }
            // 老数据没有 role 字段时视为超级管理员，保证升级后现有账号仍可登录
            return admin.getRole() == null || admin.getRole().isBlank()
                    ? Optional.of(AdminRole.SUPER_ADMIN)
                    : AdminRole.fromCode(admin.getRole());
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
