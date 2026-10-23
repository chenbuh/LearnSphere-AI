package com.learnsphere.utils;

import cn.hutool.core.codec.Base32;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.crypto.digest.HMac;
import cn.hutool.crypto.digest.HmacAlgorithm;
import lombok.extern.slf4j.Slf4j;

import java.nio.ByteBuffer;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * MFA (TOTP) 工具类
 * 实现基于 RFC 6238 / Google Authenticator 的标准 TOTP 算法。
 *
 * ============================================================================
 * 安全修复（2026-03）：
 *   1) 密钥长度：原为 10 字节（80 位），低于 RFC 4226 要求的 128 位下限。
 *      现提升为 20 字节（160 位），与 Google Authenticator 默认一致。
 *   2) 验证码比较：原使用 String.equals（短路比较），存在时序侧信道。
 *      现改为 MessageDigest.isEqual 常量时间比较，与项目内 EpaySigner 保持一致。
 *   3) 窗口：仍接受前后各 1 个时间步（±30 秒）以容忍时钟漂移，这一点符合惯例。
 *      防重放需在调用侧完成（同一验证码只允许成功一次），见类注释末尾说明。
 * ============================================================================
 */
@Slf4j
public class MfaUtil {

    private static final int TIME_STEP = 30; // 30秒
    private static final int CODE_DIGITS = 6;

    /** 密钥字节数：160 位，符合 RFC 4226 建议且与主流验证器一致 */
    private static final int SECRET_BYTES = 20;

    /**
     * 生成随机密钥 (Base32 编码)。
     * 使用 20 字节（160 位）密钥，不得调低。
     */
    public static String generateSecret() {
        byte[] buffer = new byte[SECRET_BYTES];
        RandomUtil.getSecureRandom().nextBytes(buffer);
        return Base32.encode(buffer).toUpperCase();
    }

    /**
     * 验证验证码。
     *
     * ⚠️ 防重放说明：本方法只判断验证码在当前时间窗内是否有效，
     * 不记录「已使用过的验证码」。调用方如需防重放，应结合 Redis 记录
     * 已成功使用的 (userId, 时间步) 组合，同一时间步只允许成功一次。
     */
    public static boolean verifyCode(String secret, String code) {
        if (secret == null || code == null)
            return false;
        long counter = Instant.now().getEpochSecond() / TIME_STEP;
        // 允许前后周期的请求（容忍时钟漂移）
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

            // 常量时间比较，避免通过响应时间推断验证码（原为 String.equals）
            return MessageDigest.isEqual(
                    generatedCode.getBytes(StandardCharsets.UTF_8),
                    code.trim().getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("MFA verification error", e);
            return false;
        }
    }

    /**
     * 验证验证码，并返回命中的时间步（用于防重放）。
     *
     * 返回 -1 表示校验失败；返回 >= 0 表示校验成功，且该值就是本次命中的
     * TOTP 时间步计数器。调用方应在校验成功后，把该时间步记录为「已使用」，
     * 使同一验证码无法在窗口期内被重复使用。
     *
     * @param secret TOTP 密钥
     * @param code   用户提交的验证码
     * @return 命中的时间步；失败返回 -1
     */
    public static long verifyCodeWithStep(String secret, String code) {
        if (secret == null || code == null) {
            return -1L;
        }
        long counter = Instant.now().getEpochSecond() / TIME_STEP;
        // 顺序与 verifyCode 保持一致：先当前窗口，再前、后窗口
        if (checkCode(secret, code, counter)) {
            return counter;
        }
        if (checkCode(secret, code, counter - 1)) {
            return counter - 1;
        }
        if (checkCode(secret, code, counter + 1)) {
            return counter + 1;
        }
        return -1L;
    }

    /**
     * 生成用于防重放的 Redis 键。
     *
     * 格式：mfa:used:{scope}:{subjectId}:{timeStep}
     * 同一主体在同一时间步只允许使用一次该验证码。
     *
     * @param scope     业务场景，例如 "unlock" / "unbind" / "bind"
     * @param subjectId 主体标识（通常为用户 ID）
     * @param timeStep  命中的时间步（来自 verifyCodeWithStep）
     */
    public static String replayKey(String scope, Object subjectId, long timeStep) {
        return "mfa:used:" + scope + ":" + subjectId + ":" + timeStep;
    }

    /**
     * 时间步有效期（秒）。TOTP 窗口为 30 秒，且接受前后各一步，
     * 因此记录需保留 3 个窗口即 90 秒；这里留出余量取 120 秒。
     */
    public static long replayKeyTtlSeconds() {
        return TIME_STEP * 4L;
    }

    /**
     * 生成 Google Authenticator 绑定链接
     */
    public static String getOtpAuthUrl(String user, String secret) {
        return String.format("otpauth://totp/LearnSphere:%s?secret=%s&issuer=LearnSphere", user, secret);
    }
}

