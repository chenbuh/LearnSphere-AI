USE learnsphere_ai;

-- 创建管理员表
CREATE TABLE IF NOT EXISTS `admin` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL COMMENT '账号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加盐哈希）',
  `salt` VARCHAR(64) NOT NULL COMMENT '盐值',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `status` INT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入默认管理员账号
-- 账号：chen
-- 密码：chen20040209
-- 盐值：learnsphere2024salt
-- 加盐后的MD5哈希密码
INSERT INTO `admin` (`username`, `password`, `salt`, `nickname`, `status`) 
VALUES ('chen', '5571eda2e969f05e80a337cee189d9e7', 'learnsphere2024salt', '超级管理员', 1);

