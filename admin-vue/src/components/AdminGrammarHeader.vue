<script setup>
import { Plus } from 'lucide-vue-next'
import { NButton } from 'naive-ui'

defineEmits(['add'])
</script>

<template>
  <header class="page-header">
    <div>
      <h1>语法练习管理</h1>
      <p>管理各类语法知识点的练习题目</p>
    </div>
    <n-button type="primary" @click="$emit('add')">
      <template #icon>
        <Plus />
      </template>
      添加练习
    </n-button>
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin-bottom: 8px;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  font-size: 0.95rem;
  color: #71717a;
}
</style>
