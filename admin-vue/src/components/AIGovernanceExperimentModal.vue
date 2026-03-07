<script setup>
import { computed, ref, watch } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'

const createDefaultForm = () => ({
  name: '',
  actionType: '',
  variantName: 'Variant B',
  systemPromptB: '',
  trafficRatio: 50
})

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'created'])

const message = useMessage()
const saving = ref(false)
const experimentForm = ref(createDefaultForm())

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

watch(
  () => props.show,
  (show) => {
    if (show) {
      experimentForm.value = createDefaultForm()
    }
  },
  { immediate: true }
)

const handleStartExperiment = async () => {
  if (!experimentForm.value.name?.trim()) {
    message.warning('请填写实验名称')
    return
  }

  if (!experimentForm.value.actionType?.trim()) {
    message.warning('请填写目标 Action')
    return
  }

  if (!experimentForm.value.systemPromptB?.trim()) {
    message.warning('请填写 B 版本 Prompt')
    return
  }

  saving.value = true

  try {
    await adminApi.startExperiment(experimentForm.value)
    message.success('实验已启动')
    emit('created')
    modalVisible.value = false
  } catch (error) {
    console.error(error)
    message.error('启动失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" title="创建 A/B 测试实验" style="width: 700px">
    <n-form label-placement="left" label-width="120">
      <n-form-item label="实验名称">
        <n-input v-model:value="experimentForm.name" placeholder="例如：阅读生成 Prompt V2 优化测试" />
      </n-form-item>
      <n-form-item label="目标 Action">
        <n-input v-model:value="experimentForm.actionType" placeholder="例如：GENERATE_READING" />
      </n-form-item>
      <n-form-item label="Variant B 名称">
        <n-input v-model:value="experimentForm.variantName" placeholder="例如：Few-shot Enhanced" />
      </n-form-item>
      <n-form-item label="B 版本 Prompt">
        <n-input
          v-model:value="experimentForm.systemPromptB"
          type="textarea"
          :autosize="{ minRows: 5 }"
          placeholder="输入 Variant B 的完整 System Prompt"
        />
      </n-form-item>
      <n-form-item label="B 版本流量 (%)">
        <n-input v-model:value="experimentForm.trafficRatio" type="number" placeholder="50" />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="flex justify-end gap-2">
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="handleStartExperiment">启动实验</n-button>
      </div>
    </template>
  </n-modal>
</template>
