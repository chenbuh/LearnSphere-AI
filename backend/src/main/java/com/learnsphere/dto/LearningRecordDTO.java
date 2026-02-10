package com.learnsphere.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 学习记录DTO
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
@Schema(description = "学习记录提交参数")
public class LearningRecordDTO {

    @Schema(description = "内容ID（如单词ID或题目ID）")
    private Long contentId;

    @Schema(description = "内容类型", example = "vocabulary")
    private String contentType;

    @Schema(description = "是否正确：0-错误，1-正确", example = "1")
    private Integer isCorrect;

    @Schema(description = "耗时（秒）", example = "120")
    private Integer timeSpent;

    @Schema(description = "得分", example = "100")
    private Integer score;

    @Schema(description = "用户答案")
    private String answer;

    @Schema(description = "正确答案")
    private String correctAnswer;

    @Schema(description = "掌握程度：0-5", example = "3")
    private Integer masteryLevel;

    @Schema(description = "原文内容（如题目文本）")
    private String originalContent;
}
