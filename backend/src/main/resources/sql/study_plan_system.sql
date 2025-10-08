-- ========================================
-- 学习计划系统 - 数据库表
-- ========================================

USE learnsphere_ai;

-- 学习计划表
CREATE TABLE IF NOT EXISTS `study_plan` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` BIGINT NOT NULL COMMENT 'User ID',
  `exam_type` VARCHAR(20) COMMENT 'Exam type: cet4/cet6/ielts/toefl',
  `target_score` INT COMMENT 'Target score',
  `current_level` INT COMMENT 'Current level (estimated)',
  `duration_days` INT COMMENT 'Plan duration in days',
  `start_date` DATE COMMENT 'Start date',
  `end_date` DATE COMMENT 'End date',
  `status` TINYINT DEFAULT 1 COMMENT '0-completed,1-in_progress,2-abandoned',
  `plan_detail` JSON COMMENT 'Detailed plan (weekly tasks)',
  `progress` INT DEFAULT 0 COMMENT 'Completion percentage 0-100',
  `deleted` TINYINT DEFAULT 0 COMMENT 'Deleted flag',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`, `status`),
  KEY `idx_date` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Study plan';

-- 每日任务表
CREATE TABLE IF NOT EXISTS `daily_task` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `plan_id` BIGINT COMMENT 'Study plan ID',
  `task_date` DATE COMMENT 'Task date',
  `task_type` VARCHAR(20) COMMENT 'Task type: vocabulary/reading/listening/grammar/writing/speaking',
  `task_name` VARCHAR(100) COMMENT 'Task name',
  `target_count` INT COMMENT 'Target count',
  `completed_count` INT DEFAULT 0 COMMENT 'Completed count',
  `is_completed` BOOLEAN DEFAULT FALSE,
  `complete_time` DATETIME COMMENT 'Complete time',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_date_type` (`user_id`, `task_date`, `task_type`),
  KEY `idx_plan` (`plan_id`),
  KEY `idx_date` (`task_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Daily tasks';

-- 插入示例学习计划模板
INSERT INTO `study_plan` (`user_id`, `exam_type`, `target_score`, `current_level`, `duration_days`, `start_date`, `end_date`, `status`, `plan_detail`, `progress`) VALUES
(1, 'cet4', 550, 400, 30, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 1, 
'{"weeks": [
  {"week": 1, "focus": "Vocabulary Foundation", "tasks": ["Learn 100 words/day", "Grammar basics", "Listening practice 30min"]},
  {"week": 2, "focus": "Reading Skills", "tasks": ["Reading 2 articles/day", "Vocabulary review", "Grammar exercises"]},
  {"week": 3, "focus": "Listening Enhancement", "tasks": ["Listening 1 hour/day", "Mock tests", "Error review"]},
  {"week": 4, "focus": "Mock Exams", "tasks": ["Full mock exam x2", "Weak point practice", "Final review"]}
]}', 0);

-- 插入今天的示例任务
INSERT INTO `daily_task` (`user_id`, `plan_id`, `task_date`, `task_type`, `task_name`, `target_count`, `completed_count`, `is_completed`) VALUES
(1, 1, CURDATE(), 'vocabulary', 'Learn new words', 50, 0, FALSE),
(1, 1, CURDATE(), 'reading', 'Read articles', 2, 0, FALSE),
(1, 1, CURDATE(), 'listening', 'Listening practice (minutes)', 30, 0, FALSE),
(1, 1, CURDATE(), 'grammar', 'Grammar exercises', 10, 0, FALSE);

SELECT 'Study plan system tables created successfully!' AS message;
