package com.learnsphere.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * 生成管理员密码的工具类
 */
public class GenerateAdminPassword {

    public static void main(String[] args) {
        String password = "chen20040209";
        String salt = "learnsphere2024salt";

        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            String saltedPassword = password + salt;
            byte[] hashBytes = md.digest(saltedPassword.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            System.out.println("密码: " + password);
            System.out.println("盐值: " + salt);
            System.out.println("正确的哈希值: " + hexString.toString());

            // 验证
            String storedHash = "8a5ed4e0b7f2c6d3a9e1f4b8c2d7a3e9";
            System.out.println("\nSQL中的哈希值: " + storedHash);
            System.out.println("是否匹配: " + hexString.toString().equals(storedHash));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
