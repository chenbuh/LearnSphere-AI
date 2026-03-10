<template>
  <div class="result-container">
    <div class="back-button-container mb-6">
      <n-button secondary @click="emit('restart')">
        <template #icon>
          <n-icon :component="RotateCcw" />
        </template>
        返回设置
      </n-button>
    </div>

    <n-card class="score-card" :bordered="false">
      <n-result status="success" title="阅读完成" :description="'你的理解正确率：' + score + '%'">
        <template #icon>
          <n-icon :component="Trophy" size="80" color="#eab308" />
        </template>
        <template #extra>
          <div class="flex justify-center mb-4" v-if="currentLogId">
            <AIFeedback :log-id="currentLogId" />
          </div>
        </template>
        <template #footer>
          <n-space justify="center" vertical :size="16">
            <n-space justify="center">
              <n-button @click="emit('restart')">阅读下一篇</n-button>
              <n-button type="primary" @click="emit('review')">查看原文解析</n-button>
            </n-space>

            <n-button secondary class="share-btn" @click="shareVisible = true">
              <template #icon>
                <n-icon :component="Share2" />
              </template>
              分享学习成果
            </n-button>
          </n-space>
        </template>
      </n-result>
    </n-card>

    <ShareModal
      v-model:show="shareVisible"
      :title="shareContent.title"
      :description="shareContent.description"
      :url="shareContent.url"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NCard, NIcon, NResult, NSpace } from 'naive-ui'
import { RotateCcw, Share2, Trophy } from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import AIFeedback from '@/components/AIFeedback.vue'

const props = defineProps({
  score: {
    type: Number,
    default: 0
  },
  currentLogId: {
    type: [Number, String],
    default: null
  },
  showShare: {
    type: Boolean,
    default: false
  },
  shareContent: {
    type: Object,
    default: () => ({ title: '', description: '', url: '' })
  }
})

const emit = defineEmits(['restart', 'review', 'update:showShare'])

const shareVisible = computed({
  get: () => props.showShare,
  set: (value) => emit('update:showShare', value)
})
</script>

<style scoped>
.score-card {
  text-align: center;
  padding: 40px;
  border-radius: 24px;
  margin-bottom: 24px;
}
</style>
