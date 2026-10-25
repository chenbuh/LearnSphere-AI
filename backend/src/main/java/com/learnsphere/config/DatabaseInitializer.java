package com.learnsphere.config;

import com.learnsphere.util.SystemPromptDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 数据库初始化组件
 * 在应用启动时自动检查并创建数据库表结构。
 * 同时也负责初始化系统默认配置 (system_config) 和 AI 提示词模板 (system_prompt)。
 * 这是一个极简的类似 Flyway 的实现，便于快速部署。
 */
@Slf4j
@Component
public class DatabaseInitializer implements CommandLineRunner {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Override
  public void run(String... args) {
    try {
      // 0. 确保 user 表有 last_login_time 字段（用于留存率统计）
      try {
        jdbcTemplate.execute("ALTER TABLE `user` ADD COLUMN `last_login_time` DATETIME NULL AFTER `points`");
        log.info("已为 user 表添加 last_login_time 字段");
      } catch (Exception e) {
        // 字段已存在，忽略
      }

      // 0.1 后台管理员角色与最近登录时间（已有账号默认超级管理员，保持原有权限）
      String[] adminColumns = {
          "ALTER TABLE `admin` ADD COLUMN `role` VARCHAR(32) NOT NULL DEFAULT 'super_admin' AFTER `nickname`",
          "ALTER TABLE `admin` ADD COLUMN `last_login_time` DATETIME NULL AFTER `status`",
          "ALTER TABLE `admin` ADD COLUMN `user_id` BIGINT NULL COMMENT '关联的学习账号ID' AFTER `role`"
      };
      for (String columnSql : adminColumns) {
        try {
          jdbcTemplate.execute(columnSql);
        } catch (Exception e) {
          // 字段已存在，忽略
        }
      }

      // 1. 创建 writing_topic 表
      try {
        jdbcTemplate.execute("ALTER TABLE `user` ADD COLUMN `daily_tutor_quota` INT NULL AFTER `daily_ai_quota` ");
      } catch (Exception e) {
        // 幂等迁移：字段/索引已存在时忽略，无需处理
      }

      String writingTopicSql = """
              CREATE TABLE IF NOT EXISTS `writing_topic` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `exam_type` VARCHAR(50),
                `mode` VARCHAR(50),
                `title` VARCHAR(255),
                `prompt` TEXT,
                `min_words` INT,
                `tips` TEXT,
                `difficulty` VARCHAR(20),
                `deleted` TINYINT(1) DEFAULT 0,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(writingTopicSql);

      // 2. 修复/创建 grammar_exercise 表
      String[] grammarColumns = {
          "ALTER TABLE `grammar_exercise` ADD COLUMN `topic` VARCHAR(100) NOT NULL AFTER `id` ",
          "ALTER TABLE `grammar_exercise` ADD COLUMN `difficulty` VARCHAR(20) DEFAULT 'medium' AFTER `topic` ",
          "ALTER TABLE `grammar_exercise` MODIFY COLUMN `difficulty` VARCHAR(20) DEFAULT 'medium' ",
          "ALTER TABLE `grammar_exercise` MODIFY COLUMN `title` VARCHAR(255) NULL ", // 如果存在 title 字段，允许其为空以避免插入报错
          "ALTER TABLE `grammar_exercise` ADD COLUMN `questions` TEXT NOT NULL AFTER `difficulty` ",
          "ALTER TABLE `grammar_exercise` ADD COLUMN `deleted` TINYINT(1) DEFAULT 0 AFTER `questions` ",
          "ALTER TABLE `grammar_exercise` ADD COLUMN `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `deleted` ",
          "ALTER TABLE `grammar_exercise` ADD COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `create_time` "
      };

      for (String columnSql : grammarColumns) {
        try {
          jdbcTemplate.execute(columnSql);
        } catch (Exception e) {
          // 已存在则忽略
        }
      }

      String grammarExerciseSql = """
              CREATE TABLE IF NOT EXISTS `grammar_exercise` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `topic` VARCHAR(100) NOT NULL,
                `difficulty` VARCHAR(20) DEFAULT 'medium',
                `questions` TEXT NOT NULL,
                `deleted` TINYINT(1) DEFAULT 0,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(grammarExerciseSql);

      // 3. 创建 reading_article 表
      String readingArticleSql = """
              CREATE TABLE IF NOT EXISTS `reading_article` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `content` TEXT NOT NULL,
                `source` VARCHAR(100),
                `category` VARCHAR(50),
                `difficulty` VARCHAR(20),
                `word_count` INT,
                `questions` TEXT,
                `deleted` TINYINT(1) DEFAULT 0,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(readingArticleSql);

      // 一次性修复：更新 ReadingArticle 中词数为 0 的存量数据
      try {
        log.info("🔍 正在检查并修复阅读文章词数统计...");
        // 虽然 SQL 难以精确统计西文词数，但我们可以做一个近似统计：按空格和换行切分
        // 这里采用简单的正则替换统计方法（仅针对 MySQL）
        String repairSql = "UPDATE `reading_article` " +
            "SET `word_count` = (LENGTH(`content`) - LENGTH(REPLACE(`content`, ' ', '')) + 1) " +
            "WHERE `word_count` IS NULL OR `word_count` = 0";
        int affected = jdbcTemplate.update(repairSql);
        if (affected > 0) {
          log.info("✅ 已修复 {} 条阅读文章的词数统计", affected);
        }
      } catch (Exception e) {
        log.warn("修复词数统计失败: {}", e.getMessage());
      }

      String listeningMaterialSql = """
              CREATE TABLE IF NOT EXISTS `listening_material` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `title` VARCHAR(255) NOT NULL,
                `type` VARCHAR(50),
                `difficulty` VARCHAR(20),
                `script` TEXT,
                `questions` TEXT,
                `audio_url` VARCHAR(500),
                `deleted` TINYINT(1) DEFAULT 0,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(listeningMaterialSql);

      // 5. Ensure Vocabulary table columns exist (Fix for user request)
      String[] vocabColumns = {
          "ALTER TABLE `vocabulary` ADD COLUMN `phonetic` VARCHAR(100) AFTER `word`",
          "ALTER TABLE `vocabulary` ADD COLUMN `translation` VARCHAR(255) AFTER `definition`",
          "ALTER TABLE `vocabulary` ADD COLUMN `example` TEXT AFTER `translation`",
          "ALTER TABLE `vocabulary` ADD COLUMN `example_translation` TEXT AFTER `example`",
          "ALTER TABLE `vocabulary` MODIFY COLUMN `definition` TEXT" // Ensure definition is text
      };
      for (String colSql : vocabColumns) {
        try {
          jdbcTemplate.execute(colSql);
        } catch (Exception e) {
          // 幂等迁移：字段/索引已存在时忽略，无需处理
        }
      }

      // 5.1 词汇表排序索引
      //
      // 后台「批量 AI 补全」需要按 frequency 倒序取出 20 条质量缺失的记录。
      // 缺少该索引时，MySQL 必须对整张表做全表扫描再 filesort：
      //   EXPLAIN → type=ALL, rows=82194, Using filesort
      // 加上索引后可以反向扫描索引，凑够 20 条即停止：
      //   EXPLAIN → type=index, key=idx_frequency, rows=20, Backward index scan
      // 82k 行规模下这是 4000 倍的扫描量差异，且会随词库增长继续放大。
      try {
        jdbcTemplate.execute("ALTER TABLE `vocabulary` ADD INDEX `idx_frequency` (`frequency`)");
      } catch (Exception e) {
        // 索引已存在则忽略
      }

      // 5.2 允许 user_log.user_id 为空
      //
      // @UserOperation(logWhenAnonymous = true) 会把匿名操作（注册、登录失败等）也记入
      // user_log，此时没有登录用户，userId 为 null，username 回落为 "Anonymous"。
      // 但 user_log.user_id 原本是 NOT NULL 且无默认值，导致这些审计记录插入必然失败：
      //   DataIntegrityViolationException: Field 'user_id' doesn't have a default value
      // 结果是匿名审计日志被静默丢弃，并且每次都在 ERROR 级别刷一条堆栈。
      // 这里只在确实为 NOT NULL 时才改表，避免每次启动都执行 DDL。
      try {
        String nullable = jdbcTemplate.queryForObject(
            "SELECT IS_NULLABLE FROM information_schema.columns "
                + "WHERE table_schema = DATABASE() AND table_name = 'user_log' AND column_name = 'user_id'",
            String.class);
        if ("NO".equalsIgnoreCase(nullable)) {
          jdbcTemplate.execute("ALTER TABLE `user_log` MODIFY COLUMN `user_id` BIGINT NULL");
          log.info("已将 user_log.user_id 调整为可空，匿名操作日志不再丢失");
        }
      } catch (Exception e) {
        // 表不存在或查询失败时忽略
      }

      // 6. 创建 user_analysis 表
      String userAnalysisSql = """
              CREATE TABLE IF NOT EXISTS `user_analysis` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `user_id` BIGINT NOT NULL,
                `report_json` TEXT NOT NULL,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_user_id` (`user_id`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(userAnalysisSql);

      // 7. 创建 speaking_topic 表
      String speakingTopicSql = """
              CREATE TABLE IF NOT EXISTS `speaking_topic` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `type` VARCHAR(50),
                `difficulty` VARCHAR(20),
                `title` VARCHAR(255),
                `question` TEXT,
                `keywords` TEXT,
                `tips` TEXT,
                `deleted` TINYINT(1) DEFAULT 0,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(speakingTopicSql);

      // 8. 创建 achievement 和 user_achievement 表 (Gamification)
      String achievementSql = """
              CREATE TABLE IF NOT EXISTS `achievement` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `code` VARCHAR(50) NOT NULL,
                `name` VARCHAR(100) NOT NULL,
                `description` VARCHAR(255),
                `icon` VARCHAR(50),
                `level` INT DEFAULT 1 COMMENT '1-Bronze, 2-Silver, 3-Gold',
                `condition_type` VARCHAR(50) NOT NULL,
                `condition_value` INT NOT NULL DEFAULT 0,
                `reward_points` INT DEFAULT 0,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY `uk_code_level` (`code`, `level`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(achievementSql);

      // Migration: Add level column if it doesn't exist
      try {
        jdbcTemplate.execute("ALTER TABLE `achievement` ADD COLUMN `level` INT DEFAULT 1 AFTER `icon` ");
      } catch (Exception e) {
        // 幂等迁移：字段/索引已存在时忽略，无需处理
      }
      try {
        jdbcTemplate.execute("ALTER TABLE `achievement` DROP INDEX `uk_code` ");
        jdbcTemplate.execute("ALTER TABLE `achievement` ADD UNIQUE KEY `uk_code_level` (`code`, `level`) ");
      } catch (Exception e) {
        // 幂等迁移：字段/索引已存在时忽略，无需处理
      }

      String userAchievementSql = """
              CREATE TABLE IF NOT EXISTS `user_achievement` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `user_id` BIGINT NOT NULL,
                `achievement_id` BIGINT NOT NULL,
                `status` TINYINT NOT NULL DEFAULT 0,
                `current_value` INT DEFAULT 0,
                `unlocked_time` DATETIME,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY `uk_user_achv` (`user_id`,`achievement_id`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(userAchievementSql);

      // 插入初始成就数据 (支持等级)
      String[] initialAchievements = {
          // Vocabulary Master
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('VOCAB_MASTER', '词汇达人 I', '累计掌握 100 个单词', 'Target', 1, 'vocab_count', 100, 100)",
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('VOCAB_MASTER', '词汇大师 II', '累计掌握 500 个单词', 'Target', 2, 'vocab_count', 500, 300)",
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('VOCAB_MASTER', '词海宗师 III', '累计掌握 1000 个单词', 'Target', 3, 'vocab_count', 1000, 1000)",

          // AI Speaking Sessions
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('AI_ORATOR', '口语新秀', '完成 5 场 AI 口语练习', 'Mic', 1, 'AI_SPEAKING_SESSION', 5, 100)",
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('AI_ORATOR', '辩论高手', '完成 20 场 AI 口语练习', 'Mic', 2, 'AI_SPEAKING_SESSION', 20, 500)",
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('AI_ORATOR', '演讲大师', '完成 100 场 AI 口语练习', 'Mic', 3, 'AI_SPEAKING_SESSION', 100, 2000)",

          // AI Deep Analyze
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('DEEP_THINKER', '思维火花', '进行 10 次 AI 深度错题解析', 'Sparkles', 1, 'AI_DEEP_ANALYZE', 10, 200)",
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('DEEP_THINKER', '洞察之眼', '进行 50 次 AI 深度错题解析', 'Sparkles', 2, 'AI_DEEP_ANALYZE', 50, 800)",

          // Checkin
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('CHECKIN_STREAK', '坚持不懈 I', '连续打卡 7 天', 'TrendingUp', 1, 'checkin_streak', 7, 100)",
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('CHECKIN_STREAK', '钢铁意志 II', '连续打卡 30 天', 'TrendingUp', 2, 'checkin_streak', 30, 500)",
          "INSERT IGNORE INTO `achievement` (`code`, `name`, `description`, `icon`, `level`, `condition_type`, `condition_value`, `reward_points`) VALUES ('CHECKIN_STREAK', '学习之魂 III', '连续打卡 100 天', 'TrendingUp', 3, 'checkin_streak', 100, 2000)"
      };

      for (String sql : initialAchievements) {
        jdbcTemplate.execute(sql);
      }

      // 9. AI Governance Tables
      String aiSystemPromptTable = """
              CREATE TABLE IF NOT EXISTS `system_prompt` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `prompt_key` VARCHAR(100) NOT NULL UNIQUE,
                  `description` VARCHAR(255),
                  `content` TEXT NOT NULL,
                  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_prompt_key` (`prompt_key`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(aiSystemPromptTable);

      String aiGenLogTable = """
              CREATE TABLE IF NOT EXISTS `ai_generation_log` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` BIGINT,
                  `action_type` VARCHAR(50) NOT NULL,
                  `model_name` VARCHAR(50),
                  `prompt_preview` VARCHAR(500),
                  `status` VARCHAR(20) NOT NULL,
                  `error_message` TEXT,
                  `duration_ms` BIGINT,
                  `input_tokens` INT DEFAULT 0,
                  `output_tokens` INT DEFAULT 0,
                  `total_tokens` INT DEFAULT 0,
                  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_create_time` (`create_time`),
                  INDEX `idx_user_id` (`user_id`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(aiGenLogTable);

      // Add token columns to existing tables if they don't exist
      try {
        jdbcTemplate
            .execute("ALTER TABLE `ai_generation_log` ADD COLUMN `input_tokens` INT DEFAULT 0 AFTER `duration_ms`");
      } catch (Exception e) {
        // Column already exists
      }
      try {
        jdbcTemplate
            .execute("ALTER TABLE `ai_generation_log` ADD COLUMN `output_tokens` INT DEFAULT 0 AFTER `input_tokens`");
      } catch (Exception e) {
        // Column already exists
      }
      try {
        jdbcTemplate
            .execute("ALTER TABLE `ai_generation_log` ADD COLUMN `total_tokens` INT DEFAULT 0 AFTER `output_tokens`");
      } catch (Exception e) {
        // Column already exists
      }

      // Insert Default System Prompts
      // 内容集中在 SystemPromptDefaults，避免在 SQL 字符串里手工转义引号与换行。
      // 使用参数化 INSERT IGNORE：已存在的键不会被覆盖，后台改过的提示词不会被启动流程重置。
      for (SystemPromptDefaults.PromptDefault prompt : SystemPromptDefaults.all()) {
        jdbcTemplate.update(
            "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES (?, ?, ?)",
            prompt.promptKey(), prompt.description(), prompt.content());
      }

      // 10. System Configuration Table
      String sysConfigTable = """
              CREATE TABLE IF NOT EXISTS `system_config` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `config_key` VARCHAR(100) NOT NULL UNIQUE,
                  `config_value` TEXT,
                  `description` VARCHAR(255),
                  `category` VARCHAR(50),
                  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_config_key` (`config_key`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(sysConfigTable);

      // Default Configurations
      String[] defaultConfigs = {
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('sys.site_name', 'LearnSphere AI', '网站名称', 'BASIC')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('sys.announcement', '欢迎来到 LearnSphere AI 智能英语学习平台！', '系统公告', 'BASIC')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('sys.user_registration', 'true', '开放用户注册', 'SWITCH')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('sys.maintenance_mode', 'false', '系统维护模式', 'SWITCH')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.limit.daily.0', '15', '普通用户每日 AI 限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.limit.daily.1', '100', '月度会员每日 AI 限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.limit.daily.2', '120', '季度会员每日 AI 限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.limit.daily.3', '150', '年度会员每日 AI 限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.tutor.limit.daily.0', '20', '普通用户每日 AI 助教限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.tutor.limit.daily.1', '100', '月度会员每日 AI 助教限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.tutor.limit.daily.2', '150', '季度会员每日 AI 助教限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.tutor.limit.daily.3', '200', '年度会员每日 AI 助教限额', 'AI_LIMIT')",

          // VIP 套餐价格（元），前台价格页与后台订单统计共用
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('vip.price.1', '29', '月度会员价格（元）', 'VIP_PLAN')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('vip.price.2', '69', '季度会员价格（元）', 'VIP_PLAN')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('vip.price.3', '199', '年度会员价格（元）', 'VIP_PLAN')",

          // AI Quota Costs
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_reading', '2', 'AI阅读理解生成配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_writing_topic', '1', 'AI写作题目生成配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_writing_eval', '3', 'AI写作批改配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_listening', '2', 'AI听力生成配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_grammar', '1', 'AI语法生成配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_speaking_topic', '1', 'AI口语生成配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_speaking_eval', '3', 'AI口语评测配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_error_analysis', '2', 'AI错题深度分析配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_speaking_mock', '5', 'AI口语1V1模考配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_mock_exam', '4', 'AI模拟考试生成配额消耗', 'AI_QUOTA')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('quota_cost_ai_tutor', '1', 'AI助教单次提问配额消耗', 'AI_QUOTA')"
      };

      for (String sql : defaultConfigs) {
        jdbcTemplate.execute(sql);
      }

      // Force update important quota costs to ensure they are correct (in case they
      // were initialized as 1)
      String[] forceUpdateCosts = {
          "INSERT INTO system_config (config_key, config_value, description, category) VALUES ('quota_cost_writing_eval', '3', 'AI写作批改配额消耗', 'AI_QUOTA') ON DUPLICATE KEY UPDATE config_value='3'",
          "INSERT INTO system_config (config_key, config_value, description, category) VALUES ('quota_cost_speaking_eval', '3', 'AI口语评测配额消耗', 'AI_QUOTA') ON DUPLICATE KEY UPDATE config_value='3'",
          "INSERT INTO system_config (config_key, config_value, description, category) VALUES ('quota_cost_reading', '2', 'AI阅读理解生成配额消耗', 'AI_QUOTA') ON DUPLICATE KEY UPDATE config_value='2'",
          "INSERT INTO system_config (config_key, config_value, description, category) VALUES ('quota_cost_error_analysis', '2', 'AI错题深度分析配额消耗', 'AI_QUOTA') ON DUPLICATE KEY UPDATE config_value='2'",
          "INSERT INTO system_config (config_key, config_value, description, category) VALUES ('quota_cost_speaking_mock', '5', 'AI口语1V1模考配额消耗', 'AI_QUOTA') ON DUPLICATE KEY UPDATE config_value='5'"
      };

      for (String sql : forceUpdateCosts) {
        try {
          jdbcTemplate.execute(sql);
        } catch (Exception e) {
          log.warn("Failed to update quota cost config: {}", e.getMessage());
        }
      }

      // 11. Missing tables for Dashboard Stats
      String vipOrderTable = """
              CREATE TABLE IF NOT EXISTS `vip_order` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` BIGINT NOT NULL,
                  `vip_level` INT NOT NULL,
                  `amount` DECIMAL(10,2) NOT NULL,
                  `status` VARCHAR(20) NOT NULL COMMENT 'PENDING, PAID, CANCELLED',
                  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_status` (`status`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(vipOrderTable);
      // 易支付字段
      String[] vipOrderColumns = {
          "ALTER TABLE `vip_order` ADD COLUMN `out_trade_no` VARCHAR(64) NULL COMMENT '商户订单号' AFTER `status`",
          "ALTER TABLE `vip_order` ADD COLUMN `trade_no` VARCHAR(64) NULL COMMENT '易支付平台订单号' AFTER `out_trade_no`",
          "ALTER TABLE `vip_order` ADD COLUMN `pay_type` VARCHAR(20) NULL COMMENT 'alipay / wxpay' AFTER `trade_no`",
          "ALTER TABLE `vip_order` ADD COLUMN `pay_time` DATETIME NULL AFTER `pay_type`",
          "ALTER TABLE `vip_order` ADD UNIQUE INDEX `uk_out_trade_no` (`out_trade_no`)",
          "ALTER TABLE `vip_order` ADD COLUMN `order_type` VARCHAR(20) NULL COMMENT 'NEW / RENEW / UPGRADE' AFTER `pay_time`",
          "ALTER TABLE `vip_order` ADD COLUMN `credit_amount` DECIMAL(10,2) NULL COMMENT '升级抵扣金额' AFTER `order_type`"
      };
      for (String columnSql : vipOrderColumns) {
        try {
          jdbcTemplate.execute(columnSql);
        } catch (Exception e) {
          // 字段已存在，忽略
        }
      }

      String learningRecordTable = """
              CREATE TABLE IF NOT EXISTS `learning_record` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` BIGINT NOT NULL,
                  `content_type` VARCHAR(50) COMMENT 'vocabulary, reading, listening, grammar, writing, speaking',
                  `score` INT DEFAULT 0,
                  `answer` TEXT,
                  `correct_answer` TEXT,
                  `is_correct` TINYINT(1) DEFAULT 0,
                  `original_content` TEXT,
                  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_user_content` (`user_id`, `content_type`),
                  INDEX `idx_create_time` (`create_time`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(learningRecordTable);

      String securityLogTable = """
              CREATE TABLE IF NOT EXISTS `security_log` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` BIGINT NOT NULL,
                  `event` VARCHAR(100),
                  `ip` VARCHAR(50),
                  `status` VARCHAR(20),
                  `details` TEXT,
                  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_user_id` (`user_id`),
                  INDEX `idx_create_time` (`create_time`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(securityLogTable);

      String studyPlanTable = """
              CREATE TABLE IF NOT EXISTS `study_plan` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` BIGINT NOT NULL UNIQUE,
                  `exam_type` VARCHAR(20),
                  `target_score` INT,
                  `current_level` INT,
                  `duration_days` INT,
                  `start_date` DATE,
                  `end_date` DATE,
                  `status` TINYINT DEFAULT 1 COMMENT '0-Finished, 1-In Progress, 2-Abandoned',
                  `progress` INT DEFAULT 0,
                  `plan_detail` TEXT,
                  `deleted` TINYINT(1) DEFAULT 0,
                  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(studyPlanTable);

      // 12. Notification Tables
      String notificationTable = """
              CREATE TABLE IF NOT EXISTS `notification` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `title` VARCHAR(255) NOT NULL,
                  `content` TEXT NOT NULL,
                  `type` VARCHAR(50) NOT NULL COMMENT 'system, announcement, update, warning',
                  `priority` INT DEFAULT 0 COMMENT '0-普通, 1-重要, 2-紧急',
                  `target_type` VARCHAR(20) DEFAULT 'all' COMMENT 'all, vip, specific',
                  `target_user_ids` TEXT COMMENT '逗号分隔的用户ID',
                  `sender_id` BIGINT,
                  `sender_name` VARCHAR(100),
                  `is_published` TINYINT(1) DEFAULT 1 COMMENT '0-草稿, 1-已发布',
                  `expire_time` DATETIME,
                  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_type` (`type`),
                  INDEX `idx_create_time` (`create_time`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(notificationTable);

      String userNotificationTable = """
              CREATE TABLE IF NOT EXISTS `user_notification` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `user_id` BIGINT NOT NULL,
                  `notification_id` BIGINT NOT NULL,
                  `is_read` TINYINT(1) DEFAULT 0 COMMENT '0-未读, 1-已读',
                  `read_time` DATETIME,
                  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  INDEX `idx_user_read` (`user_id`, `is_read`),
                  INDEX `idx_notification` (`notification_id`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(userNotificationTable);

      // 13. Sensitive Word Table
      String sensitiveWordTable = """
              CREATE TABLE IF NOT EXISTS `sensitive_word` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `word` VARCHAR(100) NOT NULL UNIQUE,
                  `category` VARCHAR(50),
                  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(sensitiveWordTable);

      // 14. AI Feedback Audit Pool
      String aiFeedbackTable = """
              CREATE TABLE IF NOT EXISTS `ai_content_feedback` (
                  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
                  `log_id` BIGINT NOT NULL,
                  `user_id` BIGINT NOT NULL,
                  `rating` TINYINT NOT NULL,
                  `feedback_text` TEXT,
                  `original_content` LONGTEXT,
                  `corrected_content` LONGTEXT,
                  `status` TINYINT DEFAULT 0,
                  `admin_notes` TEXT,
                  `analysis_result` TEXT,
                  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX `idx_log_id` (`log_id`),
                  INDEX `idx_user_id` (`user_id`),
                  INDEX `idx_status` (`status`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(aiFeedbackTable);

      // Add analysis_result column if missing (Migration)
      try {
        jdbcTemplate.execute("ALTER TABLE `ai_content_feedback` ADD COLUMN `analysis_result` TEXT AFTER `admin_notes`");
      } catch (Exception e) {
        // Ignore if exists
      }

      // Default Sensitive Words
      String[] defaultSensitiveWords = {
          "暴力", "恐怖", "违禁", "非法", "政治", "色情", "毒品", "赌博", "炸药", "枪支",
          "反政府", "反党", "邪教", "自残", "自杀", "贩卖人口", "洗钱", "诈骗", "假钞", "窃听",
          "黑客", "木马", "病毒", "色狼", "淫秽", "猥亵", "赌注", "赌场", "白粉", "冰毒",
          "海洛因", "大麻", "翻墙", "梯子", "VPN", "弹药", "军火", "私服", "外挂"
      };
      for (String word : defaultSensitiveWords) {
        jdbcTemplate.update("INSERT IGNORE INTO `sensitive_word` (`word`, `category`) VALUES (?, 'DEFAULT')", word);
      }

      // Initialize SensitiveWordUtil
      java.util.List<String> words = jdbcTemplate.queryForList("SELECT `word` FROM `sensitive_word` ", String.class);
      com.learnsphere.utils.SensitiveWordUtil.init(words);
      log.info("✅ 已初始化敏感词库，共 {} 条词条", words.size());

      // Seed AI Feedback Data
      try {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ai_content_feedback", Integer.class);
        if (count != null && count == 0) {
          log.info("Creating seed data for AI Feedback...");

          // Ensure we have a user
          Long userId = 1L;
          try {
            userId = jdbcTemplate.queryForObject("SELECT id FROM user LIMIT 1", Long.class);
          } catch (Exception e) {
            // Create default user if not exists
            jdbcTemplate.update(
                "INSERT INTO user (username, password, nickname, role) VALUES ('student', '123456', 'Active Student', 'USER')");
            userId = jdbcTemplate.queryForObject("SELECT id FROM user WHERE username='student'", Long.class);
          }

          // Ensure we have generation logs
          String[] actionTypes = { "writing_eval", "grammar_check", "translation", "chat" };
          for (int i = 0; i < 5; i++) {
            String action = actionTypes[i % actionTypes.length];
            jdbcTemplate.update(
                """
                        INSERT INTO ai_generation_log
                        (user_id, action_type, model_name, prompt_preview, status, duration_ms, input_tokens, output_tokens, total_tokens, create_time)
                        VALUES (?, ?, 'qwen-turbo', ?, 'SUCCESS', ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
                    """,
                userId, action, "Sample prompt for " + action, 1500 + i * 100, 100, 200, 300, i);

            // Get the log ID
            Long logId = jdbcTemplate.queryForObject("SELECT id FROM ai_generation_log ORDER BY id DESC LIMIT 1",
                Long.class);

            // Insert feedback
            int rating = (i % 3 == 0) ? -1 : 1;
            String feedback = (rating == 1) ? "Thinking process is clear!" : "Incorrect grammar explanation.";
            jdbcTemplate.update("""
                    INSERT INTO ai_content_feedback
                    (log_id, user_id, rating, feedback_text, original_content, status, create_time)
                    VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
                """, logId, userId, rating, feedback, "AI Generated Content Sample " + i, 0, i);
          }
          log.info("✅ Seeded 5 AI feedback records");
        }
      } catch (Exception e) {
        log.warn("Failed to seed AI feedback data: {}", e.getMessage());
      }

      // 15. AI Tutor 相关表
      String aiTutorConversationSql = """
              CREATE TABLE IF NOT EXISTS `ai_tutor_conversation` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `user_id` BIGINT NOT NULL,
                `session_id` VARCHAR(64) NOT NULL,
                `role` VARCHAR(20) NOT NULL,
                `content` TEXT NOT NULL,
                `context_info` TEXT,
                `topic` VARCHAR(100),
                `resolved` TINYINT(1) DEFAULT 0,
                `feedback` VARCHAR(20),
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                `deleted` INT DEFAULT 0,
                INDEX `idx_user_id` (`user_id`),
                INDEX `idx_session_id` (`session_id`),
                INDEX `idx_topic` (`topic`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(aiTutorConversationSql);

      String userWeaknessSql = """
              CREATE TABLE IF NOT EXISTS `user_weakness` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `user_id` BIGINT NOT NULL,
                `topic` VARCHAR(100) NOT NULL,
                `category` VARCHAR(50) NOT NULL,
                `error_count` INT DEFAULT 0,
                `total_count` INT DEFAULT 0,
                `accuracy` DECIMAL(5,2) DEFAULT 0.00,
                `last_practice_time` DATETIME,
                `needs_review` TINYINT(1) DEFAULT 0,
                `review_priority` INT DEFAULT 0,
                `ai_suggestion` TEXT,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                `deleted` INT DEFAULT 0,
                UNIQUE KEY `uk_user_topic` (`user_id`, `topic`, `deleted`),
                INDEX `idx_category` (`category`),
                INDEX `idx_needs_review` (`needs_review`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(userWeaknessSql);

      String knowledgeGraphSql = """
              CREATE TABLE IF NOT EXISTS `knowledge_graph` (
                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                `topic` VARCHAR(100) NOT NULL,
                `category` VARCHAR(50) NOT NULL,
                `related_topics` TEXT,
                `prerequisite_topics` TEXT,
                `next_topics` TEXT,
                `difficulty_level` INT DEFAULT 1,
                `description` TEXT,
                `common_mistakes` TEXT,
                `recommended_resources` TEXT,
                `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                `deleted` INT DEFAULT 0,
                UNIQUE KEY `uk_topic` (`topic`, `deleted`),
                INDEX `idx_category` (`category`),
                INDEX `idx_difficulty` (`difficulty_level`)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          """;
      jdbcTemplate.execute(knowledgeGraphSql);

      // 插入初始知识图谱数据
      String[] initialKnowledgeGraph = {
          "INSERT IGNORE INTO `knowledge_graph` (`topic`, `category`, `related_topics`, `prerequisite_topics`, `next_topics`, `difficulty_level`, `description`, `common_mistakes`) VALUES ('时态', 'grammar', '[\"现在完成时\", \"过去完成时\", \"将来完成时\", \"现在进行时\"]', '[\"基础语法\", \"动词\"]', '[\"虚拟语气\", \"被动语态\"]', 3, '英语时态是表示动作发生时间和状态的语法形式', '[\"混淆现在完成时和过去时\", \"忘记第三人称单数\"]')",
          "INSERT IGNORE INTO `knowledge_graph` (`topic`, `category`, `related_topics`, `prerequisite_topics`, `next_topics`, `difficulty_level`, `description`, `common_mistakes`) VALUES ('现在完成时', 'grammar', '[\"过去完成时\", \"时态\", \"for/since用法\"]', '[\"时态\", \"过去分词\"]', '[\"现在完成进行时\"]', 3, '表示过去发生的动作对现在造成的影响', '[\"与过去时混淆\", \"for和since用法错误\"]')",
          "INSERT IGNORE INTO `knowledge_graph` (`topic`, `category`, `related_topics`, `prerequisite_topics`, `next_topics`, `difficulty_level`, `description`, `common_mistakes`) VALUES ('虚拟语气', 'grammar', '[\"条件句\", \"时态\"]', '[\"时态\", \"助动词\"]', '[\"混合虚拟语气\"]', 4, '表示假设、愿望、建议等非真实情况', '[\"if条件句时态错误\", \"wish后时态使用不当\"]')",
          "INSERT IGNORE INTO `knowledge_graph` (`topic`, `category`, `related_topics`, `prerequisite_topics`, `next_topics`, `difficulty_level`, `description`, `common_mistakes`) VALUES ('定语从句', 'grammar', '[\"关系代词\", \"关系副词\", \"非限制性定语从句\"]', '[\"从句基础\", \"先行词\"]', '[\"名词性从句\"]', 4, '修饰名词或代词的从句', '[\"which和that混淆\", \"介词+关系代词\"]')",
          "INSERT IGNORE INTO `knowledge_graph` (`topic`, `category`, `related_topics`, `prerequisite_topics`, `next_topics`, `difficulty_level`, `description`, `common_mistakes`) VALUES ('被动语态', 'grammar', '[\"时态\", \"助动词\"]', '[\"时态\", \"过去分词\"]', '[\"被动语态的特殊用法\"]', 3, '表示主语是动作的承受者', '[\"时态与被动语态结合错误\", \"by的使用\"]')"
      };
      for (String sql : initialKnowledgeGraph) {
        jdbcTemplate.execute(sql);
      }

      log.info("✅ All Learning AI database tables initialized/verified successfully");

    } catch (Exception e) {
      log.error("❌ Failed to initialize database tables", e);
      throw new IllegalStateException("Database initialization failed; verify the MySQL connection and CREATE privileges", e);
    }
  }
}
