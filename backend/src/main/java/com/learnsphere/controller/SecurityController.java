package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.UserOperation;
import com.learnsphere.entity.User;
import com.learnsphere.service.IUserService;
import com.learnsphere.utils.MfaUtil;
import com.learnsphere.utils.PasswordUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * 安全行为控制器 (MFA 绑定与自动化解封)
 */
@Slf4j
@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@Tag(name = "系统安全接口", description = "MFA 绑定、风险状态查询及自动化解封流程")
public class SecurityController {

    private final IUserService userService;
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * 校验 MFA 验证码并消费（防重放）。
     *
     * ========================================================================
     * 安全修复（2026-03）：原实现只调用 MfaUtil.verifyCode()，只判断验证码在
     * 当前时间窗内是否有效，不记录「已使用」。由于 verifyCode 接受当前窗口
     * 及前后各一个窗口（约 90 秒），同一个 6 位验证码在该期间内可被反复使用，
     * 使得以下场景出现重放风险：
     *   - /mfa/unbind  ：一次验证码可反复解绑
     *   - /unlock      ：一次验证码可反复解除风险锁定
     *   - /mfa/bind    ：绑定阶段的验证码可被复用
     *
     * 修复方式：校验成功后，将命中的时间步写入 Redis 并设置过期时间；
     * 同一 (scope, userId, timeStep) 再次出现时判定为重放并拒绝。
     *
     * 顺序要求：必须「校验成功 → 检查重放 → 标记已使用」。
     * 绝不能在校验通过前占位，否则攻击者可用错误验证码把窗口占掉（DoS）。
     * ========================================================================
     *
     * @param scope     业务场景（unbind / unlock / bind），用于区分不同用途
     * @param subjectId 主体标识（用户 ID）
     * @param secret    TOTP 密钥
     * @param code      用户提交的验证码
     * @return true 表示校验通过且本次消费成功
     */
    private boolean verifyAndConsumeMfa(String scope, Object subjectId, String secret, String code) {
        if (code == null || code.isBlank()) {
            return false;
        }

        long timeStep = MfaUtil.verifyCodeWithStep(secret, code);
        if (timeStep < 0) {
            return false;
        }

        String key = MfaUtil.replayKey(scope, subjectId, timeStep);
        // setIfAbsent：仅当键不存在时写入，天然满足「先到者成功」
        Boolean firstUse = redisTemplate.opsForValue().setIfAbsent(key, "1");
        if (!Boolean.TRUE.equals(firstUse)) {
            log.warn("检测到 MFA 验证码重放：scope={}, subject={}, timeStep={}", scope, subjectId, timeStep);
            return false;
        }
        redisTemplate.expire(key, Duration.ofSeconds(MfaUtil.replayKeyTtlSeconds()));

        return true;
    }

    /**
     * 获取 MFA 初始化信息。
     *
     * 安全加固（2026-03）：已绑定 MFA 的账号不再允许直接重新生成密钥，
     * 必须先行解除绑定（需要旧凭证校验），防止会话被窃取后直接替换受害者 MFA。
     */
    @Operation(summary = "初始化 MFA 绑定", description = "生成新的密钥和绑定 URL（已绑定账号需先解绑）")
    @UserOperation(module = "security", action = "mfa_setup", description = "初始化 MFA")
    @GetMapping("/mfa/setup")
    public Result<Map<String, String>> setupMfa() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 已绑定 MFA 时禁止直接重新生成，必须先通过解绑流程（校验旧验证码或账号口令）
        if (user.getMfaEnabled() != null && user.getMfaEnabled() == 1) {
            return Result.error("账号已绑定 MFA，如需重新绑定请先完成身份校验后解绑");
        }

        String secret = MfaUtil.generateSecret();
        String qrCodeUrl = MfaUtil.getOtpAuthUrl(user.getUsername(), secret);

