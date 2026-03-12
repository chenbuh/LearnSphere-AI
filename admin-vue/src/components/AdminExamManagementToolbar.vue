<script setup>
import { NButton, NCard, NInput, NSpace } from 'naive-ui'
import { Search } from 'lucide-vue-next'

defineProps({
  selectedTab: {
    type: String,
    default: 'exams'
  },
  keyword: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:keyword', 'search'])
</script>

<template>
  <header class="page-header">
    <div>
      <h1>试卷与模考管理</h1>
      <p>查看系统内的 AI 模拟试卷及用户考试记录</p>
    </div>
  </header>

  <n-card v-if="selectedTab === 'exams'" class="search-card">
    <n-space align="center">
      <n-input
        :value="keyword"
        placeholder="搜索试卷标题..."
        style="width: 300px"
        @update:value="emit('update:keyword', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix>
          <Search :size="16" />
        </template>
      </n-input>
      <n-button type="primary" @click="emit('search')">搜索</n-button>
    </n-space>
  </n-card>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #71717a;
}

.search-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 16px;
}
</style>
