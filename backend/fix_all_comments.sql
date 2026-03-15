-- 设置数据库字符集
ALTER DATABASE `chen` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 1. 表注?(Table Comments)
ALTER TABLE `achievement` COMMENT='成就定义?;
ALTER TABLE `admin` COMMENT='管理员表';
ALTER TABLE `admin_log` COMMENT='管理员操作日志表';
ALTER TABLE `ai_content_feedback` COMMENT='AI内反?;
ALTER TABLE `ai_experiment` COMMENT='AI A/B 实验管理?;
ALTER TABLE `ai_generation_log` COMMENT='AI调用日志?;
ALTER TABLE `ai_tutor_conversation` COMMENT='AI助教对话记录?;
ALTER TABLE `daily_learning_stats` COMMENT='每日学习统?;
ALTER TABLE `daily_task` COMMENT='每日任务?;
ALTER TABLE `exam_record` COMMENT='考试记录?;
ALTER TABLE `grammar_exercise` COMMENT='诳练习?;
ALTER TABLE `knowledge_graph` COMMENT='知识图谱?;
ALTER TABLE `learning_record` COMMENT='学习记录?;
ALTER TABLE `listening_material` COMMENT='吊材料?;
ALTER TABLE `mock_exam` COMMENT='模拟考试?;
ALTER TABLE `notification` COMMENT='系统通知?;
ALTER TABLE `reading_article` COMMENT='阅文章?;
ALTER TABLE `security_log` COMMENT='用户安全日志?;
ALTER TABLE `sensitive_log` COMMENT='敏感内审日志?;
ALTER TABLE `sensitive_word` COMMENT='敏感词表';
ALTER TABLE `speaking_topic` COMMENT='口题目?;
ALTER TABLE `study_plan` COMMENT='学习计划?;
ALTER TABLE `sys_error_log` COMMENT='系统前错日志?;
ALTER TABLE `sys_prompt_history` COMMENT='提示词历史表';
ALTER TABLE `system_config` COMMENT='系统配置?;
ALTER TABLE `system_prompt` COMMENT='系统提示词表';
ALTER TABLE `user` COMMENT='用户?;
ALTER TABLE `user_achievement` COMMENT='用户成就进度?;
ALTER TABLE `user_analysis` COMMENT='用户学习分析?;
ALTER TABLE `user_log` COMMENT='用户操作日志?;
ALTER TABLE `user_notification` COMMENT='用户通知关联?;
ALTER TABLE `user_weakness` COMMENT='用户薄弱知识点表';
ALTER TABLE `vip_order` COMMENT='会员订单?;
ALTER TABLE `vocabulary` COMMENT='词汇?;
ALTER TABLE `vocabulary_backup_primary_high_20260224` COMMENT='词汇表份_小高中_20260224';
ALTER TABLE `vocabulary_dedup_backup_20260225` COMMENT='词汇去重备份_20260225';
ALTER TABLE `vocabulary_mastery` COMMENT='词汇掌握度表';
ALTER TABLE `writing_topic` COMMENT='写作题目?;

-- 2. 列注?(Column Comments)

-- admin_log 
ALTER TABLE `admin_log` MODIFY COLUMN `admin_id` BIGINT COMMENT '管理员ID';
ALTER TABLE `admin_log` MODIFY COLUMN `admin_username` VARCHAR(50) COMMENT '管理员用户名';
ALTER TABLE `admin_log` MODIFY COLUMN `module` VARCHAR(50) COMMENT '操作模块';
ALTER TABLE `admin_log` MODIFY COLUMN `action` VARCHAR(50) COMMENT '具体动作';
ALTER TABLE `admin_log` MODIFY COLUMN `details` TEXT COMMENT '操作详情';
ALTER TABLE `admin_log` MODIFY COLUMN `ip` VARCHAR(50) COMMENT '操作IP地址';
ALTER TABLE `admin_log` MODIFY COLUMN `status` TINYINT COMMENT '操作状? 1-成功, 0-失败';
ALTER TABLE `admin_log` MODIFY COLUMN `error_msg` TEXT COMMENT '错信息';

-- ai_experiment 
ALTER TABLE `ai_experiment` MODIFY COLUMN `name` VARCHAR(100) COMMENT '实验名称';
ALTER TABLE `ai_experiment` MODIFY COLUMN `action_type` VARCHAR(50) COMMENT '盠动作';
ALTER TABLE `ai_experiment` MODIFY COLUMN `variant_name` VARCHAR(50) COMMENT '实验组名?;
ALTER TABLE `ai_experiment` MODIFY COLUMN `system_prompt_b` TEXT COMMENT '实验组提示词';
ALTER TABLE `ai_experiment` MODIFY COLUMN `traffic_ratio` INT COMMENT '流量配比(0-100)';
ALTER TABLE `ai_experiment` MODIFY COLUMN `status` VARCHAR(20) COMMENT '实验状? RUNNING/STOPPED';

-- ai_generation_log 
ALTER TABLE `ai_generation_log` MODIFY COLUMN `experiment_id` BIGINT COMMENT '实验ID';
ALTER TABLE `ai_generation_log` MODIFY COLUMN `variant` VARCHAR(50) COMMENT '实验组别';

