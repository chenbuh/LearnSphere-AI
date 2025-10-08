-- 修复 user 表缺失的 points 字段
USE learnsphere_ai;

-- 添加 points 字段
ALTER TABLE `user` ADD COLUMN `points` INT DEFAULT 0 COMMENT '用户积分';
