<script setup>
import { NAlert, NButton, NInput, NModal, NSpace } from 'naive-ui'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentPrompt: {
    type: Object,
    default: () => ({
      content: '',
      promptKey: '',
      description: '',
      remark: ''
    })
  }
})

const emit = defineEmits(['update:show', 'update:prompt', 'save'])

const updateField = (key, value) => {
  emit('update:prompt', {
    ...props.currentPrompt,
    [key]: value
  })
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    style="width: 800px"
    :title="'编辑提示词: ' + (currentPrompt.promptKey || '')"
    :bordered="false"
    @update:show="emit('update:show', $event)"
  >
    <n-space vertical :size="20">
      <n-alert type="info" show-icon>
        修改提示词将立即影响 AI 助教的回答风格和准则。请确保内容中包含必要的占位符（如 %s）。
      </n-alert>

      <div class="field-group">
        <span class="field-label">提示词内容</span>
        <n-input
          :value="currentPrompt.content"
          type="textarea"
          :autosize="{ minRows: 10, maxRows: 20 }"
          placeholder="在此输入系统提示词内容..."
          @update:value="updateField('content', $event)"
        />
      </div>

      <div class="field-group">
        <span class="field-label">更新说明/备注</span>
        <n-input
          :value="currentPrompt.remark"
          placeholder="记录本次修改的原因，方便后续回滚..."
          @update:value="updateField('remark', $event)"
        />
      </div>

      <div class="footer-actions">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="emit('save')">保存更改</n-button>
      </div>
    </n-space>
  </n-modal>
</template>

<style scoped>
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>
