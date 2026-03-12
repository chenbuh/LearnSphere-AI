<script setup>
import { computed } from 'vue'
import { NCard, NGrid, NGridItem, NDivider, NSpace, NButton, NIcon } from 'naive-ui'
import { Trophy, Share2 } from 'lucide-vue-next'

const props = defineProps({
  examResult: {
    type: Object,
    required: true
  }
})

defineEmits(['back-list', 'review', 'share'])

const spentMinutes = computed(() => Math.floor((props.examResult?.timeSpent || 0) / 60))
</script>

<template>
  <div class="result-view">
    <n-card class="result-card" :bordered="false">
      <template #header>
        <div class="score-header">
          <Trophy :size="80" color="#f59e0b" />
          <h2>考试成绩报告</h2>
        </div>
      </template>

      <div class="score-circle-container">
        <div class="score-circle">
          <div class="score-val">{{ examResult.score }}</div>
          <div class="score-unit">TOTAL SCORE</div>
        </div>
      </div>

      <n-grid cols="3" x-gap="20" class="stat-summary">
        <n-grid-item>
          <div class="stat-box">
            <div class="v success">{{ examResult.correctCount }}</div>
            <div class="l">正确题目</div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="stat-box">
            <div class="v error">{{ examResult.totalCount - examResult.correctCount }}</div>
            <div class="l">错误题目</div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="stat-box">
            <div class="v">{{ spentMinutes }}m</div>
            <div class="l">所用时间</div>
          </div>
        </n-grid-item>
      </n-grid>

      <n-divider />

      <div class="result-actions">
        <n-space justify="center" vertical :size="12">
          <n-space justify="center">
            <n-button type="primary" color="#6366f1" size="large" round @click="$emit('back-list')">
              返回列表
            </n-button>
            <n-button secondary size="large" round @click="$emit('review')">
              详细解析
            </n-button>
          </n-space>
          <n-button secondary size="large" round class="share-btn" @click="$emit('share')">
            <template #icon>
              <n-icon :component="Share2" />
            </template>
            分享考试成绩
          </n-button>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.result-view {
  max-width: 600px;
  margin: 0 auto;
}

.result-card {
  background: #18181b;
  border-radius: 32px;
  padding: 40px;
  text-align: center;
}

.score-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.score-header h2 {
  font-size: 2rem;
  color: #fff;
}

.score-circle-container {
  margin: 40px 0;
  display: flex;
  justify-content: center;
}

.score-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 8px solid #6366f1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.2);
}

.score-val {
  font-size: 5rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.score-unit {
  color: #71717a;
  font-size: 0.8rem;
  letter-spacing: 2px;
}

.stat-summary {
  margin-bottom: 40px;
}

.stat-box {
  background: rgba(255,255,255,0.03);
  padding: 20px;
  border-radius: 16px;
}

.stat-box .v {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.stat-box .v.success {
  color: #10b981;
}

.stat-box .v.error {
  color: #ef4444;
}

.stat-box .l {
  font-size: 0.8rem;
  color: #71717a;
}

@media (max-width: 768px) {
  .score-circle {
    width: 160px;
    height: 160px;
  }

  .score-val {
    font-size: 3.5rem;
  }

  .result-card {
    padding: 24px 16px;
  }

  .stat-summary {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
}
</style>
