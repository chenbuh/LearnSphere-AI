<script setup>
import { computed } from 'vue'
import { NAlert, NButton, NDivider, NModal, NPopconfirm, NScrollbar, NTag } from 'naive-ui'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  sessionMessages: {
    type: Array,
    default: () => []
  },
  sessionLoading: {
    type: Boolean,
    default: false
  },
  currentSessionId: {
    type: String,
    default: ''
  },
  currentSessionMeta: {
    type: Object,
    default: null
  },
  formatTime: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:show', 'refresh', 'resolve-session', 'delete-session'])

const userMessageCount = computed(
  () => props.sessionMessages.filter(msg => msg.role === 'user').length
)

const assistantMessageCount = computed(
  () => props.sessionMessages.filter(msg => msg.role !== 'user').length
)

const isResolved = computed(() => Boolean(props.currentSessionMeta?.resolved))
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    style="width: 760px; max-height: 86vh"
    title="完整会话追踪"
    :bordered="false"
    @update:show="emit('update:show', $event)"
  >
    <div class="session-container">
      <div class="session-summary">
        <div class="summary-copy">
          <div class="summary-top">
            <h3 class="summary-title">Session {{ currentSessionId || '-' }}</h3>
            <n-tag
              :type="isResolved ? 'success' : 'default'"
              :color="
                isResolved
                  ? undefined
                  : { color: '#fdf3d0', textColor: '#7a5a00', borderColor: '#fdf3d0' }
              "
              size="small"
              :bordered="false"
            >
              {{ isResolved ? '已处理' : '待处理' }}
            </n-tag>
          </div>
          <p class="summary-description">用户 {{ currentSessionMeta?.username || '-' }}</p>
          <div v-if="currentSessionMeta?.topic" class="session-topic-inline">
            <span>主题</span>
            <strong>{{ currentSessionMeta.topic }}</strong>
          </div>
        </div>

        <div class="summary-metrics">
          <div class="summary-metric">
            <span>总消息</span>
            <strong>{{ sessionMessages.length }}</strong>
          </div>
          <div class="summary-metric">
            <span>用户</span>
            <strong>{{ userMessageCount }}</strong>
          </div>
          <div class="summary-metric">
            <span>AI</span>
            <strong>{{ assistantMessageCount }}</strong>
          </div>
        </div>
      </div>

      <div class="summary-actions">
        <n-button
          secondary
          :type="isResolved ? 'warning' : 'success'"
          @click="emit('resolve-session', currentSessionId, !isResolved)"
        >
          {{ isResolved ? '恢复待处理' : '标记已处理' }}
        </n-button>

        <n-button quaternary size="small" @click="emit('refresh')">刷新会话</n-button>

        <n-popconfirm @positive-click="emit('delete-session', currentSessionId)">
          <template #trigger>
            <n-button tertiary type="error">删除会话</n-button>
          </template>
          删除后该会话将在后台列表中隐藏，确认继续吗？
        </n-popconfirm>
      </div>

      <n-alert v-if="sessionMessages.length === 0 && !sessionLoading" type="info">
        暂无对话内容
      </n-alert>

      <div class="stream-header">
        <span class="stream-title">对话流</span>
      </div>

      <n-scrollbar style="max-height: 60vh">
        <div class="session-list">
          <div
            v-for="(msg, index) in sessionMessages"
            :key="index"
            class="session-item"
            :class="msg.role === 'user' ? 'session-item-user' : 'session-item-assistant'"
          >
            <div class="session-meta" :class="msg.role === 'user' ? 'session-meta-user' : ''">
              <n-tag
                :type="msg.role === 'user' ? 'info' : 'success'"
                size="small"
                :bordered="false"
              >
                {{ msg.role === 'user' ? 'User' : 'AI Tutor' }}
              </n-tag>
              <span class="session-time">{{ formatTime(msg.createTime) }}</span>
            </div>
            <div
              class="session-bubble"
              :class="msg.role === 'user' ? 'session-bubble-user' : 'session-bubble-assistant'"
            >
              {{ msg.content }}
            </div>
            <div v-if="msg.topic" class="session-topic">
              <span class="session-topic-label">主题</span>
              <span>{{ msg.topic }}</span>
            </div>
          </div>
        </div>
      </n-scrollbar>
    </div>

    <n-divider dashed />
    <div class="session-footer">
      <span>Session ID: {{ currentSessionId }}</span>
      <span>当前状态: {{ isResolved ? '已处理' : '待处理' }}</span>
    </div>
  </n-modal>
</template>

<style scoped>
.session-container {
  padding: 4px 0 12px;
}

.session-summary {
  margin-bottom: 14px;
  padding: 16px 18px;
  border-radius: var(--r-lg);
  background: var(--paper-sunken);
  display: grid;
  gap: 14px;
}

.summary-copy {
  display: grid;
  gap: 6px;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.summary-description {
  margin: 0;
  line-height: 1.6;
  color: var(--ink-2);
}

.session-topic-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 4px 8px;
  border-radius: var(--r-sm);
  background: var(--surface);
  color: var(--ink-2);
  font-size: 12px;
}

.session-topic-inline span {
  color: var(--ink-3);
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-metric {
  padding: 10px 14px;
  border-radius: var(--r-md);
  background: var(--surface);
  display: grid;
  gap: 4px;
}

.summary-metric span {
  font-size: 12px;
  color: var(--ink-3);
}

.summary-metric strong {
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.summary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 10px;
}

.stream-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
}

.session-list {
  padding: 10px 6px 6px;
}

.session-item {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.session-item-user {
  align-items: flex-end;
}

.session-item-assistant {
  align-items: flex-start;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.session-meta-user {
  flex-direction: row-reverse;
}

.session-time {
  font-size: 12px;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}

.session-bubble {
  padding: 12px 14px;
  border-radius: var(--r-lg);
  max-width: 90%;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.session-bubble-user {
  background: var(--accent-soft);
  color: var(--ink);
  border-top-right-radius: 0;
}

.session-bubble-assistant {
  background: var(--surface);
  color: var(--ink);
  border-top-left-radius: 0;
  border: 1px solid var(--line);
}

.session-topic {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  padding: 4px 8px;
  border-radius: var(--r-sm);
  font-size: 12px;
  color: var(--ink-2);
  background: var(--paper-sunken);
}

.session-topic-label {
  color: var(--ink-3);
}

.session-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--ink-3);
}

@media (max-width: 640px) {
  .summary-metrics {
    grid-template-columns: 1fr;
  }

  .stream-header,
  .session-footer,
  .summary-top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
