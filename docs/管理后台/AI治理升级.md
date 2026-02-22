# AI 治理中心升级指南

## 已创建的新组件

### 1. Sparkline.vue - 迷你趋势图组件
用于在表格中显示微型趋势图,直观对比数据变化。

**使用示例:**
```vue
<template>
  <!-- 单条趋势线 -->
  <sparkline
    :data="[10, 20, 15, 25, 30, 20, 35]"
    color="#10b981"
    height="40px"
    width="120px"
  />

  <!-- A/B 对比 -->
  <div class="flex gap-4">
    <div>
      <div class="text-xs text-zinc-500 mb-1">A组耗时</div>
      <sparkline
        :data="groupALatency"
        color="#6366f1"
        :show-stats="true"
      />
    </div>
    <div>
      <div class="text-xs text-zinc-500 mb-1">B组耗时</div>
      <sparkline
        :data="groupBLatency"
        color="#10b981"
        :show-stats="true"
      />
    </div>
  </div>
</template>
```

### 2. RethinkSandbox.vue - 人工校验沙箱
为错误反馈提供针对性提示词优化功能。

**使用示例:**
```vue
<template>
  <rethink-sandbox
    v-model:show="showRethink"
    :feedback-item="selectedFeedback"
    @saved="handleRethinkSaved"
  />
</template>

<script setup>
import RethinkSandbox from '@/components/RethinkSandbox.vue'

const showRethink = ref(false)
const selectedFeedback = ref(null)

const openRethink = (feedbackItem) => {
  selectedFeedback.value = feedbackItem
  showRethink.value = true
}

const handleRethinkSaved = (result) => {
  console.log('优化已保存:', result)
  // 刷新数据
  fetchData()
}
</script>
```

---

## AIGovernance.vue 升级步骤

### 第一步: 修复双滚动问题

**问题根源:**
- 页面整体有滚动
- 内部组件(n-scrollbar)也有滚动
- 导致两个滚动条同时存在

**解决方案:**
```vue
<!-- 1. 移除内部滚动组件 -->

<!-- 之前 (错误) -->
<n-card title="最近用户反馈流">
  <div class="h-96 overflow-y-auto">
    <div v-for="item in list">...</div>
  </div>
</n-card>

<!-- 之后 (正确) -->
<n-card title="最近用户反馈流">
  <div class="feedback-list">
    <div v-for="item in list" class="feedback-item">...</div>
  </div>
</n-card>

<!-- 2. 移除固定高度限制 -->

<!-- 之前 -->
<n-scrollbar style="max-height: 400px">
  ...
</n-scrollbar>

<!-- 之后 -->
<div class="content-section">
  ...
</div>
```

### 第二步: 添加 Sparklines 到 A/B 实验表格

```vue
<script setup>
import Sparkline from '@/components/Sparkline.vue'

// A/B 实验列定义
const abtestColumns = [
  { title: '实验名称', key: 'name' },
  {
    title: '耗时趋势',
    key: 'latencyTrend',
    width: 200,
    render: (row) => {
      return h('div', { class: 'flex gap-2' },
        // A组
        h('div', { class: 'text-center' },
          h('div', { class: 'text-[10px] text-zinc-500 mb-1' }, 'A'),
          h(Sparkline, {
            data: row.groupALatency || [],
            color: '#6366f1',
            height: '30px',
            width: '80px'
          })
        ),
        // B组
        h('div', { class: 'text-center' },
          h('div', { class: 'text-[10px] text-zinc-500 mb-1' }, 'B'),
          h(Sparkline, {
            data: row.groupBLatency || [],
            color: '#10b981',
            height: '30px',
            width: '80px'
          })
        )
      )
    }
  },
  {
    title: '失败率趋势',
    key: 'failureTrend',
    width: 200,
    render: (row) => {
      return h('div', { class: 'flex gap-2' },
        h('div', { class: 'text-center' },
          h('div', { class: 'text-[10px] text-zinc-500 mb-1' }, 'A'),
          h(Sparkline, {
            data: row.groupAFailureRate || [],
            color: '#f87171',
            height: '30px',
            width: '80px'
          })
        ),
        h('div', { class: 'text-center' },
          h('div', { class: 'text-[10px] text-zinc-500 mb-1' }, 'B'),
          h(Sparkline, {
            data: row.groupBFailureRate || [],
            color: '#10b981',
            height: '30px',
            width: '80px'
          })
        )
      )
    }
  },
  { title: '操作', key: 'actions' }
]
</script>
```

### 第三步: 添加 Rethink 按钮到反馈流

