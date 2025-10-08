package com.learnsphere.dto;

import lombok.Data;

/**
 * 学习记录DTO
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
public class LearningRecordDTO {

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
     * 原文内容
     */
    private String originalContent;
}
