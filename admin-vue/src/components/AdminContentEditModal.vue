<script setup>
import { NButton, NDropdown, NForm, NModal } from 'naive-ui'
import { Wand2 } from 'lucide-vue-next'
import AdminContentListeningForm from '@/components/AdminContentListeningForm.vue'
import AdminContentReadingForm from '@/components/AdminContentReadingForm.vue'
import AdminContentGrammarForm from '@/components/AdminContentGrammarForm.vue'
import AdminContentSpeakingForm from '@/components/AdminContentSpeakingForm.vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  activeTab: {
    type: String,
    default: 'listening'
  },
  formData: {
    type: Object,
    required: true
  },
  aiToolOptions: {
    type: Array,
    default: () => []
  },
  listeningTypeOptions: {
    type: Array,
    default: () => []
  },
  readingCategoryOptions: {
    type: Array,
    default: () => []
  },
  grammarTopicOptions: {
    type: Array,
    default: () => []
  },
  speakingTypeOptions: {
    type: Array,
    default: () => []
  },
  difficultyOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'ai-tool-select', 'save'])
</script>

<template>
  <n-modal
    v-if="show"
    :show="show"
    preset="card"
    :title="title"
    style="width: 800px"
    @update:show="emit('update:show', $event)"
  >
    <div class="toolbar">
      <n-dropdown trigger="click" :options="aiToolOptions" @select="emit('ai-tool-select', $event)">
        <n-button secondary type="tertiary" size="small" round>
          <template #icon>
            <Wand2 :size="14" />
          </template>
          AI 智能助手
        </n-button>
      </n-dropdown>
    </div>

    <n-form :model="formData" label-placement="top">
      <AdminContentListeningForm
        v-if="activeTab === 'listening'"
        :form-data="formData"
        :listening-type-options="listeningTypeOptions"
        :difficulty-options="difficultyOptions"
      />

      <AdminContentReadingForm
        v-else-if="activeTab === 'reading'"
        :form-data="formData"
        :reading-category-options="readingCategoryOptions"
        :difficulty-options="difficultyOptions"
      />

      <AdminContentGrammarForm
        v-else-if="activeTab === 'grammar'"
        :form-data="formData"
        :grammar-topic-options="grammarTopicOptions"
        :difficulty-options="difficultyOptions"
      />

      <AdminContentSpeakingForm
        v-else-if="activeTab === 'speaking'"
        :form-data="formData"
        :speaking-type-options="speakingTypeOptions"
        :difficulty-options="difficultyOptions"
      />

      <div class="footer">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="emit('save')">确定保存</n-button>
      </div>
    </n-form>
  </n-modal>
</template>

<style scoped>
.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
