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

    private String avatar;

    private String phone;

    private String examType;

    private Integer targetScore;

    private String currentLevel;

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

    private Integer status;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
