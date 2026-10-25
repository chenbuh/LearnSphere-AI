<template>
  <div class="conversation-history" :class="{ embedded }">
    <!-- 标题栏 -->
    <div v-if="!embedded" class="history-header">
      <span class="history-title">最近对话 ({{ messages.length }})</span>
      <n-button v-if="messages.length > 0" text size="tiny" type="error" @click="clearAll">
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
              <!-- R7：角色图标亮蓝/亮绿在浅色主题不足 3:1，改用主题令牌 -->
              <n-icon
                :component="msg.role === 'user' ? User : Bot"
                size="14"
                :color="msg.role === 'user' ? 'var(--tone-blue)' : 'var(--tone-emerald)'"
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
        <!-- R2：空状态图标固定灰在浅色主题不足 3:1，改用主题次要文字色 -->
        <n-icon :component="MessageSquare" size="40" color="var(--secondary-text)" />
        <p>暂无对话记录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { NIcon, NButton } from 'naive-ui'
import { User, Bot, Eye, Trash2, MessageSquare } from 'lucide-vue-next'
import { renderSafeMarkdown } from '@/utils/safeHtml'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  embedded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['review', 'delete', 'clear'])

const messagesListRef = ref(null)

/**
 * 渲染历史消息为 HTML。
 *
 * 先剥掉内部注入的词汇上下文前缀，再走 renderSafeMarkdown 转义。
 * 这里的内容来自数据库，属于持久化数据，必须转义后再交给 v-html。
 */
function formatMessage(content) {
  // 移除为了给 AI 传上下文而注入的隐藏前缀
  const displayContent = String(content || '').replace(/《当前学习单词:[^》]*》/g, '')
  return renderSafeMarkdown(displayContent)
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
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
  --history-shell-bg: #111827;
  --history-card-bg: rgba(255, 255, 255, 0.03);
  --history-card-hover-bg: rgba(255, 255, 255, 0.05);
  --history-border: rgba(255, 255, 255, 0.1);
  --history-title: #f3f4f6;
  --history-muted: #9ca3af;
  /* R2：固定的深灰作为次要文字色在深色卡片上远低于 4.5:1 */
  --history-soft: #9ca3af;
  --history-text: #d1d5db;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--history-shell-bg);
}

.conversation-history.embedded {
  background: transparent;
}

:global(html[data-theme='light'] .conversation-history) {
  --history-shell-bg: rgba(255, 255, 255, 0.92);
  --history-card-bg: rgba(248, 250, 252, 0.92);
  --history-card-hover-bg: rgba(241, 245, 249, 0.98);
  --history-border: rgba(148, 163, 184, 0.18);
  --history-title: #182132;
  --history-muted: #64748b;
  /* R2：浅灰文字在浅色卡片上不足 4.5:1，改为深色档灰 */
  --history-soft: #64748b;
  --history-text: #334155;
}

.history-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--history-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.history-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--history-title);
}

.messages-list {
  flex: 1;
  min-height: 0; /* 关键：允许子项在高度溢出时收缩，从而触发滚动 */
  overflow-y: scroll; /* 强制显示滚动轨道 */
  padding: 12px;
  overscroll-behavior: contain;
}

.message-item {
  background: var(--history-card-bg);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid var(--history-border);
  transition: all 0.2s;
}

.message-item:hover {
  background: var(--history-card-hover-bg);
  border-color: var(--history-border);
}

.message-item.reviewed {
  /* R8：整卡 opacity 会连带压低正文对比度，改用次要文字色表达层级 */
  --history-text: var(--secondary-text);
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
  color: var(--history-muted);
}

.message-time {
  font-size: 11px;
  color: var(--history-soft);
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
  color: var(--history-text);
  word-break: break-word;
}

.full-content :deep(strong) {
  color: var(--tone-emerald);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--history-soft);
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

/* 动画 */
.message-fade-enter-active,
.message-fade-leave-active {
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
  background: rgba(148, 163, 184, 0.28);
  border-radius: 2px;
}

@media (max-width: 768px) {
  .history-header {
    gap: 10px;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .messages-list {
    padding: 10px;
  }

  .message-item {
    padding: 10px;
    border-radius: 10px;
  }

  .item-header {
    gap: 8px 10px;
    flex-wrap: wrap;
  }

  .role-info {
    min-width: 0;
  }

  .full-content {
    overflow-wrap: anywhere;
  }
}

@media (max-width: 480px) {
  .history-header {
    padding: 10px 12px;
  }

  .history-title {
    font-size: 13px;
  }

  .messages-list {
    padding: 8px;
  }

  .message-item {
    padding: 9px;
    margin-bottom: 10px;
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .message-time,
  .role-name {
    font-size: 11px;
  }

  .full-content {
    font-size: 12.5px;
    line-height: 1.55;
  }

  .empty-state {
    padding: 42px 16px;
  }
}

@media (max-width: 360px) {
  .history-header {
    padding: 8px 10px;
  }

  .messages-list {
    padding: 6px;
  }

  .message-item {
    padding: 8px;
  }

  .full-content {
    font-size: 12px;
  }
}
</style>
