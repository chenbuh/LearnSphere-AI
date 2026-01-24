package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("notification")
public class Notification {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String content;

    private String type; // system, announcement, update, warning

    private Integer priority; // 0-普通, 1-重要, 2-紧急

    private String targetType; // all, vip, specific

    private String targetUserIds; // 逗号分隔的用户ID

    private Long senderId;

    private String senderName;

    private Integer isPublished; // 0-草稿, 1-已发布

    private LocalDateTime expireTime;

    private LocalDateTime createTime;
}
