<script setup>
import { computed, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NInputNumber,
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

const vipLevelOptions = [
  { label: '月度会员', value: 1 },
  { label: '季度会员', value: 2 },
  { label: '年度会员', value: 3 }
]

const createBatchVipForm = () => ({
  vipLevel: 1,
  duration: 7,
  dailyQuota: 50
})

const batchVipForm = ref(createBatchVipForm())

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

watch(
  () => props.show,
  (show) => {
    if (show) {
      batchVipForm.value = createBatchVipForm()
    }
  },
  { immediate: true }
)

const handleBatchGrantVip = async () => {
  if (props.selectedUserIds.length === 0) {
    message.warning('请先选择用户')
    return
  }

  try {
    saving.value = true
    await adminApi.batchGrantVip({
      userIds: props.selectedUserIds,
      vipLevel: batchVipForm.value.vipLevel,
      duration: batchVipForm.value.duration,
      dailyQuota: batchVipForm.value.dailyQuota
    })
    message.success(`成功为 ${props.selectedUserIds.length} 位用户赠送VIP`)
    emit('updated')
    modalVisible.value = false
  } catch (error) {
    message.error('批量赠送VIP失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" title="批量赠送VIP" style="width: 550px">
    <n-alert type="info" :bordered="false" style="margin-bottom: 16px">
      已选择 <strong>{{ selectedUserIds.length }}</strong> 位用户
    </n-alert>
    <n-form label-placement="left" label-width="100">
      <n-form-item label="VIP等级">
        <n-select v-model:value="batchVipForm.vipLevel" :options="vipLevelOptions" />
      </n-form-item>
      <n-form-item label="时长（天）">
        <n-input-number v-model:value="batchVipForm.duration" :min="1" :max="365" style="width: 100%" />
      </n-form-item>
      <n-form-item label="每日AI配额">
        <n-input-number v-model:value="batchVipForm.dailyQuota" :min="0" :max="1000" style="width: 100%" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="warning" :loading="saving" @click="handleBatchGrantVip">确认赠送</n-button>
      </n-space>
    </template>
  </n-modal>
</template>