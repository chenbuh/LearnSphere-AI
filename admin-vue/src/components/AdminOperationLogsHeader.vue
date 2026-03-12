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
        <FileClock :size="28" />
      </div>
      <div>
        <h1>管理员操作日志</h1>
        <p>记录系统关键操作、执行状态与最近变更轨迹</p>
      </div>
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
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.24), rgba(37, 99, 235, 0.08));
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.18);
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: #f8fafc;
}

.page-header p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.95rem;
}

.toolbar {
  justify-content: flex-end;
}
</style>
