package com.learnsphere.common;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * 后台管理员角色。
 * super_admin 拥有全部权限；content 负责内容与 AI 审核；operator 负责学员运营与通知。
 * 每个角色列出它能访问的 /api/admin 路径前缀，未列出的路径只有超级管理员可访问。
 */
public enum AdminRole {

    SUPER_ADMIN("super_admin", "超级管理员", List.of()),

    CONTENT("content", "内容运营", List.of(
            "/api/admin/stats", "/api/admin/content-stats", "/api/admin/user-growth",
            "/api/admin/user-funnel", "/api/admin/retention", "/api/admin/search",
            "/api/admin/vocabulary", "/api/admin/listening", "/api/admin/reading",
            "/api/admin/writing", "/api/admin/grammar", "/api/admin/speaking",
            "/api/admin/content", "/api/admin/audit", "/api/admin/exams",
            "/api/admin/learning-records", "/api/admin/learning-stats",
            "/api/admin/ai", "/api/admin/ai-tutor", "/api/admin/sensitive")),

    OPERATOR("operator", "用户运营", List.of(
            "/api/admin/stats", "/api/admin/content-stats", "/api/admin/user-growth",
            "/api/admin/user-funnel", "/api/admin/retention", "/api/admin/finance",
            "/api/admin/search", "/api/admin/users", "/api/admin/vip",
            "/api/admin/orders", "/api/admin/notifications", "/api/admin/user-logs",
            "/api/admin/learning-records", "/api/admin/learning-stats",
            "/api/admin/exams", "/api/admin/speaking-leaderboard"));

    /** 即使前缀匹配也只允许超级管理员访问的路径（AI 服务密钥、模型切换等） */
    private static final List<String> SUPER_ONLY_PREFIXES = List.of(
            "/api/admin/ai/config", "/api/admin/ai-tutor/config", "/api/admin/accounts",
            "/api/admin/orders/plans");

    private final String code;
    private final String label;
    private final List<String> allowedPrefixes;

    AdminRole(String code, String label, List<String> allowedPrefixes) {
        this.code = code;
        this.label = label;
        this.allowedPrefixes = allowedPrefixes;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static Optional<AdminRole> fromCode(String code) {
        return Arrays.stream(values()).filter(role -> role.code.equals(code)).findFirst();
    }

    /** 未设置或无法识别的角色按最小权限处理（只能访问自己的认证信息） */
    public boolean canAccess(String path) {
        if (this == SUPER_ADMIN) {
            return true;
        }
        if (path == null || matchesAny(SUPER_ONLY_PREFIXES, path) || isOrderRefund(path)) {
            return false;
        }
        return matchesAny(allowedPrefixes, path);
    }

    /** 订单退款涉及资金，只允许超级管理员操作 */
    private static boolean isOrderRefund(String path) {
        return path.startsWith("/api/admin/orders/") && path.endsWith("/refund");
    }

    private static boolean matchesAny(List<String> prefixes, String path) {
        return prefixes.stream().anyMatch(prefix -> path.equals(prefix) || path.startsWith(prefix + "/"));
    }
}
