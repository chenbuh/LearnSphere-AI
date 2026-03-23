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
    <div class="heading-copy">
      <span class="eyebrow">试卷管理</span>
      <h1>试卷与模考管理</h1>
      <p>查看试卷结构、参与情况和考试记录。</p>
      <div class="heading-meta">
        <span class="meta-pill">{{ selectedTab === 'exams' ? '当前视图 试卷列表' : '当前视图 考试记录' }}</span>
      </div>
    </div>
  </header>

  <n-card v-if="selectedTab === 'exams'" class="search-card">
    <div class="card-intro">
      <div>
        <span class="card-label">试卷检索</span>
        <p>按标题定位试卷，再进入详情核对题型结构和参考内容。</p>
      </div>
    </div>
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
  margin: 0;
  color: #f7fbff;
  letter-spacing: -0.04em;
}

.page-header p {
  color: #8ea1ba;
  margin: 0;
}

.heading-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #c7d3e3;
  font-size: 0.8rem;
  font-weight: 600;
}

.search-card {
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.92), rgba(10, 16, 26, 0.82));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
  margin-bottom: 16px;
}

.card-intro {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.card-label {
  display: inline-block;
  margin-bottom: 6px;
  color: #f7fbff;
  font-size: 0.85rem;
  font-weight: 700;
}

.card-intro p {
  margin: 0;
  color: #8ea1ba;
  font-size: 0.88rem;
}
</style>
