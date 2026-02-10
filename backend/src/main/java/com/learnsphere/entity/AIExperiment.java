package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI A/B Experiment Entity
 */
@Data
@TableName("ai_experiment")
public class AIExperiment {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    /**
     * Target Action Type (e.g. GENERATE_READING)
     */
    private String actionType;

    /**
     * Variant B Name
     */
    private String variantName;

    /**
     * System Prompt Content for Variant B
     */
    private String systemPromptB;

    /**
     * Traffic to B (0-100)
     */
    private Integer trafficRatio;

    /**
     * Status: RUNNING, STOPPED
     */
    private String status;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createTime;
}
