-- AI Governance Tables
-- System Prompts Table
CREATE TABLE IF NOT EXISTS `system_prompt` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key',
    `prompt_key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique key for identifying the prompt',
    `description` VARCHAR(255) COMMENT 'Description of what this prompt does',
    `content` TEXT NOT NULL COMMENT 'The actual prompt template',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_prompt_key` (`prompt_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='System Prompts Configuration';

-- AI Generation Logs Table
CREATE TABLE IF NOT EXISTS `ai_generation_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary Key',
    `user_id` BIGINT COMMENT 'User ID who initiated the request, null if system',
    `action_type` VARCHAR(50) NOT NULL COMMENT 'Type of action, e.g., GENERATE_READING',
    `model_name` VARCHAR(50) COMMENT 'Model used, e.g., qwen-plus',
    `prompt_preview` VARCHAR(500) COMMENT 'Short preview of the prompt sent',
    `status` VARCHAR(20) NOT NULL COMMENT 'SUCCESS or FAIL',
    `error_message` TEXT COMMENT 'Error message if failed',
    `duration_ms` BIGINT COMMENT 'Execution time in milliseconds',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_create_time` (`create_time`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI Generation Logs';

-- Insert Default Prompts
INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES 
('READING_GENERATION_SYSTEM', 'System prompt for reading comprehension generation', '你是一个专业的英语阅读理解出题专家。你必须严格遵守用户的字数要求，绝对不能偷懒写短文。如果文章长度不足，任务将失败。'),
('READING_GENERATION_USER', 'User prompt template for reading generation', '请生成一篇%s难度的英语阅读理解，主题：%s。\n【重要】文章长度要求：%s词左右。请务必写够字数，内容要丰富充实！\n要求：\n1. 文章要地道、有趣、贴近生活，段落结构清晰。\n2. 包含5道选择题，每题4个选项。\n3. 必须返回标准的JSON格式，不要包含任何Markdown格式，直接返回JSON字符串。\nJSON结构：{"title":"文章标题", "passage":"这里放完整的长篇文章内容", "questions":[{"text":"问题", "options":["A","B","C","D"], "correct":0, "explanation":"解析"}]}');
