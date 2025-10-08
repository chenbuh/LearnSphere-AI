-- ========================================
-- 添加会员相关字段
-- ========================================

USE learnsphere_ai;

-- 修改用户表，添加会员相关字段
ALTER TABLE `user` 
ADD COLUMN `vip_expire_time` DATETIME NULL COMMENT 'VIP 过期时间，NULL 表示非会员' AFTER `current_level`,
ADD COLUMN `vip_level` TINYINT DEFAULT 0 COMMENT 'VIP 等级：0-普通用户，1-月度会员，2-季度会员，3-年度会员' AFTER `vip_expire_time`,
ADD COLUMN `daily_ai_quota` INT DEFAULT 200 COMMENT '每日 AI 调用配额，VIP 默认 200，普通用户为 0' AFTER `vip_level`;

-- 为已有用户设置默认值（普通用户 AI 配额为 0）
UPDATE `user` SET `daily_ai_quota` = 0 WHERE `vip_expire_time` IS NULL OR `vip_expire_time` < NOW();

-- 设置会员用户的配额（如果有）
-- UPDATE `user` SET `daily_ai_quota` = 200 WHERE `vip_expire_time` IS NOT NULL AND `vip_expire_time` > NOW();

SELECT '会员字段添加完成！' AS message;
