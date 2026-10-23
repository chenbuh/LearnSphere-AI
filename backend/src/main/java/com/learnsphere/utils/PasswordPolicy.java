package com.learnsphere.utils;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * 密码强度策略。
 *
 * <p>BCrypt 只能抵抗离线爆破，挡不住 {@code 123456} 这类弱密码被直接猜中。
 * 用户侧此前只有长度校验（AuthController 6-64 位），管理员侧另有一套独立规则，
 * 两边不一致。这里统一成一套策略，所有设置密码的入口都调用它。
 *
 * @author LearnSphere Team
 */
public final class PasswordPolicy {

    /** 最短长度。8 位是 NIST SP 800-63B 的下限建议。 */
    public static final int MIN_LENGTH = 8;

    /** 最长长度。BCrypt 只取前 72 字节，超长会被静默截断，因此显式限制。 */
    public static final int MAX_LENGTH = 64;

    /** 字典资源路径。随 jar 打包，只读一次。 */
    private static final String BLACKLIST_RESOURCE = "/password-blacklist.txt";

    /**
     * 常见弱密码字典（约 3 万条，含中文场景高频密码）。
     *
     * <p>不含 "123456" 这类长度不足 8 位的条目——它们在长度校验就被拦掉了，
     * 放进来只会浪费内存。加载失败时降级为下面的内置最小值。
     */
    private static final Set<String> WEAK_PASSWORDS = loadBlacklist();

    /** 内置兜底，保证字典文件缺失时策略依然有效。 */
    private static final Set<String> BUILTIN_WEAK = Set.of(
            "12345678", "123456789", "1234567890", "password", "password1", "password123",
            "qwerty123", "abc12345", "11111111", "00000000", "88888888", "66666666",
            "a1234567", "admin123", "iloveyou", "welcome1", "letmein1", "monkey123",
            "dragon123", "sunshine1", "princess1", "football1", "baseball1", "superman1"
    );

    /**
     * 从 classpath 读取弱密码字典。
     *
     * <p>用 HashSet 而非布隆过滤器：3 万条在现代 JVM 上约 2MB 内存，
     * 精确匹配的收益大于省下的那点内存，也避免了误判。
     */
    private static Set<String> loadBlacklist() {
        Set<String> set = new HashSet<>(32768);
        try (InputStream in = PasswordPolicy.class.getResourceAsStream(BLACKLIST_RESOURCE)) {
            if (in == null) {
                return new HashSet<>(BUILTIN_WEAK);
            }
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(in, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String trimmed = line.trim();
                    // 只保留可能通过长度校验的条目
                    if (trimmed.length() >= MIN_LENGTH && trimmed.length() <= MAX_LENGTH) {
                        set.add(trimmed.toLowerCase());
                    }
                }
            }
        } catch (Exception e) {
            return new HashSet<>(BUILTIN_WEAK);
        }
        if (set.isEmpty()) {
            return new HashSet<>(BUILTIN_WEAK);
        }
        return Collections.unmodifiableSet(set);
    }

    /** 供测试与诊断：当前实际加载的字典条目数。 */
    public static int blacklistSize() {
        return WEAK_PASSWORDS.size();
    }

    private PasswordPolicy() {
    }

    /**
     * 校验密码强度。
     *
     * @param password 原始密码
     * @return 不合规时返回给用户看的提示；合规返回 {@code null}
     */
    public static String validate(String password) {
        if (password == null || password.isEmpty()) {
            return "请输入密码";
        }
        if (password.length() < MIN_LENGTH) {
            return "密码至少 " + MIN_LENGTH + " 位";
        }
        if (password.length() > MAX_LENGTH) {
            return "密码不能超过 " + MAX_LENGTH + " 位";
        }
        if (password.chars().anyMatch(Character::isWhitespace)) {
            return "密码不能包含空格";
        }

        boolean hasLetter = password.chars().anyMatch(Character::isLetter);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        if (!hasLetter || !hasDigit) {
            return "密码需同时包含字母和数字";
        }

        if (WEAK_PASSWORDS.contains(password.toLowerCase())) {
            return "密码过于常见，请换一个";
        }

        // 连续或重复字符（如 aaaaaaaa、12345678）容易被猜，直接拦掉
        if (isRepeatedOrSequential(password)) {
            return "密码不能是连续或重复的字符";
        }

        return null;
    }

    /**
     * 判断是否存在重复或连续片段。
     *
     * <p>仅判断整串是不够的：{@code aaaaaaaa1} 只有末位不同，实际强度依然很弱，
     * 因此改成统计“最长重复段”和“最长连续段”占比。
     */
    private static boolean isRepeatedOrSequential(String password) {
        String lower = password.toLowerCase();

        // 最长重复段（同一字符连续出现）
        int longestRepeat = 1;
        int run = 1;
        for (int i = 1; i < lower.length(); i++) {
            if (lower.charAt(i) == lower.charAt(i - 1)) {
                run++;
                longestRepeat = Math.max(longestRepeat, run);
            } else {
                run = 1;
            }
        }

        // 最长连续段（严格递增或递减）
        int longestSequential = 1;
        int asc = 1;
        int desc = 1;
        for (int i = 1; i < lower.length(); i++) {
            int diff = lower.charAt(i) - lower.charAt(i - 1);
            asc = (diff == 1) ? asc + 1 : 1;
            desc = (diff == -1) ? desc + 1 : 1;
            longestSequential = Math.max(longestSequential, Math.max(asc, desc));
        }

        // 阈值设为 6：5 位连续段（如 Admin12345 里的 12345）在真实密码中很常见，
        // 拦掉会误伤正常用户；6 位以上（123456、aaaaaa）才是明显的可猜特征。
        int threshold = 6;
        return longestRepeat >= threshold || longestSequential >= threshold;
    }
}
