package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户安全日志
 */
@Data
@TableName("security_log")
public class SecurityLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    /**
     * 事件名称 (e.g. 登录成功, 密码修改)
     */
    private String event;

    /**
     * IP地址
     */
    private String ip;

    /**
     * 状态 (success, warning, error)
     */
    private String status;

    /**
     * 详情/备注
     */
    private String details;

    private LocalDateTime createTime;
}
