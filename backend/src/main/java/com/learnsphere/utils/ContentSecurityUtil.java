package com.learnsphere.utils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * 学习内容加密工具类 - 简单 XOR 版本
 * 兼容性高，无需额外依赖，且能有效防止基础爬虫抓取明文
 */
public class ContentSecurityUtil {

    private static final String STATIC_SALT = "LrnSphere2026";

    /**
     * 密钥日期在响应里使用的字段名。
     *
     * 前端必须知道后端到底用了哪一天的密钥，否则只要浏览器和服务器
     * 对"今天"的判断差一天（UTC 与本地时区、跨零点、容器时区等），
     * 就会解出 insist on -> insist oa、空格 -> /、? -> 0 这类乱码。
     * 前端会优先读这个字段，读不到时才退回本地日期。
     */
    public static final String KEY_DATE_FIELD = "_keyDate";

    /**
     * 当前密钥对应的日期（服务器本地时区）
     */
    public static String currentKeyDate() {
        return java.time.LocalDate.now().toString();
    }

    /**
     * 获取动态加密密钥 (按天变换)
     */
    private static byte[] getDynamicKey() {
        String date = java.time.LocalDate.now().toString();
        String rawKey = STATIC_SALT + date;
        return rawKey.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * 加密/解密 (XOR 是自反的)
     */
    public static String xor(String data) {
        if (data == null || data.isEmpty())
            return data;

        byte[] bytes = data.getBytes(StandardCharsets.UTF_8);
        byte[] keyBytes = getDynamicKey();
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

        // 处理敏感字段
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
        // 告诉前端本次加密用的密钥日期，避免前端猜错日期导致字符被改
        payload.put(KEY_DATE_FIELD, currentKeyDate());
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
     *
     * 分页对象本身是 Page<Vocabulary>，没有合适的字段挂"密钥日期"，
     * 因此由调用方（VocabularyController）额外把 keyDate 放进响应的
     * Result 里；这里只负责逐条加密。
     */
    public static void encryptVocabularyPage(
            com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.learnsphere.entity.Vocabulary> page) {
        if (page == null || page.getRecords() == null)
            return;
        page.getRecords().forEach(ContentSecurityUtil::encryptVocabulary);
    }
}
