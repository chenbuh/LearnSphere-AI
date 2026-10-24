-- Migration for AI Generation Log details
-- Adds columns to store system prompt and full response content

ALTER TABLE ai_generation_log ADD COLUMN system_prompt TEXT COMMENT '系统提示词';
ALTER TABLE ai_generation_log ADD COLUMN response_content MEDIUMTEXT COMMENT 'AI 响应完整内容';

-- Optional: Add comments to existing token columns if not present
ALTER TABLE ai_generation_log MODIFY COLUMN input_tokens INT DEFAULT 0 COMMENT '输入 Token';
ALTER TABLE ai_generation_log MODIFY COLUMN output_tokens INT DEFAULT 0 COMMENT '输出 Token';
ALTER TABLE ai_generation_log MODIFY COLUMN total_tokens INT DEFAULT 0 COMMENT '总 Token';
