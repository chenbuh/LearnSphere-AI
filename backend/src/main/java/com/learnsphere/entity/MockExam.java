package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 模拟考试实体
 */
@Data
@TableName("mock_exam")
public class MockExam {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String examType;

    private Integer duration;

    private Integer totalQuestions;

    private Integer difficulty;

    private String questions;

    private Integer participants;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
