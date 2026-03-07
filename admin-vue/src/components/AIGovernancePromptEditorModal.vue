<script setup>
import { computed, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NModal,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'

const createDefaultPrompt = () => ({
  id: null,
  promptKey: '',
  description: '',
  content: '',
  remark: ''
})

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  promptData: {
    type: Object,
    default: () => ({
      id: null,
      promptKey: '',
      description: '',
      content: '',
      remark: ''
    })
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'saved'])

const message = useMessage()
const saving = ref(false)
const localPrompt = ref(createDefaultPrompt())

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const resetForm = () => {
  localPrompt.value = {
    ...createDefaultPrompt(),
    ...(props.promptData || {})
  }
}

watch(
  () => [props.show, props.isEdit, props.promptData?.id, props.promptData?.promptKey],
  ([show]) => {
    if (show) {
      resetForm()
    }
  },
  { immediate: true }
)

const closeModal = () => {
  modalVisible.value = false
}

const handleSave = async () => {
  if (!localPrompt.value.promptKey?.trim()) {
    message.warning('请填写模板标识')
    return
  }

  if (!localPrompt.value.content?.trim()) {
    message.warning('请填写正文内容')
    return
  }

  saving.value = true

  try {
    if (props.isEdit) {
      await adminApi.updatePrompt(localPrompt.value.id, localPrompt.value)
    } else {
      await adminApi.addPrompt(localPrompt.value)
    }

    message.success(props.isEdit ? '更新成功' : '创建成功')
    emit('saved')
    modalVisible.value = false
  } catch (error) {
    console.error(error)
    message.error(props.isEdit ? '更新失败' : '创建失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    preset="card"
    :title="isEdit ? '编辑提示词模板' : '创建提示词模板'"
    style="width: 850px"
  >
    <n-alert type="warning" style="margin-bottom: 20px" closable>
      警告：修改在线提示词会直接影响 AI 生成内容的质量和格式稳定性。请在保存前确认占位符配置正确。
    </n-alert>
    <n-form label-placement="top">
      <n-grid :cols="3" :x-gap="20">
        <n-grid-item>
          <n-form-item label="模板标识 (Key)">
            <n-input
              v-model:value="localPrompt.promptKey"
              :disabled="isEdit"
              placeholder="例如：VOCAB_DETAIL_GEN"
            />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="描述">
            <n-input v-model:value="localPrompt.description" placeholder="说明该提示词的应用场景" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="变更摘要">
            <n-input v-model:value="localPrompt.remark" placeholder="本版本修改了什么？" />
          </n-form-item>
        </n-grid-item>
      </n-grid>
      <n-form-item label="正文内容">
        <n-input
          v-model:value="localPrompt.content"
          type="textarea"
          :autosize="{ minRows: 12, maxRows: 30 }"
          placeholder="输入 Prompt 原始内容..."
          style="font-family: monospace"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px">
        <n-button @click="closeModal">放弃修改</n-button>
        <n-button type="primary" :loading="saving" @click="handleSave">发布变更</n-button>
      </div>
    </template>
  </n-modal>
</template>
