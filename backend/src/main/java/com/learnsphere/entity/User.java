package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
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
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    private String password;

    private String salt;

    private String email;

    private String nickname;

    private String bio;

    private String avatar;

    private String phone;

    private String examType;

    private Integer targetScore;

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

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
