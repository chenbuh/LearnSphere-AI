package com.learnsphere.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 数据库初始化
 */
@Slf4j
@Component
public class DatabaseInitializer implements CommandLineRunner {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Override
  public void run(String... args) {
    try {
      // 1. 创建 writing_topic 表
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
        }
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

      log.info("✅ All Learning AI database tables initialized/verified successfully");

    } catch (Exception e) {
      log.error("❌ Failed to initialize database tables", e);
    }
  }
}
