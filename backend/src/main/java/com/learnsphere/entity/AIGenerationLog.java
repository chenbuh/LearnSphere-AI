package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI Generation Log Entity
 */
@Data
@TableName("ai_generation_log")
@Schema(description = "AI 生成日志")
public class AIGenerationLog {
    @TableId(type = IdType.AUTO)
    @Schema(description = "日志ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "操作类型")
    private String actionType;

    @Schema(description = "模型名称")
    private String modelName;

    @Schema(description = "提示词预览")
    private String promptPreview;

    @Schema(description = "状态 (SUCCESS/FAIL)")
    private String status;

    @Schema(description = "错误消息")
    private String errorMessage;

    @Schema(description = "耗时 (ms)")
    private Long durationMs;

    @Schema(description = "输入 Token")
    private Integer inputTokens;

    @Schema(description = "输出 Token")
    private Integer outputTokens;

    @Schema(description = "总 Token")
    private Integer totalTokens;

    @Schema(description = "系统提示词")
    private String systemPrompt;

    @Schema(description = "响应内容")
    private String responseContent;

    @Schema(description = "实验ID")
    private Long experimentId;

    @Schema(description = "实验分支 (CONTROL/VARIANT_B)")
    private String variant;

    private LocalDateTime createTime;
}
