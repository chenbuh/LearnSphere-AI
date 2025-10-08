package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 词汇实体
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
@TableName("vocabulary")
public class Vocabulary {

    /**
     * 词汇ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 单词
     */
    private String word;

    /**
     * 音标
     */
    private String phonetic;

    /**
     * 释义
     */
    private String definition;

    /**
     * 中文翻译
     */
    private String translation;

    /**
     * 例句
     */
    private String example;

    /**
     * 例句翻译
     */
    private String exampleTranslation;

    /**
     * 考试类型
     */
    private String examType;

    /**
     * 难度等级：1-5
     */
    private Integer difficulty;

    /**
     * 词频
     */
    private Integer frequency;

    /**
     * 标签（JSON数组）
     */
    private String tags;

    /**
     * 逻辑删除
     */
    @TableLogic
    private Integer deleted;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
