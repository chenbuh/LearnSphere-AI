<template>
  <div class="flash-card-container">
    <!-- 进度指示器 -->
    <div class="progress-indicator">
      <div class="progress-text">
        <span>{{ currentIndex + 1 }}</span>
        <span class="separator">/</span>
        <span>{{ totalCards }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>

    <!-- 闪卡 -->
    <div class="flash-card-wrapper" @click="handleFlip">
      <div
        :class="['flash-card', { flipped: isFlipped }]"
        :style="{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }"
      >
        <!-- 正面 -->
        <div class="card-front">
          <div class="card-content">
            <!-- 单词 -->
            <div class="word-main">{{ word.word }}</div>

            <!-- 音标 -->
            <div v-if="word.phonetic" class="word-phonetic">
              <n-icon :component="Volume2" size="14" />
              <span>{{ word.phonetic }}</span>
              <button class="play-sound-btn" @click.stop="playPronunciation" title="播放发音">
                <n-icon :component="Play" size="12" />
              </button>
            </div>

            <!-- 例句 -->
            <div v-if="word.example" class="word-example">
              <div class="example-label">
                例句
                <button
                  type="button"
                  class="example-sound-btn"
                  title="朗读例句"
                  aria-label="朗读例句"
                  @click.stop="playExample"
                >
                  <n-icon :component="Volume2" size="13" />
                </button>
              </div>
              <div class="example-text">{{ word.example }}</div>
            </div>

            <!-- 提示 -->
            <div class="card-hint">
              <n-icon :component="MousePointerClick" size="14" />
              <span>点击卡片查看释义</span>
            </div>
          </div>
        </div>

        <!-- 背面 -->
        <div class="card-back">
          <div class="card-content">
            <!-- 释义 -->
            <div class="word-definition">
              <div class="definition-label">释义</div>
              <div class="definition-text">{{ word.definition }}</div>
            </div>

            <!-- 同义词 -->
            <div v-if="word.synonyms" class="word-synonyms">
              <div class="synonyms-label">
                <n-icon :component="ArrowRight" size="14" />
                <span>同义词</span>
              </div>
              <div class="synonyms-list">
                <span
                  v-for="(synonym, index) in word.synonyms.split(',')"
                  :key="index"
                  class="synonym-tag"
                >
                  {{ synonym.trim() }}
                </span>
              </div>
            </div>

            <!-- 反义词 -->
            <div v-if="word.antonyms" class="word-antonyms">
              <div class="antonyms-label">
                <n-icon :component="ArrowLeft" size="14" />
                <span>反义词</span>
              </div>
              <div class="antonyms-list">
                <span
                  v-for="(antonym, index) in word.antonyms.split(',')"
                  :key="index"
                  class="antonym-tag"
                >
                  {{ antonym.trim() }}
                </span>
              </div>
            </div>

            <!-- 词性 -->
            <div v-if="word.partOfSpeech" class="word-pos">
              <n-tag size="small" type="info">{{ word.partOfSpeech }}</n-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="card-actions">
      <!-- 未知按钮 -->
      <button class="action-btn unknown" @click="handleUnknown" :disabled="isFlipped">
        <n-icon :component="X" size="20" />
        <span>不认识</span>
      </button>

      <!-- 翻转按钮 -->
      <button class="action-btn flip" @click="handleFlip">
        <n-icon :component="isFlipped ? RotateCcw : Eye" size="20" />
        <span>{{ isFlipped ? '返回' : '查看' }}</span>
      </button>

      <!-- 已知按钮 -->
      <button class="action-btn known" @click="handleKnown" :disabled="!isFlipped">
        <n-icon :component="Check" size="20" />
        <span>认识</span>
      </button>
    </div>

    <!-- 快捷键提示 -->
    <div class="keyboard-hints">
      <span class="hint-item"> <kbd>←</kbd> 上一个 </span>
      <span class="hint-item"> <kbd>Space</kbd> 翻转 </span>
      <span class="hint-item"> <kbd>→</kbd> 下一个 </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NIcon, NTag } from 'naive-ui'
import { useTextAudio } from '@/composables/useTextAudio'
import {
  Volume2,
  Play,
  MousePointerClick,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Eye,
  RotateCcw
} from 'lucide-vue-next'

