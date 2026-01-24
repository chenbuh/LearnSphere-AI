-- AI模块配额消耗配置
-- AI Module Quota Cost Configuration

INSERT INTO system_config (config_key, config_value, description, category, update_time) VALUES
('quota_cost_reading', '2', 'AI阅读理解生成配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_writing_topic', '1', 'AI写作题目生成配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_writing_eval', '3', 'AI写作批改配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_listening', '2', 'AI听力生成配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_grammar', '1', 'AI语法生成配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_speaking_topic', '1', 'AI口语生成配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_speaking_eval', '3', 'AI口语评测配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_error_analysis', '2', 'AI错题深度分析配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_speaking_mock', '5', 'AI口语1V1模考配额消耗', 'AI_QUOTA', NOW()),
('quota_cost_mock_exam', '4', 'AI模拟考试生成配额消耗', 'AI_QUOTA', NOW())
ON DUPLICATE KEY UPDATE 
    config_value = VALUES(config_value),
    description = VALUES(description),
    update_time = NOW();
