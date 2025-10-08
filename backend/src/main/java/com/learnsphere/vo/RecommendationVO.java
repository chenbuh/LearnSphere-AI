package com.learnsphere.vo;

import lombok.Data;
import java.util.List;

/**
 * 推荐结果VO
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
public class RecommendationVO {

    /**
     * 推荐的词汇ID
     */
    private Long vocabularyId;

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
     * 难度等级
     */
    private Integer difficulty;

    /**
     * 推荐分数（0-100）
     */
    private Double recommendScore;

    /**
     * 推荐原因
     */
    private String reason;

    /**
     * 标签
     */
    private List<String> tags;

    /**
     * 预计掌握时间（分钟）
     */
    private Integer estimatedTime;
}
