package com.learnsphere.common;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdminRoleTest {

    @Test
    void superAdmin_canAccessEverything() {
        assertTrue(AdminRole.SUPER_ADMIN.canAccess("/api/admin/accounts"));
        assertTrue(AdminRole.SUPER_ADMIN.canAccess("/api/admin/redis/clear"));
        assertTrue(AdminRole.SUPER_ADMIN.canAccess("/api/admin/orders/3/refund"));
    }

    @Test
    void content_canManageContentButNotUsersOrSystem() {
        assertTrue(AdminRole.CONTENT.canAccess("/api/admin/vocabulary"));
        assertTrue(AdminRole.CONTENT.canAccess("/api/admin/reading/12"));
        assertTrue(AdminRole.CONTENT.canAccess("/api/admin/ai/prompts"));
        assertFalse(AdminRole.CONTENT.canAccess("/api/admin/users"));
        assertFalse(AdminRole.CONTENT.canAccess("/api/admin/system/config"));
        assertFalse(AdminRole.CONTENT.canAccess("/api/admin/redis/keys"));
    }

    @Test
    void operator_canManageUsersAndOrdersButNotContentOrPrices() {
        assertTrue(AdminRole.OPERATOR.canAccess("/api/admin/users/5/status"));
        assertTrue(AdminRole.OPERATOR.canAccess("/api/admin/orders"));
        assertTrue(AdminRole.OPERATOR.canAccess("/api/admin/notifications"));
        assertFalse(AdminRole.OPERATOR.canAccess("/api/admin/vocabulary"));
        assertFalse(AdminRole.OPERATOR.canAccess("/api/admin/orders/plans"));
        assertFalse(AdminRole.OPERATOR.canAccess("/api/admin/orders/9/refund"));
    }

    @Test
    void superOnlyPaths_blockedEvenWhenPrefixWouldMatch() {
        // content 能访问 /api/admin/ai，但 AI 服务密钥配置只给超级管理员
        assertFalse(AdminRole.CONTENT.canAccess("/api/admin/ai/config"));
        assertFalse(AdminRole.CONTENT.canAccess("/api/admin/ai-tutor/config"));
        assertFalse(AdminRole.OPERATOR.canAccess("/api/admin/accounts"));
    }

    @Test
    void prefixMatch_requiresSegmentBoundary() {
        // /api/admin/users 不应放行 /api/admin/users-export 之类的相邻路径
        assertFalse(AdminRole.OPERATOR.canAccess("/api/admin/usersx"));
        assertFalse(AdminRole.CONTENT.canAccess("/api/admin/ai-tutorx"));
    }

    @Test
    void fromCode_resolvesKnownCodesOnly() {
        assertEquals(AdminRole.CONTENT, AdminRole.fromCode("content").orElseThrow());
        assertTrue(AdminRole.fromCode("root").isEmpty());
        assertTrue(AdminRole.fromCode(null).isEmpty());
    }
}
