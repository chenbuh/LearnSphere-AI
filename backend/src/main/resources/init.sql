-- Create database
CREATE DATABASE IF NOT EXISTS learnsphere_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE learnsphere_ai;

-- User table
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `nickname` VARCHAR(50),
  `avatar` VARCHAR(255),
  `phone` VARCHAR(20),
  `exam_type` VARCHAR(20),
  `target_score` INT,
  `current_level` VARCHAR(20),
  `status` TINYINT DEFAULT 1,
  `deleted` TINYINT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vocabulary table
CREATE TABLE IF NOT EXISTS `vocabulary` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `word` VARCHAR(100) NOT NULL,
  `phonetic` VARCHAR(100),
  `definition` TEXT,
  `translation` VARCHAR(500),
  `example` TEXT,
  `example_translation` TEXT,
  `exam_type` VARCHAR(20),
  `difficulty` TINYINT,
  `frequency` INT DEFAULT 0,
  `tags` VARCHAR(255),
  `deleted` TINYINT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_word` (`word`),
  KEY `idx_exam_type` (`exam_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Grammar exercise table
CREATE TABLE IF NOT EXISTS `grammar_exercise` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT,
  `question` TEXT NOT NULL,
  `options` TEXT,
  `answer` VARCHAR(500) NOT NULL,
  `explanation` TEXT,
  `exam_type` VARCHAR(20),
  `difficulty` TINYINT,
  `category` VARCHAR(50),
  `tags` VARCHAR(255),
  `deleted` TINYINT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Learning record table
CREATE TABLE IF NOT EXISTS `learning_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `content_id` BIGINT NOT NULL,
  `content_type` VARCHAR(20) NOT NULL,
  `is_correct` TINYINT,
  `time_spent` INT,
  `score` INT,
  `answer` TEXT,
  `correct_answer` TEXT,
  `mastery_level` TINYINT DEFAULT 0,
  `review_count` INT DEFAULT 0,
  `last_review_time` DATETIME,
  `next_review_time` DATETIME,
  `deleted` TINYINT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert test users
-- admin & test: password = 123456
-- damin: password = 147258369
INSERT INTO `user` (`username`, `password`, `email`, `nickname`, `exam_type`, `status`) VALUES
('admin', '$2a$10$N.zmdr8RyqHmQu9Qvkr9YuTXN9HSkCFSQ7h7C8U6u/3CzZvCXFNR6', 'admin@learnsphere.ai', 'Admin', 'CET-6', 1),
('test', '$2a$10$N.zmdr8RyqHmQu9Qvkr9YuTXN9HSkCFSQ7h7C8U6u/3CzZvCXFNR6', 'test@learnsphere.ai', 'Test User', 'CET-4', 1),
('damin', '$2a$10$5ZQqYvLXJ7j.7K3jP0xGROpQz1EWvpN3YfJWxD7rCCGMqVnQa8Zny', 'damin@learnsphere.ai', 'Damin', 'CET-4', 1);


SELECT 'Database initialized successfully!' AS message;
