<script setup>
import { NCard, NSelect, NSpace } from 'naive-ui'

defineProps({
  contentType: {
    type: [String, null],
    default: null
  },
  contentTypeOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:content-type'])
</script>

<template>
  <header class="page-header">
    <div>
      <h1>学习记录</h1>
      <p>查看用户学习数据统计与内容类型分布</p>
    </div>
  </header>

  <n-card class="filter-card">
    <div class="filter-row">
      <div class="filter-copy">
        <span>内容筛选</span>
        <p>按练习内容类型快速切换学习记录视图</p>
      </div>
      <n-space align="center">
        <n-select
          :value="contentType"
          :options="contentTypeOptions"
          placeholder="内容类型"
          style="width: 180px"
          @update:value="emit('update:content-type', $event)"
        />
      </n-space>
    </div>
  </n-card>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #71717a;
  font-size: 0.95rem;
}

.filter-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 24px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-copy span {
  display: block;
  color: #e4e4e7;
  font-weight: 700;
  margin-bottom: 4px;
}

.filter-copy p {
  margin: 0;
  color: #71717a;
  font-size: 0.9rem;
}
</style>
