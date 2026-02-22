# AI 治理面板增强 - AI 助教提问配额监控

## 📊 更新概览

在 AI 治理面板的全景监控中新增了 **AI 助教提问配额的 Token 消耗**统计，帮助管理员实时监控助教功能的资源使用情况。

## ✨ 新增功能

### 1. **后端统计增强**
- **文件**: `AIGenerationLogServiceImpl.java`
- **新增字段**:
  - `tutorTokens`: AI 助教提问累计消耗的 Token 数
  - `tutorCalls`: AI 助教提问的总调用次数

```java
// 9. AI 助教提问专项统计
Object tutorTokensObj = this
    .getObj(new QueryWrapper<AIGenerationLog>()
        .select("SUM(total_tokens)")
        .eq("action_type", "AI 助教提问"), obj -> obj);
long tutorTokens = tutorTokensObj != null ? ((Number) tutorTokensObj).longValue() : 0;
result.put("tutorTokens", tutorTokens);

long tutorCalls = this.count(
    new QueryWrapper<AIGenerationLog>()
        .eq("action_type", "AI 助教提问"));
result.put("tutorCalls", tutorCalls);
```

### 2. **前端监控面板**
- **文件**: `AIGovernance.vue`
- **新增卡片**: AI 助教提问消耗统计卡

#### 卡片特性
- **图标**: 粉色消息气泡图标 (MessageSquare)
- **主指标**: 助教累计 Token 消耗
- **辅助信息**: 对话总次数
- **位置**: Token 使用统计行的第 5 张卡片

```vue
<n-card class="stat-card tutor-card" :bordered="false">
  <div class="stat-content">
    <div class="stat-icon bg-pink-500/20 text-pink-400">
      <MessageSquare :size="24" />
    </div>
    <div class="stat-info">
      <span class="label">AI 助教提问消耗</span>
      <n-statistic>
        <n-number-animation :from="0" :to="aiStats.tutorTokens || 0" />
      </n-statistic>
      <span class="text-xs text-zinc-500">共 {{ aiStats.tutorCalls || 0 }} 次对话</span>
    </div>
  </div>
</n-card>
```

## 🎯 业务价值

1. **成本透明化**
   - 清晰了解助教功能的 Token 消耗占比
   - 快速识别异常高消耗情况

2. **资源优化**
   - 基于实际数据调整助教配额策略
   - 评估功能投入产出比

3. **趋势分析**
   - 结合总消耗对比，了解助教功能使用率
   - 支持长期成本规划

## 📐 UI 布局

全景监控 Token 统计行现在包含 5 张卡片：

| 序号 | 卡片名称 | 主指标 | 图标颜色 |
|------|----------|--------|----------|
| 1 | 总 Token 消耗 | totalTokens | 琥珀色 |
| 2 | 24h Token 消耗 | tokens24h | 黄色 |
| 3 | 平均 Tokens | avgTokens | 柠檬色 |
| 4 | 预估运营成本 | estimatedCost | 玫瑰色 |
| **5** | **AI 助教提问消耗** | **tutorTokens** | **粉色** |

## 🔧 技术实现

### 数据流
```
AI 生成日志 (ai_generation_log)
  ↓ action_type = 'AI 助教提问'
AIGenerationLogService.getStats()
  ↓ 统计 SUM(total_tokens) + COUNT(*)
AdminAIController.getAIStats API
  ↓ /api/admin/ai/stats
AIGovernance.vue 前端展示
```

### 性能优化
- 使用数据库聚合函数 `SUM()` 和 `COUNT()`
- 条件过滤 `action_type` 减少扫描范围
- 前端使用 Number Animation 提升用户体验

## 📊 配额体系参考

| 用户类型 | 助教配额（次/天） | 预估日消耗 Token |
|---------|------------------|----------------|
| 普通用户 | 200 | ~60,000 |
| 月度会员 | 400 | ~120,000 |
| 季度会员 | 800 | ~240,000 |
| 年度会员 | 1500 | ~450,000 |

*基于平均每次对话消耗 300 Token 估算*

## 🚀 后续优化建议

1. **细分统计**
   - 按用户类型统计助教使用率
   - 按时段分析高峰期

2. **成本告警**
   - 单日消耗超阈值预警
   - 用户异常高频提问检测

3. **质量监控**
   - 助教回复满意度趋势
   - 高频问题聚类分析

---

**更新时间**: 2026-02-15  
**影响范围**: AI 治理面板 - 全景监控  
**相关文档**: `AI_Tutor_UI_Enhancement_2026.md`

## 🔧 问题修复 (2026-02-15 02:15)

### 问题描述
初始实现中，AI 助教提问消耗卡片始终显示为 0，原因是 `AITutorServiceImpl` 没有记录 AI 生成日志。

### 修复方案
在 `AITutorServiceImpl.chatWithMessages()` 方法中添加了日志记录逻辑：

**成功场景**:
- 记录用户 ID、Token 使用量（输入/输出/总计）
- action_type 设置为 "AI 助教提问"
- 捕获 AI 响应内容

**失败场景**:
- 记录错误信息和用户 ID
- 标记状态为 "FAIL"

**关键修改**:
```java
// 注入日志服务
private final IAIGenerationLogService aiGenerationLogService;

// 成功时记录
aiGenerationLogService.log(
    userId,
    "AI 助教提问",
    getEffectiveModel(),
    contextualPrompt,
    question,
    response,
    "SUCCESS",
    null,
    0L,
    inputTokens,
    outputTokens,
    totalTokens
);

// 失败时记录
aiGenerationLogService.log(
    userId,
    "AI 助教提问",
    getEffectiveModel(),
    "",
    question,
    null,
    "FAIL",
    e.getMessage(),
    0L, 0, 0, 0
);
```

### 验证方式
1. 在前端使用 AI 助教功能提问
2. 刷新 AI 治理面板
3. 观察"AI 助教提问消耗"卡片数值更新

---

**初始更新时间**: 2026-02-15  
**修复时间**: 2026-02-15 02:15  
**影响范围**: AI 治理面板 - 全景监控  
**相关文档**: `AI_Tutor_UI_Enhancement_2026.md`
