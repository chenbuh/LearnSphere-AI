<template>
  <div class="conversation-history">
    <!-- 消息列表 -->
    <div class="messages-list" ref="messagesListRef">
      <transition-group name="message-fade">
        <div
          v-for="(msg, index) in messages"
          :key="msg.id || index"
          :class="['message-item', msg.role, { reviewed: msg.reviewed }]"
          @click="selectMessage(msg)"
        >
          <!-- 消息头像 -->
          <div class="message-avatar">
            <n-icon
              :component="msg.role === 'user' ? User : Bot"
              size="18"
              :color="msg.role === 'user' ? '#3b82f6' : '#10b981'"
            />
          </div>

          <!-- 消息内容 -->
          <div class="message-content">
            <!-- 预览文本 -->
            <div class="message-preview">{{ getPreview(msg.content) }}</div>

            <!-- 消息时间 -->
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>

            <!-- 回顾标记 -->
            <div v-if="msg.reviewed" class="review-badge">
              <n-icon :component="CheckCircle" size="12" color="#10b981" />
            </div>
          </div>

          <!-- 消息操作按钮 -->
          <div class="message-actions">
            <n-button
              text
              size="tiny"
              @click.stop="reviewMessage(msg, index)"
              :disabled="msg.reviewed"
            >
              <template #icon>
                <n-icon :component="Eye" size="14" />
              </template>
            </n-button>
            <n-button
              text
              size="tiny"
              type="error"
              @click.stop="deleteMessage(index)"
            >
              <template #icon>
                <n-icon :component="Trash2" size="14" />
              </template>
            </n-button>
          </div>
        </div>
      </transition-group>

      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="empty-state">
        <n-icon :component="MessageSquare" size="40" color="#6b7280" />
        <p>暂无对话记录</p>
      </div>
    </div>

    <!-- 消息详情抽屉 -->
    <n-drawer v-model:show="showDetail" :width="400" placement="right">
      <n-drawer-content title="消息详情" closable>
        <div v-if="selectedMessage" class="message-detail">
          <!-- 消息角色 -->
          <div class="detail-row">
            <span class="label">发送者：</span>
            <n-tag
              :type="selectedMessage.role === 'user' ? 'primary' : 'success'"
              size="small"
            >
              {{ selectedMessage.role === 'user' ? '用户' : 'AI 助手' }}
            </n-tag>
          </div>

          <!-- 发送时间 -->
          <div class="detail-row">
            <span class="label">发送时间：</span>
            <span>{{ formatFullTime(selectedMessage.timestamp) }}</span>
          </div>

          <!-- 消息内容 -->
          <div class="detail-row">
            <span class="label">消息内容：</span>
            <div class="content-box" v-html="formatMessage(selectedMessage.content)"></div>
          </div>

          <!-- 回顾状态 -->
          <div class="detail-row">
            <span class="label">回顾状态：</span>
            <n-tag v-if="selectedMessage.reviewed" type="success" size="small">
              已回顾
            </n-tag>
            <n-tag v-else type="default" size="small">
              未回顾
            </n-tag>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { NIcon, NButton, NTag, NDrawer, NDrawerContent } from 'naive-ui'
import { User, Bot, Eye, Trash2, CheckCircle, MessageSquare } from 'lucide-vue-next'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['review', 'delete'])

const messagesListRef = ref(null)
const showDetail = ref(false)
const selectedMessage = ref(null)

// 获取消息预览（最多 50 个字符）
function getPreview(content) {
  const text = content.replace(/<[^>]*>/g, '') // 移除 HTML 标签
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 小于 1 分钟
  if (diff < 60000) {
    return '刚刚'
  }

  // 小于 1 小时
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + ' 分钟前'
  }

  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 更早
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 格式化完整时间
function formatFullTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化消息内容
function formatMessage(content) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 选择消息
function selectMessage(msg) {
  selectedMessage.value = msg
  showDetail.value = true
}

// 回顾消息
function reviewMessage(msg, index) {
  emit('review', { message: msg, index })
}

// 删除消息
function deleteMessage(index) {
  emit('delete', index)
}

// 滚动到最新消息
function scrollToBottom() {
  nextTick(() => {
    if (messagesListRef.value) {
      messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight
    }
  })
}

// 暴露方法给父组件
defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.conversation-history {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.message-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(16, 185, 129, 0.3);
}

.message-item.user {
  border-left: 2px solid #3b82f6;
}

.message-item.assistant {
  border-left: 2px solid #10b981;
}

.message-item.reviewed {
  opacity: 0.7;
}

.message-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-preview {
  color: #d1d5db;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-time {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.review-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.message-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-state p {
  margin: 12px 0 0;
  font-size: 14px;
}

/* 消息详情 */
.message-detail {
  padding: 16px 0;
}

.detail-row {
  margin-bottom: 20px;
}

.detail-row .label {
  display: block;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.content-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 8px;
  color: #f9fafb;
  font-size: 14px;
  line-height: 1.6;
}

.content-box :deep(strong) {
  color: #10b981;
  font-weight: 600;
}

.content-box :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #fbbf24;
}

/* 消息列表动画 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 滚动条样式 */
.messages-list::-webkit-scrollbar {
  width: 6px;
}

.messages-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.messages-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.messages-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .message-item {
    padding: 8px;
  }

  .message-preview {
    font-size: 12px;
  }

  .message-actions {
    opacity: 1;
  }
}
</style>
