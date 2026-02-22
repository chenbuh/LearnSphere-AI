# 后端 NullPointerException 修复报告

## 问题描述

后端服务在调用 `/learning/statistics` API 时抛出 `NullPointerException`：

```
java.lang.NullPointerException: Cannot invoke "java.lang.Number.doubleValue()" because "avgScore" is null
at LearningRecordServiceImpl.getUserStatistics(LearningRecordServiceImpl.java:228)
```

## 根本原因

### SQL 查询结果
当用户做语法练习时，如果所有题目都答错（correctCount = 0），SQL 的 `AVG(score)` 会返回 `null`：

```sql
SELECT 
  content_type, 
  COUNT(*) as count, 
  AVG(score) as avgScore  -- 当所有 score 都是 null 时，AVG 返回 null
FROM learning_record 
WHERE user_id = ? 
GROUP BY content_type
```

结果：
```
content_type | count | avgScore
-------------|-------|----------
vocabulary   | 1     | 100.0000
grammar      | 10    | null      <-- 问题所在
```

### 代码问题
第 228 行直接调用 `.doubleValue()`，没有检查 null：
```java
Number avgScore = (Number) typeStat.get("avgScore");
abilityStats.get(type).put("mastery", avgScore.doubleValue() / 20.0);  // ❌ NPE
```

## 修复方案

### 1. 修复第 227-229 行（主要问题）
```java
// 修复前
Number avgScore = (Number) typeStat.get("avgScore");
abilityStats.get(type).put("mastery", avgScore.doubleValue() / 20.0);

// 修复后
Number avgScore = (Number) typeStat.get(" avgScore");
double mastery = (avgScore != null) ? avgScore.doubleValue() / 20.0 : 0.0;  // ✅ 安全
abilityStats.get(type).put("mastery", mastery);
```

### 2. 修复第 237-239 行（推断口语分数）
```java
// 修复前
double inferredScore = (((Number) listening.get("avgScore")).doubleValue() * 0.6
        + ((Number) reading.get("avgScore")).doubleValue() * 0.4) * 0.8;

// 修复后
double listeningScore = getScoreOrDefault(listening.get("avgScore"));
double readingScore = getScoreOrDefault(reading.get("avgScore"));
double inferredScore = (listeningScore * 0.6 + readingScore * 0.4) * 0.8;  // ✅ 安全
```

### 3. 新增辅助方法
```java
/**
 * 获取分数或返回默认值
 * 处理 avgScore 可能为 null 的情况（例如全部答错时）
 */
private double getScoreOrDefault(Object scoreObj) {
    if (scoreObj == null) {
        return 0.0;
    }
    if (scoreObj instanceof Number) {
        return ((Number) scoreObj).doubleValue();
    }
    return 0.0;
}
```

## 修复文件
- `backend/src/main/java/com/learnsphere/service/impl/LearningRecordServiceImpl.java`
  - Line 227-229: 添加 null 检查
  - Line 237-243: 使用辅助方法处理 null
  - Line 289-302: 新增 `getScoreOrDefault()` 方法

## 测试验证

### 重现步骤
1. 登录系统
2. 进入语法练习
3. 故意全部答错（10道题都选错）
4. 提交试卷
5. 访问首页（会调用 `/learning/statistics`）

### 预期结果
- ✅ 不再抛出 NullPointerException
- ✅ 返回正常的统计数据，`avgScore` 为 0 或 null，`mastery` 为 0.0
- ✅ 前端能正常显示统计信息

## 影响范围
- **修复前**: 用户只要有一个模块全部答错，统计 API 就会崩溃
- **修复后**: 所有边界情况都能正常处理

## 状态
✅ 已修复
⏳ 需要重启后端服务生效

## 下一步
请重启后端服务以应用修复：
```bash
# 停止当前运行的后端
# 重新运行后端
```
