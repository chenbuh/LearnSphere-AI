# 根目录历史 SQL 脚本归档

本目录存放原先散落在**项目根目录**的 SQL 脚本，现已不再被任何代码或脚本引用。

## 为什么归档

任务 4（数据库变更改为正式迁移机制）要求「将根目录零散的 SQL 脚本统一收口」。
这些脚本的问题在于：

1. **没有执行入口** —— 没有任何代码、构建脚本或部署脚本引用它们，
   实际执行完全依赖人工记得去跑，多环境状态因此容易不一致
2. **与代码逻辑重复** —— 其中多个脚本的结构变更已由 `DatabaseInitializer`
   的幂等 ALTER 覆盖（脚本注释里也写明了"后端启动时会…"）
3. **非幂等** —— 多数直接 `ADD COLUMN` / `CREATE TABLE`（无 `IF NOT EXISTS`），
   重复执行会报错

## 文件清单

| 文件 | 原用途 | 现状 |
|---|---|---|
| `migration_ai_governance.sql` | AI 治理表（`system_prompt` 等） | 已由 `db/bootstrap/schema.sql` 覆盖 |
| `migration_ai_governance_v2.sql` | AI 治理结构扩展 | 同上 |
| `migration_ai_feedback_pool.sql` | AI 内容反馈审核池 | 同上 |
| `migration_add_user_id.sql` | 补 `user_id` 字段 | 已由 Flyway `V2__add_user_id_to_ai_content.sql` 以幂等方式实现 |
| `migration_add_token_stats.sql` | AI 日志 token 统计字段 | 已由 `DatabaseInitializer` 覆盖 |
| `migration_add_quota_configs.sql` | AI 配额消耗配置 | 已由 `DatabaseInitializer` 覆盖 |
| `migration_epay_2026_10.sql` | 易支付订单字段 | 已由 `DatabaseInitializer` 覆盖（脚本注释自述） |
| `migration_vip_pricing_2026_10.sql` | VIP 定价与额度 | 已由 `DatabaseInitializer` 覆盖（脚本注释自述） |
| `seed_prompts.sql` | 默认提示词数据 | 已由 `DatabaseInitializer` 的 `system_prompt` 初始化覆盖 |

## 后续新增变更请走 Flyway

新的数据库变更**不要**再放到这里，也不要放回根目录。正确做法：

1. 在 `backend/src/main/resources/db/migration/` 新建 `V{n}__{描述}.sql`
2. 版本号递增，不可跳号或复用
3. 必须幂等（用 `INFORMATION_SCHEMA` 判断后再执行）
4. 提交前在真实库副本上验证（见 `FlywayProductionCopyIntegrationTest`）

详见 [docs/数据库脚本/数据库初始化与迁移约定.md](../../../docs/数据库脚本/数据库初始化与迁移约定.md)。