const props = defineProps({
  // 当前单词
  word: {
    type: Object,
    required: true
  },
  // 当前索引
  currentIndex: {
    type: Number,
    default: 0
  },
  // 总卡片数
  totalCards: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['flip', 'next', 'previous', 'known', 'unknown'])
const { playAudio, stopAudio } = useTextAudio()

const isFlipped = ref(false)

// 进度百分比
const progressPercentage = computed(() => {
  return ((props.currentIndex + 1) / props.totalCards) * 100
})

// 翻转卡片
function handleFlip() {
  isFlipped.value = !isFlipped.value
  emit('flip', { flipped: isFlipped.value })
}

// 标记为已知
function handleKnown() {
  emit('known', props.word)
  nextCard()
}

// 标记为未知
function handleUnknown() {
  emit('unknown', props.word)
  nextCard()
}

// 下一张卡片
function nextCard() {
  isFlipped.value = false
  emit('next')
}

// 上一张卡片
function previousCard() {
  isFlipped.value = false
  emit('previous')
}

// 播放发音
// 走 Edge TTS 神经音色（en-US-JennyNeural），与例句、听力保持一致；
// 网络异常时 useTextAudio 会自动降级到浏览器原生语音。
function playPronunciation() {
  if (!props.word?.word) return
  playAudio(props.word.word, { rate: 0.9 })
}

// 播放例句
function playExample() {
  const sentence = props.word?.example
  if (!sentence) return
  playAudio(sentence, { rate: 0.9 })
}

// 键盘事件处理
function handleKeydown(event) {
  switch (event.key) {
    case ' ':
      event.preventDefault()
      handleFlip()
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (props.currentIndex > 0) {
        previousCard()
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (props.currentIndex < props.totalCards - 1) {
        nextCard()
      }
      break
    case '1':
      handleUnknown()
      break
    case '2':
      handleKnown()
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  stopAudio()
})
</script>

<style scoped>
.flash-card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 18px 20px 20px;
  max-width: 600px;
  margin: 0 auto;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(148, 163, 184, 0.1);
  min-width: 0;
  box-sizing: border-box;
  background: var(--card-bg);
}

:global(html[data-theme='light'] .flash-card-container) {
  border-color: rgba(148, 163, 184, 0.16);
}

/* 进度指示器 */
.progress-indicator {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.progress-text {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--secondary-text);
  white-space: nowrap;
  flex-shrink: 0;
}

:global(html[data-theme='light'] .progress-text) {
  color: var(--secondary-text);
}

.progress-text span:first-child {
  font-size: 18px;
  color: var(--tone-emerald);
}

.separator {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .separator) {
  color: var(--secondary-text);
}

.progress-bar {
  flex: 1;
  min-width: 0;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

:global(html[data-theme='light'] .progress-bar) {
  background: rgba(226, 232, 240, 0.96);
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 闪卡容器 */
.flash-card-wrapper {
  width: 100%;
  height: 370px;
  min-width: 0;
  perspective: 1000px;
  cursor: pointer;
}

.flash-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flash-card.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--radius-lg);
  /* R6：卡面原本写死深色底，改用主题令牌，两种主题都成立 */
  background: var(--card-bg);
  color: var(--text-color);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

:global(html[data-theme='light'] .card-front),
:global(html[data-theme='light'] .card-back) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .card-front) {
  background: var(--card-bg);
  color: var(--text-color);
}

:global(html[data-theme='light'] .card-back) {
  background: var(--surface-muted);
  color: var(--text-color);
}

.card-back {
  transform: rotateY(180deg);
  /* 背面改用更深的表面色区分正反，不再写死深绿 */
  background: var(--surface-muted);
}

.card-content {
  padding: 26px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  box-sizing: border-box;
}

/* 正面内容 */
.word-main {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 12px;
  text-align: center;
  line-height: 1.15;
  max-width: 100%;
  overflow-wrap: anywhere;
}

:global(html[data-theme='light'] .word-main),
:global(html[data-theme='light'] .definition-text) {
  color: var(--text-color);
}

.word-phonetic {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  color: var(--secondary-text);
  font-size: 16px;
  margin-bottom: 24px;
  max-width: 100%;
  text-align: center;
}

:global(html[data-theme='light'] .word-phonetic),
:global(html[data-theme='light'] .example-text),
:global(html[data-theme='light'] .card-hint),
:global(html[data-theme='light'] .keyboard-hints) {
  color: var(--secondary-text);
}

.play-sound-btn {
  padding: 6px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  color: var(--tone-emerald);
  cursor: pointer;
  transition: all 0.2s;
}

.play-sound-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--tone-emerald);
}

