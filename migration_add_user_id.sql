-- 安全添加user_id字段
ALTER TABLE listening_material ADD COLUMN user_id BIGINT NULL AFTER id;
ALTER TABLE reading_article ADD COLUMN user_id BIGINT NULL AFTER id;

-- 添加索引
CREATE INDEX idx_user_id ON listening_material(user_id);
CREATE INDEX idx_user_id ON reading_article(user_id);
