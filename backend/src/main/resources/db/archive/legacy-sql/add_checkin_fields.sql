-- 为用户表添加连续打卡相关字段
ALTER TABLE `user` 
ADD COLUMN `consecutive_days` INT DEFAULT 0 COMMENT '连续打卡天数' AFTER `current_level`,
ADD COLUMN `last_checkin_date` DATE COMMENT '最后打卡日期' AFTER `consecutive_days`,
ADD COLUMN `total_checkin_days` INT DEFAULT 0 COMMENT '累计打卡天数' AFTER `last_checkin_date`;
