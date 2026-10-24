USE chen;

-- 创建管理员表
CREATE TABLE IF NOT EXISTS `admin` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL COMMENT '账号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（BCrypt 哈希）',
  `salt` VARCHAR(64) NOT NULL COMMENT '盐值（BCrypt 已内含，保留兼容）',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `status` INT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
  `deleted` INT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 安全说明（重要）：
-- 本脚本不再内置任何默认管理员账号与口令。
-- 历史版本曾内置 admin / admin123 的固定 BCrypt 哈希，该哈希已随仓库公开，
-- 属于已被验证可登录的默认凭证，故永久移除。
--
-- 首次部署创建管理员，请使用以下任一方式：
--   1) 设置环境变量后启动，由应用在启动时创建（推荐）：
--        ADMIN_INIT_USERNAME=admin
--        ADMIN_INIT_PASSWORD=<至少 12 位的随机强口令>
--      应用仅在 admin 表为空时创建该账号，创建后请立即修改口令。
--   2) 手动生成 Bcrypt 哈希后自行 INSERT：
--        java -cp hutool-all.jar 用 BCrypt.hashpw(口令, BCrypt.gensalt())
--      INSERT INTO `admin` (`username`, `password`, `salt`, `nickname`, `status`)
--      VALUES ('admin', '<你的 BCrypt 哈希>', '', '超级管理员', 1);
--
-- 注意：`password` 必须为 BCrypt（$2 前缀）；`salt` 列已废弃，保留仅为兼容旧表结构。
--
-- 如需迁移旧 MD5 密码记录，请单独执行迁移脚本，切勿在本文件中写入固定哈希。

-- 仅为空库创建管理员提供占位提示，不插入任何数据。
SELECT '请通过 ADMIN_INIT_PASSWORD 环境变量或手动 INSERT 创建管理员账号' AS notice;
