package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * AI System Prompts Version History Entity
 */
@Data
@TableName("sys_prompt_history")
public class SystemPromptHistory {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long promptId;

    private String promptKey;

    private String content;

    private Integer version;

    private String remark;

    private LocalDateTime createTime;
}
