<script setup>
import { computed } from 'vue'
import { NButton, NCard, NResult, NSpace } from 'naive-ui'
import { Share2 } from 'lucide-vue-next'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  isEnglish: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['restart', 'view-analysis', 'share'])

const resultTitle = computed(() => {
  return props.isEnglish ? `Practice completed! Score: ${props.score}` : `练习已完成! 得分: ${props.score}`
})

const resultDescription = computed(() => {
  return props.score >= 60
    ? props.translate('表现不错，继续保持！', 'Great work, keep it up!')
    : props.translate('还需要多加练习，加油！', 'Keep practicing, you can do it!')
})
</script>

<template>
  <n-card class="result-card" :bordered="false">
    <n-result status="success" :title="resultTitle" :description="resultDescription">
      <template #icon>
        <div class="score-circle">
          <span class="val">{{ score }}</span>
        </div>
      </template>

      <template #footer>
        <n-space justify="center" vertical :size="16">
          <n-space justify="center">
            <n-button type="primary" @click="emit('restart')">
              {{ props.translate('返回首页', 'Go Home') }}
            </n-button>
            <n-button secondary @click="emit('view-analysis')">
              {{ props.translate('查看详细解析', 'Detailed Analysis') }}
            </n-button>
          </n-space>

          <n-button secondary @click="emit('share')" class="share-btn">
            <template #icon>
              <n-icon :component="Share2" />
            </template>
            {{ props.translate('分享学习成果', 'Share Learning Result') }}
          </n-button>
        </n-space>
      </template>
    </n-result>
  </n-card>
</template>

<style scoped>
.score-circle {
  width: 120px;
  height: 120px;
  border: 8px solid #6366f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
}

.score-circle .val {
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-color);
}

.result-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  transition: var(--theme-transition);
}

.share-btn {
  min-width: 180px;
}
</style>
