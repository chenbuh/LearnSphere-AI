<script setup>
import { computed } from 'vue'
import { NButton, NProgress, NSpin, NTag } from 'naive-ui'
import { Check, MessageCircle, Volume2, X, Zap } from 'lucide-vue-next'

const props = defineProps({
  selectedExam: {
    type: String,
    default: 'cet4'
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

const emit = defineEmits(['flip-card', 'play-audio', 'get-mnemonic', 'open-ai-tutor', 'handle-result'])

const progressPercentage = computed(() => {
  if (!props.sessionWords.length) return 0
  return (props.sessionIndex / props.sessionWords.length) * 100
})

const primaryExample = computed(() => {
  return props.currentLearnWord?.examples?.[0] || null
})
</script>

<template>
  <div class="learning-view">
    <div class="session-stage">
      <div class="learn-header">
        <span class="header-chip">
          <span class="header-chip__label">Word</span>
          <span class="header-chip__value">{{ props.sessionIndex + 1 }} / {{ props.sessionWords.length }}</span>
        </span>
        <span class="header-chip header-chip--muted">
          <span class="header-chip__label">Exam</span>
          <span class="header-chip__value">{{ props.selectedExam }}</span>
        </span>
      </div>
      <n-progress type="line" :percentage="progressPercentage" :show-indicator="false" processing color="#6366f1" class="progress-bar" />

      <div class="flashcard-scene" :class="{ 'flashcard-scene--flipped': props.isFlipped }" @click="emit('flip-card')">
        <div class="flashcard-cube" :class="{ 'is-flipped': props.isFlipped }">
              <div class="card-face front">
                <div class="card-orb card-orb--top"></div>
                <div class="card-orb card-orb--bottom"></div>
                <div class="front-eyebrow">Vocabulary Drill</div>
                <h2 class="word-text">{{ props.currentLearnWord?.word }}</h2>
                <div class="phonetic-box">
                  <span class="phonetic-text">{{ props.currentLearnWord?.phonetic }}</span>
                  <div class="sound-icon" @click.stop="emit('play-audio', props.currentLearnWord?.word)">
                    <Volume2 :size="20" />
                  </div>
                </div>
                <div class="front-tip-line"></div>
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
                  Generate AI mnemonic
                </n-button>

                <div v-if="primaryExample" class="example-box-premium secure-content">
                  <div class="ex-row">
                    <div>
                      <div class="en-sent">{{ primaryExample.en }}</div>
                      <div class="cn-sent">{{ primaryExample.cn }}</div>
                    </div>
                    <div class="sound-icon-small" @click.stop="emit('play-audio', primaryExample.en)">
                      <Volume2 :size="18" />
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </div>

      <div class="learn-controls" v-if="props.isFlipped">
        <n-button size="large" type="error" class="control-btn feedback-wrong" @click="emit('handle-result', false)">
          <template #icon><X :size="28" /></template>
          Again
        </n-button>
        <n-button quaternary size="large" class="thinking-text" @click="emit('open-ai-tutor')">
          <template #icon><MessageCircle :size="18" /></template>
          Ask AI
        </n-button>
        <n-button size="large" type="success" class="control-btn feedback-correct" @click="emit('handle-result', true)">
          <template #icon><Check :size="28" /></template>
          Know It
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.learning-view {
  width: 100%;
  max-width: 760px;
  perspective: 1000px;
  margin: 0 auto;
  position: relative;
}

.session-stage {
  width: min(100%, 860px);
  margin: 0 auto;
  padding: 18px 18px 16px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.02)),
    radial-gradient(circle at top, rgba(99, 102, 241, 0.08), transparent 42%);
  border: 1px solid rgba(129, 140, 248, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.learn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.header-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
}

.header-chip--muted {
  margin-left: auto;
}

.header-chip__label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #818cf8;
}

.header-chip__value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e5e7eb;
}

:global(.dark-mode) .learn-header {
  color: #a1a1aa;
}

.progress-bar {
  margin-bottom: 18px;
}

.progress-bar :deep(.n-progress-rail) {
  background: rgba(148, 163, 184, 0.14);
}

