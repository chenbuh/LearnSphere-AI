-- 创建数据库
CREATE DATABASE IF NOT EXISTS learnsphere_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE learnsphere_ai;

-- 用户表
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
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 词汇表
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
  KEY `idx_frequency` (`frequency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='词汇表';

-- 学习记录表
CREATE TABLE IF NOT EXISTS `learning_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `content_id` BIGINT NOT NULL COMMENT '内容ID',
  `content_type` VARCHAR(20) NOT NULL COMMENT '内容类型：vocabulary/grammar/reading',
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
  KEY `idx_content` (`content_id`, `content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习记录表';

-- 插入一些测试词汇数据
INSERT IGNORE INTO `vocabulary` (`word`, `phonetic`, `definition`, `translation`, `example`, `example_translation`, `exam_type`, `difficulty`, `frequency`) VALUES
('abandon', '/əˈbændən/', 'v. to leave somebody/something behind', '放弃；遗弃', 'The baby had been abandoned by its mother.', '这个婴儿被母亲遗弃了。', 'cet4', 3, 850),
('ability', '/əˈbɪləti/', 'n. the fact that somebody/something is able to do something', '能力；才能', 'She has the ability to speak three languages.', '她有说三种语言的能力。', 'cet4', 2, 920),
('about', '/əˈbaʊt/', 'prep. on the subject of somebody/something', '关于；大约', 'Tell me about your trip.', '告诉我你的旅行情况。', 'cet4', 1, 1500),
('above', '/əˈbʌv/', 'prep. at or to a higher place or position than somebody/something', '在...上面', 'The plane flew above the clouds.', '飞机在云层上方飞行。', 'cet4', 2, 1200),
('accept', '/əkˈsept/', 'v. to take willingly something that is offered', '接受；同意', 'I accept your invitation.', '我接受你的邀请。', 'cet4', 2, 980);