package com.learnsphere.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VocabularyImportControllerSecurityTest {

    @Test
    void importController_hasAdminRoleGuard() {
        SaCheckRole roleCheck = VocabularyImportController.class.getAnnotation(SaCheckRole.class);
        assertNotNull(roleCheck, "VocabularyImportController should declare @SaCheckRole");
        assertTrue(Arrays.asList(roleCheck.value()).contains("admin"));
    }
}