        Map<String, String> result = new HashMap<>();
        result.put("secret", secret);
        result.put("qrCodeUrl", qrCodeUrl);
        return Result.success(result);
    }

    /**
     * 绑定 MFA。
     *
     * 安全加固（2026-03）：若账号已启用 MFA，禁止直接覆写 mfa_secret，
     * 否则攻击者可凭一个有效会话完成 MFA 接管。
     */
    @Operation(summary = "完成 MFA 绑定", description = "验证第一个六位验证码并保存密钥")
    @UserOperation(module = "security", action = "mfa_bind", description = "绑定 MFA")
    @PostMapping("/mfa/bind")
    public Result<Void> bindMfa(@RequestBody Map<String, String> body) {
        String secret = body.get("secret");
        String code = body.get("code");

        if (secret == null || secret.isBlank() || code == null || code.isBlank()) {
            return Result.error("参数不完整");
        }

        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }

        // 已绑定账号不允许通过本接口覆写密钥，必须先解绑
        if (user.getMfaEnabled() != null && user.getMfaEnabled() == 1) {
            return Result.error("账号已绑定 MFA，请先通过身份校验解绑后再重新绑定");
        }

        // 防重放校验：绑定场景的验证码同样只能消费一次
        if (!verifyAndConsumeMfa("bind", userId, secret, code)) {
            return Result.error("验证码校验失败，请重试");
        }

        user.setMfaSecret(secret);
        user.setMfaEnabled(1);
        userService.updateById(user);

        log.info("用户 {} 完成 MFA 绑定", userId);
        return Result.successMessage("MFA 绑定成功");
    }

    /**
     * 解绑 MFA：需提供当前账号口令或已生效的 MFA 验证码，二者之一通过即可。
     *
     * 安全加固（2026-03）：补齐原先缺失的解绑入口，使「重绑」必须经过身份再验证，
     * 而不是通过 setupMfa/bindMfa 直接覆写。
     */
    @Operation(summary = "解绑 MFA", description = "校验账号口令或当前 MFA 验证码后解除绑定")
    @UserOperation(module = "security", action = "mfa_unbind", description = "解绑 MFA")
    @PostMapping("/mfa/unbind")
    public Result<Void> unbindMfa(@RequestBody Map<String, String> body) {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);
        if (user == null) {
            return Result.error("用户不存在");
        }
        if (user.getMfaEnabled() == null || user.getMfaEnabled() == 0) {
            return Result.error("账号未绑定 MFA");
        }

        String password = body.get("password");
        String code = body.get("code");

        boolean passwordOk = password != null && !password.isBlank()
                && user.getPassword() != null
                && PasswordUtil.matches(password, user.getPassword());
        // 验证码路径带防重放：同一时间步的验证码只能消费一次
        boolean codeOk = verifyAndConsumeMfa("unbind", userId, user.getMfaSecret(), code);

        if (!passwordOk && !codeOk) {
            return Result.error("身份校验失败：请提供正确的账号密码或当前 MFA 验证码");
        }

        user.setMfaSecret(null);
        user.setMfaEnabled(0);
        userService.updateById(user);

        log.info("用户 {} 已解绑 MFA", userId);
        return Result.successMessage("MFA 已解绑");
    }

    /**
     * 使用 MFA 自动化解封
     */
    @Operation(summary = "自动化风险解封", description = "通过 MFA 校验后，清空 Redis 中的违规计数，重置账户状态")
    @UserOperation(module = "security", action = "unlock", description = "解除风险锁定")
    @PostMapping("/unlock")
    public Result<Void> unlock(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);

        if (user.getMfaEnabled() == null || user.getMfaEnabled() == 0) {
            return Result.error("账户未绑定 MFA，请联系管理员手动解锁");
        }

        // 防重放校验：解封用的验证码只能消费一次，
        // 避免一次有效验证码被反复用于解除风险限制
        if (!verifyAndConsumeMfa("unlock", userId, user.getMfaSecret(), code)) {
            return Result.error("MFA 验证码错误或已被使用");
        }

        // 核心逻辑：清空 Redis 违规计数
        String key = "security:violation:" + userId;
        redisTemplate.delete(key);

        log.info("用户 {} 已通过 MFA 成功解除风险锁定", userId);
        return Result.successMessage("风险限制已解除，当前功能已恢复正常");
    }

    /**
     * 获取当前风险状态。
     *
     * 安全加固（2026-03）：违规计数解析改用安全方法，
     * 避免 Redis 中存在非数字内容时抛出 NumberFormatException。
     */
    @GetMapping("/risk-status")
    public Result<Map<String, Object>> getRiskStatus() {
        Long userId = StpUtil.getLoginIdAsLong();
        String key = "security:violation:" + userId;
        Object violations = redisTemplate.opsForValue().get(key);

        int count = readViolationCount(violations);
        Map<String, Object> result = new HashMap<>();
        result.put("violations", count);
        result.put("isLocked", count >= 10);

        User user = userService.getById(userId);
        result.put("mfaEnabled", user != null && user.getMfaEnabled() != null && user.getMfaEnabled() == 1);

        return Result.success(result);
    }

    /**
     * 安全解析违规计数：非数字或异常一律回退为 0，不向外抛出异常。
     */
    private static int readViolationCount(Object value) {
        if (value == null) {
            return 0;
        }
        try {
            return Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException e) {
            log.warn("违规计数格式异常，已按 0 处理: {}", value);
            return 0;
        }
    }
}
