package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * System Configuration Entity
 */
@Data
@TableName("system_config")
public class SystemConfig {
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * Unique configuration key (e.g., sys_maintenance_mode)
     */
    private String configKey;

    /**
     * Configuration value
     */
    private String configValue;

    /**
     * Description/Label for the setting
     */
    private String description;

    /**
     * Group category for UI grouping (e.g., BASIC, AI, SYSTEM)
     */
    private String category;

    private LocalDateTime updateTime;
}
