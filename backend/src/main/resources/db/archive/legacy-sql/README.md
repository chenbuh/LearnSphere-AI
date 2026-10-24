# 历史 SQL 脚本归档

本目录存放**已不再被任何代码或脚本引用**的历史 SQL 脚本，仅作追溯用途。

## 为什么保留而不是删除

这些脚本记录了项目演进过程中的结构变更意图。虽然当前已由
`db/bootstrap/schema.sql` + `DatabaseInitializer` + Flyway 三者覆盖，
但排查历史问题（"某个字段是哪次变更加的？"）时仍有参考价值。

**重要：本目录下的脚本不会被执行。** Flyway 只扫描
`classpath:db/migration`，`spring.sql.init` 只执行
`classpath:db/bootstrap/schema.sql`。

## 归档来源与对应关系

### 来自 `resources/sql/`（14 个）

| 文件 | 原用途 |
|---|---|
| `add_admin_log_table.sql` | 管理后台操作日志表 |
| `add_checkin_fields.sql` | 签到相关字段 |
| `add_sensitive_word_table.sql` | 敏感词表 |
| `add_vip_fields.sql` | VIP 相关字段 |
| `ai_tutor_enhancement.sql` | AI 导师增强结构 |
| `create_mastery_tables.sql` | 掌握度相关表 |
| `create_notification_system.sql` | 通知系统表 |
| `fix_missing_admin_tables.sql` | 补建缺失的管理后台表 |
| `fix_user_points.sql` | 修正用户积分字段 |
| `init-from-sql-dir.sql` | 早期初始化脚本（注意：与 resources 根下的 init.sql 内容不同） |
| `migration_ab_experiment.sql` | A/B 实验表 |
| `study_plan_system.sql` | 学习计划系统表 |
| `update_ai_log_details.sql` | AI 日志明细字段 |
| `vocabulary_mastery_system.sql` | 词汇掌握度系统 |

### 来自 `resources/` 根目录（2 个）

| 文件 | 原用途 | 说明 |
|---|---|---|
| `init-from-resources-root.sql` | 早期初始化脚本 | 与 sql 目录下的 init.sql 内容不同，故分别保留 |
| `admin-init.sql` | 管理员账号初始化 | 仅被 `AdminAuthController` 的注释提及，未被程序执行 |

### 来自 `db/migration/`（2 个，`.archived` 后缀）

| 文件 | 归档原因 |
|---|---|
| `V1.3__add_user_id_to_ai_content.sql.archived` | **非幂等**：直接 `ADD COLUMN`，字段已存在即报错；且从未被任何机制执行过。其意图已由 `V2__add_user_id_to_ai_content.sql` 以幂等方式重新实现 |
| `add_user_id_safe.sql.archived` | 上述脚本的幂等改写版，但同样从未被引用。V2 已覆盖其全部功能 |

## 关于 `resources/schema.sql`

`resources` 根下仍保留 `schema.sql`，它**未被归档**，因为它可能仍被某些
外部流程引用。但请注意：

- 应用实际使用的是 `db/bootstrap/schema.sql`（由 `spring.sql.init.schema-locations` 指定）
- 根下的 `schema.sql` 是早期版本，表结构与当前不一致，**不应再用于初始化**

若确认无外部依赖，建议后续删除。
