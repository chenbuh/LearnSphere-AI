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
 * 记录普通用户的所有操作，包括IP、地理位置信息
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
     * IP属地国家
     */
    private String ipCountry;

    /**
     * IP属地省份
     */
    private String ipProvince;

    /**
     * IP属地城市
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
     * 原始 User-Agent 字符串。
     *
     * <p>只存 browser/os/deviceType 三个解析结果是不够的：一旦识别不准
     * （例如某个国产 App 内置浏览器被误判成 Chrome），事后无法回溯真实 UA，
     * 只能等用户反馈再靠猜。保留原始值便于直接复现并修正解析规则。
     *
     * <p>写入时截断到 512 字符，避免异常超长请求撑爆列宽。
     */
    private String userAgent;

    /**
     * 请求URL
     */
    private String requestUrl;

    /**
     * 请求方法 (GET, POST, PUT, DELETE)
     */
    private String requestMethod;

    /**
     * 操作状态(0:失败, 1:成功)
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
