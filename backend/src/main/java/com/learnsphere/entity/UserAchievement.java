package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user_achievement")
public class UserAchievement {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long achievementId;
    /**
     * 0: In Progress, 1: Unlocked
     */
    private Integer status;
    private Integer currentValue;
    private LocalDateTime unlockedTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
