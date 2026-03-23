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
    <div class="heading-copy">
      <span class="eyebrow">学习数据</span>
      <h1>学习记录</h1>
      <p>查看学习记录、内容类型分布和成绩明细。</p>
      <span class="meta-pill">按内容类型筛选</span>
    </div>
  </header>

  <n-card class="filter-card">
    <div class="filter-row">
      <div class="filter-copy">
        <span>内容筛选</span>
        <p>按内容类型切换记录列表与统计结果。</p>
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
  margin-bottom: 18px;
}

.heading-copy {
  display: grid;
  gap: 8px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(62, 207, 188, 0.12);
  color: #8fe7dc;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.page-header h1 {
  font-size: 2.1rem;
  font-weight: 800;
  color: #f7fbff;
  letter-spacing: -0.04em;
  margin: 0;
}

.page-header p {
  color: #8ea1ba;
  font-size: 0.95rem;
  margin: 0;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #c7d3e3;
  font-size: 0.8rem;
  font-weight: 600;
}

.filter-card {
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.92), rgba(10, 16, 26, 0.82));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
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
  color: #f7fbff;
  font-weight: 700;
  margin-bottom: 4px;
}

.filter-copy p {
  margin: 0;
  color: #8ea1ba;
  font-size: 0.9rem;
}
</style>
