# 用户全生命周期管理功能设计文档

## 一、功能概述

### 1.1 用户画像透视
点击用户详情时，展示完整的用户画像，包括：
- **学习轨迹**：最近学习内容、进度、偏好科目
- **AI 对话偏好**：常用 AI 功能、对话主题分布
- **活跃时间段**：用户登录/学习的时间分布热力图
- **价值分层**：根据行为数据自动分类（高潜力、流失风险、活跃用户等）

### 1.2 批量精细化运营
- **高级筛选器**：支持多条件组合（如"最近30天未登录" AND "余额>0"）
- **批量发送消息**：站内信/邮件批量召回
- **批量VIP赠送**：快速赠送体验天数

---

## 二、数据模型设计

### 2.1 用户详情接口返回数据结构

```json
{
  "user": {
    "id": 1,
    "username": "test",
    "nickname": "测试用户",
    "email": "test@example.com",
    "avatar": "https://...",
    "createTime": "2026-01-01T00:00:00",
    "lastLoginTime": "2026-02-09T22:00:00"
  },
  
  "userTag": "高潜力用户",  // 自动分类标签
  "riskLevel": "LOW",      // 流失风险: LOW/MEDIUM/HIGH
  
  "statistics": {
    "totalWordsLearned": 1520,
    "totalAiUsage": 380,
    "totalCheckins": 45,
    "studyStreak": 7
  },
  
  "learningTrack": {
    "recentActivities": [
      {
        "type": "vocabulary",
        "title": "雅思核心词汇",
        "time": "2026-02-09 21:30",
        "score": 95
      },
      {
        "type": "reading",
        "title": "经济学人文章精读",
        "time": "2026-02-09 20:15",
        "score": 88
      }
    ],
    "subjectPreference": {
      "vocabulary": 35,
      "grammar": 20,
      "reading": 25,
      "listening": 10,
      "speaking":5,
      "writing": 5
    }
  },
  
  "aiUsageProfile": {
    "preferredFeatures": [
      { "name": "AI 批改作文", "usage": 45, "percentage": 35 },
      { "name": "AI 对话练习", "usage": 38, "percentage": 30 },
      { "name": "智能生成题目", "usage": 25, "percentage": 20 }
    ],
    "topicDistribution": {
      "学术写作": 30,
      "日常对话": 25,
      "商务英语": 20,
      "其他": 25
    }
  },
  
  "activityHeatmap": {
    "hourlyDistribution": [
      { "hour": 0, "count": 2 },
      { "hour": 1, "count": 0 },
      ...
      { "hour": 20, "count": 15 },
      { "hour": 21, "count": 22 },
      { "hour": 22, "count": 18 },
      { "hour": 23, "count": 5 }
    ],
    "weeklyDistribution": [
      { "day": "Monday", "count": 45 },
      { "day": "Tuesday", "count": 38 },
      ...
    ]
  },
  
  "valueSegmentation": {
    "segment": "高潜力用户",
    "ltv": 299,              // Lifetime Value (预估)
    "engagementScore": 85,   // 参与度评分 (0-100)
    "churnRisk": 15,         // 流失风险评分 (0-100, 越高越危险)
    "reasons": [
      "连续7天活跃",
      "AI使用频率高于平均水平",
      "学习进度稳定增长"
    ]
  },
  
  "skillScores": {
    "vocabulary": 85,
    "grammar": 78,
    "reading": 82,
    "listening": 65,
    "speaking": 55,
    "writing": 60
  },
  
  "usageTrend": [
    { "date": "2026-02-03", "value": 12 },
    { "date": "2026-02-04", "value": 18 },
    ...
  ]
}
```

###  2.2 筛选条件接口

```
GET /api/admin/users/list?filterCriteria={...}
```

**filterCriteria 结构:**
```json
{
  "conditions": [
    {
      "field": "lastLoginTime",
      "operator": "lessThan",
      "value": "30days"
    },
    {
      "field": "points",
      "operator": "greaterThan",
      "value": 0
    },
    {
      "field": "vipStatus",
      "operator": "equals",
      "value": false
    }
  ],
  "logic": "AND"  // 条件连接逻辑: AND / OR
}
```

