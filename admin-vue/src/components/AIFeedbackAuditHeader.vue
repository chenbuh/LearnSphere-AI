<script setup>
import { MessageSquare } from 'lucide-vue-next'
import { NButton, NSelect, NSpace } from 'naive-ui'

defineProps({
  ratingFilter: {
    type: [Number, null],
    default: null
  },
  statusFilter: {
    type: Number,
    default: 0
  },
  ratingOptions: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:rating-filter', 'update:status-filter', 'refresh'])
</script>

<template>
  <header class="page-header">
    <div class="title-wrap">
      <div class="header-icon">
        <MessageSquare :size="24" />
      </div>
      <div class="title-copy">
        <span class="eyebrow">反馈审核</span>
        <h1>AI 反馈记录审核</h1>
        <p>查看用户提交的 AI 反馈记录，并处理评分和审核状态。</p>
        <div class="meta-row">
          <span class="meta-pill">待处理记录</span>
          <span class="meta-pill meta-pill--accent">内容与回复</span>
        </div>
      </div>
    </div>

    <div class="toolbar-shell">
      <div class="toolbar-copy">
        <strong>筛选审核范围</strong>
        <span>先按评分和处理状态缩小范围，再进入逐条审核和处理。</span>
      </div>
      <n-space class="toolbar" :wrap="true">
        <n-select
          :value="ratingFilter"
          :options="ratingOptions"
          style="width: 150px"
          @update:value="emit('update:rating-filter', $event)"
        />
        <n-select
          :value="statusFilter"
          :options="statusOptions"
          style="width: 150px"
          @update:value="emit('update:status-filter', $event)"
        />
        <n-button secondary @click="emit('refresh')">
          刷新
        </n-button>
      </n-space>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #78bbff;
  background: linear-gradient(135deg, rgba(92, 168, 255, 0.18), rgba(62, 207, 188, 0.12));
  border: 1px solid rgba(92, 168, 255, 0.2);
  box-shadow: 0 18px 36px rgba(2, 6, 23, 0.16);
}

.title-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7ee6d8;
}

.page-header h1 {
  margin: 0;
  font-size: 1.82rem;
  font-weight: 800;
  color: #f8fafc;
}

.page-header p {
  margin: 0;
  color: #94a3b8;
  max-width: 46ch;
  line-height: 1.55;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 600;
}

.meta-pill--accent {
  color: #7ee6d8;
  border-color: rgba(62, 207, 188, 0.22);
  background: rgba(62, 207, 188, 0.08);
}

.toolbar-shell {
  min-width: min(100%, 430px);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.44);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.toolbar-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toolbar-copy strong {
  font-size: 0.9rem;
  font-weight: 700;
  color: #e2e8f0;
}

.toolbar-copy span {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.5;
  max-width: 28ch;
}

.toolbar {
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .toolbar-shell {
    width: 100%;
    flex-direction: column;
  }
}
</style>
