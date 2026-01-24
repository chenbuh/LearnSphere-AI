-- 创建通知表
CREATE TABLE IF NOT EXISTS `notification` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL COMMENT 'system, announcement, update, warning',
    `priority` INT DEFAULT 0 COMMENT '0-普通, 1-重要, 2-紧急',
    `target_type` VARCHAR(20) DEFAULT 'all' COMMENT 'all, vip, specific',
    `target_user_ids` TEXT COMMENT '逗号分隔的用户ID',
    `sender_id` BIGINT,
    `sender_name` VARCHAR(100),
    `is_published` TINYINT(1) DEFAULT 1 COMMENT '0-草稿, 1-已发布',
    `expire_time` DATETIME,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_type` (`type`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建用户通知关联表
CREATE TABLE IF NOT EXISTS `user_notification` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `notification_id` BIGINT NOT NULL,
    `is_read` TINYINT(1) DEFAULT 0 COMMENT '0-未读, 1-已读',
    `read_time` DATETIME,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_notification` (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入示例通知数据（可选）
INSERT INTO `notification` (`title`, `content`, `type`, `priority`, `target_type`, `sender_name`) VALUES
('欢迎使用 LearnSphere AI', '欢迎来到 LearnSphere AI 智能英语学习平台！我们为您提供全方位的英语学习解决方案。', 'announcement', 0, 'all', '系统管理员'),
('系统维护通知', '系统将于本周末进行例行维护，届时部分功能可能暂时无法使用。', 'system', 1, 'all', '系统管理员');
