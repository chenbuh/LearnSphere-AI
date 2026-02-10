-- AI 内容反馈审核池表
CREATE TABLE IF NOT EXISTS `ai_content_feedback` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '反馈ID',
    `log_id` BIGINT NOT NULL COMMENT '关联的生成日志ID',
    `user_id` BIGINT NOT NULL COMMENT '提供反馈的用户ID',
    `rating` TINYINT NOT NULL COMMENT '评分: 1-正向, -1-负向',
    `feedback_text` TEXT DEFAULT NULL COMMENT '用户补充分馈文本',
    `original_content` LONGTEXT DEFAULT NULL COMMENT '生成时的原始内容快照',
    `corrected_content` LONGTEXT DEFAULT NULL COMMENT '管理员修正后的内容',
    `status` TINYINT DEFAULT 0 COMMENT '审核状态: 0-待处理, 1-已处理, 2-已忽略',
    `admin_notes` TEXT DEFAULT NULL COMMENT '管理员备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_log_id` (`log_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI内容反馈审核池';
