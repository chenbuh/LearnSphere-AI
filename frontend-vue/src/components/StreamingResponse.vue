<template>
  <div class="streaming-response">
    <div class="message-content streaming">
      <!-- 流式显示的文字 -->
      <div class="message-text" v-html="formattedContent"></div>

      <!-- 光标效果 -->
      <span v-if="isStreaming" class="cursor">|</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isStreaming: {
    type: Boolean,
    default: false
  },
  speed: {
    type: Number,
    default: 30 // 打字速度（毫秒/字符）
  }
})

const emit = defineEmits(['complete'])

// 当前显示的内容
const displayedContent = ref('')

// 格式化后的内容（支持 Markdown）
const formattedContent = computed(() => {
  return formatMessage(displayedContent.value)
})

// 格式化消息（支持 Markdown）
function formatMessage(content) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 打字机效果
let typewriterInterval = null
let currentIndex = 0

const startTyping = (text) => {
  // 重置状态
  stopTyping()
  displayedContent.value = ''
  currentIndex = 0

  // 如果内容为空，直接完成
  if (!text) {
    emit('complete')
    return
  }

  // 开始打字
  typewriterInterval = setInterval(() => {
    if (currentIndex < text.length) {
      displayedContent.value += text[currentIndex]
      currentIndex++
    } else {
      stopTyping()
      emit('complete')
    }
  }, props.speed)
}

const stopTyping = () => {
  if (typewriterInterval) {
    clearInterval(typewriterInterval)
    typewriterInterval = null
  }
}

// 监听内容变化
watch(() => props.content, (newContent) => {
  if (props.isStreaming) {
    startTyping(newContent)
  } else {
    // 如果不是流式模式，直接显示全部内容
    stopTyping()
    displayedContent.value = newContent
  }
}, { immediate: true })

// 监听流式状态变化
watch(() => props.isStreaming, (isStreaming) => {
  if (!isStreaming) {
    // 流式结束，显示全部内容
    stopTyping()
    displayedContent.value = props.content
    emit('complete')
  }
})

// 组件卸载时清理
onMounted(() => {
  if (props.content && !props.isStreaming) {
    displayedContent.value = props.content
  }
})
</script>

<style scoped>
.streaming-response {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.message-content.streaming {
  background: rgba(16, 185, 129, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  position: relative;
}

.message-text {
  color: #f9fafb;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-text :deep(strong) {
  color: #10b981;
  font-weight: 600;
}

.message-text :deep(em) {
  color: #a7f3d0;
  font-style: italic;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #fbbf24;
}

/* 光标闪烁效果 */
.cursor {
  display: inline-block;
  color: #10b981;
  font-weight: bold;
  animation: blink 1s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .message-content.streaming {
    padding: 10px 12px;
  }

  .message-text {
    font-size: 13px;
  }
}
</style>
