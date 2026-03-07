<script setup>
import { computed } from 'vue'
import { NButton, NProgress, NSelect, NSpin, NTag } from 'naive-ui'
import { Brain, Check, MessageCircle, Trophy, Volume2, X, Zap } from 'lucide-vue-next'

const props = defineProps({
  selectedExam: {
    type: String,
    default: 'cet4'
  },
  examOptions: {
    type: Array,
    default: () => []
  },
  sessionWords: {
    type: Array,
    default: () => []
  },
  sessionIndex: {
    type: Number,
    default: 0
  },
  isFlipped: {
    type: Boolean,
    default: false
  },
  sessionComplete: {
    type: Boolean,
    default: false
  },
  sessionStats: {
    type: Object,
    default: () => ({ correct: 0, wrong: 0 })
  },
  currentLearnWord: {
    type: Object,
    default: null
  },
  mnemonicText: {
    type: String,
    default: ''
  },
  mnemonicLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:selected-exam',
  'start-session',
  'flip-card',
  'play-audio',
  'get-mnemonic',
  'open-ai-tutor',
  'handle-result'
])

const progressPercentage = computed(() => {
  if (!props.sessionWords.length) return 0
  return (props.sessionIndex / props.sessionWords.length) * 100
})

const primaryExample = computed(() => {
  return props.currentLearnWord?.examples?.[0] || null
})
</script>

<template>
  <div class="learn-container">
    <div v-if="props.sessionWords.length === 0 && !props.sessionComplete" class="start-session-view animate-zoom-in">
      <div class="brain-icon-wrapper pulse-animation">
        <Brain :size="80" />
      </div>
      <h2>Ready to start learning</h2>
      <p>We will prepare 15 words for {{ props.selectedExam }}, including new and review words.</p>
      <div class="start-actions">
        <n-select :value="props.selectedExam" :options="props.examOptions" class="exam-select-learn" @update:value="emit('update:selected-exam', $event)" />
        <n-button type="primary" size="large" class="active-shrink" @click="emit('start-session')">Start Session</n-button>
      </div>
    </div>

    <div v-else-if="!props.sessionComplete" class="learning-view">
      <div class="learn-header">
        <span>Word {{ props.sessionIndex + 1 }} / {{ props.sessionWords.length }}</span>
        <span>Exam: {{ props.selectedExam }}</span>
      </div>
      <n-progress type="line" :percentage="progressPercentage" :show-indicator="false" processing color="#6366f1" class="progress-bar" />

      <div class="flashcard-scene" @click="emit('flip-card')">
        <div class="flashcard-cube" :class="{ 'is-flipped': props.isFlipped }">
          <div class="card-face front">
            <h2 class="word-text">{{ props.currentLearnWord?.word }}</h2>
            <div class="phonetic-box">
              <span class="phonetic-text">{{ props.currentLearnWord?.phonetic }}</span>
              <div class="sound-icon" @click.stop="emit('play-audio', props.currentLearnWord?.word)">
                <Volume2 :size="20" />
              </div>
            </div>
            <p class="hint-text">Tap to flip this card</p>
          </div>

          <div class="card-face back">
            <div class="card-glow-overlay"></div>
            <div class="top-accent"></div>
            <div class="tags-row">
              <n-tag :type="props.currentLearnWord?.difficulty > 3 ? 'warning' : 'success'" size="small" round ghost>
                {{ props.currentLearnWord?.category }}
              </n-tag>
            </div>
            <h3 class="meaning-text secure-content">{{ props.currentLearnWord?.meaning }}</h3>

            <div v-if="props.mnemonicText || props.mnemonicLoading" class="mnemonic-section">
              <div class="mnemonic-box">
                <div v-if="props.mnemonicLoading" class="flex items-center gap-2 text-indigo-400">
                  <n-spin size="small" /> <span>AI is generating mnemonic...</span>
                </div>
                <div v-else class="mnemonic-content secure-content">
                  {{ props.mnemonicText }}
                </div>
              </div>
            </div>
            <n-button v-else quaternary size="tiny" class="ai-hint-btn" @click.stop="emit('get-mnemonic')">
              <template #icon><Zap :size="14" /></template>
              Generate AI Mnemonic
            </n-button>

            <n-button quaternary size="tiny" class="ai-tutor-btn-inline mt-1" @click.stop="emit('open-ai-tutor')">
              <template #icon><n-icon :component="MessageCircle" :size="14" /></template>
              Ask AI Tutor
            </n-button>

            <div v-if="primaryExample" class="example-box-premium secure-content">
              <div class="ex-row">
                <p class="en-sent">"{{ primaryExample.en }}"</p>
                <div class="sound-icon-small" @click.stop="emit('play-audio', primaryExample.en)">
                  <Volume2 :size="18" />
                </div>
              </div>
              <p class="cn-sent">{{ primaryExample.cn }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="learn-controls">
        <template v-if="props.isFlipped">
          <n-button circle color="#ef4444" size="large" class="control-btn active-shrink feedback-wrong" @click="emit('handle-result', false)">
            <template #icon><X /></template>
          </n-button>
          <n-button circle color="#22c55e" size="large" class="control-btn active-shrink feedback-correct" @click="emit('handle-result', true)">
            <template #icon><Check /></template>
          </n-button>
        </template>
        <div v-else class="thinking-text">Flip to answer...</div>
      </div>
    </div>

    <div v-else class="complete-view animate-zoom-in">
      <div class="trophy-wrapper trophy-bounce">
        <Trophy class="trophy-icon" />
      </div>
      <h2 class="title-gradient">Session Complete</h2>
      <p>This session learned {{ props.sessionStats.correct }} new words, with {{ props.sessionStats.wrong }} to review.</p>

      <div class="result-stats-row">
        <div class="stat-box">
          <div class="val green">{{ props.sessionStats.correct }}</div>
          <div class="lbl">Correct</div>
        </div>
        <div class="stat-box">
          <div class="val red">{{ props.sessionStats.wrong }}</div>
          <div class="lbl">Need review</div>
        </div>
      </div>

      <n-button type="primary" size="large" @click="emit('start-session')">Start another set</n-button>
    </div>
  </div>
</template>

<style scoped>
.learn-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 400px;
}

