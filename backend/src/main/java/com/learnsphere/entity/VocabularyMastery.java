package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 词汇掌握度实体
 * 记录用户对每个单词的学习情况和掌握程度
 */
@Data
@TableName("vocabulary_mastery")
public class VocabularyMastery {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 词汇ID
     */
    private Long vocabularyId;

    /**
     * 掌握等级
     * 0 - 未学习
     * 1-2 - 学习中/不熟悉
     * 3-4 - 熟悉
     * 5 - 完全掌握
     */
    private Integer masteryLevel;

    /**
     * 复习次数
     */
    private Integer reviewCount;

    /**
     * 答对次数
     */
    private Integer correctCount;

    /**
     * 答错次数
     */
    private Integer wrongCount;

    /**
     * 最后复习时间
     */
    private LocalDateTime lastReviewTime;

    /**
     * 下次复习时间（基于艾宾浩斯遗忘曲线）
     */
    private LocalDateTime nextReviewTime;

    /**
     * 是否收藏
     */
    private Boolean isFavorite;

    /**
     * 首次学习时间
     */
    private LocalDateTime firstLearnedTime;

    /**
     * 用户笔记
     */
    private String notes;

    /**
     * 逻辑删除标志
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

    /**
     * 计算掌握率（百分比）
     */
    public Double getMasteryRate() {
        int total = correctCount + wrongCount;
        if (total == 0)
            return 0.0;
        return (correctCount * 100.0) / total;
    }

    /**
     * 判断是否需要复习
     */
    public boolean needsReview() {
        if (nextReviewTime == null)
            return true;
        return LocalDateTime.now().isAfter(nextReviewTime);
    }
}
