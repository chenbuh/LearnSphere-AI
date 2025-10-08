-- 为 AI 生成内容表添加 user_id 字段，实现用户隔离

-- 1. listening_material 表添加 user_id
ALTER TABLE listening_material ADD COLUMN user_id BIGINT NULL AFTER id;
ALTER TABLE listening_material ADD INDEX idx_user_id (user_id);

-- 2. reading_article 表添加 user_id  
ALTER TABLE reading_article ADD COLUMN user_id BIGINT NULL AFTER id;
ALTER TABLE reading_article ADD INDEX idx_user_id (user_id);

-- 3. writing_topic 表添加 user_id (如果存在)
ALTER TABLE writing_topic ADD COLUMN user_id BIGINT NULL AFTER id;
ALTER TABLE writing_topic ADD INDEX idx_user_id (user_id);

-- 4. grammar_exercise 表添加 user_id (如果存在)
ALTER TABLE grammar_exercise ADD COLUMN user_id BIGINT NULL AFTER id;
ALTER TABLE grammar_exercise ADD INDEX idx_user_id (user_id);

-- 注意：已存在的记录 user_id 为 NULL，表示全局共享数据
-- 新生成的记录会记录当前用户 ID