-- learning_record 
ALTER TABLE `learning_record` MODIFY COLUMN `user_id` BIGINT COMMENT '用户ID';
ALTER TABLE `learning_record` MODIFY COLUMN `content_id` BIGINT COMMENT '内ID';
ALTER TABLE `learning_record` MODIFY COLUMN `content_type` VARCHAR(50) COMMENT '内类型: vocabulary/grammar/reading/listening';
ALTER TABLE `learning_record` MODIFY COLUMN `is_correct` TINYINT COMMENT '昐正确: 0-错, 1-正确';
ALTER TABLE `learning_record` MODIFY COLUMN `time_spent` INT COMMENT '耗时(?';
ALTER TABLE `learning_record` MODIFY COLUMN `score` INT COMMENT '得分';
ALTER TABLE `learning_record` MODIFY COLUMN `answer` TEXT COMMENT '用户答';
ALTER TABLE `learning_record` MODIFY COLUMN `correct_answer` TEXT COMMENT '正确答';
ALTER TABLE `learning_record` MODIFY COLUMN `mastery_level` INT COMMENT '掌握程度(0-5)';
ALTER TABLE `learning_record` MODIFY COLUMN `review_count` INT COMMENT '复习次数';
ALTER TABLE `learning_record` MODIFY COLUMN `last_review_time` DATETIME COMMENT '后习时?;
ALTER TABLE `learning_record` MODIFY COLUMN `next_review_time` DATETIME COMMENT '下复习时间';

-- sys_error_log 
ALTER TABLE `sys_error_log` MODIFY COLUMN `username` VARCHAR(50) COMMENT '用户?;
ALTER TABLE `sys_error_log` MODIFY COLUMN `type` VARCHAR(20) COMMENT '错类型: vue/js/promise';
ALTER TABLE `sys_error_log` MODIFY COLUMN `message` TEXT COMMENT '错信息';
ALTER TABLE `sys_error_log` MODIFY COLUMN `stack` TEXT COMMENT '堆栈信息';
ALTER TABLE `sys_error_log` MODIFY COLUMN `url` VARCHAR(255) COMMENT '页面URL';
ALTER TABLE `sys_error_log` MODIFY COLUMN `component` VARCHAR(100) COMMENT 'Vue组件?;
ALTER TABLE `sys_error_log` MODIFY COLUMN `user_agent` TEXT COMMENT '浏器代?;

-- user 
ALTER TABLE `user` MODIFY COLUMN `username` VARCHAR(50) COMMENT '用户?;
ALTER TABLE `user` MODIFY COLUMN `password` VARCHAR(255) COMMENT '密码';
ALTER TABLE `user` MODIFY COLUMN `email` VARCHAR(100) COMMENT '';
ALTER TABLE `user` MODIFY COLUMN `nickname` VARCHAR(100) COMMENT '昵称';
ALTER TABLE `user` MODIFY COLUMN `phone` VARCHAR(20) COMMENT '手机?;
ALTER TABLE `user` MODIFY COLUMN `exam_type` VARCHAR(50) COMMENT '考试类型';
ALTER TABLE `user` MODIFY COLUMN `target_score` INT COMMENT '盠分数';
ALTER TABLE `user` MODIFY COLUMN `current_level` VARCHAR(50) COMMENT '当前水平';
ALTER TABLE `user` MODIFY COLUMN `vip_expire_time` DATETIME COMMENT 'VIP过期时间';
ALTER TABLE `user` MODIFY COLUMN `vip_level` INT COMMENT 'VIP等级';
ALTER TABLE `user` MODIFY COLUMN `daily_ai_quota` INT COMMENT '每日AI配';
ALTER TABLE `user` MODIFY COLUMN `status` TINYINT COMMENT '状?;
ALTER TABLE `user` MODIFY COLUMN `deleted` TINYINT COMMENT '逻辑删除';

-- user_log 
ALTER TABLE `user_log` MODIFY COLUMN `module` VARCHAR(50) COMMENT '操作模块';
ALTER TABLE `user_log` MODIFY COLUMN `action` VARCHAR(100) COMMENT '操作类型';
ALTER TABLE `user_log` MODIFY COLUMN `details` TEXT COMMENT '操作详情';
ALTER TABLE `user_log` MODIFY COLUMN `ip` VARCHAR(50) COMMENT 'IP地址';
ALTER TABLE `user_log` MODIFY COLUMN `browser` VARCHAR(100) COMMENT '浏?;
ALTER TABLE `user_log` MODIFY COLUMN `os` VARCHAR(100) COMMENT '操作系统';
ALTER TABLE `user_log` MODIFY COLUMN `status` TINYINT COMMENT '操作状?;

-- vocabulary 
ALTER TABLE `vocabulary` MODIFY COLUMN `word` VARCHAR(100) COMMENT '单词';
ALTER TABLE `vocabulary` MODIFY COLUMN `phonetic` VARCHAR(100) COMMENT '音标';
ALTER TABLE `vocabulary` MODIFY COLUMN `translation` TEXT COMMENT '世翻译';
ALTER TABLE `vocabulary` MODIFY COLUMN `example` TEXT COMMENT '例句';
ALTER TABLE `vocabulary` MODIFY COLUMN `example_translation` TEXT COMMENT '例句翻译';
ALTER TABLE `vocabulary` MODIFY COLUMN `exam_type` VARCHAR(50) COMMENT '考试类型';
ALTER TABLE `vocabulary` MODIFY COLUMN `difficulty` INT COMMENT '难度等级';
ALTER TABLE `vocabulary` MODIFY COLUMN `tags` VARCHAR(255) COMMENT '标';