.flashcard-scene {
  width: 100%;
  height: 430px;
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
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
  border-radius: 32px;
  background:
    radial-gradient(circle at top, rgba(99, 102, 241, 0.18), transparent 42%),
    linear-gradient(180deg, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98));
  border: 1px solid rgba(129, 140, 248, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.front-eyebrow {
  position: relative;
  z-index: 1;
  margin-bottom: 18px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(129, 140, 248, 0.12);
  border: 1px solid rgba(129, 140, 248, 0.2);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #c7d2fe;
}

.card-orb {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(8px);
  opacity: 0.55;
}

.card-orb--top {
  width: 180px;
  height: 180px;
  top: -70px;
  right: 60px;
  background: radial-gradient(circle, rgba(250, 204, 21, 0.18), transparent 70%);
}

.card-orb--bottom {
  width: 220px;
  height: 220px;
  bottom: -110px;
  left: 40px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.22), transparent 72%);
}

@media (min-width: 769px) {
  .flashcard-scene {
    width: min(100%, 100%);
    height: 430px;
    margin: 0 auto;
  }

  .card-face {
    border-radius: 28px;
    padding: 30px 38px;
  }

  .word-text {
    font-size: 2.9rem;
    margin-bottom: 18px;
    letter-spacing: -0.03em;
  }

  .phonetic-box {
    margin-bottom: 22px;
  }

  .card-face.front {
    justify-content: center;
  }

  .card-face.front .hint-text {
    margin-top: 12px;
  }

  .card-face.back {
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    padding-top: 24px;
  }

  .meaning-text {
    margin: 6px 0 0;
    font-size: 2.1rem;
    line-height: 1.18;
  }

  .mnemonic-section {
    margin-bottom: 0;
  }

  .card-face.back .ai-hint-btn {
    align-self: center;
    margin-bottom: 0;
  }

  .card-face.back .example-box-premium {
    margin-top: 0;
  }

  .learn-controls {
    width: min(100%, 560px);
    margin-top: 18px;
    padding: 8px;
    gap: 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .control-btn {
    min-width: 148px;
    height: 52px;
    border-radius: 999px !important;
    font-weight: 700;
    letter-spacing: 0.01em;
    box-shadow: none;
  }

  .thinking-text {
    flex: 1;
    min-width: 0;
    line-height: 52px;
    color: #cbd5e1;
    border: 1px solid rgba(148, 163, 184, 0.14);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 999px;
    font-weight: 600;
  }
}

@media (min-width: 1280px) {
  .flashcard-scene {
    width: min(100%, 100%);
    height: 450px;
  }
}

.card-face.front {
  transform: translateZ(1px);
  background:
    radial-gradient(circle at top, rgba(250, 204, 21, 0.12), transparent 34%),
    radial-gradient(circle at bottom, rgba(99, 102, 241, 0.16), transparent 42%),
    linear-gradient(180deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98));
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
  transform: rotateY(180deg) translateZ(1px);
  border-color: rgba(99, 102, 241, 0.3);
}

.word-text {
  font-size: 3rem;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.card-face.front .word-text {
  text-shadow: 0 8px 28px rgba(99, 102, 241, 0.25);
}

.phonetic-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.08);
  padding: 8px 16px;
  border-radius: 99px;
  margin-bottom: 40px;
  border: 1px solid rgba(129, 140, 248, 0.18);
  position: relative;
  z-index: 1;
}

.phonetic-text {
  font-size: 1.2rem;
  color: #c7d2fe;
  font-family: monospace;
}

.sound-icon {
  color: #a5b4fc;
  cursor: pointer;
  display: flex;
}

.front-tip-line {
  width: 72px;
  height: 1px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.8), transparent);
}

.hint-text {
  color: rgba(226, 232, 240, 0.72);
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

.meaning-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: #f8fafc;
  margin: 16px 0 24px;
  text-align: center;
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
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
}

.example-box-premium {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(129, 140, 248, 0.14);
  padding: 20px;
  border-radius: 20px;
  width: 100%;
}

.en-sent {
  font-size: 1.15rem;
  color: #f8fafc;
  margin-bottom: 6px;
  font-family: 'Merriweather', serif;
  line-height: 1.5;
}

.cn-sent {
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.8);
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

