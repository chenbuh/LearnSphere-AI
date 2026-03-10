<template>
  <div class="setup-container">
    <n-card class="setup-card" :bordered="false" size="huge">
      <div class="setting-section">
        <h3><n-icon :component="Languages" color="#fdba74" class="mr-2" /> {{ translate('话题类型', 'Topic Type') }}</h3>
        <div class="pill-options">
          <div
            v-for="t in topicTypes"
            :key="t.value"
            class="pill-option"
            :class="{ active: settings.type === t.value }"
            @click="emit('update-setting', 'type', t.value)"
          >
            {{ t.label }}
          </div>
        </div>
      </div>

      <div class="setting-section mt-8">
        <h3><n-icon :component="Target" color="#a78bfa" class="mr-2" /> {{ translate('难度', 'Difficulty') }}</h3>
        <div class="pill-options">
          <div
            v-for="d in difficulties"
            :key="d.value"
            class="pill-option"
            :class="{ active: settings.difficulty === d.value }"
            @click="emit('update-setting', 'difficulty', d.value)"
          >
            {{ d.label }}
          </div>
        </div>
      </div>

      <div class="setting-section mt-8">
        <n-button type="primary" size="large" block round class="start-btn" :loading="isLoading" @click="emit('generate')">
          {{ translate('生成话题', 'Generate Topic') }}
        </n-button>
      </div>
    </n-card>

    <SpeakingHistoryPanel
      :topics="topics"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :translate="translate"
      :show-date="true"
      @select="emit('select', $event)"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:page-size', $event)"
    />
  </div>
</template>

<script setup>
import { NButton, NCard, NIcon } from 'naive-ui'
import { Languages, Target } from 'lucide-vue-next'
import SpeakingHistoryPanel from '@/components/speaking/SpeakingHistoryPanel.vue'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  topicTypes: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  topics: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 6
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  translate: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update-setting', 'generate', 'select', 'update:page', 'update:page-size'])
</script>

<style scoped>
.setup-card {
  border-radius: 24px;
}

.setup-card :deep(.n-card) {
  background-color: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  color: var(--text-color);
}

.setup-card :deep(.n-card__content) {
  color: var(--text-color);
}

.setting-section h3 {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.start-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
}

.pill-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pill-option {
  padding: 10px 20px;
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.03);
  border: 2px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  color: #52525b;
}

:global(.dark-mode) .pill-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.05);
  color: #a1a1aa;
}

.pill-option:hover {
  background: rgba(168, 85, 247, 0.1);
  border-color: #a78bfa;
  color: #a78bfa;
}

.pill-option.active {
  background: rgba(249, 115, 22, 0.15);
  border-color: #f97316;
  color: #f97316;
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>