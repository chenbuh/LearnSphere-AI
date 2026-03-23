<script setup>
import { computed } from 'vue'
import { NAlert, NCard, NModal, NSpin } from 'naive-ui'
import { Sparkles } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  briefingData: {
    type: Object,
    default: () => ({
      title: '',
      summary: '',
      alert: ''
    })
  }
})

const emit = defineEmits(['update:show'])

const generatedAt = computed(() => new Date().toLocaleString('zh-CN'))
</script>

<template>
  <n-modal :show="show" @update:show="emit('update:show', $event)">
    <n-card
      style="width: 600px; max-width: 90vw"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="glass-modal"
    >
      <template #header>
        <div class="briefing-header">
          <div class="briefing-header__icon">
            <Sparkles :size="20" />
          </div>
          <div class="briefing-header__copy">
            <span class="briefing-header__eyebrow">数据简报</span>
            <strong>{{ briefingData.title || '概览摘要' }}</strong>
            <span class="briefing-header__meta">生成于 {{ generatedAt }}</span>
          </div>
        </div>
      </template>

      <div v-if="loading" class="py-12 flex flex-col items-center justify-center">
        <n-spin size="large" />
        <p class="mt-4 text-zinc-400 animate-pulse">正在汇总最新概览数据...</p>
      </div>

      <div v-else class="briefing-content">
        <n-alert v-if="briefingData.alert" type="error" title="需优先处理" class="mb-6">
          {{ briefingData.alert }}
        </n-alert>

        <div class="briefing-section">
          <span class="briefing-section__label">简报内容</span>
          <div class="briefing-section__body whitespace-pre-line">
            {{ briefingData.summary || '暂无摘要内容。' }}
          </div>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped>
.glass-modal {
  background: rgba(9, 9, 11, 0.94);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.briefing-content {
  color: #e4e4e7;
}

.briefing-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.briefing-header__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(92, 168, 255, 0.16);
  color: #78bbff;
}

.briefing-header__copy {
  display: grid;
  gap: 4px;
}

.briefing-header__eyebrow {
  color: #8ea1ba;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.briefing-header__copy strong {
  color: #f7fbff;
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.briefing-header__meta {
  color: #68809c;
  font-size: 0.76rem;
}

.briefing-section {
  display: grid;
  gap: 10px;
}

.briefing-section__label {
  color: #8ea1ba;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.briefing-section__body {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #d7e2f1;
  font-size: 0.94rem;
  line-height: 1.8;
}
</style>
