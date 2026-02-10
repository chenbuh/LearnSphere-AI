package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI Tutor 对话历史实体
 * 
 * @author LearnSphere Team
 * @since 3.0.0
 */
@Data
@TableName("ai_tutor_conversation")
@Schema(description = "AI 助教对话记录")
public class AITutorConversation {

    @TableId(type = IdType.AUTO)
    @Schema(description = "记录ID")
    private Long id;

    @Schema(description = "用户ID")
    private Long userId;

    @Schema(description = "会话ID")
    private String sessionId;

    @Schema(description = "角色 (user/assistant)")
    private String role;

    @Schema(description = "消息内容")
    @TableField(value = "content")
    private String content;

    @Schema(description = "上下文信息 (JSON)")
    @TableField(value = "context_info")
    private String contextInfo;

    @Schema(description = "主题")
    private String topic;

    @Schema(description = "是否已解决")
    private Boolean resolved;

    @Schema(description = "反馈 (helpful/not_helpful)")
    private String feedback;

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
