package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 每日任务实体
 */
@Data
@TableName("daily_task")
public class DailyTask {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /**
     * 学习计划ID
     */
    private Long planId;

    /**
     * 任务日期
     */
    private LocalDate taskDate;

    /**
     * 任务类型：vocabulary/reading/listening/grammar/writing/speaking
     */
    private String taskType;

    /**
     * 任务名称
     */
    private String taskName;

    /**
     * 目标数量
     */
    private Integer targetCount;

    /**
     * 已完成数量
     */
    private Integer completedCount;

    /**
     * 是否完成
     */
    private Boolean isCompleted;

    /**
     * 完成时间
     */
    private LocalDateTime completeTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
