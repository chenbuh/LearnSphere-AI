# AI Tutor 对话历史自动清理功能

## 📋 功能概述

为了防止数据库膨胀和优化系统性能，系统提供了自动清理过期对话历史的功能。

### 核心特性
- ✅ **自动清理** - 定时任务自动清理过期数据
- ✅ **软删除机制** - 先逻辑删除，后物理删除
- ✅ **灵活配置** - 可自定义保留天数和执行时间
- ✅ **手动触发** - 管理员可手动执行清理
- ✅ **统计监控** - 实时查看待清理数据量

---

## ⚙️ 配置说明

### application.yml 配置项

```yaml
# AI Tutor 配置
ai:
  tutor:
    # 对话历史保留天数（默认30天）
    history:
      retention-days: 30
      # 是否启用自动清理（默认true）
      auto-cleanup: true
    
    # 清理任务 Cron 表达式配置
    cleanup:
      # 逻辑删除过期记录：每天凌晨2点执行
      cron: "0 0 2 * * ?"
    
    purge:
      # 物理删除已标记删除的记录：每周日凌晨3点执行
      cron: "0 0 3 ? * SUN"
```

### 配置项说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `retention-days` | 30 | 对话历史保留天数 |
| `auto-cleanup` | true | 是否启用自动清理 |
| `cleanup.cron` | `0 0 2 * * ?` | 逻辑删除的执行时间 |
| `purge.cron` | `0 0 3 ? * SUN` | 物理删除的执行时间 |

### Cron 表达式说明

```
秒 分 时 日 月 周

0 0 2 * * ?     → 每天凌晨2点执行
0 0 3 ? * SUN   → 每周日凌晨3点执行
0 0 1 1 * ?     → 每月1号凌晨1点执行
```

---

## 🔄 清理流程

### 两阶段删除机制

```
第一阶段：逻辑删除（软删除）
   ↓
创建时间 > 保留天数的记录
   ↓
标记 deleted = 1
   ↓
数据仍保留在数据库中（可恢复）
   ↓
第二阶段：物理删除（每周执行）
   ↓
已逻辑删除 > 7天的记录
   ↓
从数据库中永久删除
   ↓
释放存储空间
```

### 为什么使用两阶段删除？

1. **安全性** - 防止误删除，有恢复窗口
2. **性能优化** - 逻辑删除速度快，不影响系统
3. **合规性** - 符合数据保留政策要求
4. **可审计** - 保留操作记录

---

## 📊 管理员 API

### 1. 获取清理统计

**接口**: `GET /api/admin/ai-tutor/cleanup/stats`

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "expiredCount": 1250,
    "message": "有 1250 条过期对话记录待清理"
  }
}
```

**使用场景**: 管理员查看有多少条记录即将被清理

---

### 2. 手动触发清理

**接口**: `POST /api/admin/ai-tutor/cleanup/trigger`

**参数**:
- `daysToKeep` (可选): 保留天数，默认30天

**请求示例**:
```bash
# 使用默认保留天数(30天)
curl -X POST http://localhost:8080/api/admin/ai-tutor/cleanup/trigger

