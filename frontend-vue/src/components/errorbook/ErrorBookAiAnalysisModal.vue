<script setup>
/**
 * 错题 AI 深挖弹窗。
 *
 * 从 ErrorBookView 抽出：该弹窗只在用户点击「AI 深挖」后出现，
 * 属于低频内容，没必要占用错题本首屏的解析与渲染成本。
 *
 * 数据流：分析结果由父页面传入，组件不发起请求，
 * 父页面仍是唯一的数据编排入口。可见性通过 v-model:show 双向绑定。
 *
 * 样式注意事项：原样式依赖全局 CSS 变量（--text-color、--tone-emerald 等，
 * 定义在 style.css / fluid-adaptive.css）与明暗主题选择器
 * `:global(html[data-theme='light'] ...)`。这些已原样搬迁，
 * 若改动需同步验证深色与浅色两套主题。
 */
import { NButton, NModal } from 'naive-ui'
import { BrainCircuit, Lightbulb, BookOpen } from 'lucide-vue-next'

defineProps({
  /** 弹窗可见性，配合 v-model:show 使用 */
  show: {
    type: Boolean,
    default: false
  },
  /** AI 分析结果；为空时不渲染内容区，避免出现空白弹窗 */
  result: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show'])

const close = () => {
  emit('update:show', false)
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    style="width: min(760px, calc(100vw - 24px)); border-radius: 28px"
    :bordered="false"
    class="ai-analysis-modal"
    @update:show="emit('update:show', $event)"
  >
    <template #header>
      <div class="ai-modal-header">
        <div class="title-main">
          <BrainCircuit :size="22" />
          <span>AI 错因深挖</span>
        </div>
        <div class="modal-status-badge">
          <span class="pulse-dot"></span>
          ANALYSIS READY
        </div>
      </div>
    </template>

    <div v-if="result" class="ai-analysis-container">
      <section class="analysis-segment">
        <div class="segment-label">
          <Lightbulb :size="14" />
          错因判断
        </div>
        <div class="analysis-box">
          <p class="analysis-text">{{ result.analysis }}</p>
        </div>
      </section>

      <section class="analysis-segment">
        <div class="segment-label amber">
          <BookOpen :size="14" />
          知识补强
        </div>
        <div class="analysis-box warm">
          <p class="analysis-text warm-text">{{ result.knowledgeShield }}</p>
        </div>
      </section>

      <section v-if="result.challengeQuestion?.text" class="analysis-segment">
        <div class="segment-label emerald">
          <BrainCircuit :size="14" />
          即时追问
        </div>
        <div class="challenge-shell">
          <h4>{{ result.challengeQuestion.text }}</h4>
          <div v-if="result.challengeQuestion.options?.length" class="challenge-options">
            <div
              v-for="(option, index) in result.challengeQuestion.options"
              :key="`challenge-${index}`"
              class="challenge-option"
            >
              <span>{{ String.fromCharCode(65 + index) }}</span>
              <p>{{ option }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="ai-modal-footer">
        <div v-if="result?.points" class="points-earned">
          奖励积分 <strong>+{{ result.points }}</strong>
        </div>
        <n-button type="primary" round @click="close"> 收下分析，继续复盘 </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
/* ===== 原样搬迁自 ErrorBookView.vue，保持视觉不变 ===== */

:global(html[data-theme='light'] .ai-analysis-modal .n-card) {
  border-color: rgba(203, 213, 225, 0.8) !important;
}

.ai-modal-header,
.ai-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.title-main {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-color);
}

:global(html[data-theme='light'] .title-main) {
  color: var(--text-color);
}

.modal-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(30, 107, 82, 0.14);
  border: 1px solid rgba(30, 107, 82, 0.28);
  font-size: 11px;
  font-weight: 750;
  color: var(--tone-emerald);
  letter-spacing: 0.06em;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #5fa88b;
  animation: pulse-radar 2s infinite;
}

.ai-analysis-container {
  display: grid;
  gap: 16px;
}

.analysis-segment {
  display: grid;
  gap: 10px;
}

.segment-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  color: var(--tone-emerald);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.segment-label.amber {
  color: var(--tone-amber);
}

:global(html[data-theme='light'] .segment-label.amber) {
  color: var(--tone-amber);
}

.segment-label.emerald {
  color: var(--tone-emerald);
}

:global(html[data-theme='light'] .segment-label.emerald) {
  color: var(--tone-emerald);
}

.analysis-box {
  padding: 20px 22px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:global(html[data-theme='light'] .analysis-box) {
  background: rgba(248, 250, 252, 0.85);
  border-color: rgba(226, 232, 240, 0.8);
}

.analysis-box.warm {
  background: var(--card-bg);
  border-color: rgba(245, 158, 11, 0.25);
}

:global(html[data-theme='light'] .analysis-box.warm) {
  border-color: rgba(245, 158, 11, 0.3);
}

.analysis-text {
  margin: 0;
  color: var(--text-color);
  line-height: 1.8;
  white-space: pre-line;
  font-size: 14px;
}

:global(html[data-theme='light'] .analysis-text) {
  color: var(--text-color);
}

.challenge-shell {
  padding: 20px 22px;
  border-radius: var(--radius-lg);
  background: transparent;
  border: 1px solid rgba(52, 211, 153, 0.25);
}

.challenge-shell h4 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.6;
  color: var(--text-color);
}

:global(html[data-theme='light'] .challenge-shell h4) {
  color: var(--text-color);
}

.challenge-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.challenge-option {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
  padding: 13px 16px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

:global(html[data-theme='light'] .challenge-option) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(226, 232, 240, 0.9);
}

.challenge-option:hover {
  border-color: rgba(52, 211, 153, 0.4);
  background: rgba(16, 185, 129, 0.08);
}

.challenge-option span {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--tone-emerald-soft);
  color: var(--tone-emerald);
  font-weight: 800;
  font-size: 12px;
}

.challenge-option p {
  margin: 0;
  line-height: 1.6;
  font-size: 13.5px;
  color: var(--text-color);
}

:global(html[data-theme='light'] .challenge-option p) {
  color: var(--text-color);
}

.points-earned {
  color: var(--error-muted);
  font-size: 13px;
  font-weight: 600;
}

.points-earned strong {
  color: var(--tone-amber);
  font-weight: 800;
}

@keyframes pulse-radar {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.35;
    transform: scale(1.55);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 移动端：与父页面媒体查询保持一致 */
@media (max-width: 768px) {
  .ai-modal-header,
  .ai-modal-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .challenge-options {
    grid-template-columns: 1fr;
  }
}
</style>
