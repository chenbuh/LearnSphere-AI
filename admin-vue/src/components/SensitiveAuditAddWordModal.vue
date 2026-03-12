<script setup>
import { NButton, NForm, NFormItem, NInput, NModal, NSpace } from 'naive-ui'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  newWord: {
    type: Object,
    default: () => ({ word: '' })
  }
})

const emit = defineEmits(['update:show', 'submit'])
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="新增敏感词"
    style="width: 400px"
    @update:show="emit('update:show', $event)"
  >
    <n-form>
      <n-form-item label="敏感词内容">
        <n-input
          v-model:value="newWord.word"
          placeholder="例如：暴力、赌博..."
          @keyup.enter="emit('submit')"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="emit('submit')">确认添加</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
