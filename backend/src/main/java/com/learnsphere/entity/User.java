package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户实体
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
@TableName("user")
@Schema(description = "用户信息")
public class User {

    @TableId(type = IdType.AUTO)
    @Schema(description = "用户ID")
    private Long id;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "密码", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String password;

    @Schema(description = "盐值", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String salt;

    @Schema(description = "邮箱")
    private String email;

    @Schema(description = "昵称")
    private String nickname;

    @Schema(description = "简介")
    private String bio;

    @Schema(description = "头像")
    private String avatar;

    @Schema(description = "手机号")
    private String phone;

    @Schema(description = "考试类型 (cet4/cet6/ielts/toefl)")
    private String examType;

    @Schema(description = "目标分数")
    private Integer targetScore;

    @Schema(description = "当前水平")
    private String currentLevel;

    /**
     * VIP 过期时间，NULL 表示非会员
     */
    private LocalDateTime vipExpireTime;

    /**
     * VIP 等级：0-普通用户，1-月度会员，2-季度会员，3-年度会员
     */
    private Integer vipLevel;

    /**
     * 每日 AI 调用配额（VIP 默认 200，普通用户为 0）
     */
    private Integer dailyAiQuota;

    /**
     * 连续打卡天数
     */
    private Integer consecutiveDays;

    /**
     * 最后打卡日期
     */
    private java.time.LocalDate lastCheckinDate;

    /**
     * 累计打卡天数
     */
    private Integer totalCheckinDays;

    /**
     * 用户积分
     */
    private Integer points;

    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;

    private Integer status;

    @Schema(description = "MFA 密钥")
    private String mfaSecret;

    @Schema(description = "是否启用 MFA")
    private Integer mfaEnabled;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
