package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户操作日志实体
 * 记录普通用户的所有操作，包括IP、地理位置等信息
 */
@Data
@TableName("user_log")
public class UserLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 操作模块 (reading, listening, speaking, writing, exam, etc.)
     */
    private String module;

    /**
     * 操作类型 (login, logout, submit, view, share, etc.)
     */
    private String action;

    /**
     * 操作详情/描述
     */
    private String details;

    /**
     * 请求IP地址
     */
    private String ip;

    /**
     * IP所属地区（国家）
     */
    private String ipCountry;

    /**
     * IP所属地区（省份）
     */
    private String ipProvince;

    /**
     * IP所属地区（城市）
     */
    private String ipCity;

    /**
     * 浏览器类型
     */
    private String browser;

    /**
     * 操作系统
     */
    private String os;

    /**
     * 设备类型 (desktop, mobile, tablet)
     */
    private String deviceType;

    /**
     * 请求URL
     */
    private String requestUrl;

    /**
     * 请求方法 (GET, POST, PUT, DELETE)
     */
    private String requestMethod;

    /**
     * 操作状态 (0:失败, 1:成功)
     */
    private Integer status;

    /**
     * 错误信息
     */
    private String errorMsg;

    /**
     * 操作耗时(毫秒)
     */
    private Long duration;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
