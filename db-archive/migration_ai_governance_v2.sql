-- 1. 系统提示词表 (存储 AI 的指令集)
CREATE TABLE IF NOT EXISTS `system_prompt` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `prompt_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '模板唯一标识',
    `description` VARCHAR(255) COMMENT '用途描述',
    `content` TEXT NOT NULL COMMENT '提示词原文',
    `remark` VARCHAR(255) COMMENT '备注',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI治理-系统提示词';

-- 2. 提示词历史版本表 (支持回滚功能)
CREATE TABLE IF NOT EXISTS `sys_prompt_history` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `prompt_id` BIGINT NOT NULL COMMENT '关联的提示词ID',
    `prompt_key` VARCHAR(100) COMMENT '快照Key',
    `content` TEXT COMMENT '提示词内容快照',
    `version` INT COMMENT '版本号',
    `remark` VARCHAR(255) COMMENT '修改备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI治理-提示词历史';

-- 3. AI 调用日志表 (监控面板的数据源)
CREATE TABLE IF NOT EXISTS `ai_generation_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT COMMENT '用户ID',
    `action_type` VARCHAR(50) NOT NULL COMMENT '动作类型',
    `model_name` VARCHAR(50) COMMENT '模型名称',
    `prompt_preview` VARCHAR(500) COMMENT '用户输入预览',
    `system_prompt` TEXT COMMENT '当时生成的系统提示词',
    `response_content` MEDIUMTEXT COMMENT '完整响应',
    `status` VARCHAR(20) NOT NULL COMMENT 'SUCCESS / FAIL',
    `error_message` TEXT COMMENT '失败原因',
    `duration_ms` BIGINT COMMENT '耗时(毫秒)',
    `input_tokens` INT DEFAULT 0,
    `output_tokens` INT DEFAULT 0,
    `total_tokens` INT DEFAULT 0,
    `experiment_id` BIGINT DEFAULT NULL COMMENT 'AB实验ID',
    `variant` VARCHAR(50) DEFAULT NULL COMMENT '实验组别(CONTROL/VARIANT_B)',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_action` (`action_type`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI调用审计日志';

-- 4. AI 内容反馈表 (闭环治理的核心)
CREATE TABLE IF NOT EXISTS `ai_content_feedback` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `log_id` BIGINT NOT NULL COMMENT '关联的AI日志ID',
    `user_id` BIGINT NOT NULL COMMENT '反馈人',
    `rating` TINYINT NOT NULL COMMENT '1-正向, -1-负向',
    `feedback_text` TEXT COMMENT '详细反馈',
    `original_content` LONGTEXT COMMENT '原始内容快照',
    `corrected_content` LONGTEXT COMMENT '管理员修正内容',
    `status` TINYINT DEFAULT 0 COMMENT '0-待处理, 1-已处理',
    `admin_notes` TEXT COMMENT '管理员备注',
    `analysis_result` TEXT COMMENT '智能归因分析结果',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI内容评价与反馈池';

-- 5. A/B 实验表
CREATE TABLE IF NOT EXISTS `ai_experiment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL COMMENT '实验名称',
    `action_type` VARCHAR(50) NOT NULL COMMENT '目标动作',
    `variant_name` VARCHAR(50) NOT NULL COMMENT '实验组名称',
    `system_prompt_b` TEXT COMMENT '实验组提示词',
    `traffic_ratio` INT DEFAULT 50 COMMENT '流量配比(0-100)',
    `status` VARCHAR(20) DEFAULT 'STOPPED' COMMENT 'RUNNING / STOPPED',
    `start_time` DATETIME,
    `end_time` DATETIME,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_action_type` (`action_type`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI A/B 实验管理';
