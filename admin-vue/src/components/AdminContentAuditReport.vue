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
    style="width: 600px; border-radius: var(--r-lg)"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="auditResult" class="audit-report">
      <div class="summary-panel">
        <div class="summary-copy">
          <div class="header-meta">
            <div class="audit-icon-wrap" :class="auditResult.qualityScore >= 80 ? 'pass' : 'fail'">
              <Bot :size="24" />
            </div>
            <div>
              <h4 class="score-title">审查评分：{{ auditResult.qualityScore }}/100</h4>
              <p class="score-hint">
                {{
                  auditResult.isPassed
                    ? '质量达标，可继续发布流程'
                    : '存在质量风险，建议调整后再发布'
                }}
              </p>
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
  border-radius: var(--r-lg);
  background: var(--paper-sunken);
}

.summary-copy {
  display: grid;
  gap: 12px;
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
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.audit-icon-wrap.pass {
  background: var(--ok-soft);
  color: var(--ok);
}

.audit-icon-wrap.fail {
  background: var(--danger-soft);
  color: var(--danger);
}

.score-title {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.score-hint {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink-2);
}

.score-pill {
  padding: 4px 10px;
  border-radius: var(--r-sm);
  font-size: 12px;
  font-weight: 600;
}

.score-pill.pass {
  background: var(--ok-soft);
  color: var(--ok);
}

.score-pill.fail {
  background: var(--danger-soft);
  color: var(--danger);
}

.metric-item {
  padding: 12px 14px;
  border-radius: var(--r-md);
  background: var(--surface);
  border: 1px solid var(--line);
  min-width: 120px;
  display: grid;
  gap: 4px;
}

.metric-item span {
  font-size: 12px;
  color: var(--ink-3);
}

.metric-item strong {
  font-size: 18px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
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
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}

.icon-warning {
  color: var(--warn);
}

.icon-info {
  color: var(--accent);
}

.issue-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.issue-list li {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-left: 3px solid var(--danger);
  border-radius: var(--r-sm);
  background: var(--danger-soft);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--ink);
}

.empty-text {
  margin: 0;
  font-size: 0.875rem;
  font-style: italic;
  color: var(--ink-3);
}

.suggestion-box {
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--surface);
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--ink);
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
