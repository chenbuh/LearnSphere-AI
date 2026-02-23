<template>
  <div class="conversation-history">
    <!-- 标题栏 -->
    <div class="history-header">
      <span class="history-title">最近对话 ({{ messages.length }})</span>
      <n-button
        v-if="messages.length > 0"
        text
        size="tiny"
        type="error"
        @click="clearAll"
      >
        <template #icon><n-icon :component="Trash2" size="14" /></template>
        清空全部
      </n-button>
    </div>

    <!-- 消息列表 -->
    <div class="messages-list" ref="messagesListRef">
      <transition-group name="message-fade">
        <div
          v-for="(msg, index) in messages"
          :key="msg.id || index"
          :class="['message-item', msg.role, { reviewed: msg.reviewed }]"
        >
          <div class="item-header">
            <div class="role-info">
              <n-icon
                :component="msg.role === 'user' ? User : Bot"
                size="14"
                :color="msg.role === 'user' ? '#3b82f6' : '#10b981'"
              />
              <span class="role-name">{{ msg.role === 'user' ? '我' : '助手' }}</span>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            
            <div class="item-actions">
               <n-button
                text
                size="tiny"
                @click.stop="reviewMessage(msg, index)"
                :disabled="msg.reviewed"
                :title="msg.reviewed ? '已回顾' : '标记已回顾'"
              >
                <template #icon><n-icon :component="Eye" size="14" /></template>
              </n-button>
              <n-button
                text
                size="tiny"
                type="error"
                @click.stop="deleteMessage(index)"
                title="删除此条"
              >
                <template #icon><n-icon :component="Trash2" size="14" /></template>
              </n-button>
            </div>
          </div>

          <!-- 消息内容：展示全文 -->
          <div class="item-body">
            <div class="full-content" v-html="formatMessage(msg.content)"></div>
          </div>
        </div>
      </transition-group>

      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="empty-state">
        <n-icon :component="MessageSquare" size="40" color="#6b7280" />
        <p>暂无对话记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { NIcon, NButton } from 'naive-ui'
import { User, Bot, Eye, Trash2, MessageSquare } from 'lucide-vue-next'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['review', 'delete', 'clear'])

const messagesListRef = ref(null)

// 格式化消息内容，过滤注入的词汇上下文前缀
function formatMessage(content) {
  // 移除为了给 AI 传上下文而注入的隐藏前缀
  let displayContent = content.replace(/《当前学习单词:[^》]*》/g, '')

  return displayContent
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm前'
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

function reviewMessage(msg, index) {
  emit('review', { message: msg, index })
}

function deleteMessage(index) {
  emit('delete', index)
}

function clearAll() {
  emit('clear')
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesListRef.value) {
      messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight
    }
  })
}

defineExpose({ scrollToBottom })
</script>

<style scoped>
.conversation-history {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #111827;
}

.history-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: #f3f4f6;
}

.messages-list {
  flex: 1;
  min-height: 0;          /* 关键：允许子项在高度溢出时收缩，从而触发滚动 */
  overflow-y: scroll;     /* 强制显示滚动轨道 */
  padding: 12px;
  overscroll-behavior: contain;
}

.message-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
}

.message-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.message-item.reviewed {
  opacity: 0.6;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.role-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-name {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
}

.message-time {
  font-size: 11px;
  color: #4b5563;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.item-body {
  min-width: 0;
}

.full-content {
  font-size: 13px;
  line-height: 1.6;
  color: #d1d5db;
  word-break: break-word;
}

.full-content :deep(strong) {
  color: #10b981;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

/* 动画 */
.message-fade-enter-active, .message-fade-leave-active {
  transition: all 0.3s;
}
.message-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.message-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 滚动条 */
.messages-list::-webkit-scrollbar {
  width: 4px;
}
.messages-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
</style>
