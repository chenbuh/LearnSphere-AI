package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 学习记录实体
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
@TableName("learning_record")
public class LearningRecord {

    /**
     * 记录ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 内容ID
     */
    private Long contentId;

    /**
     * 内容类型：vocabulary/grammar/reading
     */
    private String contentType;

    /**
     * 是否正确：0-错误，1-正确
     */
    private Integer isCorrect;

    /**
     * 耗时（秒）
     */
    private Integer timeSpent;

    /**
     * 得分
     */
    private Integer score;

    /**
     * 用户答案
     */
    private String answer;

    /**
     * 正确答案
     */
    private String correctAnswer;

    /**
     * 掌握程度：0-5
     */
    private Integer masteryLevel;

    /**
     * 复习次数
     */
    private Integer reviewCount;

    /**
     * 最后复习时间
     */
    private LocalDateTime lastReviewTime;

    /**
     * 下次复习时间
     */
    private LocalDateTime nextReviewTime;

    /**
     * 原文内容（听力原文、阅读文章、语法题目JSON等）
     */
    private String originalContent;

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
