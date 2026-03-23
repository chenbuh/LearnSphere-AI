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
  NTag,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'
import { buildPromptMeta, isPromptDescriptionAutoManaged } from '@/utils/aiPromptMeta'

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

const promptMeta = computed(() => buildPromptMeta(localPrompt.value))
const descriptionAutoManaged = computed(() => isPromptDescriptionAutoManaged(localPrompt.value.promptKey))

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
    <n-alert type="info" style="margin-bottom: 20px">
      <template #header>模板解析预览</template>
      <div class="meta-preview">
        <n-tag :bordered="false" :type="promptMeta.module.color">{{ promptMeta.module.label }}</n-tag>
        <n-tag :bordered="false" :type="promptMeta.stage.color">{{ promptMeta.stage.label }}</n-tag>
        <n-tag :bordered="false" :type="promptMeta.kind.color">{{ promptMeta.kind.label }}</n-tag>
      </div>
      <div class="meta-hint">{{ promptMeta.module.description }}</div>
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
            <n-input
              v-if="descriptionAutoManaged"
              :value="promptMeta.displayDescription"
              readonly
              placeholder="系统会根据 Prompt Key 自动生成说明"
            />
            <n-input
              v-else
              v-model:value="localPrompt.description"
              placeholder="说明该提示词的应用场景"
            />
            <div class="field-hint">
              {{
                descriptionAutoManaged
                  ? '标准模板的说明会根据 Prompt Key 自动解析，列表中优先展示系统生成的结构化说明。'
                  : '自定义模板可选填写，留空时系统会根据 Prompt Key 自动生成默认说明。'
              }}
            </div>
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

<style scoped>
.meta-preview {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.meta-hint {
  color: #64748b;
  line-height: 1.6;
}

.field-hint {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}
</style>
