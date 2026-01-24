-- 系统通知表
CREATE TABLE IF NOT EXISTS `notification` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    `title` VARCHAR(200) NOT NULL COMMENT '通知标题',
    `content` TEXT NOT NULL COMMENT '通知内容',
    `type` VARCHAR(50) DEFAULT 'system' COMMENT '通知类型: system-系统通知, announcement-公告, update-更新, warning-警告',
    `priority` INT DEFAULT 0 COMMENT '优先级: 0-普通, 1-重要, 2-紧急',
    `target_type` VARCHAR(50) DEFAULT 'all' COMMENT '目标类型: all-所有用户, vip-VIP用户, specific-指定用户',
    `target_user_ids` TEXT COMMENT '指定用户ID列表(逗号分隔)',
    `sender_id` BIGINT COMMENT '发送者ID',
    `sender_name` VARCHAR(100) COMMENT '发送者名称',
    `is_published` TINYINT DEFAULT 1 COMMENT '是否发布: 0-草稿, 1-已发布',
    `expire_time` DATETIME COMMENT '过期时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_type` (`type`),
    INDEX `idx_create_time` (`create_time`),
    INDEX `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知表';

-- 用户通知关系表(用于追踪用户是否已读)
CREATE TABLE IF NOT EXISTS `user_notification` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `notification_id` BIGINT NOT NULL COMMENT '通知ID',
    `is_read` TINYINT DEFAULT 0 COMMENT '是否已读: 0-未读, 1-已读',
    `read_time` DATETIME COMMENT '阅读时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_user_notification` (`user_id`, `notification_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_notification_id` (`notification_id`),
    INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户通知关系表';
