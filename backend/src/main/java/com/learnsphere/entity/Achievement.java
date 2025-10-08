package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("achievement")
public class Achievement {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String code;
    private String name;
    private String description;
    private String icon;
    private String conditionType;
    private Integer conditionValue;
    private Integer level; // 1-Bronze, 2-Silver, 3-Gold
    private Integer rewardPoints;
    private LocalDateTime createTime;
}
