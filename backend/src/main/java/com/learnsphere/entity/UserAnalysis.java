package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户 AI 分析报告实体
 */
@Data
@TableName("user_analysis")
public class UserAnalysis {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String reportJson;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
