package com.learnsphere.utils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * 学习内容加密工具类 - 简单 XOR 版本
 * 兼容性高，无需额外依赖，且能有效防止基础爬虫抓取明文
 */
public class ContentSecurityUtil {

    private static final String KEY = "LrnSphere2026";

    /**
     * 加密/解密 (XOR 是自反的)
     */
    public static String xor(String data) {
        if (data == null || data.isEmpty())
            return data;

        byte[] bytes = data.getBytes(StandardCharsets.UTF_8);
        byte[] keyBytes = KEY.getBytes(StandardCharsets.UTF_8);
        byte[] result = new byte[bytes.length];

        for (int i = 0; i < bytes.length; i++) {
            result[i] = (byte) (bytes[i] ^ keyBytes[i % keyBytes.length]);
        }

        return Base64.getEncoder().encodeToString(result);
    }

    /**
     * 对学习内容对象进行转换
     */
    public static void encryptPayload(java.util.Map<String, Object> payload) {
        if (payload == null)
            return;

        // 处理解析等字段
        String[] sensitiveFields = {
                "analysis", "suggestions", "tips", "hint",
                "explanation", "feedback", "script", "transcript",
                "transcription", "content", "passage", "translation",
                "example", "exampleTranslation", "definition"
        };
        for (String field : sensitiveFields) {
            if (payload.containsKey(field) && payload.get(field) instanceof String) {
                payload.put(field, xor((String) payload.get(field)));
                if (field.equals("content") || field.equals("passage") || field.equals("script")) {
                    payload.put("_secure", true);
                }
            }
        }
    }

    /**
     * 对词汇实体进行加密
     */
    public static void encryptVocabulary(com.learnsphere.entity.Vocabulary v) {
        if (v == null)
            return;
        v.setTranslation(xor(v.getTranslation()));
        v.setExample(xor(v.getExample()));
        v.setExampleTranslation(xor(v.getExampleTranslation()));
        v.setDefinition(xor(v.getDefinition()));
    }

    /**
     * 对词汇分页列表进行加密
     */
    public static void encryptVocabularyPage(
            com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.learnsphere.entity.Vocabulary> page) {
        if (page == null || page.getRecords() == null)
            return;
        page.getRecords().forEach(ContentSecurityUtil::encryptVocabulary);
    }
}
