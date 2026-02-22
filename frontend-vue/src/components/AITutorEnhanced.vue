<template>
  <div class="ai-tutor-enhanced" v-show="show">
    <AITutor
      :context="context"
      :auto-open="show"
      :enable-history="true"
      :session-id="sessionId"
      @close="handleClose"
      @message-sent="handleMessageSent"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AITutor from './AITutor.vue'

const props = defineProps({
  show: Boolean,
  context: Object,
  sessionId: String
})

const emit = defineEmits(['update:show', 'session-created'])

const internalSessionId = ref(props.sessionId)

function handleClose() {
  emit('update:show', false)
}

function handleMessageSent(data) {
  // 如果服务器返回了新的 sessionId,保存它
  if (data && data.sessionId && !internalSessionId.value) {
    internalSessionId.value = data.sessionId
    emit('session-created', data.sessionId)
  }
}

watch(() => props.sessionId, (newVal) => {
  internalSessionId.value = newVal
})
</script>
