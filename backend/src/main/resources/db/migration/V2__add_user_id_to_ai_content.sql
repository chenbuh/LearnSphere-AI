-- ============================================================================
-- V2: 补齐 AI 生成内容表的 user_id 字段（幂等）
-- ============================================================================
--
-- 目标：
--   为 listening_material / reading_article / writing_topic / grammar_exercise
--   补上 user_id 字段与索引，实现「AI 生成内容按用户隔离」。
--
-- 为什么需要这个版本：
--   历史上 db/migration/V1.3__add_user_id_to_ai_content.sql 表达过同样的意图，
--   但存在两个问题：
--     1) 非幂等 —— 直接 ADD COLUMN，字段已存在时整条语句报错，迁移中断
--     2) 从未被执行 —— 当时没有任何迁移机制，该文件只是「放着」
--   结果各环境的实际状态并不一致：生产库 listening_material / reading_article
--   已有 user_id，而 writing_topic / grammar_exercise 缺失。
--
-- 实现方式：
--   用 INFORMATION_SCHEMA 判断后再执行，可安全重复运行。
--   每张表的处理独立，任一表不存在时跳过而不中断整体迁移
--   （部分环境可能没有 writing_topic / grammar_exercise）。
--
-- 语义说明：
--   已存在的记录 user_id 为 NULL，表示「全局共享数据」，不对任何用户隐藏；
--   新生成的记录会写入当前用户 ID。
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. listening_material
-- ---------------------------------------------------------------------------
SET @tbl = 'listening_material';
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl) = 0,
    'SELECT ''skip: listening_material 不存在''',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'user_id') = 0,
      CONCAT('ALTER TABLE `', @tbl, '` ADD COLUMN `user_id` BIGINT NULL AFTER `id`'),
      'SELECT ''skip: listening_material.user_id 已存在'''
    )
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl) = 0,
    'SELECT ''skip: listening_material 不存在''',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND INDEX_NAME = 'idx_user_id') = 0,
      CONCAT('ALTER TABLE `', @tbl, '` ADD INDEX `idx_user_id` (`user_id`)'),
      'SELECT ''skip: listening_material.idx_user_id 已存在'''
    )
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 2. reading_article
-- ---------------------------------------------------------------------------
SET @tbl = 'reading_article';
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl) = 0,
    'SELECT ''skip: reading_article 不存在''',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'user_id') = 0,
      CONCAT('ALTER TABLE `', @tbl, '` ADD COLUMN `user_id` BIGINT NULL AFTER `id`'),
      'SELECT ''skip: reading_article.user_id 已存在'''
    )
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl) = 0,
    'SELECT ''skip: reading_article 不存在''',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND INDEX_NAME = 'idx_user_id') = 0,
      CONCAT('ALTER TABLE `', @tbl, '` ADD INDEX `idx_user_id` (`user_id`)'),
      'SELECT ''skip: reading_article.idx_user_id 已存在'''
    )
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 3. writing_topic
-- ---------------------------------------------------------------------------
SET @tbl = 'writing_topic';
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl) = 0,
    'SELECT ''skip: writing_topic 不存在''',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'user_id') = 0,
      CONCAT('ALTER TABLE `', @tbl, '` ADD COLUMN `user_id` BIGINT NULL AFTER `id`'),
      'SELECT ''skip: writing_topic.user_id 已存在'''
    )
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl) = 0,
    'SELECT ''skip: writing_topic 不存在''',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND INDEX_NAME = 'idx_user_id') = 0,
      CONCAT('ALTER TABLE `', @tbl, '` ADD INDEX `idx_user_id` (`user_id`)'),
      'SELECT ''skip: writing_topic.idx_user_id 已存在'''
    )
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- 4. grammar_exercise
-- ---------------------------------------------------------------------------
SET @tbl = 'grammar_exercise';
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl) = 0,
    'SELECT ''skip: grammar_exercise 不存在''',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'user_id') = 0,
      CONCAT('ALTER TABLE `', @tbl, '` ADD COLUMN `user_id` BIGINT NULL AFTER `id`'),
      'SELECT ''skip: grammar_exercise.user_id 已存在'''
    )
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl) = 0,
    'SELECT ''skip: grammar_exercise 不存在''',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND INDEX_NAME = 'idx_user_id') = 0,
      CONCAT('ALTER TABLE `', @tbl, '` ADD INDEX `idx_user_id` (`user_id`)'),
      'SELECT ''skip: grammar_exercise.idx_user_id 已存在'''
    )
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
