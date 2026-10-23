package com.learnsphere.controller;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.entity.Admin;
import com.learnsphere.service.IAdminService;
import com.learnsphere.utils.PasswordUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminAuthControllerTest {

    private IAdminService adminService;
    private AdminAuthController controller;

    @BeforeEach
    void setUp() {
        adminService = mock(IAdminService.class);
        controller = new AdminAuthController();
        ReflectionTestUtils.setField(controller, "adminService", adminService);
    }

    @Test
    void unknownAccountAndWrongPassword_returnSameMessage() {
        when(adminService.getOne(any(Wrapper.class))).thenReturn(null);
        Result<?> unknown = controller.login(Map.of("username", "nobody", "password", "admin123"));

        when(adminService.getOne(any(Wrapper.class))).thenReturn(admin(PasswordUtil.encode("admin123")));
        Result<?> wrongPassword = controller.login(Map.of("username", "admin", "password", "wrong"));

        assertEquals("账号或密码错误", unknown.getMessage());
        assertEquals("账号或密码错误", wrongPassword.getMessage());
    }

    @Test
    void legacyMd5Hash_isRejected() {
        // admin123 + 旧盐值的 MD5，迁移到 BCrypt 后不再被接受
        when(adminService.getOne(any(Wrapper.class)))
                .thenReturn(admin("0192023a7bbd73250516f069df18b500"));

        Result<?> result = controller.login(Map.of("username", "admin", "password", "admin123"));

        assertEquals("账号或密码错误", result.getMessage());
    }

    @Test
    void loginEndpoint_isRateLimitedByIp() throws NoSuchMethodException {
        RateLimit rateLimit = AdminAuthController.class.getMethod("login", Map.class).getAnnotation(RateLimit.class);

        assertNotNull(rateLimit, "admin login should declare @RateLimit");
        assertEquals(RateLimit.LimitType.IP, rateLimit.limitType());
    }

    private Admin admin(String encodedPassword) {
        Admin admin = new Admin();
        admin.setId(1L);
        admin.setUsername("admin");
        admin.setPassword(encodedPassword);
        admin.setSalt("");
        admin.setStatus(1);
        return admin;
    }
}