:global(html[data-theme='light'] .play-sound-btn) {
  background: rgba(236, 253, 245, 0.96);
}

.word-example {
  text-align: center;
  margin-top: auto;
  width: 100%;
  max-width: 28rem;
  min-width: 0;
}

.example-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--secondary-text);
  margin-bottom: 8px;
}

/* 例句朗读按钮：与单词发音按钮视觉一致。
   盒模型直接给到 32×32，满足移动端最小点击目标；
   图标本身仍是 13px，视觉上不会显得笨重。 */
.example-sound-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: -4px;
  padding: 0;
  border: 1px solid var(--border-color, rgba(15, 23, 42, 0.12));
  border-radius: 999px;
  background: transparent;
  color: var(--secondary-text);
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.example-sound-btn:hover {
  color: var(--brand);
  border-color: var(--brand);
}

.example-sound-btn:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

.example-text {
  font-size: 14px;
  color: var(--secondary-text);
  font-style: italic;
  line-height: 1.6;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow-wrap: anywhere;
}

:global(html[data-theme='light'] .example-label),
:global(html[data-theme='light'] .definition-label),
:global(html[data-theme='light'] .synonyms-label),
:global(html[data-theme='light'] .antonyms-label) {
  color: var(--tone-emerald);
}

.card-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  font-size: 12px;
  color: var(--secondary-text);
}

/* 背面内容 */
.definition-label,
.synonyms-label,
.antonyms-label {
  /* R3：浅绿标签文字在浅色主题不可读，改用主题绿 */
  font-size: 12px;
  color: var(--tone-emerald);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.word-definition {
  text-align: center;
  margin-bottom: 24px;
  width: 100%;
  max-width: 28rem;
  min-width: 0;
}

.definition-text {
  font-size: 18px;
  color: var(--text-color);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.word-synonyms,
.word-antonyms {
  width: 100%;
  margin-bottom: 16px;
}

.synonyms-list,
.antonyms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.synonym-tag {
  padding: 6px 12px;
  /* R5：alpha 由 0.2 降到 0.14，避免文字对比度被底色吃掉 */
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 8px;
  color: var(--tone-emerald);
  font-size: 13px;
  max-width: 100%;
  overflow-wrap: anywhere;
  text-align: center;
}

:global(html[data-theme='light'] .synonym-tag) {
  background: rgba(220, 252, 231, 0.9);
  border-color: rgba(16, 185, 129, 0.22);
  color: var(--tone-emerald);
}

.antonym-tag {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  color: var(--tone-red);
  font-size: 13px;
  max-width: 100%;
  overflow-wrap: anywhere;
  text-align: center;
}

:global(html[data-theme='light'] .antonym-tag) {
  background: rgba(254, 226, 226, 0.88);
  border-color: rgba(239, 68, 68, 0.2);
  color: var(--tone-red);
}

.word-pos {
  margin-top: auto;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 54px;
  padding: 14px 12px;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.action-btn span {
  line-height: 1.2;
  text-align: center;
}

.action-btn:disabled {
  /* R8：不再整体降透明度（0.5 会让文字跌破 4.5:1），禁用态靠光标表达 */
  opacity: 1;
  cursor: not-allowed;
}

.action-btn.unknown {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--tone-red);
}

.action-btn.unknown:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  transform: translateY(-2px);
}

:global(html[data-theme='light'] .action-btn.unknown) {
  background: rgba(254, 226, 226, 0.82);
  border-color: rgba(239, 68, 68, 0.22);
}

.action-btn.flip {
  background: rgba(43, 122, 96, 0.1);
  border: 1px solid rgba(43, 122, 96, 0.3);
  color: var(--tone-emerald);
}

.action-btn.flip:hover {
  background: rgba(43, 122, 96, 0.2);
  border-color: var(--tone-emerald);
  transform: translateY(-2px);
}

:global(html[data-theme='light'] .action-btn.flip) {
  background: rgba(237, 233, 254, 0.86);
  border-color: rgba(43, 122, 96, 0.22);
}

.action-btn.known {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--tone-emerald);
}

