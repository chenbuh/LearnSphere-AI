package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 敏感内容审核日志
 */
@Data
@TableName("sensitive_log")
public class SensitiveLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String username;

    /**
     * 触发内容（片段或完整内容）
     */
    private String content;

    /**
     * 命中的敏感词
     */
    private String matchedWord;

    /**
     * 接口动作（如：WRITE_EVALUATE, PROFILE_UPDATE）
     */
    private String action;

    private LocalDateTime createTime;
}
