package com.learnsphere.utils;

import cn.hutool.crypto.digest.BCrypt;

/**
 * 密码工具类
 * 使用BCrypt进行密码加密，自动生成盐
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
public class PasswordUtil {

    /**
     * 加密密码
     * BCrypt会自动生成盐并将其包含在哈希值中
     * 
     * @param rawPassword 原始密码
     * @return 加密后的密码
     */
    public static String encode(String rawPassword) {
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt());
    }

    /**
     * 验证密码
     * 
     * @param rawPassword 原始密码
     * @param encodedPassword 加密后的密码
     * @return 是否匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        return BCrypt.checkpw(rawPassword, encodedPassword);
    }

    /**
     * 生成指定强度的盐
     * 
     * @param rounds 加密轮数，默认10，范围4-31
     * @return 盐值
     */
    public static String generateSalt(int rounds) {
        return BCrypt.gensalt(rounds);
    }

    /**
     * 使用指定盐加密密码
     * 
     * @param rawPassword 原始密码
     * @param salt 盐值
     * @return 加密后的密码
     */
    public static String encodeWithSalt(String rawPassword, String salt) {
        return BCrypt.hashpw(rawPassword, salt);
    }
}