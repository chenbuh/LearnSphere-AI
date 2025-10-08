-- 为 ai_generation_log 表添加 token 统计字段
ALTER TABLE `ai_generation_log` 
ADD COLUMN `input_tokens` INT DEFAULT 0 COMMENT 'Input tokens consumed',
ADD COLUMN `output_tokens` INT DEFAULT 0 COMMENT 'Output tokens generated',
ADD COLUMN `total_tokens` INT DEFAULT 0 COMMENT 'Total tokens (input + output)';
