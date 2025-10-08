-- 2.3.0 Achievement System Tables

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for achievement
-- ----------------------------
DROP TABLE IF EXISTS `achievement`;
CREATE TABLE `achievement` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT '唯一编码',
  `name` varchar(100) NOT NULL COMMENT '成就名称',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `icon` varchar(50) DEFAULT NULL COMMENT '图标标识',
  `condition_type` varchar(50) NOT NULL COMMENT '条件类型(checkin_streak, vocab_count, etc.)',
  `condition_value` int(11) NOT NULL DEFAULT 0 COMMENT '目标值',
  `reward_points` int(11) DEFAULT 0 COMMENT '奖励积分',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就定义表';

-- ----------------------------
-- Initial Data for achievement
-- ----------------------------
INSERT INTO `achievement` (`code`, `name`, `description`, `icon`, `condition_type`, `condition_value`, `reward_points`) VALUES
('FIRST_BLOOD', '初出茅庐', '完成第一次学习练习', 'Zap', 'total_records', 1, 50),
('CHECKIN_STREAK_7', '坚持不懈', '连续打卡达到 7 天', 'TrendingUp', 'checkin_streak', 7, 100),
('VOCAB_MASTER_100', '百词斩', '累计掌握 100 个单词', 'Target', 'vocab_count', 100, 200),
('EARLY_BIRD', '早起鸟', '在早上 8 点前完成一次打卡', 'Award', 'checkin_time', 8, 50),
('VIP_MEMBER', '尊贵身份', '成为 LearnSphere VIP 会员', 'Flame', 'is_vip', 1, 500),
('PERFECT_SCORE', '完美主义', '在一次测试中获得 100% 正确率', 'Star', 'perfect_score', 1, 100);

-- ----------------------------
-- Table structure for user_achievement
-- ----------------------------
DROP TABLE IF EXISTS `user_achievement`;
CREATE TABLE `user_achievement` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `achievement_id` bigint(20) NOT NULL COMMENT '成就ID',
  `status` tinyint(2) NOT NULL DEFAULT 0 COMMENT '状态: 0-进行中, 1-已解锁',
  `current_value` int(11) DEFAULT 0 COMMENT '当前进度值',
  `unlocked_time` datetime DEFAULT NULL COMMENT '解锁时间',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_achv` (`user_id`,`achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户成就进度表';

SET FOREIGN_KEY_CHECKS = 1;