.start-session-view {
  text-align: center;
}

.brain-icon-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
}

.start-session-view h2 {
  font-size: 1.8rem;
  color: #18181b;
  margin-bottom: 12px;
}

:global(.dark-mode) .start-session-view h2 {
  color: #fff;
}

.start-session-view p {
  color: #52525b;
  margin-bottom: 32px;
  max-width: 400px;
}

:global(.dark-mode) .start-session-view p {
  color: #a1a1aa;
}

.start-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.exam-select-learn {
  width: 160px;
  text-align: left;
}

.learning-view {
  width: 100%;
  max-width: 600px;
  perspective: 1000px;
}

.learn-header {
  display: flex;
  justify-content: space-between;
  color: #52525b;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

:global(.dark-mode) .learn-header {
  color: #a1a1aa;
}

.progress-bar {
  margin-bottom: 32px;
}

.flashcard-scene {
  width: 100%;
  height: 360px;
  cursor: pointer;
}

.flashcard-cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flashcard-cube.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 32px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

:global(.dark-mode) .card-face {
  background: #111115;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

.card-glow-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 120%, rgba(99, 102, 241, 0.15), transparent 70%);
  pointer-events: none;
}

.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(to right, #6366f1, #a855f7);
}

.card-face.back {
  transform: rotateY(180deg);
  border-color: rgba(99, 102, 241, 0.3);
}

.word-text {
  font-size: 3rem;
  font-weight: 800;
  color: #18181b;
  margin-bottom: 24px;
}

:global(.dark-mode) .word-text {
  color: #fff;
}

.phonetic-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.05);
  padding: 8px 16px;
  border-radius: 99px;
  margin-bottom: 40px;
}

:global(.dark-mode) .phonetic-box {
  background: rgba(255, 255, 255, 0.05);
}

.phonetic-text {
  font-size: 1.2rem;
  color: #6366f1;
  font-family: monospace;
}

:global(.dark-mode) .phonetic-text {
  color: #818cf8;
}

.sound-icon {
  color: #6366f1;
  cursor: pointer;
  display: flex;
}

