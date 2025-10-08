package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI Generation Log Entity
 */
@Data
@TableName("ai_generation_log")
public class AIGenerationLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /**
     * Type of action, e.g., GENERATE_READING
     */
    private String actionType;

    /**
     * Model used, e.g., qwen-plus
     */
    private String modelName;

    /**
     * Short preview of the prompt sent
     */
    private String promptPreview;

    /**
     * SUCCESS or FAIL
     */
    private String status;

    /**
     * Error message if failed
     */
    private String errorMessage;

    /**
     * Execution time in milliseconds
     */
    private Long durationMs;

    /**
     * Input tokens consumed
     */
    private Integer inputTokens;

    /**
     * Output tokens generated
     */
    private Integer outputTokens;

    /**
     * Total tokens (input + output)
     */
    private Integer totalTokens;

    private LocalDateTime createTime;
}
