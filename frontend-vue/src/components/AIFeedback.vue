<script setup>
import { ref } from 'vue'
import { 
  NButton, NSpace, NModal, NInput, NRate, useMessage,
  NIcon, NTooltip
} from 'naive-ui'
import { ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-vue-next'
import { aiApi } from '@/api/ai'

const props = defineProps({
  logId: {
    type: [Number, String],
    required: true
  }
})

const message = useMessage()
const showModal = ref(false)
const loading = ref(false)
const rating = ref(null) // 1 for positive, -1 for negative
const feedbackText = ref('')

const handleRating = (val) => {
  rating.value = val
  showModal.value = true
}

const submitFeedback = async () => {
  if (rating.value === null) return
  
  loading.value = true
  try {
    const res = await aiApi.submitFeedback({
      logId: props.logId,
      rating: rating.value,
      feedbackText: feedbackText.value
    })
    
    if (res.code === 200) {
      message.success('感谢您的宝贵意见！我们会继续优化 AI 模型。')
      showModal.value = false
      // Reset state
      feedbackText.value = ''
    }
  } catch (error) {
    message.error('提交反馈失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="ai-feedback-trigger">
    <n-space size="small">
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button 
            circle 
            secondary 
            size="small" 
            :type="rating === 1 ? 'success' : 'default'"
            @click="handleRating(1)"
          >
            <template #icon><n-icon :component="ThumbsUp" /></template>
          </n-button>
        </template>
        认为此内容有帮助
      </n-tooltip>

      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button 
            circle 
            secondary 
            size="small"
            :type="rating === -1 ? 'error' : 'default'"
            @click="handleRating(-1)"
          >
            <template #icon><n-icon :component="ThumbsDown" /></template>
          </n-button>
        </template>
        觉得 AI 生成内容有误
      </n-tooltip>
    </n-space>

    <n-modal
      v-model:show="showModal"
      preset="card"
      style="width: 450px; border-radius: 16px;"
      :title="rating === 1 ? '告诉我们哪里好？' : '指出 AI 的不足'"
      class="feedback-modal"
    >
      <div class="feedback-content flex flex-col gap-4">
        <div class="flex items-center gap-2 text-zinc-400 text-sm mb-2">
          <MessageSquare :size="16" />
          <span>您的反馈将被用于优化提升 LearnSphere AI 的生成质量</span>
        </div>
        
        <n-input
          v-model:value="feedbackText"
          type="textarea"
          placeholder="补充您的详细观察或修正建议（可选）..."
          :autosize="{ minRows: 4, maxRows: 8 }"
        />
      </div>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button 
            type="primary" 
            :loading="loading" 
            @click="submitFeedback"
            icon-placement="right"
          >
            <template #icon><n-icon :component="Send" /></template>
            提交反馈
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.ai-feedback-trigger {
  display: inline-flex;
  align-items: center;
}

:deep(.n-button.n-button--circle) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-button.n-button--circle:hover) {
  transform: scale(1.1);
}

.feedback-modal {
  backdrop-filter: blur(10px);
}
</style>
