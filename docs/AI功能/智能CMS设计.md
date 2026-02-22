# 智能内容管理 (CMS) 功能设计文档

## 一、功能概述

### 1.1 内容质量 AI 预检
在内容创建/编辑时，自动进行质量检查，减少人工审核工作量。

**检查项**：
- ✅ 拼写错误检测
- ✅ 敏感词违规检测
- ✅ 格式问题检测
- ✅ 内容重复度检测
- ✅ 语法错误检测

### 1.2 资源热度分析
展示内容的受欢迎程度，帮助运营决策。

**分析指标**：
- 📊 完读率（浏览完成百分比）
- ⭐ 收藏率（收藏/浏览比例）
- 👁️ 浏览量
- 💬 互动量
- 📈 趋势分析

---

## 二、数据模型设计

### 2.1 内容质检结果 DTO

```java
public class ContentQualityCheckDTO {
    private Boolean passed;              // 是否通过
    private Integer score;               // 质量评分 0-100
    private List<Issue> issues;          // 问题列表
    private Map<String, Object> statistics; // 统计信息
    
    @Data
    public static class Issue {
        private String type;             // spelling, sensitive, format, grammar
        private String severity;         // low, medium, high
        private String message;          // 问题描述
        private Integer position;        // 问题位置
        private String suggestion;       // 修复建议
    }
}
```

### 2.2 内容热度分析 DTO

```java
public class ContentHeatAnalysisDTO {
    private Long contentId;
    private String contentType;          // vocabulary, writing, reading, etc.
    private String title;
    
    // 核心指标
    private Long viewCount;              // 浏览量
    private Long completeCount;          // 完成量
    private Long favoriteCount;          // 收藏量
    
    // 计算指标
    private Double completeRate;         // 完读率 = completeCount / viewCount
    private Double favoriteRate;         // 收藏率 = favoriteCount / viewCount
    
    // 趋势数据
    private List<TrendData> trend;       // 7天趋势
    
    // 排名
    private Integer rank;                // 热度排名
    
    @Data
    public static class TrendData {
        private String date;
        private Long views;
        private Long completes;
        private Long favorites;
    }
}
```

### 2.3 数据库表设计

#### content_analytics（内容分析表）
```sql
CREATE TABLE content_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content_id BIGINT NOT NULL COMMENT '内容ID',
    content_type VARCHAR(50) NOT NULL COMMENT '内容类型',
    view_count BIGINT DEFAULT 0 COMMENT '浏览量',
    complete_count BIGINT DEFAULT 0 COMMENT '完成量',
    favorite_count BIGINT DEFAULT 0 COMMENT '收藏量',
    avg_duration INT DEFAULT 0 COMMENT '平均停留时长(秒)',
    complete_rate DECIMAL(5, 2) DEFAULT 0 COMMENT '完读率',
    favorite_rate DECIMAL(5, 2) DEFAULT 0 COMMENT '收藏率',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_content (content_id, content_type),
    INDEX idx_complete_rate (complete_rate DESC),
    INDEX idx_favorite_rate (favorite_rate DESC)
) COMMENT='内容分析数据表';
```

#### sensitive_words（敏感词表）
```sql
CREATE TABLE sensitive_words (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL COMMENT '敏感词',
    level VARCHAR(20) DEFAULT 'medium' COMMENT '严重级别: low/medium/high',
    category VARCHAR(50) COMMENT '分类: political/violent/pornographic/illegal',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_word (word),
    INDEX idx_level (level),
    INDEX idx_status (status)
) COMMENT='敏感词库';
```

---

## 三、API 设计

### 3.1 内容质检 API

#### 检查内容质量
```
POST /api/admin/content/quality-check

Request:
{
  "content": "需要检查的内容...",
  "contentType": "vocabulary",  // vocabulary, writing, reading, etc.
  "checkOptions": {
    "spelling": true,
    "sensitive": true,
    "grammar": true,
    "format": true
  }
}

Response:
{
  "code": 200,
  "data": {
    "passed": false,
    "score": 75,
    "issues": [
      {
        "type": "spelling",
        "severity": "low",
        "message": "拼写错误: 'recieve' 应为 'receive'",
        "position": 125,
        "suggestion": "receive"
      },
      {
        "type": "sensitive",
        "severity": "high",
        "message": "检测到敏感词: '***'",
        "position": 256,
        "suggestion": "请修改此内容"
      }
    ],
    "statistics": {
      "wordCount": 350,
      "sentenceCount": 15,
      "avgSentenceLength": 23
    }
  }
}
```

### 3.2 内容热度分析 API

