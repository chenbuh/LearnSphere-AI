package com.learnsphere.utils;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.EnvironmentStringPBEConfig;

/**
 * Jasypt 加密工具类
 * 用于加密配置文件中的敏感信息
 */
public class JasyptEncryptUtil {

    /**
     * 加密算法
     */
    private static final String ALGORITHM = "PBEWithMD5AndDES";

    /**
     * 加密密钥（建议通过环境变量设置）
     * 生产环境必须修改此密钥！
     */
    private static final String DEFAULT_PASSWORD = "LearnSphere2026SecretKey";

    /**
     * 加密文本
     *
     * @param plainText 明文
     * @param password  加密密钥
     * @return 加密后的密文
     */
    public static String encrypt(String plainText, String password) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        EnvironmentStringPBEConfig config = new EnvironmentStringPBEConfig();
        config.setAlgorithm(ALGORITHM);
        config.setPassword(password);
        encryptor.setConfig(config);
        return encryptor.encrypt(plainText);
    }

    /**
     * 解密文本
     *
     * @param encryptedText 密文
     * @param password      解密密钥
     * @return 解密后的明文
     */
    public static String decrypt(String encryptedText, String password) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        EnvironmentStringPBEConfig config = new EnvironmentStringPBEConfig();
        config.setAlgorithm(ALGORITHM);
        config.setPassword(password);
        encryptor.setConfig(config);
        return encryptor.decrypt(encryptedText);
    }

    /**
     * 主方法：用于生成加密后的密码
     * 运行示例：java JasyptEncryptUtil chen20040209
     */
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("使用方法：");
            System.out.println("加密：java JasyptEncryptUtil <明文>");
            System.out.println("示例：java JasyptEncryptUtil chen20040209");
            return;
        }

        String plainText = args[0];
        String password = System.getenv("JASYPT_PASSWORD");
        if (password == null || password.isEmpty()) {
            password = DEFAULT_PASSWORD;
            System.out.println("⚠️  警告：使用默认加密密钥，生产环境请设置 JASYPT_PASSWORD 环境变量");
        }

        String encrypted = encrypt(plainText, password);
        System.out.println("======================================");
        System.out.println("明文: " + plainText);
        System.out.println("密文: " + encrypted);
        System.out.println("======================================");
        System.out.println("请在application.properties中使用以下格式：");
        System.out.println("spring.datasource.password=ENC(" + encrypted + ")");
        System.out.println("======================================");

        // 验证加解密
        String decrypted = decrypt(encrypted, password);
        if (plainText.equals(decrypted)) {
            System.out.println("✅ 加密验证成功！");
        } else {
            System.out.println("❌ 加密验证失败！");
        }
    }
}
