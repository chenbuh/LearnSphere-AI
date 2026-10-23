package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 管理员实体
 * 
 * @author LearnSphere Team
 */
@Data
@TableName("admin")
@Schema(description = "管理员信息")
public class Admin {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 管理员账号
     */
    private String username;

    /**
     * 密码（加盐哈希后）
     */
    private String password;

    /**
     * 盐值
     */
    private String salt;

    /**
     * 管理员昵称
     */
    private String nickname;

    /**
     * 角色：super_admin / content / operator，见 {@link com.learnsphere.common.AdminRole}
     */
    private String role;

    /**
     * 关联的学习账号ID（user 表），管理员在前台进入学习中心时自动创建
     */
    private Long userId;

    /**
     * 状态：0-禁用，1-正常
     */
    private Integer status;

    /**
     * 最近登录时间
     */
    private LocalDateTime lastLoginTime;

    @TableLogic
    private Integer deleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
