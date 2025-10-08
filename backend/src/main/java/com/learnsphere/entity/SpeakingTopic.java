package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("speaking_topic")
public class SpeakingTopic {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String type;
    private String difficulty;
    private String title;
    private String question;

    // JSON arrays stored as strings
    private String keywords;
    private String tips;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