```vue
<!-- 在 feedback loop 标签页中 -->
<template>
  <n-tab-pane name="loop" tab="Feedback Loop">
    <!-- ... 现有内容 ... -->

    <!-- 在每个反馈卡片中添加 Rethink 按钮 -->
    <n-card v-for="item in loopStats.list" :key="item.id">
      <div class="feedback-actions">
        <!-- 现有的"智能归因"按钮 -->
        <n-button
          v-if="item.rating === -1 && !item.analysisResult"
          size="tiny"
          type="warning"
          @click="handleAnalyzeFeedback(item)"
        >
          🤖 智能归因
        </n-button>

        <!-- 新增: Rethink 按钮 -->
        <n-button
          v-if="item.rating === -1 && item.analysisResult"
          size="tiny"
          type="success"
          ghost
          @click="openRethink(item)"
        >
          <template #icon><FlaskConical :size="12" /></template>
          Rethink 优化
        </n-button>
      </div>
    </n-card>
  </n-tab-pane>
</template>

<script setup>
import RethinkSandbox from '@/components/RethinkSandbox.vue'
import { FlaskConical } from 'lucide-vue-next'

const showRethink = ref(false)
const selectedFeedback = ref(null)

const openRethink = (item) => {
  selectedFeedback.value = item
  showRethink.value = true
}

const handleRethinkSaved = async (result) => {
  message.success('提示词优化已保存并应用')

  // 标记该反馈为已处理
  const index = loopStats.value.list.findIndex(
    i => i.id === result.feedbackId
  )
  if (index !== -1) {
    loopStats.value.list[index].processed = true
    loopStats.value.list[index].optimizedPrompt = result.optimizedPrompt
  }

  // 刷新数据
  await fetchLoopStats()
}
</script>

<template>
  <!-- 添加 Rethink 沙箱组件 -->
  <rethink-sandbox
    v-model:show="showRethink"
    :feedback-item="selectedFeedback"
    @saved="handleRethinkSaved"
  />
</template>
```

### 第四步: 优化页面布局结构

```vue
<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>AI 治理中心</h1>
    </div>

    <!-- 统计卡片 - 移除固定高度 -->
    <n-grid :cols="4" :x-gap="16" class="mb-6">
      <n-grid-item v-for="stat in stats" :key="stat.key">
        <n-card class="stat-card">
          <!-- 内容 -->
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 图表区域 - 移除固定高度 -->
    <n-grid :cols="2" :x-gap="16" class="mb-6">
      <n-grid-item>
        <n-card title="调用趋势" class="chart-card">
          <div ref="trendChartRef" style="height: 300px"></div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="模型分布" class="chart-card">
          <div ref="modelChartRef" style="height: 300px"></div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 标签页 - 移除内部滚动 -->
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="monitor" tab="实时监控">
        <!-- 内容直接放这里,不要 n-scrollbar -->
        <div class="tab-content">
          <!-- ... -->
        </div>
      </n-tab-pane>

      <n-tab-pane name="loop" tab="Feedback Loop">
        <!-- 移除 h-96 overflow-y-auto -->
        <div class="feedback-list">
          <n-card v-for="item in loopStats.list" :key="item.id">
            <!-- ... -->
          </n-card>
        </div>
      </n-tab-pane>

      <n-tab-pane name="abtest" tab="A/B 实验室">
        <!-- 使用新的 Sparkline 列 -->
        <n-data-table
          :columns="abtestColumns"
          :data="experimentList"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style scoped>
/* 移除页面容器的高度限制 */
.page-container {
  /* 不要 max-height 或 overflow */
  padding: 24px;
}

/* 移除卡片的固定高度 */
.stat-card,
.chart-card {
  /* 不要 height: xxx */
  min-height: auto;
}

/* 标签页内容区域 */
.tab-content {
  /* 不要 overflow-y: auto 或 max-height */
  padding: 16px 0;
}

/* 反馈列表 */
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 不要 max-height 或 overflow */
}

/* 整体滚动由浏览器自动处理 */
</style>
```

---

## 数据结构要求

### A/B 实验数据格式

```javascript
{
  id: 1,
  name: "阅读生成 V2 优化",
  actionType: "GENERATE_READING",
  variantName: "Few-shot Enhanced",
  trafficRatio: 20,
  status: "RUNNING",
  startTime: "2026-02-22 10:00:00",
  // 新增: 趋势数据
  groupALatency: [1200, 1150, 1300, 1250, 1180, 1220, 1190],
  groupBLatency: [1100, 1050, 1080, 1020, 990, 1010, 1000],
  groupAFailureRate: [2.1, 1.8, 2.3, 1.9, 2.0, 1.7, 1.8],
  groupBFailureRate: [1.5, 1.2, 1.3, 1.1, 1.0, 0.9, 1.1]
}
```

---

## API 接口需求

### Rethink 沙箱需要的接口

```javascript
// 1. 获取原始提示词
GET /api/admin/ai/prompt/by-action?actionType=GENERATE_READING
Response: { content: "..." }

// 2. AI 生成优化建议
POST /api/admin/ai/prompt/optimize
Body: {
  actionType: "GENERATE_READING",
  feedback: "生成的阅读理解太难了",
  analysis: "内容难度过高...",
  originalPrompt: "..."
}
Response: { optimizedPrompt: "..." }

// 3. 测试提示词
POST /api/admin/ai/prompt/test
Body: {
  actionType: "GENERATE_READING",
  systemPrompt: "...",
  testInput: "测试输入"
}
Response: {
  success: true,
  response: "...",
  duration: 1234
}

// 4. 保存优化版本
PUT /api/admin/ai/prompt
Body: {
  promptKey: "READING_GEN_SYSTEM",
  content: "...",
  remark: "Rethink优化"
}
```

