package com.learnsphere.payment;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * 彩虹易支付 MD5 签名：参数按 key 升序，排除 sign / sign_type 和空值，
 * 拼成 k1=v1&k2=v2 后直接追加商户密钥，取 32 位小写 MD5。
 */
public final class EpaySigner {

    private EpaySigner() {
    }

    public static String sign(Map<String, String> params, String key) {
        String content = new TreeMap<>(params).entrySet().stream()
                .filter(e -> !"sign".equals(e.getKey()) && !"sign_type".equals(e.getKey()))
                .filter(e -> e.getValue() != null && !e.getValue().isEmpty())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));
        return md5(content + key);
    }

    public static boolean verify(Map<String, String> params, String key) {
        String sign = params.get("sign");
        if (sign == null || sign.isEmpty()) {
            return false;
        }
        // 常量时间比较，避免时序侧信道
        return MessageDigest.isEqual(sign.toLowerCase().getBytes(StandardCharsets.UTF_8),
                sign(params, key).getBytes(StandardCharsets.UTF_8));
    }

    private static String md5(String text) {
        try {
            byte[] digest = MessageDigest.getInstance("MD5").digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(32);
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
