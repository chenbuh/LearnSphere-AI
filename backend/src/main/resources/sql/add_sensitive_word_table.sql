-- ======================================================
-- 添加敏感词表 (Sensitive Word)
-- ======================================================

USE learnsphere_ai;

-- 敏感词表
CREATE TABLE IF NOT EXISTS `sensitive_word` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `word` VARCHAR(100) NOT NULL COMMENT '敏感词内容',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_word` (`word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='敏感词库';

-- 插入一些示例敏感词 (可以根据需要调整)
INSERT IGNORE INTO `sensitive_word` (`word`) VALUES
('暴力'),
('恐怖'),
('色情'),
('赌博'),
('毒品'),
('诈骗');
