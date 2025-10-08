package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
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
public class AITutorConversation {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户 ID
     */
    private Long userId;

    /**
     * 会话 ID (同一次学习会话的对话会有相同的 sessionId)
     */
    private String sessionId;

    /**
     * 消息角色: user/assistant
     */
    private String role;

    /**
     * 消息内容
     */
    @TableField(value = "content")
    private String content;

    /**
     * 上下文信息 (JSON 格式存储题目、答案等)
     */
    @TableField(value = "context_info")
    private String contextInfo;

    /**
     * 关联的知识点/主题
     */
    private String topic;

    /**
     * 是否已解决用户问题
     */
    private Boolean resolved;

    /**
     * 用户反馈 (helpful/not_helpful)
     */
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
