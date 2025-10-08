package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("listening_material")
public class ListeningMaterial {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String title;

    private String script;

    private String type;

    private String difficulty;

    // Stored as JSON string
    private String questions;

    private String audioUrl;

    @com.baomidou.mybatisplus.annotation.TableLogic
    private Integer deleted;

    @TableField(fill = com.baomidou.mybatisplus.annotation.FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = com.baomidou.mybatisplus.annotation.FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