#### 获取单个内容热度
```
GET /api/admin/content/{contentId}/heat-analysis?contentType=vocabulary

Response:
{
  "code": 200,
  "data": {
    "contentId": 123,
    "contentType": "vocabulary",
    "title": "雅思核心词汇",
    "viewCount": 1520,
    "completeCount": 1123,
    "favoriteCount": 456,
    "completeRate": 73.88,
    "favoriteRate": 30.00,
    "rank": 5,
    "trend": [
      { "date": "2026-02-03", "views": 200, "completes": 145, "favorites": 60 },
      { "date": "2026-02-04", "views": 220, "completes": 160, "favorites": 65 }
    ]
  }
}
```

#### 获取热门内容列表
```
GET /api/admin/content/hot-list?contentType=vocabulary&orderBy=completeRate&limit=10

Response:
{
  "code": 200,
  "data": [
    {
      "contentId": 123,
      "title": "雅思核心词汇",
      "viewCount": 1520,
      "completeRate": 73.88,
      "favoriteRate": 30.00,
      "rank": 1
    }
  ]
}
```

---

## 四、前端实现

### 4.1 Writing.vue / Vocabulary.vue 增强

#### AI 质检按钮
```vue
<template>
  <!-- 编辑表单 -->
  <n-form>
    <n-form-item label="内容">
      <n-input
        v-model:value="form.content"
        type="textarea"
        :rows="10"
      />
    </n-form-item>
    
    <!-- AI 质检按钮 -->
    <n-space>
      <n-button
        type="primary"
        :loading="checking"
        @click="handleAICheck"
      >
        <template #icon>
          <Sparkles :size="16" />
        </template>
        AI 质检
      </n-button>
      
      <n-tag v-if="checkResult" :type="checkResult.passed ? 'success' : 'warning'">
        质量评分: {{ checkResult.score }}
      </n-tag>
    </n-space>
    
    <!-- 质检结果展示 -->
    <n-alert
      v-if="checkResult && checkResult.issues.length > 0"
      type="warning"
      title="发现以下问题"
      style="margin-top: 16px"
    >
      <n-space vertical>
        <div v-for="(issue, index) in checkResult.issues" :key="index">
          <n-tag :type="getIssueSeverityType(issue.severity)">
            {{ issue.type }}
          </n-tag>
          {{ issue.message }}
          <n-button text type="primary" @click="applySuggestion(issue)">
            应用建议
          </n-button>
        </div>
      </n-space>
    </n-alert>
  </n-form>
</template>

<script setup>
const checking = ref(false)
const checkResult = ref(null)

const handleAICheck = async () => {
  checking.value = true
  try {
    const res = await adminApi.checkContentQuality({
      content: form.value.content,
      contentType: 'vocabulary',
      checkOptions: {
        spelling: true,
        sensitive: true,
        grammar: true,
        format: true
      }
    })
    checkResult.value = res.data
    if (res.data.passed) {
      message.success(`质检通过！评分: ${res.data.score}`)
    } else {
      message.warning(`发现 ${res.data.issues.length} 个问题，请修改`)
    }
  } catch (error) {
    message.error('质检失败')
  } finally {
    checking.value = false
  }
}
</script>
```

### 4.2 Content.vue 增强

#### 热度分析展示
```vue
<template>
  <n-data-table :columns="columns" :data="contents">
    <!-- 自定义列 -->
    <template #completeRate="{ row }">
      <n-progress
        type="line"
        :percentage="row.completeRate"
        :color="getHeatColor(row.completeRate)"
      />
      <span style="margin-left: 8px">{{ row.completeRate }}%</span>
    </template>
    
    <template #favoriteRate="{ row }">
      <n-space align="center">
        <Star :size="16" :fill="row.favoriteRate > 20 ? '#FFD700' : 'none'" />
        {{ row.favoriteRate }}%
      </n-space>
    </template>
    
    <template #trend="{ row }">
      <n-button text @click="showTrendChart(row)">
        查看趋势
      </n-button>
    </template>
  </n-data-table>
  
  <!-- 趋势图弹窗 -->
  <n-modal v-model:show="showTrendModal">
    <n-card style="width: 700px" title="内容热度趋势">
      <div ref="trendChartRef" style="width: 100%; height: 300px"></div>
    </n-card>
  </n-modal>
</template>

<script setup>
const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', width: 200 },
  { title: '浏览量', key: 'viewCount', width: 100 },
  { 
    title: '完读率', 
    key: 'completeRate', 
    width: 150,
    render: (row) => h('div', {}, [
      h(NProgress, {
        type: 'line',
        percentage: row.completeRate,
        color: getHeatColor(row.completeRate)
      }),
      h('span', { style: 'margin-left: 8px' }, `${row.completeRate}%`)
    ])
  },
  { title: '收藏率', key: 'favoriteRate', width: 120 },
  { title: '操作', key: 'actions' }
]

const getHeatColor = (rate) => {
  if (rate >= 70) return '#52c41a'  // 绿色 - 优秀
  if (rate >= 50) return '#1890ff'  // 蓝色 - 良好
  if (rate >= 30) return '#faad14'  // 橙色 - 一般
  return '#ff4d4f'                   // 红色 - 较差
}

const showTrendChart = async (row) => {
  const res = await adminApi.getContentHeatAnalysis(row.id, row.contentType)
  // 渲染 ECharts 趋势图
  renderTrendChart(res.data.trend)
  showTrendModal.value = true
}
</script>
```

