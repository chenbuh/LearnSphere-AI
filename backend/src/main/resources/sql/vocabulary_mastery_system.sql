-- ========================================
-- 词汇掌握度系统 - 数据库表
-- ========================================

USE learnsphere_ai;

-- 词汇掌握度表
CREATE TABLE IF NOT EXISTS `vocabulary_mastery` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `vocabulary_id` BIGINT NOT NULL COMMENT '词汇ID',
  
  -- 掌握程度
  `mastery_level` TINYINT DEFAULT 0 COMMENT '掌握等级 0-5 (0=未学习, 1-2=学习中, 3-4=熟悉, 5=完全掌握)',
  `review_count` INT DEFAULT 0 COMMENT '复习次数',
  `correct_count` INT DEFAULT 0 COMMENT '答对次数',
  `wrong_count` INT DEFAULT 0 COMMENT '答错次数',
  
  -- 复习时间（艾宾浩斯遗忘曲线）
  `last_review_time` DATETIME COMMENT '最后复习时间',
  `next_review_time` DATETIME COMMENT '下次复习时间',
  
  -- 辅助信息
  `is_favorite` BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
  `first_learned_time` DATETIME COMMENT '首次学习时间',
  `notes` TEXT COMMENT '用户笔记',
  
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_vocab` (`user_id`, `vocabulary_id`),
  KEY `idx_user_mastery` (`user_id`, `mastery_level`),
  KEY `idx_next_review` (`user_id`, `next_review_time`),
  KEY `idx_favorite` (`user_id`, `is_favorite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户词汇掌握度';

-- 学习记录表增强字段
ALTER TABLE `learning_record` 
ADD COLUMN `time_spent` INT COMMENT '耗时（秒）' AFTER `is_correct`,
ADD COLUMN `original_content` JSON COMMENT '原始内容（用于回溯分析）' AFTER `correct_answer`,
ADD INDEX `idx_user_content` (`user_id`, `content_type`, `create_time`);

-- 用户每日学习统计表（缓存表，避免频繁聚合）
CREATE TABLE IF NOT EXISTS `daily_learning_stats` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  
  -- 学习数量
  `vocabulary_count` INT DEFAULT 0 COMMENT '学习词汇数',
  `grammar_count` INT DEFAULT 0 COMMENT '语法练习数',
  `reading_count` INT DEFAULT 0 COMMENT '阅读篇数',
  `listening_count` INT DEFAULT 0 COMMENT '听力次数',
  `writing_count` INT DEFAULT 0 COMMENT '写作次数',
  `speaking_count` INT DEFAULT 0 COMMENT '口语练习数',
  
  -- 学习时长
  `total_time_minutes` INT DEFAULT 0 COMMENT '总学习时长（分钟）',
  
  -- 准确率
  `total_questions` INT DEFAULT 0 COMMENT '总题数',
  `correct_questions` INT DEFAULT 0 COMMENT '答对题数',
  
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `stat_date`),
  KEY `idx_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日学习统计';

-- 插入示例数据
INSERT IGNORE INTO `vocabulary_mastery` (`user_id`, `vocabulary_id`, `mastery_level`, `review_count`, `correct_count`, `wrong_count`, `last_review_time`, `next_review_time`, `first_learned_time`)
SELECT 
  1 AS user_id,
  v.id AS vocabulary_id,
  FLOOR(RAND() * 6) AS mastery_level,
  FLOOR(RAND() * 10) AS review_count,
  FLOOR(RAND() * 8) AS correct_count,
  FLOOR(RAND() * 3) AS wrong_count,
  NOW() - INTERVAL FLOOR(RAND() * 30) DAY AS last_review_time,
  NOW() + INTERVAL FLOOR(RAND() * 7) DAY AS next_review_time,
  NOW() - INTERVAL FLOOR(RAND() * 60) DAY AS first_learned_time
FROM vocabulary v
WHERE v.exam_type = 'cet4'
LIMIT 50;

SELECT '✅ 词汇掌握度系统创建完成！' AS message;
