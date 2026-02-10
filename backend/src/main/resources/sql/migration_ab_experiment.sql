-- A/B Testing Experiment Table
CREATE TABLE IF NOT EXISTS `ai_experiment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Experiment ID',
    `name` VARCHAR(100) NOT NULL COMMENT 'Experiment Name',
    `action_type` VARCHAR(50) NOT NULL COMMENT 'Target Action Type (e.g. GENERATE_READING)',
    `variant_name` VARCHAR(50) NOT NULL COMMENT 'Variant B Name',
    `system_prompt_b` TEXT COMMENT 'System Prompt for Variant B',
    `traffic_ratio` INT DEFAULT 50 COMMENT 'Traffic allocation for B (0-100)',
    `status` VARCHAR(20) DEFAULT 'STOPPED' COMMENT 'RUNNING, STOPPED',
    `start_time` DATETIME COMMENT 'Start Time',
    `end_time` DATETIME COMMENT 'End Time',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_action_type` (`action_type`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI A/B Experiments';

-- Update AI Generation Log for Experiment Tracking
ALTER TABLE `ai_generation_log`
ADD COLUMN `experiment_id` BIGINT DEFAULT NULL COMMENT 'Experiment ID' AFTER `duration_ms`,
ADD COLUMN `variant` VARCHAR(50) DEFAULT NULL COMMENT 'Variant Name (CONTROL/VARIANT_B)' AFTER `experiment_id`,
ADD INDEX `idx_experiment` (`experiment_id`);

-- Update AI Content Feedback for Analysis
ALTER TABLE `ai_content_feedback`
ADD COLUMN `analysis_result` TEXT DEFAULT NULL COMMENT 'AI 归因分析结果' AFTER `admin_notes`;
