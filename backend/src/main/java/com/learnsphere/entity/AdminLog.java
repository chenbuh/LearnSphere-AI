package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 管理员操作日志实体
 */
@Data
@TableName("admin_log")
public class AdminLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 操作人ID
     */
    private Long adminId;

    /**
     * 操作人用户名
     */
    private String adminUsername;

    /**
     * 操作模块
     */
    private String module;

    /**
     * 操作类型/名称
     */
    private String action;

    /**
     * 操作详情/参数
     */
    private String details;

    /**
     * 请求IP
     */
    private String ip;

    /**
     * 操作状态 (success/fail)
     */
    private Integer status;

    /**
     * 错误信息
     */
    private String errorMsg;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
