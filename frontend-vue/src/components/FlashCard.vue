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
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- 闪卡 -->
    <div
      class="flash-card-wrapper"
      @click="handleFlip"
    >
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
              <button
                class="play-sound-btn"
                @click.stop="playPronunciation"
                title="播放发音"
              >
                <n-icon :component="Play" size="12" />
              </button>
            </div>

            <!-- 例句 -->
            <div v-if="word.example" class="word-example">
              <div class="example-label">例句</div>
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
      <button
        class="action-btn unknown"
        @click="handleUnknown"
        :disabled="isFlipped"
      >
        <n-icon :component="X" size="20" />
        <span>不认识</span>
      </button>

      <!-- 翻转按钮 -->
      <button
        class="action-btn flip"
        @click="handleFlip"
      >
        <n-icon :component="isFlipped ? RotateCcw : Eye" size="20" />
        <span>{{ isFlipped ? '返回' : '查看' }}</span>
      </button>

      <!-- 已知按钮 -->
      <button
        class="action-btn known"
        @click="handleKnown"
        :disabled="!isFlipped"
      >
        <n-icon :component="Check" size="20" />
        <span>认识</span>
      </button>
    </div>

    <!-- 快捷键提示 -->
    <div class="keyboard-hints">
      <span class="hint-item">
        <kbd>←</kbd> 上一个
      </span>
      <span class="hint-item">
        <kbd>Space</kbd> 翻转
      </span>
      <span class="hint-item">
        <kbd>→</kbd> 下一个
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NIcon, NTag } from 'naive-ui'
import {
  Volume2, Play, MousePointerClick, ArrowRight, ArrowLeft,
  X, Check, Eye, RotateCcw
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
function playPronunciation() {
  // 使用 Web Speech API
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(props.word.word)
    utterance.lang = 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
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
})
</script>

<style scoped>
.flash-card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

/* 进度指示器 */
.progress-indicator {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-text {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #d4d4d8;
  white-space: nowrap;
}

.progress-text span:first-child {
  font-size: 18px;
  color: #10b981;
}

.separator {
  color: #71717a;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 闪卡容器 */
.flash-card-wrapper {
  width: 100%;
  height: 400px;
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
  border-radius: 16px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #065f46 0%, #064e3b 100%);
}

.card-content {
  padding: 32px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 正面内容 */
.word-main {
  font-size: 48px;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 12px;
  text-align: center;
}

.word-phonetic {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 16px;
  margin-bottom: 24px;
}

.play-sound-btn {
  padding: 6px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  color: #10b981;
  cursor: pointer;
  transition: all 0.2s;
}

.play-sound-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
}

.word-example {
  text-align: center;
  margin-top: auto;
}

.example-label {
  font-size: 12px;
  color: #71717a;
  margin-bottom: 8px;
}

.example-text {
  font-size: 14px;
  color: #d4d4d8;
  font-style: italic;
  line-height: 1.6;
}

.card-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  font-size: 12px;
  color: #71717a;
}

/* 背面内容 */
.definition-label,
.synonyms-label,
.antonyms-label {
  font-size: 12px;
  color: #a7f3d0;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.word-definition {
  text-align: center;
  margin-bottom: 24px;
}

.definition-text {
  font-size: 20px;
  color: #f9fafb;
  line-height: 1.6;
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
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 8px;
  color: #10b981;
  font-size: 13px;
}

.antonym-tag {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  color: #ef4444;
  font-size: 13px;
}

.word-pos {
  margin-top: auto;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.unknown {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.action-btn.unknown:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  transform: translateY(-2px);
}

.action-btn.flip {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #8b5cf6;
}

.action-btn.flip:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  transform: translateY(-2px);
}

.action-btn.known {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.action-btn.known:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  transform: translateY(-2px);
}

/* 快捷键提示 */
.keyboard-hints {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #71717a;
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

/* 移动端适配 */
@media (max-width: 768px) {
  .flash-card-container {
    padding: 16px;
  }

  .flash-card-wrapper {
    height: 350px;
  }

  .word-main {
    font-size: 36px;
  }

  .definition-text {
    font-size: 16px;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-btn {
    flex-direction: row;
    justify-content: center;
    padding: 12px;
  }

  .keyboard-hints {
    display: none;
  }
}
</style>
