<script setup>
import { NAlert, NButton, NDivider, NModal, NScrollbar, NTag } from 'naive-ui'

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
  formatTime: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:show', 'refresh'])
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    style="width: 600px; max-height: 80vh"
    title="完整会话追踪"
    :bordered="false"
    @update:show="emit('update:show', $event)"
  >
    <div class="session-container">
      <n-alert v-if="sessionMessages.length === 0 && !sessionLoading" type="info">
        暂无对话内容
      </n-alert>

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
              主题: {{ msg.topic }}
            </div>
          </div>
        </div>
      </n-scrollbar>
    </div>

    <n-divider dashed />
    <div class="session-footer">
      <span>Session ID: {{ currentSessionId }}</span>
      <n-button quaternary size="tiny" @click="emit('refresh')">再刷新</n-button>
    </div>
  </n-modal>
</template>

<style scoped>
.session-container {
  padding: 12px 0;
}

.session-list {
  padding: 8px;
}

.session-item {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
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
  padding: 12px;
  border-radius: 16px;
  max-width: 90%;
  font-size: 14px;
}

.session-bubble-user {
  background: #6366f1;
  color: #fff;
  border-top-right-radius: 0;
}

.session-bubble-assistant {
  background: rgba(39, 39, 42, 0.9);
  color: #e4e4e7;
  border-top-left-radius: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.session-topic {
  margin-top: 4px;
  font-size: 10px;
  color: #a1a1aa;
}

.session-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #71717a;
}
</style>
