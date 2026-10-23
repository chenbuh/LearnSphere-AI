@echo off
REM 数据库口令只从环境变量读取，不提供任何默认值。
REM 使用前请先设置： set DB_PASS=你的口令
if "%DB_PASS%"=="" (
  echo 缺少 DB_PASS 环境变量，请先设置数据库口令后再运行本脚本。
  exit /b 1
)

mysql -u root -p%DB_PASS% learnsphere_ai -e "CREATE TABLE IF NOT EXISTS vocabulary_mastery (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, vocabulary_id BIGINT NOT NULL, mastery_level TINYINT DEFAULT 0, review_count INT DEFAULT 0, correct_count INT DEFAULT 0, wrong_count INT DEFAULT 0, last_review_time DATETIME, next_review_time DATETIME, is_favorite BOOLEAN DEFAULT FALSE, first_learned_time DATETIME, notes TEXT, deleted TINYINT DEFAULT 0, create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY uk_user_vocab (user_id, vocabulary_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"

mysql -u root -p%DB_PASS% learnsphere_ai -e "CREATE TABLE IF NOT EXISTS daily_learning_stats (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, stat_date DATE NOT NULL, vocabulary_count INT DEFAULT 0, grammar_count INT DEFAULT 0, reading_count INT DEFAULT 0, listening_count INT DEFAULT 0, writing_count INT DEFAULT 0, speaking_count INT DEFAULT 0, total_time_minutes INT DEFAULT 0, total_questions INT DEFAULT 0, correct_questions INT DEFAULT 0, create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY uk_user_date (user_id, stat_date)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"

echo Done! Tables created successfully.
pause
