<script setup>
import { computed, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  selectedUserIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'updated'])

const message = useMessage()
const saving = ref(false)

const notifyTypeOptions = [
  { label: '站内信', value: 'system' },
  { label: '邮件', value: 'email' },
  { label: '站内信+邮件', value: 'both' }
]

const createBatchNotifyForm = () => ({
  title: '',
  content: '',
  type: 'system'
})

const batchNotifyForm = ref(createBatchNotifyForm())

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

watch(
  () => props.show,
  (show) => {
    if (show) {
      batchNotifyForm.value = createBatchNotifyForm()
    }
  },
  { immediate: true }
)

const handleBatchNotify = async () => {
  if (props.selectedUserIds.length === 0) {
    message.warning('请先选择用户')
    return
  }

  if (!batchNotifyForm.value.title || !batchNotifyForm.value.content) {
    message.warning('请填写标题和内容')
    return
  }

  try {
    saving.value = true
    await adminApi.batchNotify({
      userIds: props.selectedUserIds,
      title: batchNotifyForm.value.title,
      content: batchNotifyForm.value.content,
      type: batchNotifyForm.value.type
    })
    message.success(`成功向 ${props.selectedUserIds.length} 位用户发送通知`)
    emit('updated')
    modalVisible.value = false
  } catch (error) {
    message.error('批量发送通知失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" title="批量发送通知" style="width: 650px">
    <n-alert type="info" :bordered="false" style="margin-bottom: 16px">
      已选择 <strong>{{ selectedUserIds.length }}</strong> 位用户
    </n-alert>
    <n-form label-placement="left" label-width="100">
      <n-form-item label="通知类型">
        <n-select v-model:value="batchNotifyForm.type" :options="notifyTypeOptions" />
      </n-form-item>
      <n-form-item label="标题">
        <n-input v-model:value="batchNotifyForm.title" placeholder="请输入通知标题" />
      </n-form-item>
      <n-form-item label="内容">
        <n-input
          v-model:value="batchNotifyForm.content"
          type="textarea"
          :rows="6"
          placeholder="请输入通知内容"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="info" :loading="saving" @click="handleBatchNotify">发送通知</n-button>
      </n-space>
    </template>
  </n-modal>
</template>