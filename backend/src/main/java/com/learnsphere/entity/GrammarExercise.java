package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("grammar_exercise")
public class GrammarExercise {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String topic;

    private String difficulty;

    private String question; // 单个题目文本（为了兼容数据库）

    private String questions; // JSON string

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
