package com.learnsphere;

import cn.hutool.crypto.digest.BCrypt;

/**
 * 密码生成工具
 */
public class PasswordGenerator {
    public static void main(String[] args) {
        String password = "chen20040209";
        String hashed = BCrypt.hashpw(password, BCrypt.gensalt());
        System.out.println("原始密码: " + password);
        System.out.println("BCrypt加密后: " + hashed);
        System.out.println("验证结果: " + BCrypt.checkpw(password, hashed));
    }
}