.hint-text {
  color: #71717a;
  font-size: 0.9rem;
}

:global(.dark-mode) .hint-text {
  color: #52525b;
}

.meaning-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: #18181b;
  margin: 16px 0 24px;
  text-align: center;
}

:global(.dark-mode) .meaning-text {
  color: #fff;
}

.mnemonic-section {
  width: 100%;
  margin-bottom: 24px;
}

.mnemonic-box {
  background: rgba(99, 102, 241, 0.05);
  border: 1px dashed rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  padding: 16px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(.dark-mode) .mnemonic-box {
  background: rgba(99, 102, 241, 0.1);
  border: 1px dashed rgba(99, 102, 241, 0.4);
}

.mnemonic-content {
  font-size: 0.9rem;
  color: #4f46e5;
  line-height: 1.6;
  font-style: italic;
}

:global(.dark-mode) .mnemonic-content {
  color: #c7d2fe;
}

.ai-hint-btn {
  margin-bottom: 24px;
  color: #6366f1 !important;
  font-weight: 600;
}

.example-box-premium {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 20px;
  border-radius: 20px;
  width: 100%;
}

:global(.dark-mode) .example-box-premium {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.en-sent {
  font-size: 1.15rem;
  color: #18181b;
  margin-bottom: 6px;
  font-family: 'Merriweather', serif;
  line-height: 1.5;
}

:global(.dark-mode) .en-sent {
  color: #fff;
}

.cn-sent {
  font-size: 0.9rem;
  color: #52525b;
}

:global(.dark-mode) .cn-sent {
  color: #a1a1aa;
}

.learn-controls {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 32px;
  height: 64px;
}

.control-btn {
  width: 64px;
  height: 64px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.thinking-text {
  color: #71717a;
  line-height: 64px;
}

.complete-view {
  text-align: center;
  animation: fadeIn 0.5s;
  padding-top: 40px;
}

.trophy-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border-radius: 50%;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complete-view h2 {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 8px;
}

.complete-view p {
  color: #a1a1aa;
  margin-bottom: 40px;
}

.result-stats-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.stat-box {
  background: #f4f4f5;
  padding: 20px 40px;
  border-radius: 12px;
}

:global(.dark-mode) .stat-box {
  background: #1f1f23;
}

.stat-box .val {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-box .val.green {
  color: #4ade80;
}

.stat-box .val.red {
  color: #f87171;
}

.stat-box .lbl {
  font-size: 0.8rem;
  color: #71717a;
  text-transform: uppercase;
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

.pulse-animation {
  animation: pulse-soft 2s infinite;
}

.trophy-bounce {
  animation: trophy-float 3s ease-in-out infinite;
}

.title-gradient {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

.feedback-correct:hover {
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}

.feedback-wrong:hover {
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
}

.sound-icon:active,
.sound-icon-small:active {
  transform: scale(0.8);
  transition: transform 0.1s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes pulse-soft {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.04);
    opacity: 0.85;
  }
}

@keyframes trophy-float {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }

  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@media (max-width: 768px) {
  .learn-container {
    padding: 10px 0;
  }

  .start-session-view {
    padding: 20px;
    text-align: center;
  }

  .brain-icon-wrapper {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
  }

  .start-session-view h2 {
    font-size: 1.5rem;
  }

  .start-session-view p {
    font-size: 0.9rem;
  }

  .start-actions {
    flex-direction: column;
    width: 100%;
  }

  .exam-select-learn {
    width: 100% !important;
  }

  .start-actions :deep(.n-button) {
    width: 100% !important;
  }

  .flashcard-scene {
    height: 400px;
  }

  .word-text {
    font-size: 2rem;
  }

  .meaning-text {
    font-size: 1.4rem;
  }

  .learn-controls {
    margin-top: 20px;
    gap: 20px;
  }

  .control-btn {
    width: 56px;
    height: 56px;
  }

  .stat-box {
    padding: 16px 20px;
  }

  .result-stats-row {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .flashcard-scene {
    height: 350px;
  }

  .word-text {
    font-size: 1.75rem;
  }

  .meaning-text {
    font-size: 1.2rem;
  }

  .start-session-view h2 {
    font-size: 1.25rem;
  }
}
</style>
