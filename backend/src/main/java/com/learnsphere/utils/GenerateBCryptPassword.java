package com.learnsphere.utils;

import cn.hutool.crypto.digest.BCrypt;

/**
 * 生成BCrypt密码的工具类
 */
public class GenerateBCryptPassword {

    public static void main(String[] args) {
        // 为用户 damin 生成密码
        String password = "147258369";
        String username = "damin";

        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

        System.out.println("========================================");
        System.out.println("BCrypt 密码生成器");
        System.out.println("========================================");
        System.out.println("用户名: " + username);
        System.out.println("原始密码: " + password);
        System.out.println("BCrypt哈希: " + hashedPassword);
        System.out.println("========================================");
        System.out.println("\nSQL语句:");
        System.out.println("INSERT INTO `user` (`username`, `password`, `nickname`, `status`) VALUES");
        System.out.println("('" + username + "', '" + hashedPassword + "', '" + username + "', 1);");
        System.out.println("========================================");

        // 验证
        boolean matches = BCrypt.checkpw(password, hashedPassword);
        System.out.println("\n验证结果: " + (matches ? "✓ 成功" : "✗ 失败"));
    }
}
