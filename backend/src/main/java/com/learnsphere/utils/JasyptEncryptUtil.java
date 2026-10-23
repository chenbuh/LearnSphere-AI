package com.learnsphere.utils;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.EnvironmentStringPBEConfig;
import org.jasypt.iv.RandomIvGenerator;
import org.jasypt.salt.RandomSaltGenerator;

/**
 * Jasypt 加密工具类
 * 用于加密配置文件中的敏感信息。
 *
 * 安全约定（请勿回退）：
 * - 算法固定为 PBEWITHHMACSHA512ANDAES_256，禁止改回 PBEWithMD5AndDES。
 * - 必须使用随机 IV 与随机盐，禁止使用 NoIvGenerator。
 * - 加密口令只能来自环境变量 JASYPT_PASSWORD；不得硬编码默认值。
 *   缺失口令时直接抛错，避免静默使用弱密钥继续运行。
 */
public final class JasyptEncryptUtil {

    /**
     * 加密算法：AES-256 + HMAC-SHA512 密钥派生。
     */
    private static final String ALGORITHM = "PBEWITHHMACSHA512ANDAES_256";

    /**
     * 密钥派生迭代次数，提高离线暴力破解成本。
     */
    private static final int KEY_OBTENTION_ITERATIONS = 100_000;

    /**
     * 环境变量名。
     */
    private static final String PASSWORD_ENV = "JASYPT_PASSWORD";

    private JasyptEncryptUtil() {
    }

    /**
     * 加密文本
     *
     * @param plainText 明文
     * @param password  加密密钥（不得为默认值，调用方须传入真实密钥）
     * @return 加密后的密文
     */
    public static String encrypt(String plainText, String password) {
        return buildEncryptor(password).encrypt(plainText);
    }

    /**
     * 解密文本
     *
     * @param encryptedText 密文
     * @param password      解密密钥
     * @return 解密后的明文
     */
    public static String decrypt(String encryptedText, String password) {
        return buildEncryptor(password).decrypt(encryptedText);
    }

    private static StandardPBEStringEncryptor buildEncryptor(String password) {
        if (password == null || password.isEmpty()) {
            throw new IllegalStateException(
                    "未提供加密口令：请设置环境变量 " + PASSWORD_ENV + " 后重试");
        }
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        EnvironmentStringPBEConfig config = new EnvironmentStringPBEConfig();
        config.setAlgorithm(ALGORITHM);
        config.setPassword(password);
        config.setKeyObtentionIterations(KEY_OBTENTION_ITERATIONS);
        config.setIvGenerator(new RandomIvGenerator());
        config.setSaltGenerator(new RandomSaltGenerator());
        encryptor.setConfig(config);
        return encryptor;
    }

    /**
     * 主方法：用于生成加密后的密码。
     * 运行示例（先设置 JASYPT_PASSWORD）：
     *   $env:JASYPT_PASSWORD="&lt;强口令&gt;"
     *   java JasyptEncryptUtil &lt;明文&gt;
     */
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("使用方法：");
            System.out.println("加密：java JasyptEncryptUtil <明文>（需先设置环境变量 " + PASSWORD_ENV + "）");
            return;
        }

        String plainText = args[0];
        String password = System.getenv(PASSWORD_ENV);
        if (password == null || password.isEmpty()) {
            System.err.println("❌ 未检测到环境变量 " + PASSWORD_ENV + "。");
            System.err.println("   为避免使用弱密钥，本工具不提供默认口令，请先设置后重试。");
            System.exit(1);
            return;
        }

        String encrypted = encrypt(plainText, password);
        System.out.println("======================================");
        System.out.println("算法: " + ALGORITHM);
        System.out.println("密文: " + encrypted);
        System.out.println("======================================");
        System.out.println("请勿把密文与密钥提交到同一仓库。");
        System.out.println("在配置中使用格式：spring.datasource.password=ENC(" + encrypted + ")");
        System.out.println("======================================");

        String decrypted = decrypt(encrypted, password);
        if (plainText.equals(decrypted)) {
            System.out.println("✅ 加密验证成功！");
        } else {
            System.out.println("❌ 加密验证失败！");
            System.exit(2);
        }
    }
}
