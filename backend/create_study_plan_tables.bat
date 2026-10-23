@echo off
REM 数据库口令只从环境变量读取，不提供任何默认值。
REM 使用前请先设置： set DB_PASS=你的口令
if "%DB_PASS%"=="" (
  echo 缺少 DB_PASS 环境变量，请先设置数据库口令后再运行本脚本。
  exit /b 1
)

mysql -u root -p%DB_PASS% learnsphere_ai -e "CREATE TABLE IF NOT EXISTS study_plan (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, exam_type VARCHAR(20), target_score INT, current_level INT, duration_days INT, start_date DATE, end_date DATE, status TINYINT DEFAULT 1, plan_detail JSON, progress INT DEFAULT 0, deleted TINYINT DEFAULT 0, create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, KEY idx_user_status (user_id, status)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"

mysql -u root -p%DB_PASS% learnsphere_ai -e "CREATE TABLE IF NOT EXISTS daily_task (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id BIGINT NOT NULL, plan_id BIGINT, task_date DATE, task_type VARCHAR(20), task_name VARCHAR(100), target_count INT, completed_count INT DEFAULT 0, is_completed BOOLEAN DEFAULT FALSE, complete_time DATETIME, create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY uk_user_date_type (user_id, task_date, task_type), KEY idx_plan (plan_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"

echo Done! Study plan tables created successfully.
pause
