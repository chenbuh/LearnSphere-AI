<script setup>
import { computed } from 'vue'
import { NButton, NCard, NIcon, NModal, NTag } from 'naive-ui'
import { MessageCircle, Volume2 } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentDetailWord: {
    type: Object,
    default: null
  },
  isPlaceholderDefinition: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:show', 'play-audio', 'open-ai-tutor'])

const examples = computed(() => props.currentDetailWord?.examples || [])

// 避免释义与详细定义内容完全重复
const shouldShowDefinition = computed(() => {
  if (!props.currentDetailWord?.definition) return false
  if (props.isPlaceholderDefinition(props.currentDetailWord.definition)) return false
  const def = props.currentDetailWord.definition.trim()
  const mean = (props.currentDetailWord.meaning || '').trim()
  return def !== mean
})
</script>

<template>
  <n-modal
    :show="props.show"
    :trap-focus="true"
    :auto-focus="true"
    :close-on-esc="true"
    :mask-closable="true"
    @update:show="emit('update:show', $event)"
  >
    <n-card class="detail-modal-card" :bordered="false" role="dialog" aria-modal="true">
      <template #header>
        <div class="modal-header-wrap">
          <div class="modal-word-title">{{ props.currentDetailWord?.word }}</div>
          <button
            type="button"
            class="modal-sound-btn"
            title="朗读发音"
            @click="emit('play-audio', props.currentDetailWord?.word)"
          >
            <Volume2 :size="20" />
          </button>
        </div>
      </template>

      <div v-if="props.currentDetailWord" class="detail-content">
        <!-- 音标、分类、AI导师操作条 -->
        <div class="modal-meta">
          <span class="modal-phonetic">{{ props.currentDetailWord.phonetic }}</span>
          <span v-if="props.currentDetailWord.category" class="category-badge">
            {{ props.currentDetailWord.category }}
          </span>
          <n-button
            size="small"
            secondary
            type="primary"
            class="tutor-btn"
            @click="emit('open-ai-tutor')"
          >
            <template #icon><n-icon :component="MessageCircle" /></template>
            AI 导师精讲
          </n-button>
        </div>

        <!-- 核心释义 -->
        <div class="modal-section">
          <div class="section-tag">
            <span class="section-tag-dot"></span>
            释义 · MEANING
          </div>
          <div class="meaning-box">
            <p class="meaning-big">{{ props.currentDetailWord.meaning }}</p>
            <p v-if="shouldShowDefinition" class="definition-text">
              {{ props.currentDetailWord.definition }}
            </p>
          </div>
        </div>

        <!-- 例句展示 -->
        <div v-if="examples.length" class="modal-section">
          <div class="section-tag">
            <span class="section-tag-dot accent"></span>
            语境例句 · EXAMPLES
          </div>
          <div class="examples-list">
            <div v-for="(example, idx) in examples" :key="idx" class="example-item">
              <div class="ex-row">
                <p class="ex-en">{{ example.en }}</p>
                <button
                  type="button"
                  class="sound-icon-small"
                  title="朗读例句"
                  @click="emit('play-audio', example.en)"
                >
                  <Volume2 :size="16" />
                </button>
              </div>
              <p v-if="example.cn" class="ex-cn">{{ example.cn }}</p>
            </div>
          </div>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped>
.detail-modal-card {
  width: 540px;
  max-width: 92vw;
  /* R6：卡片底色跟随主题，避免浅色主题下深字压深底 */
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: var(--radius-lg);
  box-shadow:
    0 25px 60px -10px rgba(0, 0, 0, 0.75),
    0 0 0 1px rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

:deep(.detail-modal-card.n-card > .n-card-header) {
  padding: 22px 24px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

:deep(.detail-modal-card.n-card > .n-card__content) {
  padding: 18px 24px 26px;
}

.modal-header-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.modal-word-title {
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-color);
  line-height: 1.2;
}

.modal-sound-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(30, 107, 82, 0.35);
  /* R5：同色底透明度降到 0.10，浅色主题下文字才够 4.5:1 */
  background: rgba(30, 107, 82, 0.1);
  color: var(--tone-emerald);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-sound-btn:hover {
  background: var(--brand);
  color: var(--brand-ink);
  border-color: var(--brand);
  transform: scale(1.05);
}

.modal-sound-btn:active {
  transform: scale(0.95);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.modal-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.modal-phonetic {
  font-size: 1.12rem;
  color: var(--brand);
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-weight: 500;
  padding: 4px 10px;
  background: rgba(30, 107, 82, 0.1);
  border: 1px solid rgba(30, 107, 82, 0.2);
  border-radius: 8px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 9px;
  border-radius: 7px;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tutor-btn {
  margin-left: auto;
  border-radius: var(--radius-md);
  font-weight: 600;
}

.modal-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--secondary-text);
}

.section-tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
}

.section-tag-dot.accent {
  background: #1e6b52;
}

.meaning-box {
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.meaning-big {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.5;
  color: var(--text-color) !important;
  letter-spacing: 0.01em;
}

.definition-text {
  margin: 8px 0 0;
  font-size: 0.95rem;
  color: var(--secondary-text);
  line-height: 1.55;
  font-style: normal;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  padding-top: 8px;
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.example-item {
  /* R6：示例块同样是写死的深色底，改为主题表面色 */
  background: var(--surface-muted);
  border: 1px solid rgba(30, 107, 82, 0.2);
  border-left: 3px solid #5fa88b;
  padding: 14px 16px;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  transition: all 0.2s ease;
}

.example-item:hover {
  background: var(--brand-soft);
  border-color: rgba(30, 107, 82, 0.4);
  transform: translateX(2px);
}

.ex-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.ex-en {
  margin: 0 0 6px;
  font-size: 1.02rem;
  color: var(--text-color) !important;
  line-height: 1.55;
  font-weight: 500;
}

.sound-icon-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(30, 107, 82, 0.3);
  background: rgba(30, 107, 82, 0.1);
  color: var(--tone-emerald);
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s ease;
}

.sound-icon-small:hover {
  background: var(--brand);
  color: var(--brand-ink);
  border-color: var(--brand);
  transform: scale(1.1);
}

.sound-icon-small:active {
  transform: scale(0.9);
}

.ex-cn {
  margin: 0;
  font-size: 0.9rem;
  color: var(--secondary-text);
  line-height: 1.5;
}

/* 浅色模式适配 */
html[data-theme='light'] .detail-modal-card {
  border: 1px solid rgba(148, 163, 184, 0.2) !important;
}

html[data-theme='light'] :deep(.detail-modal-card.n-card > .n-card-header) {
  border-bottom-color: rgba(148, 163, 184, 0.15);
}

html[data-theme='light'] .modal-word-title {
  color: var(--text-color);
}

html[data-theme='light'] .meaning-box {
  background: var(--surface-muted);
  border-color: rgba(203, 213, 225, 0.8);
}

html[data-theme='light'] .meaning-big {
  color: var(--text-color) !important;
}

html[data-theme='light'] .definition-text {
  border-top-color: rgba(203, 213, 225, 0.8);
}

html[data-theme='light'] .example-item {
  background: var(--surface-muted);
  border-color: rgba(30, 107, 82, 0.25);
  border-left: 3px solid var(--brand);
}

html[data-theme='light'] .example-item:hover {
  background: var(--brand-soft);
}

html[data-theme='light'] .ex-en {
  color: var(--text-color) !important;
}

html[data-theme='light'] .ex-cn {
  color: var(--secondary-text);
}

html[data-theme='light'] .category-badge {
  background: var(--surface-muted);
  border-color: rgba(203, 213, 225, 0.8);
}
</style>