.action-btn.known:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--tone-emerald);
  transform: translateY(-2px);
}

:global(html[data-theme='light'] .action-btn.known) {
  background: rgba(220, 252, 231, 0.84);
  border-color: rgba(16, 185, 129, 0.22);
}

/* 快捷键提示 */
.keyboard-hints {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: var(--secondary-text);
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

kbd {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}

:global(html[data-theme='light'] kbd) {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(148, 163, 184, 0.18);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .flash-card-container {
    gap: 14px;
    padding: 14px max(14px, env(safe-area-inset-right))
      calc(14px + env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left));
    border-radius: var(--radius-lg);
  }

  .progress-indicator {
    gap: 12px;
  }

  .progress-text {
    font-size: 13px;
  }

  .flash-card-wrapper {
    height: clamp(300px, 58svh, 320px);
  }

  .word-main {
    font-size: 31px;
    margin-bottom: 10px;
  }

  .card-content {
    padding: 20px 18px;
    justify-content: flex-start;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .word-phonetic {
    margin-bottom: 18px;
    font-size: 14px;
  }

  .definition-text {
    font-size: 17px;
  }

  .card-actions {
    gap: 10px;
  }

  .action-btn {
    min-height: 48px;
    padding: 12px 10px;
    font-size: 13px;
  }

  .action-btn span {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .keyboard-hints {
    display: none;
  }
}

@media (max-width: 480px) {
  .flash-card-container {
    padding: 12px max(12px, env(safe-area-inset-right))
      calc(12px + env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left));
    border-radius: var(--radius-lg);
  }

  .progress-indicator {
    gap: 10px;
  }

  .progress-text {
    font-size: 12px;
  }

  .progress-text span:first-child {
    font-size: 16px;
  }

  .flash-card-wrapper {
    height: clamp(260px, 52svh, 286px);
  }

  .card-front,
  .card-back {
    border-radius: var(--radius-lg);
  }

  .card-content {
    padding: 18px 16px;
  }

  .word-main {
    font-size: 26px;
  }

  .word-phonetic {
    gap: 6px;
    margin-bottom: 14px;
    font-size: 13px;
  }

  .word-example,
  .word-definition {
    margin-bottom: 16px;
  }

  .example-text,
  .definition-text {
    font-size: 14px;
    line-height: 1.55;
  }

  .card-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .action-btn {
    gap: 6px;
    min-height: 44px;
    padding: 10px 8px;
    border-radius: var(--radius-md);
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .flash-card-container {
    gap: 12px;
    padding: 10px max(10px, env(safe-area-inset-right))
      calc(10px + env(safe-area-inset-bottom, 0px)) max(10px, env(safe-area-inset-left));
    border-radius: var(--radius-lg);
  }

  .progress-indicator {
    flex-wrap: wrap;
    gap: 8px;
  }

  .progress-text {
    width: 100%;
    justify-content: center;
    font-size: 12px;
  }

  .progress-bar {
    width: 100%;
  }

  .flash-card-wrapper {
    height: clamp(236px, 50svh, 264px);
  }

  .card-content {
    padding: 16px 14px;
  }

  .word-main {
    font-size: 23px;
    margin-bottom: 8px;
  }

  .word-phonetic {
    margin-bottom: 12px;
    font-size: 12px;
  }

  .example-text,
  .definition-text {
    font-size: 13px;
  }

  .synonyms-list,
  .antonyms-list {
    gap: 6px;
  }

  .synonym-tag,
  .antonym-tag {
    width: 100%;
    padding: 6px 10px;
    font-size: 12px;
  }

  .card-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-btn.flip {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .flash-card-container {
    gap: 12px;
    padding: 12px max(12px, env(safe-area-inset-right))
      calc(12px + env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left));
  }

  .flash-card-wrapper {
    height: min(62svh, 260px);
  }

  .card-content {
    padding: 18px 20px;
    justify-content: flex-start;
    overflow-y: auto;
  }

  .word-main {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .word-phonetic {
    margin-bottom: 12px;
  }

  .word-example,
  .word-definition {
    margin-bottom: 14px;
  }

  .card-hint {
    margin-top: 16px;
  }

  .card-actions {
    gap: 10px;
  }
}
</style>