---

## 三、前端实现要点

### 3.1 用户详情弹窗增强

**新增Tab页：**
1. **基础信息** - 现有内容
2. **学习轨迹** - 最近学习记录 + 科目偏好饼图
3. **AI 画像** - AI 功能使用分布 + 对话话题分析
4. **活跃分析** - 时间段热力图
5. **价值分层** - 用户标签 + LTV + 流失风险

**关键组件：**
- ECharts 饼图 - 科目偏好分布
- ECharts 热力图 - 活跃时间段
- 时间轴组件 - 学习轨迹展示
- 标签云 - AI 对话话题

### 3.2 高级筛选器

**筛选字段：**
- 最后登录时间（今天/7天/30天/自定义）
- 注册时间范围
- VIP 状态（是/否/即将过期）
- 积分范围
- 学习记录数量
- AI 使用次数
- 连续签到天数
- 自定义标签

**筛选逻辑：**
- 支持 AND / OR 组合
- 支持嵌套条件组

### 3.3 批量操作

**批量发送站内信：**
```javascript
{
  "userIds": [1, 2, 3, ...],
  "title": "召回提醒",
  "content": "亲爱的学员，我们为您准备了新的学习内容...",
  "type": "system"
}
```

**批量赠送VIP：**
```javascript
{
  "userIds": [1, 2, 3, ...],
  "vipLevel": 1,
  "duration": 7,  // 天数
  "dailyQuota": 50
}
```

---

## 四、后端API设计

### 4.1 用户详情API

```java
@GetMapping("/users/{userId}/profile")
public Result<UserProfileDTO> getUserProfile(@PathVariable Long userId) {
    // 1. 基础信息
    // 2. 学习记录统计
    // 3. AI 使用分析
    // 4. 活跃时间分析
    // 5. 价值分层计算
    return Result.success(userProfile);
}
```

### 4.2 高级筛选API

```java
@PostMapping("/users/filter")
public Result<Page<User>> filterUsers(@RequestBody FilterCriteriaDTO criteria) {
    // 动态构建查询条件
    // 支持多条件 AND/OR 组合
    return Result.success(filteredUsers);
}
```

### 4.3 批量操作API

```java
@PostMapping("/users/batch/notify")
public Result batchNotify(@RequestBody BatchNotifyDTO dto) {
    // 批量发送站内信/邮件
    return Result.success();
}

@PostMapping("/users/batch/grant-vip")
public Result batchGrantVip(@RequestBody BatchVipDTO dto) {
    // 批量赠送VIP
    return Result.success();
}
```

---

## 五、价值分层算法

### 5.1 用户分层规则

**1. 高潜力用户 (High Potential)**
- 近7天活跃 >= 5天
- AI使用次数 > 平均值 * 1.5
- 学习进度稳定增长
- 未购买VIP

**2. 活跃用户 (Active)**
- 近7天活跃 >= 3天
- 连续签到 >= 3天

**3. 流失风险用户 (Churn Risk)**
- 30天未登录
- 或: 7天未登录 且 之前是活跃用户
- 或: VIP即将过期(7天内)且未续费

**4. 沉睡用户 (Dormant)**
- 90天未登录

**5. 新用户 (New)**
- 注册 < 7天

### 5.2 流失风险评分

```
churnRisk = 
  (daysSinceLastLogin / 30) * 40 +
  (1 - weeklyActiveRate) * 30 +
  (aiUsageDeclineRate) * 20 +
  (isVipExpiringSoon ? 10 : 0)
```

---

## 六、实施计划

### Phase 1: 后端API开发
1. ✅ 用户详情增强接口
2. ✅ 高级筛选接口
3. ✅ 批量操作接口
4. ✅ 价值分层算法实现

### Phase 2: 前端UI开发
1. ✅ 增强用户详情弹窗
2. ✅ 高级筛选器组件
3. ✅ 批量操作面板
4. ✅ 可视化图表集成

### Phase 3: 测试与优化
1. 功能测试
2. 性能优化
3. 用户体验优化