@media (max-width: 768px) {
  .learning-view {
    max-width: 100%;
  }

  .session-stage {
    width: 100%;
    padding: 0;
    background: transparent;
    border: 0;
    box-shadow: none;
  }

  .learn-header {
    gap: 10px;
    flex-wrap: wrap;
  }

  .header-chip {
    padding: 8px 12px;
  }

  .header-chip__label {
    font-size: 0.68rem;
  }

  .header-chip__value {
    font-size: 0.82rem;
  }

  .progress-bar {
    margin-bottom: 20px;
  }

  .flashcard-scene {
    height: 400px;
  }

  .card-face {
    padding: 24px 20px;
    border-radius: 24px;
  }

  .word-text {
    font-size: 2rem;
    margin-bottom: 18px;
  }

  .phonetic-box {
    margin-bottom: 24px;
  }

  .meaning-text {
    font-size: 1.4rem;
    margin: 12px 0 18px;
  }

  .mnemonic-box,
  .example-box-premium {
    padding: 14px;
    border-radius: 16px;
  }

  .learn-controls {
    margin-top: 20px;
    gap: 20px;
  }

  .control-btn {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .learning-view {
    width: 100%;
  }

  .flashcard-scene {
    height: auto;
    min-height: 0;
  }

  .learn-header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    column-gap: 10px;
    row-gap: 2px;
    margin-bottom: 6px;
  }

  .learn-header span {
    min-width: 0;
    line-height: 1.25;
  }

  .learn-header span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .learn-header span:last-child {
    justify-self: end;
    white-space: nowrap;
  }

  .header-chip {
    gap: 8px;
    padding: 8px 10px;
  }

  .header-chip__label {
    font-size: 0.62rem;
  }

  .header-chip__value {
    font-size: 0.76rem;
  }

  .progress-bar {
    margin-bottom: 12px;
  }

  .flashcard-cube {
    height: auto;
    transform: none !important;
  }

  .card-face {
    position: relative;
    display: none;
    height: auto;
    min-height: 0;
    padding: 16px 14px;
    justify-content: flex-start;
    overflow: visible;
    border-radius: 20px;
    backface-visibility: visible;
    -webkit-backface-visibility: visible;
    box-sizing: border-box;
    box-shadow: 0 16px 36px rgba(2, 6, 23, 0.28);
  }

  .flashcard-cube:not(.is-flipped) .card-face.front,
  .flashcard-cube.is-flipped .card-face.back {
    display: flex;
  }

  .card-face.front {
    min-height: 236px;
    align-items: center;
    justify-content: center;
  }

  .card-face.back {
    transform: none;
  }

  .card-face.back {
    align-items: stretch;
    padding: 16px 14px 14px;
    gap: 10px;
  }

  .tags-row {
    display: none;
  }

  .top-accent {
    height: 4px;
  }

  .word-text {
    font-size: 1.45rem;
    margin-top: 0;
    margin-bottom: 14px;
    text-align: center;
  }

  .front-eyebrow {
    margin-bottom: 12px;
    font-size: 0.62rem;
    padding: 6px 10px;
  }

  .phonetic-box {
    padding: 7px 11px;
    gap: 8px;
    margin-bottom: 14px;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }

  .phonetic-text {
    font-size: 0.92rem;
  }

  .hint-text {
    font-size: 0.78rem;
    text-align: center;
  }

  .meaning-text {
    font-size: 1.02rem;
    line-height: 1.45;
    margin: 0;
    width: 100%;
    padding: 0 4px;
    word-break: break-word;
    text-align: center;
  }

  .mnemonic-section {
    width: 100%;
    margin: 0;
  }

  .mnemonic-box {
    padding: 10px 12px;
    min-height: auto;
    border-radius: 12px;
    align-items: flex-start;
    justify-content: flex-start;
    text-align: left;
    background: rgba(67, 56, 202, 0.08);
  }

  .mnemonic-content {
    font-size: 0.78rem;
    line-height: 1.45;
    color: #a5b4fc;
  }

  .ai-hint-btn {
    width: 100%;
    margin-bottom: 0;
    min-height: 38px;
    font-size: 0.78rem;
    padding-left: 10px;
    padding-right: 10px;
  }

  .example-box-premium {
    padding: 10px 12px;
    border-radius: 12px;
    margin-top: 0;
    background: rgba(255, 255, 255, 0.06);
  }

  .en-sent {
    font-size: 0.84rem;
    margin-bottom: 4px;
    line-height: 1.38;
  }

  .cn-sent {
    font-size: 0.72rem;
    line-height: 1.35;
  }

  .ex-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: start;
    gap: 10px;
  }

  .sound-icon-small {
    align-self: start;
    margin-top: 2px;
    padding: 5px;
  }

  .learn-controls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
    padding: 0;
    background: transparent;
    border: 0;
    box-shadow: none;
    height: auto;
    width: 100%;
  }

  .thinking-text {
    display: inline-flex;
    grid-column: 1 / -1;
    justify-content: center;
    min-height: 42px;
    border-radius: 14px;
    color: #a5b4fc;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(129, 140, 248, 0.18);
  }

  .control-btn {
    width: 100%;
    height: 46px;
    border-radius: 14px !important;
    box-shadow: none;
  }
}
</style>
