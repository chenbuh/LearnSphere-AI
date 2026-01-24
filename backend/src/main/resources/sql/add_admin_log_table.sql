CREATE TABLE IF NOT EXISTS `admin_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `admin_id` bigint(20) DEFAULT NULL COMMENT '操作人ID',
  `admin_username` varchar(50) DEFAULT NULL COMMENT '操作人用户名',
  `module` varchar(50) DEFAULT NULL COMMENT '操作模块',
  `action` varchar(100) DEFAULT NULL COMMENT '操作名称',
  `details` text COMMENT '操作详情',
  `ip` varchar(50) DEFAULT NULL COMMENT 'IP地址',
  `status` tinyint(2) DEFAULT '1' COMMENT '状态 1成功 0失败',
  `error_msg` text COMMENT '错误信息',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员操作日志表';
