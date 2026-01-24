-- ======================================================
-- 补全管理员所需的日志与配置表 (审计日志/AI日志/提示词)
-- ======================================================

USE learnsphere_ai;

-- 1. 敏感内容审计日志表 (Sensitive Log)
CREATE TABLE IF NOT EXISTS `sensitive_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `username` VARCHAR(50) COMMENT '用户名',
  `content` TEXT COMMENT '触发敏感的内容 (片段)',
  `matched_word` VARCHAR(100) COMMENT '命中的敏感词',
  `action` VARCHAR(100) COMMENT '触发动作 (Controller.Method)',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='敏感内容审计日志';

-- 2. AI 接口调用日志表 (AI Generation Log)
CREATE TABLE IF NOT EXISTS `ai_generation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT COMMENT '调用用户ID (0或NULL表示系统)',
  `action_type` VARCHAR(100) COMMENT '接口动作类型',
  `model_name` VARCHAR(50) COMMENT '使用的AI模型名称',
  `prompt_preview` TEXT COMMENT '提示词预览',
  `status` VARCHAR(20) DEFAULT 'SUCCESS' COMMENT '状态 SUCCESS/FAIL',
  `error_message` TEXT COMMENT '失败原因',
  `duration_ms` BIGINT COMMENT '耗时(毫秒)',
  `input_tokens` INT DEFAULT 0 COMMENT '输入Tokens',
  `output_tokens` INT DEFAULT 0 COMMENT '输出Tokens',
  `total_tokens` INT DEFAULT 0 COMMENT '总Tokens',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_action` (`user_id`, `action_type`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 生成接口调用日志';

-- 3. 系统提示词模板表 (System Prompt)
CREATE TABLE IF NOT EXISTS `system_prompt` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `prompt_key` VARCHAR(100) NOT NULL COMMENT '唯一标识符',
  `description` VARCHAR(255) COMMENT '描述',
  `content` TEXT NOT NULL COMMENT '提示词模板内容',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_prompt_key` (`prompt_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 提示词工程模板表';

-- 插入一些初始提示词模板 (如果为空)
INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES
('READING_GEN_SYSTEM', '阅读理解生成-系统设定', '你是一个专业的英语阅读理解出题专家。你必须严格遵守用户的字数要求。'),
('READING_GEN_USER', '阅读理解生成-用户引导', '请生成一篇%s难度的英语阅读理解，主题：%s。要求：包含5道选择题。'),
('WRITING_EVAL_FEEDBACK', '写作评估-系统反馈', '你是一个专业的英语写作评分老师。请从语法、词汇、逻辑等方面给出建议。');
