package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 学习计划实体
 */
@Data
@TableName("study_plan")
public class StudyPlan {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /**
     * 考试类型：cet4/cet6/ielts/toefl/gre
     */
    private String examType;

    /**
     * 目标分数
     */
    private Integer targetScore;

    /**
     * 当前水平评估
     */
    private Integer currentLevel;

    /**
     * 计划天数
     */
    private Integer durationDays;

    /**
     * 开始日期
     */
    private LocalDate startDate;

    /**
     * 结束日期
     */
    private LocalDate endDate;

    /**
     * 状态：0-已完成，1-进行中，2-已放弃
     */
    private Integer status;

    /**
     * 详细计划（JSON格式）
     */
    private String planDetail;

    /**
     * 完成进度 0-100
     */
    private Integer progress;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
