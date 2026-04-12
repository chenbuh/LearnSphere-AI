package com.learnsphere.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SaTokenConfigTest {

    @Test
    void requiresAdminRole_returnsTrue_forAdminBusinessPath() {
        assertTrue(SaTokenConfig.requiresAdminRole("/api/admin/users"));
    }

    @Test
    void requiresAdminRole_returnsFalse_forAdminAuthPath() {
        assertFalse(SaTokenConfig.requiresAdminRole("/api/admin/auth/login"));
    }

    @Test
    void requiresAdminRole_returnsTrue_forActuatorPath() {
        assertTrue(SaTokenConfig.requiresAdminRole("/api/actuator/prometheus"));
    }

    @Test
    void requiresAdminRole_returnsTrue_forDiagnosticPath() {
        assertTrue(SaTokenConfig.requiresAdminRole("/api/diagnostic/status"));
    }

    @Test
    void requiresAdminRole_returnsFalse_forNullOrNonAdminPath() {
        assertFalse(SaTokenConfig.requiresAdminRole(null));
        assertFalse(SaTokenConfig.requiresAdminRole("/api/user/profile"));
    }
}
