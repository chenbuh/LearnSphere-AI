-- AI Tutor 扩展功能数据库表
-- Version 3.0.0

-- 1. AI Tutor 对话历史表
CREATE TABLE IF NOT EXISTS `ai_tutor_conversation` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `session_id` VARCHAR(64) NOT NULL COMMENT '会话ID',
  `role` VARCHAR(20) NOT NULL COMMENT '消息角色 user/assistant',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `context_info` TEXT COMMENT '上下文信息(JSON)',
  `topic` VARCHAR(100) COMMENT '关联知识点',
  `resolved` TINYINT(1) DEFAULT 0 COMMENT '是否已解决',
  `feedback` VARCHAR(20) COMMENT '用户反馈',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_topic` (`topic`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI Tutor对话历史';

-- 2. 用户薄弱知识点表
CREATE TABLE IF NOT EXISTS `user_weakness` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `topic` VARCHAR(100) NOT NULL COMMENT '知识点',
  `category` VARCHAR(50) NOT NULL COMMENT '知识点类别',
  `error_count` INT DEFAULT 0 COMMENT '错误次数',
  `total_count` INT DEFAULT 0 COMMENT '总练习次数',
  `accuracy` DECIMAL(5,2) DEFAULT 0.00 COMMENT '正确率',
  `last_practice_time` DATETIME COMMENT '最近练习时间',
  `needs_review` TINYINT(1) DEFAULT 0 COMMENT '是否需要复习',
  `review_priority` INT DEFAULT 0 COMMENT '复习优先级',
  `ai_suggestion` TEXT COMMENT 'AI学习建议',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_topic` (`user_id`, `topic`, `deleted`),
  INDEX `idx_category` (`category`),
  INDEX `idx_needs_review` (`needs_review`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户薄弱知识点';

-- 3. 知识图谱表
CREATE TABLE IF NOT EXISTS `knowledge_graph` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `topic` VARCHAR(100) NOT NULL COMMENT '知识点名称',
  `category` VARCHAR(50) NOT NULL COMMENT '知识点类别',
  `related_topics` TEXT COMMENT '关联知识点(JSON)',
  `prerequisite_topics` TEXT COMMENT '前置知识点(JSON)',
  `next_topics` TEXT COMMENT '后续知识点(JSON)',
  `difficulty_level` INT DEFAULT 1 COMMENT '难度级别',
  `description` TEXT COMMENT '知识点描述',
  `common_mistakes` TEXT COMMENT '常见易错点(JSON)',
  `recommended_resources` TEXT COMMENT '推荐资源(JSON)',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_topic` (`topic`, `deleted`),
  INDEX `idx_category` (`category`),
  INDEX `idx_difficulty` (`difficulty_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识图谱';

-- 4. 插入初始知识图谱数据
INSERT INTO `knowledge_graph` (`topic`, `category`, `related_topics`, `prerequisite_topics`, `next_topics`, `difficulty_level`, `description`, `common_mistakes`) VALUES
('时态', 'grammar', '["现在完成时", "过去完成时", "将来完成时", "现在进行时"]', '["基础语法", "动词"]', '["虚拟语气", "被动语态"]', 3, '英语时态是表示动作发生时间和状态的语法形式', '["混淆现在完成时和过去时", "忘记第三人称单数"]'),
('现在完成时', 'grammar', '["过去完成时", "时态", "for/since用法"]', '["时态", "过去分词"]', '["现在完成进行时"]', 3, '表示过去发生的动作对现在造成的影响', '["与过去时混淆", "for和since用法错误"]'),
('虚拟语气', 'grammar', '["条件句", "时态"]', '["时态", "助动词"]', '["混合虚拟语气"]', 4, '表示假设、愿望、建议等非真实情况', '["if条件句时态错误", "wish后时态使用不当"]'),
('定语从句', 'grammar', '["关系代词", "关系副词", "非限制性定语从句"]', '["从句基础", "先行词"]', '["名词性从句"]', 4, '修饰名词或代词的从句', '["which和that混淆", "介词+关系代词"]'),
('被动语态', 'grammar', '["时态", "助动词"]', '["时态", "过去分词"]', '["被动语态的特殊用法"]', 3, '表示主语是动作的承受者', '["时态与被动语态结合错误", "by的使用"]');
