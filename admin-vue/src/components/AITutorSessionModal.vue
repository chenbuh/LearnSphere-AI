<script setup>
import { computed } from 'vue'
import {
  NAlert,
  NButton,
  NDivider,
  NModal,
  NPopconfirm,
  NScrollbar,
  NTag
} from 'naive-ui'

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
  () => props.sessionMessages.filter((msg) => msg.role === 'user').length
)

const assistantMessageCount = computed(
  () => props.sessionMessages.filter((msg) => msg.role !== 'user').length
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
            <div class="summary-eyebrow">会话摘要</div>
            <n-tag :type="isResolved ? 'success' : 'warning'" size="small" round :bordered="false">
              {{ isResolved ? '已处理' : '待处理' }}
            </n-tag>
          </div>
          <h3 class="summary-title">Session {{ currentSessionId || '-' }}</h3>
          <p class="summary-description">
            用户 {{ currentSessionMeta?.username || '-' }} 的完整对话轨迹，可在这里继续核查内容并处理该会话。
          </p>
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
        <span class="stream-hint">按时间顺序展示用户提问与 AI 回复，便于排查上下文和异常回复。</span>
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
              <n-tag :type="msg.role === 'user' ? 'info' : 'success'" size="small" round quaternary>
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
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.52));
  border: 1px solid rgba(148, 163, 184, 0.14);
  display: grid;
  gap: 14px;
}

.summary-copy {
  display: grid;
  gap: 8px;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.summary-eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.summary-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #f8fafc;
}

.summary-description {
  margin: 0;
  line-height: 1.6;
  color: #cbd5e1;
}

.session-topic-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  font-size: 12px;
}

.session-topic-inline span {
  color: #94a3b8;
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-metric {
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.1);
  display: grid;
  gap: 4px;
}

.summary-metric span {
  font-size: 12px;
  color: #94a3b8;
}

.summary-metric strong {
  font-size: 18px;
  color: #f8fafc;
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
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.stream-hint {
  font-size: 12px;
  color: #71717a;
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
  color: #71717a;
}

.session-bubble {
  padding: 14px 16px;
  border-radius: 16px;
  max-width: 90%;
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.session-bubble-user {
  background: linear-gradient(135deg, #334155, #1e293b);
  color: #fff;
  border-top-right-radius: 0;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.session-bubble-assistant {
  background: rgba(39, 39, 42, 0.9);
  color: #e4e4e7;
  border-top-left-radius: 0;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.session-topic {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  color: #a1a1aa;
  background: rgba(15, 23, 42, 0.44);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.session-topic-label {
  color: #94a3b8;
}

.session-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #71717a;
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