---

## 完整集成示例

```vue
<!-- AIGovernance.vue - 关键部分 -->
<script setup>
import Sparkline from '@/components/Sparkline.vue'
import RethinkSandbox from '@/components/RethinkSandbox.vue'
import { h } from 'vue'
import { FlaskConical } from 'lucide-vue-next'

// ... 现有代码 ...

// A/B 实验列定义(含 Sparklines)
const abtestColumns = computed(() => [
  { title: '实验名称', key: 'name' },
  {
    title: '耗时对比',
    key: 'latency',
    render: (row) => h('div', { class: 'flex gap-2 items-center' },
      h('div', { class: 'flex-1' },
        h('div', { class: 'text-[10px] text-zinc-500' }, 'A'),
        h(Sparkline, {
          data: row.groupALatency || [],
          color: '#6366f1',
          height: '24px',
          width: '100%'
        })
      ),
      h('div', { class: 'flex-1' },
        h('div', { class: 'text-[10px] text-zinc-500' }, 'B'),
        h(Sparkline, {
          data: row.groupBLatency || [],
          color: '#10b981',
          height: '24px',
          width: '100%'
        })
      )
    )
  },
  {
    title: '失败率对比',
    key: 'failure',
    render: (row) => h('div', { class: 'flex gap-2 items-center' },
      h('div', { class: 'flex-1' },
        h('div', { class: 'text-[10px] text-zinc-500' }, 'A'),
        h(Sparkline, {
          data: row.groupAFailureRate || [],
          color: '#f87171',
          height: '24px',
          width: '100%'
        })
      ),
      h('div', { class: 'flex-1' },
        h('div', { class: 'text-[10px] text-zinc-500' }, 'B'),
        h(Sparkline, {
          data: row.groupBFailureRate || [],
          color: '#10b981',
          height: '24px',
          width: '100%'
        })
      )
    )
  },
  { title: '操作', key: 'actions' }
])

// Rethink 沙箱
const showRethink = ref(false)
const selectedFeedback = ref(null)

const openRethink = (item) => {
  selectedFeedback.value = item
  showRethink.value = true
}
</script>

<template>
  <div class="ai-governance-page">
    <!-- ... 统计卡片和图表 ... -->

    <n-tabs v-model:value="activeTab">
      <!-- Feedback Loop 标签页 -->
      <n-tab-pane name="loop" tab="Feedback Loop">
        <!-- 移除 h-96 overflow-y-auto -->
        <div class="feedback-list">
          <n-card v-for="item in loopStats.list" :key="item.id">
            <div class="feedback-header">
              <!-- 现有内容 -->
            </div>

            <div class="feedback-actions">
              <n-button
                v-if="item.rating === -1 && !item.analysisResult"
                @click="handleAnalyzeFeedback(item)"
              >
                🤖 智能归因
              </n-button>

              <!-- Rethink 按钮 -->
              <n-button
                v-if="item.rating === -1 && item.analysisResult"
                type="success"
                ghost
                size="small"
                @click="openRethink(item)"
              >
                <template #icon><FlaskConical :size="14" /></template>
                Rethink 优化
              </n-button>
            </div>
          </n-card>
        </div>
      </n-tab-pane>

      <!-- A/B 实验标签页 -->
      <n-tab-pane name="abtest" tab="A/B 实验室">
        <n-data-table
          :columns="abtestColumns"
          :data="experimentList"
        />
      </n-tab-pane>
    </n-tabs>

    <!-- Rethink 沙箱组件 -->
    <rethink-sandbox
      v-model:show="showRethink"
      :feedback-item="selectedFeedback"
      @saved="handleRethinkSaved"
    />
  </div>
</template>

<style scoped>
.ai-governance-page {
  /* 不要固定高度,让整个页面可滚动 */
  padding: 24px;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* 不要 max-height */
}
</style>
```

---

## 效果预览

### A/B 实验表格增强
- ✅ 每行显示耗时趋势对比
- ✅ 每行显示失败率趋势对比
- ✅ 直观看出 A/B 组性能差异

### Rethink 沙箱
- ✅ 左侧显示错误详情和 AI 归因
- ✅ 右侧提供提示词优化工作台
- ✅ AI 生成优化建议
- ✅ 实时测试新提示词
- ✅ 变更对比显示
- ✅ 一键保存优化版本

### 页面滚动
- ✅ 只有一个滚动条(浏览器主滚动)
- ✅ 内容自然流动,无固定高度限制
- ✅ 更好的移动端体验

---

## 下一步

1. **后端接口**: 实现上述 API 接口
2. **测试**: 在开发环境测试 Rethink 流程
3. **文档**: 为管理员创建使用指南
4. **监控**: 添加优化效果追踪

这些增强将显著提升 AI 治理中心的智能化和易用性! 🚀
