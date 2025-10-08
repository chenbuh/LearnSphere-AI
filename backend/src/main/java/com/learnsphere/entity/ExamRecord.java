package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 考试记录实体
 */
@Data
@TableName("exam_record")
public class ExamRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long examId;

    private Integer score;

    private Integer correctCount;

    private Integer totalCount;

    private Integer timeSpent;

    private String answers;

    private String status;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
