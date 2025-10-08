package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI System Prompts Entity
 */
@Data
@TableName("system_prompt")
public class SystemPrompt {
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Unique key for identifying the prompt
     */
    private String promptKey;

    /**
     * Description of what this prompt does
     */
    private String description;

    /**
     * The actual prompt template
     */
    private String content;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
