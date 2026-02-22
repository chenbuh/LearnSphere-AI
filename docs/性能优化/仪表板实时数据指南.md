# 仪表盘真实数据说明文档

## 数据流程

### 1. 学习时长分布（Bar Chart）

**数据来源：**
- API: `GET /learning/statistics` 或 `GET /learning/trends?days=7`
- 数据字段: `weeklyStats`

**后端实现：**
```sql
SELECT DATE(create_time) as date, SUM(time_spent) as timeSpent
FROM learning_record
WHERE user_id = #{userId}
  AND deleted = 0
  AND create_time >= #{startDate}
GROUP BY DATE(create_time)
ORDER BY date
```

**数据格式：**
```json
[
  { "date": "2026-02-03", "timeSpent": 1800 },
  { "date": "2026-02-04", "timeSpent": 3600 },
  ...
]
```

**说明：**
- `timeSpent` 单位为**秒**
- 前端会自动转换为分钟显示：`(val / 60).toFixed(0)`
- 空缺日期会自动填充为 0

---

### 2. 正确率趋势（Line Chart）

**数据来源：**
- API: `GET /learning/statistics` 或 `GET /learning/trends?days=7`
- 数据字段: `trendStats`

**后端实现：**
```sql
SELECT DATE(create_time) as date,
       SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as accuracy
FROM learning_record
WHERE user_id = #{userId}
  AND deleted = 0
  AND create_time >= #{startDate}
GROUP BY DATE(create_time)
ORDER BY date
```

**数据格式：**
```json
[
  { "date": "2026-02-03", "accuracy": 85.5 },
  { "date": "2026-02-04", "accuracy": 92.0 },
  ...
]
```

**说明：**
- `accuracy` 单位为**百分比**（0-100）
- 前端会保留一位小数：`parseFloat(val).toFixed(1)`
- 空缺日期会自动填充为 `null`（图表不显示该点）

---

## 如何确保数据真实性

### 1. 学习记录必须正确保存

每次用户完成学习活动后，需要调用 `learningApi.createRecord()` 保存记录：

```javascript
await learningApi.createRecord({
  contentId: 123,
  contentType: 'vocabulary',  // vocabulary|grammar|reading|listening|writing|speaking
  isCorrect: 1,               // 0-错误，1-正确
  timeSpent: 180,             // 单位：秒
  score: 95,                  // 分数
  answer: '...',
  correctAnswer: '...',
  masteryLevel: 4,            // 0-5
  originalContent: '...'      // 题目原始内容（JSON字符串）
})
```

### 2. 关键字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `contentId` | Long | 是 | 内容ID（词汇、文章、题目等） |
| `contentType` | String | 是 | 内容类型 |
| `timeSpent` | Integer | 是 | 学习耗时（秒） |
| `isCorrect` | Integer | 是 | 是否正确（影响正确率统计） |
| `score` | Integer | 否 | 分数 |
| `answer` | String | 否 | 用户答案 |
| `correctAnswer` | String | 否 | 正确答案 |
| `masteryLevel` | Integer | 否 | 掌握程度（0-5，用于艾宾浩斯复习） |

---

## 数据验证方法

### 1. 检查数据库

```sql
-- 查看最近的学习记录
SELECT * FROM learning_record 
WHERE user_id = YOUR_USER_ID 
ORDER BY create_time DESC 
LIMIT 20;

-- 查看每日学习时长统计
SELECT DATE(create_time) as date, 
       SUM(time_spent) as timeSpent,
       COUNT(*) as recordCount
FROM learning_record
WHERE user_id = YOUR_USER_ID
  AND deleted = 0
  AND create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(create_time)
ORDER BY date;

-- 查看每日正确率统计
SELECT DATE(create_time) as date,
       SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as accuracy,
       COUNT(*) as totalQuestions
FROM learning_record
WHERE user_id = YOUR_USER_ID
  AND deleted = 0
  AND create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(create_time)
ORDER BY date;
```

### 2. 检查API响应

在浏览器开发者工具的 Network 标签中查看：

**GET /learning/statistics** 返回：
```json
{
  "code": 200,
  "data": {
    "overall": { "totalTimeSpent": 18000, ... },
    "byType": [...],
    "weeklyStats": [
      { "date": "2026-02-03", "timeSpent": 1800 },
      ...
    ],
    "trendStats": [
      { "date": "2026-02-03", "accuracy": 85.5 },
      ...
    ],
    "consecutiveDays": 5,
    "growthTime": 3600,
    "growthVocab": 50
  }
}
```

### 3. 前端调试

在浏览器控制台中：

```javascript
// 获取统计数据
const { code, data } = await learningApi.getStatistics()
console.log('Stats:', data)
console.log('Weekly Stats:', data.weeklyStats)
console.log('Trend Stats:', data.trendStats)

// 获取趋势数据（7天）
const trends7 = await learningApi.getTrends(7)
console.log('7-day Trends:', trends7.data)

// 获取趋势数据（30天）
const trends30 = await learningApi.getTrends(30)
console.log('30-day Trends:', trends30.data)
```

---

## 常见问题

### Q1: 为什么图表是空的？

**可能原因：**
1. 用户还没有任何学习记录
2. 学习记录的 `create_time` 不在查询的日期范围内
3. 学习记录的 `deleted` 字段为 1（已删除）

**解决方法：**
- 完成一些学习活动（词汇、语法、阅读等）
- 检查数据库中是否有记录
- 确保记录正确保存且 `deleted = 0`

### Q2: 为什么正确率显示为 0%？

**可能原因：**
- 所有题目都答错了
- `is_correct` 字段始终为 0

**解决方法：**
- 确保答题时正确设置 `isCorrect` 字段
- 至少答对一题后正确率才会显示

### Q3: 如何测试真实数据？

**步骤：**
1. 登录系统
2. 完成一些学习活动（例如做词汇练习）
3. 刷新仪表盘页面
4. 查看图表是否显示数据
5. 在 Network 标签中查看 API 响应

---

## 技术栈总结

### 后端
- **框架**: Spring Boot + MyBatis-Plus
- **数据库**: MySQL
- **查询优化**: 使用 `GROUP BY DATE()` 和 `SUM()` 聚合
- **日期填充**: Java 后端自动填充缺失日期

### 前端
- **框架**: Vue 3 + Composition API
- **图表库**: ECharts 5.x
- **状态管理**: `ref()` 响应式数据
- **数据处理**: 自动单位转换（秒→分钟）

---

## 更新日志

### 2026-02-09
- ✅ 确认后端真实数据接口正常工作
- ✅ 确认前端正确调用并渲染数据
- ✅ 修复 GSAP 动画导致内容消失的问题
- ✅ 添加数据验证和调试方法文档