---

## 五、技术实现要点

### 5.1 AI 质检实现方案

#### 方案一：调用第三方API（推荐）
```java
// 使用OpenAI/百度文心/阿里通义千问
public ContentQualityCheckDTO checkQuality(String content) {
    String prompt = String.format("""
        请检查以下内容的质量，返回JSON格式：
        {
          "passed": boolean,
          "score": 0-100,
          "issues": [
            {"type": "spelling/sensitive/grammar", "message": "...", "position": 0}
          ]
        }
        
        内容：
        %s
        """, content);
    
    String aiResponse = openAIService.chat(prompt);
    return JSON.parseObject(aiResponse, ContentQualityCheckDTO.class);
}
```

#### 方案二：本地规则引擎
```java
public ContentQualityCheckDTO checkQuality(String content) {
    List<Issue> issues = new ArrayList<>();
    
    // 1. 拼写检查（使用字典）
    issues.addAll(spellChecker.check(content));
    
    // 2. 敏感词检测（DFA算法）
    issues.addAll(sensitiveWordFilter.check(content));
    
    // 3. 格式检查（正则表达式）
    issues.addAll(formatChecker.check(content));
    
    // 计算评分
    int score = calculateScore(issues);
    
    return new ContentQualityCheckDTO(
        issues.isEmpty(),
        score,
        issues
    );
}
```

### 5.2 热度分析实现

#### 定时任务更新热度数据
```java
@Scheduled(cron = "0 0 * * * ?") // 每小时执行
public void updateContentAnalytics() {
    // 从学习记录表统计数据
    List<ContentAnalytics> analytics = calculateAnalytics();
    
    for (ContentAnalytics item : analytics) {
        // 计算完读率
        item.setCompleteRate(item.getCompleteCount() * 100.0 / item.getViewCount());
        
        // 计算收藏率
        item.setFavoriteRate(item.getFavoriteCount() * 100.0 / item.getViewCount());
        
        // 更新到数据库
        contentAnalyticsMapper.insertOrUpdate(item);
    }
}
```

---

## 六、实施计划

### Phase 1: 敏感词检测（最简单）
1. ✅ 创建敏感词表
2. ✅ 实现 DFA 算法敏感词过滤器
3. ✅ 提供质检 API
4. ✅ 前端集成质检按钮

### Phase 2: 热度分析
1. ✅ 创建内容分析表
2. ✅ 实现统计定时任务
3. ✅ 提供热度分析 API
4. ✅ 前端展示热度指标

### Phase 3: AI 增强（可选）
1. ⏳ 集成 AI API（拼写、语法检查）
2. ⏳ 优化质检算法
3. ⏳ 添加内容推荐

---

## 七、预期效果

### 7.1 内容质检效果
- 🎯 **减少审核时间 70%**：自动检测常见问题
- 🛡️ **内容合规率提升 95%**：敏感词自动拦截
- ✨ **内容质量提升**：拼写、语法错误减少

### 7.2 运营效果
- 📊 **数据驱动决策**：了解哪些内容更受欢迎
- 🔥 **识别爆款内容**：完读率 >70% 的优质内容
- 📈 **优化内容策略**：根据热度调整内容方向

---

## 八、示例截图设计

### 质检界面
```
┌─────────────────────────────────────────┐
│ 📝 编辑词汇                              │
├─────────────────────────────────────────┤
│ 单词: receive                            │
│ 释义: 接收                               │
│ 例句: I recieve your email.              │
│                                          │
│ [✨ AI 质检]  [💾 保存]                  │
│                                          │
│ ⚠️ 发现 1 个问题:                        │
│ 🔤 拼写错误: 'recieve' → 'receive'      │
│    [应用建议]                            │
│                                          │
│ 质量评分: 85/100                         │
└─────────────────────────────────────────┘
```

### 热度分析
```
┌─────────────────────────────────────────┐
│ 📊 内容热度排行                          │
├─────────────────────────────────────────┤
│ #1 雅思核心词汇                          │
│    浏览 1520  完读率 ████████ 73.88%    │
│    收藏率 ⭐ 30.00%  [查看趋势]          │
│                                          │
│ #2 托福听力训练                          │
│    浏览 1320  完读率 ██████ 68.20%      │
│    收藏率 ⭐ 25.50%  [查看趋势]          │
└─────────────────────────────────────────┘
```
