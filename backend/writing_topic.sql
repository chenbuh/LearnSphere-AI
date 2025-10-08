-- 写作题目表
CREATE TABLE IF NOT EXISTS `writing_topic` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `exam_type` VARCHAR(50) NOT NULL COMMENT '考试类型：ielts/toefl/cet4/cet6',
  `mode` VARCHAR(50) NOT NULL COMMENT '写作模式：essay/chart/letter',
  `title` VARCHAR(255) NOT NULL COMMENT '题目标题',
  `prompt` TEXT NOT NULL COMMENT '题目描述/提示',
  `min_words` INT DEFAULT 250 COMMENT '最少字数要求',
  `tips` TEXT COMMENT '写作提示（JSON数组）',
  `difficulty` VARCHAR(20) DEFAULT 'medium' COMMENT '难度：easy/medium/hard',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_exam_mode` (`exam_type`, `mode`),
  INDEX `idx_deleted` (`deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='写作题目表';
