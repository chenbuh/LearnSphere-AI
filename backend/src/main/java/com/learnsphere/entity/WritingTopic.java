package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("writing_topic")
public class WritingTopic {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String examType;

    private String mode;

    private String title;

    private String prompt;

    private Integer minWords;

    private String tips; // JSON string

    private String difficulty;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
