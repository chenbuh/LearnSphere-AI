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
      <div class="summary-panel">
        <div class="summary-copy">
          <div class="summary-eyebrow">审查摘要</div>
          <div class="header-meta">
            <div class="audit-icon-wrap" :class="auditResult.qualityScore >= 80 ? 'pass' : 'fail'">
              <Bot :size="24" />
            </div>
            <div>
              <h4 class="score-title">审查评分：{{ auditResult.qualityScore }}/100</h4>
              <p class="score-hint">{{ auditResult.isPassed ? '质量达标，可继续发布流程' : '存在质量风险，建议调整后再发布' }}</p>
            </div>
          </div>
        </div>

        <div class="summary-metrics">
          <div class="score-pill" :class="auditResult.qualityScore >= 80 ? 'pass' : 'fail'">
            {{ auditResult.isPassed ? '通过' : '待优化' }}
          </div>
          <div class="metric-item">
            <span>问题数</span>
            <strong>{{ auditResult.issues?.length || 0 }}</strong>
          </div>
        </div>
      </div>

      <div class="section">
        <p class="section-title">
          <AlertTriangle :size="16" class="icon-warning" />
          风险与问题
        </p>
        <p class="section-hint">先看检出项，再判断是否需要人工复核或重新生成内容。</p>
        <ul class="issue-list">
          <li v-for="issue in auditResult.issues" :key="issue">{{ issue }}</li>
        </ul>
        <p v-if="!auditResult.issues?.length" class="empty-text">未检测到显著异常</p>
      </div>

      <div class="section">
        <p class="section-title">
          <Sparkles :size="16" class="icon-info" />
          处理建议
        </p>
        <p class="section-hint">这里保留 AI 给出的后续动作建议，便于编辑和审核继续处理。</p>
        <div class="suggestion-box">
          {{ auditResult.suggestion }}
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.summary-panel {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 24px;
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.5));
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.summary-copy {
  display: grid;
  gap: 12px;
}

.summary-eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.summary-metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
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
  color: #f8fafc;
}

.score-hint {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #cbd5e1;
}

.score-pill {
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
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

.metric-item {
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.12);
  min-width: 120px;
  display: grid;
  gap: 4px;
}

.metric-item span {
  font-size: 12px;
  color: #94a3b8;
}

.metric-item strong {
  font-size: 18px;
  color: #f8fafc;
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

.section-hint {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #a1a1aa;
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
  padding: 8px 12px;
  margin-bottom: 8px;
  border-left: 3px solid #ef4444;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.08);
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
  border: 1px solid rgba(59, 130, 246, 0.14);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.5);
  font-size: 0.9rem;
  line-height: 1.6;
  color: #dbeafe;
}

@media (max-width: 640px) {
  .summary-panel {
    flex-direction: column;
  }

  .summary-metrics {
    align-items: flex-start;
  }
}
</style>
