package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI Content Feedback Entity
 * Used for AI Content Audit Pool (Self-evolution)
 */
@Data
@TableName("ai_content_feedback")
@Schema(description = "AI 内容反馈审核池")
public class AIContentFeedback {

    @TableId(type = IdType.AUTO)
    @Schema(description = "反馈ID")
    private Long id;

    @Schema(description = "关联的生成日志ID")
    private Long logId;

    @Schema(description = "提供反馈的用户ID")
    private Long userId;

    @Schema(description = "评分: 1-正向, -1-负向")
    private Integer rating;

    @Schema(description = "用户补充分馈文本")
    private String feedbackText;

    @Schema(description = "生成时的原始内容快照")
    private String originalContent;

    @Schema(description = "管理员修正后的内容")
    private String correctedContent;

    @Schema(description = "审核状态: 0-待处理, 1-已处理, 2-已忽略")
    private Integer status;

    @Schema(description = "管理员备注")
    private String adminNotes;

    @Schema(description = "AI 归因分析结果")
    private String analysisResult;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
