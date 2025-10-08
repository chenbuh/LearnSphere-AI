USE learnsphere_ai;

CREATE TABLE IF NOT EXISTS `vocabulary_mastery` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT NOT NULL COMMENT 'User ID',
  `vocabulary_id` BIGINT NOT NULL COMMENT 'Vocabulary ID',
  `mastery_level` TINYINT DEFAULT 0 COMMENT 'Mastery level 0-5',
  `review_count` INT DEFAULT 0 COMMENT 'Review count',
  `correct_count` INT DEFAULT 0 COMMENT 'Correct count',
  `wrong_count` INT DEFAULT 0 COMMENT 'Wrong count',
  `last_review_time` DATETIME COMMENT 'Last review time',
  `next_review_time` DATETIME COMMENT 'Next review time',
  `is_favorite` BOOLEAN DEFAULT FALSE COMMENT 'Is favorite',
  `first_learned_time` DATETIME COMMENT 'First learned time',
  `notes` TEXT COMMENT 'User notes',
  `deleted` TINYINT DEFAULT 0 COMMENT 'Deleted flag',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_vocab` (`user_id`, `vocabulary_id`),
  KEY `idx_user_mastery` (`user_id`, `mastery_level`),
  KEY `idx_next_review` (`user_id`, `next_review_time`),
  KEY `idx_favorite` (`user_id`, `is_favorite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Vocabulary mastery tracking';

ALTER TABLE `learning_record` 
ADD COLUMN `time_spent` INT COMMENT 'Time spent in seconds' AFTER `is_correct`,
ADD COLUMN `original_content` JSON COMMENT 'Original content' AFTER `correct_answer`;

CREATE TABLE IF NOT EXISTS `daily_learning_stats` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `stat_date` DATE NOT NULL COMMENT 'Statistics date',
  `vocabulary_count` INT DEFAULT 0 COMMENT 'Vocabulary count',
  `grammar_count` INT DEFAULT 0 COMMENT 'Grammar count',
  `reading_count` INT DEFAULT 0 COMMENT 'Reading count',
  `listening_count` INT DEFAULT 0 COMMENT 'Listening count',
  `writing_count` INT DEFAULT 0 COMMENT 'Writing count',
  `speaking_count` INT DEFAULT 0 COMMENT 'Speaking count',
  `total_time_minutes` INT DEFAULT 0 COMMENT 'Total time in minutes',
  `total_questions` INT DEFAULT 0 COMMENT 'Total questions',
  `correct_questions` INT DEFAULT 0 COMMENT 'Correct questions',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date` (`user_id`, `stat_date`),
  KEY `idx_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Daily learning statistics';

SELECT 'Vocabulary mastery system created successfully!' AS message;
