package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户薄弱知识点实体
 * 记录用户在各个知识点上的掌握情况
 * 
 * @author LearnSphere Team
 * @since 3.0.0
 */
@Data
@TableName("user_weakness")
public class UserWeakness {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户 ID
     */
    private Long userId;

    /**
     * 知识点/主题 (如: 时态, 虚拟语气, 定语从句等)
     */
    private String topic;

    /**
     * 知识点类别 (grammar/reading/listening/speaking/writing)
     */
    private String category;

    /**
     * 错误次数
     */
    private Integer errorCount;

    /**
     * 总练习次数
     */
    private Integer totalCount;

    /**
     * 正确率 (%)
     */
    private Double accuracy;

    /**
     * 最近一次练习时间
     */
    private LocalDateTime lastPracticeTime;

    /**
     * 是否需要重点复习
     */
    private Boolean needsReview;

    /**
     * AI 推荐的复习优先级 (1-10, 10最高)
     */
    private Integer reviewPriority;

    /**
     * AI 生成的学习建议
     */
    @TableField(value = "ai_suggestion")
    private String aiSuggestion;

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

    /**
     * 逻辑删除
     */
    @TableLogic
    private Integer deleted;
}
