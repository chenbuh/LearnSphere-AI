<script setup>
import { computed } from 'vue'
import { NButton, NCard, NModal, NTag } from 'naive-ui'
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
    <n-card
      style="width: 500px; max-width: 90vw;"
      :title="props.currentDetailWord?.word"
      :bordered="false"
      role="dialog"
      aria-modal="true"
      class="detail-modal-card"
    >
      <template #header-extra>
        <div class="modal-sound" @click="emit('play-audio', props.currentDetailWord?.word)">
          <Volume2 :size="24" />
        </div>
      </template>

      <div v-if="props.currentDetailWord" class="detail-content">
        <div class="modal-meta">
          <span class="modal-phonetic">{{ props.currentDetailWord.phonetic }}</span>
          <n-tag type="info" size="small">{{ props.currentDetailWord.category }}</n-tag>
          <n-button size="tiny" secondary type="primary" @click="emit('open-ai-tutor')" class="ml-auto" style="margin-left: auto;">
            <template #icon><n-icon :component="MessageCircle" /></template>
            AI Tutor
          </n-button>
        </div>

        <div class="modal-section">
          <h4>Meaning</h4>
          <p class="meaning-big">{{ props.currentDetailWord.meaning }}</p>
          <p v-if="props.currentDetailWord.definition && !props.isPlaceholderDefinition(props.currentDetailWord.definition)" class="definition-text">
            {{ props.currentDetailWord.definition }}
          </p>
        </div>

        <div class="modal-section">
          <h4>Examples</h4>
          <div v-for="(example, idx) in examples" :key="idx" class="example-item">
            <div class="ex-row">
              <p class="ex-en">{{ example.en }}</p>
              <div class="sound-icon-small" @click="emit('play-audio', example.en)">
                <Volume2 :size="16" />
              </div>
            </div>
            <p v-if="example.cn" class="ex-cn">{{ example.cn }}</p>
          </div>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped>
.detail-modal-card {
  background: #fff;
}

:global(.dark-mode) .detail-modal-card {
  background: #1e1e23;
}

.modal-sound {
  color: #6366f1;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-sound:hover {
  color: #818cf8;
}

.detail-content {
  margin-top: 16px;
}

.modal-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.modal-phonetic {
  font-size: 1.25rem;
  color: #6366f1;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

:global(.dark-mode) .modal-phonetic {
  color: #c7d2fe;
}

.modal-section {
  margin-bottom: 32px;
}

.modal-section h4 {
  font-size: 0.8rem;
  color: #71717a;
  text-transform: uppercase;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

:global(.dark-mode) .modal-section h4 {
  color: #a1a1aa;
}

.meaning-big {
  font-size: 1.5rem;
  color: #18181b;
  font-weight: 600;
  line-height: 1.4;
}

:global(.dark-mode) .meaning-big {
  color: #fafafa;
}

.definition-text {
  font-size: 1rem;
  color: #52525b;
  font-style: italic;
  margin-top: 8px;
  line-height: 1.6;
}

:global(.dark-mode) .definition-text {
  color: #d4d4d8;
}

.example-item {
  background: rgba(99, 102, 241, 0.05);
  border-left: 3px solid #6366f1;
  padding: 14px 18px;
  border-radius: 0 12px 12px 0;
  margin-bottom: 12px;
}

:global(.dark-mode) .example-item {
  background: rgba(99, 102, 241, 0.08);
  border-left-color: #818cf8;
}

.ex-en {
  font-size: 1.05rem;
  color: #18181b;
  margin-bottom: 6px;
  line-height: 1.6;
  font-weight: 500;
}

:global(.dark-mode) .ex-en {
  color: #f4f4f5;
}

.ex-cn {
  font-size: 0.9rem;
  color: #52525b;
  line-height: 1.5;
}

:global(.dark-mode) .ex-cn {
  color: #d4d4d8;
}

.ex-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.sound-icon-small {
  color: #6366f1;
  cursor: pointer;
  background: rgba(99, 102, 241, 0.1);
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: -2px;
}

.sound-icon-small:hover {
  background: #6366f1;
  color: #fff;
}

.sound-icon-small:active {
  transform: scale(0.8);
  transition: transform 0.1s;
}

:deep(.n-modal-container) {
  backdrop-filter: blur(4px);
}
</style>
