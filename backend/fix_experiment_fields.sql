-- Add missing fields for A/B experiment tracking
USE learnsphere_ai;

-- Check if columns exist before adding
SET @dbname = DATABASE();
SET @tablename = 'ai_generation_log';
SET @columnname = 'experiment_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN experiment_id BIGINT DEFAULT NULL COMMENT ''实验ID'' AFTER response_content')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add variant column
SET @columnname = 'variant';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN variant VARCHAR(20) DEFAULT NULL COMMENT ''实验分支'' AFTER experiment_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index if not exists
SET @index_exists = (SELECT COUNT(1) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE table_schema = @dbname 
    AND table_name = @tablename 
    AND index_name = 'idx_experiment');

SET @preparedStatement = (SELECT IF(
    @index_exists > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX idx_experiment (experiment_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SELECT 'Migration completed successfully!' AS status;
