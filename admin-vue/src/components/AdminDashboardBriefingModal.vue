<script setup>
import { computed } from 'vue'
import { NAlert, NCard, NModal, NSpin } from 'naive-ui'

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
        <div class="briefing-header__copy">
          <strong>{{ briefingData.title || '数据简报' }}</strong>
          <span class="briefing-header__meta">生成于 {{ generatedAt }}</span>
        </div>
      </template>

      <div v-if="loading" class="py-12 flex flex-col items-center justify-center">
        <n-spin size="large" />
        <p class="mt-4 text-zinc-400 animate-pulse">正在生成...</p>
      </div>

      <div v-else class="briefing-content">
        <n-alert v-if="briefingData.alert" type="error" title="需优先处理" class="mb-6">
          {{ briefingData.alert }}
        </n-alert>

        <div class="briefing-section__body whitespace-pre-line">
          {{ briefingData.summary || '暂无摘要内容。' }}
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped>
.glass-modal {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-pop);
}

/* Loading copy uses Tailwind zinc-400, which is too faint on white. */
.glass-modal .text-zinc-400 {
  color: var(--ink-3);
}

@media (prefers-reduced-motion: reduce) {
  .glass-modal .animate-pulse {
    animation: none;
  }
}

.briefing-content {
  color: var(--ink);
}

.briefing-header__copy {
  display: grid;
  gap: 2px;
}

.briefing-header__copy strong {
  color: var(--ink);
  font-size: 16px;
  font-weight: 650;
}

.briefing-header__meta {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.briefing-section__body {
  color: var(--ink);
  font-size: 14px;
  line-height: 1.8;
}
</style>
