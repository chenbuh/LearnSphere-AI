<script setup>
import { AlertTriangle, Bot, Sparkles } from 'lucide-vue-next'
import { NModal } from 'naive-ui'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  auditResult: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show'])
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="AI 内容质量深度审查报告"
    style="width: 600px; border-radius: 20px;"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="auditResult" class="audit-report">
      <div class="header-row">
        <div class="header-meta">
          <div class="audit-icon-wrap" :class="auditResult.qualityScore >= 80 ? 'pass' : 'fail'">
            <Bot :size="24" />
          </div>
          <div>
            <h4 class="score-title">审查评分：{{ auditResult.qualityScore }}/100</h4>
            <p class="score-hint">{{ auditResult.isPassed ? '✅ 质量达标，允许发布' : '⚠️ 建议优化后发布' }}</p>
          </div>
        </div>

        <div class="score-pill" :class="auditResult.qualityScore >= 80 ? 'pass' : 'fail'">
          {{ auditResult.qualityScore >= 80 ? 'HIGH QUALITY' : 'LOW QUALITY' }}
        </div>
      </div>

      <div class="section">
        <p class="section-title">
          <AlertTriangle :size="16" class="icon-warning" />
          检出问题
        </p>
        <ul class="issue-list">
          <li v-for="issue in auditResult.issues" :key="issue">{{ issue }}</li>
        </ul>
        <p v-if="!auditResult.issues?.length" class="empty-text">未检测到显著异常</p>
      </div>

      <div class="section">
        <p class="section-title">
          <Sparkles :size="16" class="icon-info" />
          AI 建议
        </p>
        <div class="suggestion-box">
          {{ auditResult.suggestion }}
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.audit-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audit-icon-wrap.pass {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.audit-icon-wrap.fail {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.score-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.score-hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgb(113, 113, 122);
}

.score-pill {
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
}

.score-pill.pass {
  background: #10b981;
  color: #fff;
}

.score-pill.fail {
  background: #ef4444;
  color: #fff;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 0.9rem;
  font-weight: 800;
  color: #fff;
}

.icon-warning {
  color: #f59e0b;
}

.icon-info {
  color: #818cf8;
}

.issue-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.issue-list li {
  padding: 6px 12px;
  margin-bottom: 6px;
  border-left: 3px solid #ef4444;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.05);
  font-size: 0.85rem;
  color: #fca5a5;
}

.empty-text {
  margin: 0;
  font-size: 0.875rem;
  font-style: italic;
  color: rgb(113, 113, 122);
}

.suggestion-box {
  padding: 16px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.05);
  font-size: 0.85rem;
  line-height: 1.6;
  color: #a5b4fc;
}
</style>
