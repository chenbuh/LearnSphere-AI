-- ========================================
-- LearnSphere AI 数据库初始化脚本
-- ========================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS learnsphere_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE learnsphere_ai;

-- ========================================
USE learnsphere_ai;

-- 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `email` VARCHAR(100) COMMENT '邮箱',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `exam_type` VARCHAR(20) COMMENT '考试类型',
  `target_score` INT COMMENT '目标分数',
  `current_level` VARCHAR(20) COMMENT '当前水平',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ========================================
-- 词汇表
-- ========================================
CREATE TABLE IF NOT EXISTS `vocabulary` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '词汇ID',
  `word` VARCHAR(100) NOT NULL COMMENT '单词',
  `phonetic` VARCHAR(100) COMMENT '音标',
  `definition` TEXT COMMENT '释义',
  `translation` VARCHAR(500) COMMENT '中文翻译',
  `example` TEXT COMMENT '例句',
  `example_translation` TEXT COMMENT '例句翻译',
  `exam_type` VARCHAR(20) COMMENT '考试类型',
  `difficulty` TINYINT COMMENT '难度等级：1-5',
  `frequency` INT DEFAULT 0 COMMENT '词频',
  `tags` VARCHAR(255) COMMENT '标签（JSON数组）',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_word` (`word`),
  KEY `idx_exam_type` (`exam_type`),
  KEY `idx_difficulty` (`difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='词汇表';

-- ========================================
-- 语法练习表
-- ========================================
CREATE TABLE IF NOT EXISTS `grammar_exercise` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '练习ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT COMMENT '内容',
  `question` TEXT NOT NULL COMMENT '题目',
  `options` TEXT COMMENT '选项（JSON数组）',
  `answer` VARCHAR(500) NOT NULL COMMENT '答案',
  `explanation` TEXT COMMENT '解析',
  `exam_type` VARCHAR(20) COMMENT '考试类型',
  `difficulty` TINYINT COMMENT '难度等级：1-5',
  `category` VARCHAR(50) COMMENT '分类',
  `tags` VARCHAR(255) COMMENT '标签（JSON数组）',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_exam_type` (`exam_type`),
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='语法练习表';

-- ========================================
-- 学习记录表
-- ========================================
CREATE TABLE IF NOT EXISTS `learning_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `content_id` BIGINT NOT NULL COMMENT '内容ID',
  `content_type` VARCHAR(20) NOT NULL COMMENT '内容类型：vocabulary/grammar/reading/listening',
  `is_correct` TINYINT COMMENT '是否正确：0-错误，1-正确',
  `time_spent` INT COMMENT '耗时（秒）',
  `score` INT COMMENT '得分',
  `answer` TEXT COMMENT '用户答案',
  `correct_answer` TEXT COMMENT '正确答案',
  `mastery_level` TINYINT DEFAULT 0 COMMENT '掌握程度：0-5',
  `review_count` INT DEFAULT 0 COMMENT '复习次数',
  `last_review_time` DATETIME COMMENT '最后复习时间',
  `next_review_time` DATETIME COMMENT '下次复习时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_content` (`content_id`, `content_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习记录表';

-- ========================================
-- 插入测试数据
-- ========================================

-- 插入测试用户（密码：123456，使用BCrypt加密）
INSERT INTO `user` (`username`, `password`, `email`, `nickname`, `exam_type`, `status`) VALUES
('admin', '$2a$10$N.zmdr8RyqHmQu9Qvkr9YuTXN9HSkCFSQ7h7C8U6u/3CzZvCXFNR6', 'admin@learnsphere.ai', '管理员', 'CET-6', 1),
('test', '$2a$10$N.zmdr8RyqHmQu9Qvkr9YuTXN9HSkCFSQ7h7C8U6u/3CzZvCXFNR6', 'test@learnsphere.ai', '测试用户', 'CET-4', 1);

-- 完成
SELECT '数据库初始化完成！' AS message;
