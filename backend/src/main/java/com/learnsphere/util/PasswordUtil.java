package com.learnsphere.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * 密码工具类 - 盐值加密
 * 
 * @author LearnSphere Team
 */
public class PasswordUtil {

    /**
     * 生成随机盐值
     */
    public static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return bytesToHex(salt);
    }

    /**
     * 使用MD5+盐值加密密码
     */
    public static String hashPassword(String password, String salt) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            String saltedPassword = password + salt;
            byte[] hashBytes = md.digest(saltedPassword.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5算法不可用", e);
        }
    }

    /**
     * 字节数组转十六进制字符串
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * 验证密码
     * 
     * @param rawPassword    原始密码（用户输入）
     * @param salt           盐值
     * @param storedPassword 存储的加密密码
     * @return 是否匹配
     */
    public static boolean matches(String rawPassword, String salt, String storedPassword) {
        if (rawPassword == null || storedPassword == null) {
            return false;
        }
        // 如果没有盐值，直接比较（兼容旧数据）
        if (salt == null || salt.isEmpty()) {
            return storedPassword.equals(rawPassword);
        }
        // 使用盐值加密后比较
        String hashedInput = hashPassword(rawPassword, salt);
        return hashedInput.equals(storedPassword);
    }

    /**
     * 生成测试用的加密密码
     * 用于初始化数据
     */
    public static void main(String[] args) {
        String password = "chen20040209";
        String salt = "learnsphere2024";
        String hashed = hashPassword(password, salt);
        System.out.println("盐值: " + salt);
        System.out.println("加密后的密码: " + hashed);
        System.out.println("验证结果: " + matches(password, salt, hashed));
    }
}
