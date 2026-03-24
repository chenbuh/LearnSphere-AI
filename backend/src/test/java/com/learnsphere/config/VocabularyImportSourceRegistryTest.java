package com.learnsphere.config;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VocabularyImportSourceRegistryTest {

    @Test
    void registry_exposesExpectedSafeTargets() {
        Map<String, String> targets = VocabularyImportSourceRegistry.getSafeImportTargets();

        assertEquals(11, targets.size());
        assertEquals("../frontend-vue/src/data/primary_school_words.js", targets.get("primary"));
        assertEquals("../frontend-vue/src/data/middle_school_words.js", targets.get("middle"));
        assertEquals("../frontend-vue/src/data/high_school_words.js", targets.get("high"));
        assertEquals("../frontend-vue/src/data/cet4_words.js", targets.get("cet4"));
        assertEquals("../frontend-vue/src/data/tem8_words.js", targets.get("tem8"));
        assertTrue(targets.containsKey("postgraduate"));
    }

    @Test
    void resolvePath_supportsWhitelistKeyAndWhitelistedPath() {
        String cet4Path = VocabularyImportSourceRegistry.resolvePath("cet4");
        assertEquals("../frontend-vue/src/data/cet4_words.js", cet4Path);

        String directPath = VocabularyImportSourceRegistry.resolvePath("../frontend-vue/src/data/cet6_words.js");
        assertEquals("../frontend-vue/src/data/cet6_words.js", directPath);

        assertNull(VocabularyImportSourceRegistry.resolvePath("../../etc/passwd"));
        assertNull(VocabularyImportSourceRegistry.resolvePath(null));
    }

    @Test
    void allImportPaths_followRegistryOrder() {
        List<String> paths = VocabularyImportSourceRegistry.getAllImportFilePaths();

        assertEquals(11, paths.size());
        assertEquals("../frontend-vue/src/data/primary_school_words.js", paths.get(0));
        assertEquals("../frontend-vue/src/data/cet4_words.js", paths.get(3));
        assertEquals("../frontend-vue/src/data/postgraduate_words.js", paths.get(paths.size() - 1));
        assertNotNull(VocabularyImportSourceRegistry.getPath("gre"));
    }
}