# 自定义保留天数(15天)
curl -X POST "http://localhost:8080/api/admin/ai-tutor/cleanup/trigger?daysToKeep=15"
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "deletedCount": 1250,
    "daysToKeep": 30,
    "message": "成功清理 1250 条对话记录"
  }
}
```

**使用场景**: 
- 数据库空间紧张时立即清理
- 重大版本更新前清理旧数据
- 定期维护时手动执行

---

## 📝 日志示例

### 自动清理日志

```
2026-01-22 02:00:00 [scheduling-1] INFO  AITutorCleanupTask - 开始清理过期的 AI Tutor 对话历史，保留天数: 30
2026-01-22 02:00:00 [scheduling-1] INFO  AITutorCleanupTask - 清理截止日期: 2025-12-23T02:00:00
2026-01-22 02:00:01 [scheduling-1] INFO  AITutorCleanupTask - AI Tutor 对话历史清理完成，共清理 1250 条记录
2026-01-22 02:00:01 [scheduling-1] INFO  AITutorCleanupTask - ===== AI Tutor 清理统计 =====
2026-01-22 02:00:01 [scheduling-1] INFO  AITutorCleanupTask - 清理截止日期: 2025-12-23T02:00:00
2026-01-22 02:00:01 [scheduling-1] INFO  AITutorCleanupTask - 本次清理记录数: 1250
2026-01-22 02:00:01 [scheduling-1] INFO  AITutorCleanupTask - 剩余有效记录数: 3500
2026-01-22 02:00:01 [scheduling-1] INFO  AITutorCleanupTask - 保留天数设置: 30 天
2026-01-22 02:00:01 [scheduling-1] INFO  AITutorCleanupTask - ============================
```

### 物理删除日志

```
2026-01-26 03:00:00 [scheduling-1] INFO  AITutorCleanupTask - 开始物理删除已标记删除的 AI Tutor 对话记录
2026-01-26 03:00:01 [scheduling-1] INFO  AITutorCleanupTask - AI Tutor 对话记录物理删除完成，共删除 1250 条记录
```

---

## 📈 使用场景

### 场景 1: 常规自动清理

```yaml
# 默认配置
retention-days: 30
auto-cleanup: true
cleanup.cron: "0 0 2 * * ?"
```

**效果**: 
- 每天凌晨2点自动清理30天前的对话
- 每周日凌晨3点永久删除已标记删除的记录

---

### 场景 2: 严格数据保留（7天）

```yaml
# 短期保留配置
retention-days: 7
auto-cleanup: true
cleanup.cron: "0 0 3 * * ?"  # 凌晨3点执行
```

**适用于**:
- 数据库空间有限
- 不需要长期保留对话历史
- 频繁使用的系统

---

### 场景 3: 长期保留（90天）

```yaml
# 长期保留配置
retention-days: 90
auto-cleanup: true
cleanup.cron: "0 0 1 * * ?"  # 凌晨1点执行
```

**适用于**:
- 需要数据分析和审计
- 充足的存储空间
- 合规性要求

---

### 场景 4: 仅手动清理

```yaml
# 禁用自动清理
auto-cleanup: false
```

**适用于**:
- 开发环境
- 测试环境
- 需要完全控制数据清理时机

**操作**: 管理员通过 API 手动触发清理

---

## 🛠️ 运维建议

### 1. 监控清理日志

定期检查日志，确保清理任务正常执行:

```bash
# 查看最近的清理日志
tail -f logs/learnsphere-ai.log | grep "AITutorCleanupTask"
```

### 2. 调整清理时间

根据系统使用情况调整清理时间:

```yaml
# 避开业务高峰期
cleanup.cron: "0 30 3 * * ?"  # 凌晨3:30
```

### 3. 数据备份

在物理删除前备份数据库:

```bash
# 每周六晚备份数据库
0 0 23 ? * SAT
mysqldump learnsphere_ai ai_tutor_conversation > backup.sql
```

### 4. 性能优化

对于大量数据，可以:

1. **批量删除**: 分批删除大量记录
2. **索引优化**: 在 `create_time` 和 `deleted` 字段上建立索引
3. **归档策略**: 将旧数据导出到归档表

---

## 🔍 故障排查

### 问题 1: 清理任务未执行

**检查步骤**:
1. 确认 `auto-cleanup: true`
2. 检查 Cron 表达式是否正确
3. 查看日志是否有错误信息
4. 确认 `@EnableScheduling` 注解已添加

**解决方案**:
```java
// 确保 ScheduleConfig.java 中有此注解
@EnableScheduling
```

---

### 问题 2: 清理记录数为0

**可能原因**:
- 所有对话都在保留期内
- `retention-days` 设置过大

**检查方法**:
```sql
-- 查看最早的对话记录
SELECT MIN(create_time) FROM ai_tutor_conversation WHERE deleted = 0;

-- 查看应该清理的记录数
SELECT COUNT(*) FROM ai_tutor_conversation 
WHERE create_time < DATE_SUB(NOW(), INTERVAL 30 DAY) 
AND deleted = 0;
```

---

### 问题 3: 清理速度慢

**优化方案**:

1. **添加索引**:
```sql
CREATE INDEX idx_create_time_deleted 
ON ai_tutor_conversation(create_time, deleted);
```

2. **批量删除**:
```java
// 修改 cleanupExpiredConversations() 方法
// 每次最多删除 1000 条
wrapper.last("LIMIT 1000");
```

3. **调整执行时间**:
```yaml
# 避开系统繁忙时段
cleanup.cron: "0 0 4 * * ?"
```

---

## 📊 性能影响评估

### 清理任务对系统的影响

| 操作 | 影响 | 持续时间 | 建议 |
|------|------|----------|------|
| 逻辑删除 | 极低 | 1-5秒 | 可在任何时间执行 |
| 物理删除 | 低 | 5-30秒 | 建议在凌晨执行 |
| 索引重建 | 中 | 取决于数据量 | 定期维护 |

### 存储空间节省估算

假设每条对话记录平均 1KB:

| 对话记录数 | 占用空间 | 清理30天外数据后 |
|-----------|---------|-----------------|
| 10,000 条 | ~10 MB | ~7 MB |
| 100,000 条 | ~100 MB | ~70 MB |
| 1,000,000 条 | ~1 GB | ~700 MB |

---

## 🎯 最佳实践

### 1. 合理设置保留天数

```yaml
# 推荐配置
development:   # 开发环境
  retention-days: 7
  
production:    # 生产环境
  retention-days: 30
  
enterprise:    # 企业版
  retention-days: 90
```

### 2. 定期审计

定期检查清理效果:

```sql
-- 查看数据量趋势
SELECT 
  DATE(create_time) as date,
  COUNT(*) as count
FROM ai_tutor_conversation
WHERE deleted = 0
GROUP BY DATE(create_time)
ORDER BY date DESC
LIMIT 30;
```

### 3. 监控告警

设置监控告警:

```yaml
# 当待清理记录超过10000条时告警
expiredCount: > 10000
```

---

## 📚 相关文档

- [AI Tutor 功能说明](./AI智能助手使用指南.md)
- [AI Tutor 扩展功能实现](./AI智能助手扩展功能实现.md)
- [数据库设计文档](./database_design.md)

---

## ✅ 总结

AI Tutor 自动清理功能提供了:

1. ✅ **自动化** - 无需人工干预，定时自动清理
2. ✅ **安全性** - 两阶段删除，防止误删
3. ✅ **灵活性** - 可配置保留天数和执行时间
4. ✅ **可控性** - 支持手动触发和统计查询
5. ✅ **高效性** - 优化的清理算法，影响最小

通过合理配置和使用此功能，可以有效控制数据库增长，优化系统性能！

---

**创建时间**: 2026-01-21  
**版本**: v3.0.0  
**作者**: LearnSphere Team
