-- 修复 user 表缺失的 points 字段
-- 执行时间: 2026-01-21

USE learnsphere_ai;

-- 检查并添加 points 字段（如果不存在）
ALTER TABLE `user` ADD COLUMN IF NOT EXISTS `points` INT DEFAULT 0 COMMENT '用户积分';

-- 验证字段已添加
SELECT 'points 字段已成功添加到 user 表' AS status;
