package com.learnsphere.config;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 词库导入来源注册表。
 * 统一维护允许导入的词库键与文件路径，避免多个控制器各自维护一份硬编码清单。
 */
public final class VocabularyImportSourceRegistry {

    private static final String FRONTEND_DATA_DIR = "../frontend-vue/src/data/";

    private static final Map<String, String> SAFE_IMPORT_TARGETS;

    static {
        Map<String, String> targets = new LinkedHashMap<>();
        targets.put("primary", FRONTEND_DATA_DIR + "primary_school_words.js");
        targets.put("middle", FRONTEND_DATA_DIR + "middle_school_words.js");
        targets.put("high", FRONTEND_DATA_DIR + "high_school_words.js");
        targets.put("cet4", FRONTEND_DATA_DIR + "cet4_words.js");
        targets.put("cet6", FRONTEND_DATA_DIR + "cet6_words.js");
        targets.put("ielts", FRONTEND_DATA_DIR + "ielts_words.js");
        targets.put("toefl", FRONTEND_DATA_DIR + "toefl_words.js");
        targets.put("gre", FRONTEND_DATA_DIR + "gre_words.js");
        targets.put("tem4", FRONTEND_DATA_DIR + "tem4_words.js");
        targets.put("tem8", FRONTEND_DATA_DIR + "tem8_words.js");
        targets.put("postgraduate", FRONTEND_DATA_DIR + "postgraduate_words.js");
        SAFE_IMPORT_TARGETS = Collections.unmodifiableMap(targets);
    }

    private VocabularyImportSourceRegistry() {
    }

    public static String getPath(String sourceKey) {
        return SAFE_IMPORT_TARGETS.get(sourceKey);
    }

    public static String resolvePath(String sourceKeyOrPath) {
        if (sourceKeyOrPath == null || sourceKeyOrPath.isBlank()) {
            return null;
        }

        String normalized = sourceKeyOrPath.trim();
        String resolved = SAFE_IMPORT_TARGETS.get(normalized);
        if (resolved != null) {
            return resolved;
        }

        return SAFE_IMPORT_TARGETS.containsValue(normalized) ? normalized : null;
    }

    public static Map<String, String> getSafeImportTargets() {
        return SAFE_IMPORT_TARGETS;
    }

    public static List<String> getAllImportFilePaths() {
        return List.copyOf(SAFE_IMPORT_TARGETS.values());
    }
}
