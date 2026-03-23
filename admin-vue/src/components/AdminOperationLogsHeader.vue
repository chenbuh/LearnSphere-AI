<script setup>
import { NButton, NIcon, NInput, NSpace } from 'naive-ui'
import { FileClock, RefreshCw, Search } from 'lucide-vue-next'

defineProps({
  keyword: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:keyword', 'search', 'refresh'])
</script>

<template>
  <header class="page-header">
    <div class="title-group">
      <div class="header-icon">
        <FileClock :size="24" />
      </div>
      <div class="title-copy">
        <span class="eyebrow">操作审计</span>
        <h1>管理员操作日志</h1>
        <p>记录系统关键操作、执行状态与最近变更轨迹。</p>
        <div class="meta-row">
          <span class="meta-pill">操作留痕</span>
          <span class="meta-pill meta-pill--accent">异常定位</span>
        </div>
      </div>
    </div>

    <div class="toolbar-shell">
      <div class="toolbar-copy">
        <strong>检索审计记录</strong>
        <span>支持按用户名、动作和模块聚焦异常操作，适合回溯最近变更。</span>
      </div>

      <n-space class="toolbar" :wrap="true">
        <n-input
          :value="keyword"
          placeholder="搜索用户名 / 动作 / 模块"
          clearable
          style="width: 320px"
          @update:value="emit('update:keyword', $event)"
          @keyup.enter="emit('search')"
        >
          <template #prefix>
            <n-icon :component="Search" />
          </template>
        </n-input>

        <n-button type="primary" @click="emit('search')">
          <template #icon>
            <Search :size="16" />
          </template>
          搜索
        </n-button>

        <n-button secondary :loading="loading" @click="emit('refresh')">
          <template #icon>
            <RefreshCw :size="16" />
          </template>
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

.title-group {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #78bbff;
  background: linear-gradient(135deg, rgba(92, 168, 255, 0.18), rgba(62, 207, 188, 0.1));
  border: 1px solid rgba(92, 168, 255, 0.18);
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
  font-size: 1.9rem;
  font-weight: 800;
  color: #f8fafc;
}

.page-header p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.95rem;
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
  min-width: min(100%, 460px);
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.44);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.toolbar-copy {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toolbar-copy strong {
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 700;
}

.toolbar-copy span {
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.5;
}

.toolbar {
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .toolbar-shell {
    width: 100%;
  }
}
</style>
