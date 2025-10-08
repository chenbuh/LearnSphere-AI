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
      // 0. 确保 user 表有 last_login_time 字段（用于留存率统计）
      try {
        jdbcTemplate.execute("ALTER TABLE `user` ADD COLUMN `last_login_time` DATETIME NULL AFTER `points`");
        log.info("已为 user 表添加 last_login_time 字段");
      } catch (Exception e) {
        // 字段已存在，忽略
      }

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
      }
      try {
        jdbcTemplate.execute("ALTER TABLE `achievement` DROP INDEX `uk_code` ");
        jdbcTemplate.execute("ALTER TABLE `achievement` ADD UNIQUE KEY `uk_code_level` (`code`, `level`) ");
      } catch (Exception e) {
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
      String[] defaultPrompts = {
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('READING_GEN_SYSTEM', '阅读理解生成-系统提示词', '你是一个专业的英语阅读理解出题专家。你必须严格遵守用户的字数要求，绝对不能偷懒写短文。如果文章长度不足，任务将失败。')",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('READING_GEN_USER', '阅读理解生成-用户提示词', '请生成一篇%s难度的英语阅读理解，主题：%s。\\n【重要】文章长度要求：%s词左右。请务必写够字数，内容要丰富充实！\\n要求：\\n1. 文章要地道、有趣、贴近生活，段落结构清晰。\\n2. 包含5道选择题，每题4个选项。\\n3. 必须返回标准的JSON格式，不要包含任何Markdown格式，直接返回JSON字符串。\\nJSON结构：{\"title\":\"文章标题\", \"passage\":\"这里放完整的长篇文章内容\", \"questions\":[{\"text\":\"问题\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"correct\":0, \"explanation\":\"解析\"}]}');",
          // Writing
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('WRITING_GEN_SYSTEM', '写作题目生成-系统提示词', '你是一个专业的英语写作出题专家。')",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('WRITING_GEN_USER', '写作题目生成-用户提示词', '请为%s考试生成一道%s类型的写作题目。\\n返回JSON：{\"topic\":\"题目\", \"requirements\":\"要求\", \"wordLimit\":\"字数限制\", \"timeLimit\":30}\\n');",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('WRITING_EVAL_SYSTEM', '写作评估-系统提示词', '你是一个专业的英语写作评分老师，擅长从内容、语法、词汇、结构等方面给出详细的评价和建议。')",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('WRITING_EVAL_USER', '写作评估-用户提示词', '请评估以下作文（题目：%s）：\\n\\n%s\\n\\n返回JSON：{\"score\":85, \"strengths\":[\"优点1\",\"优点2\"], \"weaknesses\":[\"不足1\",\"不足2\"], \"suggestions\":[\"建议1\",\"建议2\"], \"detailedFeedback\":\"详细反馈\"}\\n');",
          // Listening
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('LISTENING_GEN_SYSTEM', '听力生成-系统提示词', '你是一个专业的英语听力出题专家。')",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('LISTENING_GEN_USER', '听力生成-用户提示词', '请生成%d段%s难度的英语听力对话/短文，每段包含对话内容(audioScript)和5道选择题。\\n返回JSON：{\"passages\":[{\"audioScript\":\"对话内容\", \"questions\":[{\"text\":\"问题\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"correct\":0, \"explanation\":\"解析\"}]}]}\\n');",
          // Grammar
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('GRAMMAR_GEN_SYSTEM', '语法练习生成-系统提示词', '你是一个专业的英语语法出题专家。')",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('GRAMMAR_GEN_USER', '语法练习生成-用户提示词', '请针对\"%s\"这个语法点生成10道%s难度的选择题。\\n返回JSON：{\"topic\":\"%s\", \"questions\":[{\"text\":\"题目\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"correct\":0, \"explanation\":\"解析\"}]}\\n');",
          // Speaking
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('SPEAKING_GEN_SYSTEM', '口语题目生成-系统提示词', '你是一个专业的英语口语出题专家。')",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('SPEAKING_GEN_USER', '口语题目生成-用户提示词', '请生成一道%s类型、%s难度的口语练习题目。\\n返回JSON：{\"topic\":\"题目\", \"description\":\"描述\", \"hints\":[\"提示1\",\"提示2\"], \"timeLimit\":120}\\n');",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('SPEAKING_EVAL_SYSTEM', '口语评估-系统提示词', '你是一个专业的英语口语评分老师。')",
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('SPEAKING_EVAL_USER', '口语评估-用户提示词', '请评估以下口语回答（题目：%s）：\\n\\n%s\\n\\n返回JSON：{\"score\":80, \"pronunciation\":85, \"fluency\":75, \"grammar\":80, \"vocabulary\":85, \"feedback\":\"详细反馈\"}\\n');",
          // Analysis
          "INSERT IGNORE INTO `system_prompt` (`prompt_key`, `description`, `content`) VALUES ('ANALYSIS_GEN_SYSTEM', '学习分析生成-系统提示词', '你是一位经验丰富的英语学习导师，擅长根据学生数据给出个性化、温暖且有深度的学习建议。')"
      };

      for (String sql : defaultPrompts) {
        jdbcTemplate.execute(sql);
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
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.limit.daily.0', '5', '普通用户每日 AI 限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.limit.daily.1', '50', '月度会员每日 AI 限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.limit.daily.2', '100', '季度会员每日 AI 限额', 'AI_LIMIT')",
          "INSERT IGNORE INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES ('ai.limit.daily.3', '200', '年度会员每日 AI 限额', 'AI_LIMIT')"
      };

      for (String sql : defaultConfigs) {
        jdbcTemplate.execute(sql);
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

      log.info("✅ All Learning AI database tables initialized/verified successfully");

    } catch (Exception e) {
      log.error("❌ Failed to initialize database tables", e);
    }
  }
}
