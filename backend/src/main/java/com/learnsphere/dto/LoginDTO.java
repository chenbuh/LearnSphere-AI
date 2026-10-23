package com.learnsphere.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 登录DTO
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
@Schema(description = "登录请求参数")
public class LoginDTO {
    @Schema(description = "用户名", requiredMode = Schema.RequiredMode.REQUIRED, example = "admin")
    private String username;

    @Schema(description = "密码", requiredMode = Schema.RequiredMode.REQUIRED, example = "123456")
    private String password;

    @Schema(description = "验证码")
    private String captchaCode;

    @Schema(description = "验证码Key")
    private String captchaKey;

    /**
     * 覆盖 Lombok 生成的 toString，避免密码被意外写进日志。
     *
     * <p>{@code @Data} 默认会把所有字段拼进 toString，一旦有人写了
     * {@code log.info("login: {}", dto)} 就会把明文密码落盘。
     */
    @Override
    public String toString() {
        return "LoginDTO(username=" + username
                + ", password=***"
                + ", captchaCode=" + (captchaCode == null ? "null" : "***")
                + ", captchaKey=" + captchaKey + ")";
    }
}
