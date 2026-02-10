package com.learnsphere.utils;

import cn.hutool.core.codec.Base32;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.crypto.digest.HMac;
import cn.hutool.crypto.digest.HmacAlgorithm;
import lombok.extern.slf4j.Slf4j;

import java.nio.ByteBuffer;
import java.time.Instant;

/**
 * MFA (TOTP) 工具类
 * 实现基于 Google Authenticator 的标准 TOTP 算法
 */
@Slf4j
public class MfaUtil {

    private static final int TIME_STEP = 30; // 30秒步长
    private static final int CODE_DIGITS = 6;

    /**
     * 生成随机密钥 (Base32 编码)
     */
    public static String generateSecret() {
        byte[] buffer = new byte[10];
        RandomUtil.getSecureRandom().nextBytes(buffer);
        return Base32.encode(buffer).toUpperCase();
    }

    /**
     * 验证验证码
     */
    public static boolean verifyCode(String secret, String code) {
        if (secret == null || code == null)
            return false;
        long counter = Instant.now().getEpochSecond() / TIME_STEP;
        // 允许前后一个周期的误差
        return checkCode(secret, code, counter - 1) ||
                checkCode(secret, code, counter) ||
                checkCode(secret, code, counter + 1);
    }

    private static boolean checkCode(String secret, String code, long counter) {
        try {
            byte[] key = Base32.decode(secret);
            byte[] data = ByteBuffer.allocate(8).putLong(counter).array();

            HMac hmac = new HMac(HmacAlgorithm.HmacSHA1, key);
            byte[] hash = hmac.digest(data);

            int offset = hash[hash.length - 1] & 0xf;
            long truncatedHash = 0;
            for (int i = 0; i < 4; ++i) {
                truncatedHash <<= 8;
                truncatedHash |= (hash[offset + i] & 0xff);
            }
            truncatedHash &= 0x7fffffff;
            truncatedHash %= Math.pow(10, CODE_DIGITS);

            String generatedCode = String.format("%0" + CODE_DIGITS + "d", (int) truncatedHash);
            return generatedCode.equals(code);
        } catch (Exception e) {
            log.error("MFA verification error", e);
            return false;
        }
    }

    /**
     * 生成 Google Authenticator 绑定链接
     */
    public static String getOtpAuthUrl(String user, String secret) {
        return String.format("otpauth://totp/LearnSphere:%s?secret=%s&issuer=LearnSphere", user, secret);
    }
}
