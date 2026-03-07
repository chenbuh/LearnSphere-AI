<script setup>
import { computed, ref, watch } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSpace,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'
import AsyncDatePicker from '@/components/AsyncDatePicker.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: () => ({})
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

const durationTypeOptions = [
  { label: '按月设置', value: 'month' },
  { label: '按季度设置', value: 'quarter' },
  { label: '按年设置', value: 'year' },
  { label: '自定义日期', value: 'custom' }
]

const createVipForm = (user = {}) => {
  const isVip = user.vipExpireTime && new Date(user.vipExpireTime) > new Date()

  return {
    userId: user.id ?? null,
    username: user.username ?? '',
    vipLevel: user.vipLevel || 1,
    durationType: 'month',
    duration: 1,
    customDate: user.vipExpireTime ? new Date(user.vipExpireTime).getTime() : null,
    dailyQuota: isVip ? (user.dailyAiQuota || 50) : 50
  }
}

const vipForm = ref(createVipForm())

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

watch(
  () => props.show,
  (show) => {
    if (show) {
      vipForm.value = createVipForm(props.user)
    }
  },
  { immediate: true }
)

const handleVipLevelChange = (value) => {
  if (value === 1) vipForm.value.dailyQuota = 50
  if (value === 2) vipForm.value.dailyQuota = 100
  if (value === 3) vipForm.value.dailyQuota = 200
}

const handleGrantVip = async () => {
  try {
    const data = {
      userId: vipForm.value.userId,
      vipLevel: vipForm.value.vipLevel,
      dailyQuota: vipForm.value.dailyQuota
    }

    if (vipForm.value.durationType === 'custom') {
      if (!vipForm.value.customDate) {
        message.error('请选择 VIP 到期日期')
        return
      }

      const now = new Date()
      const target = new Date(vipForm.value.customDate)
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
      data.duration = Math.max(1, Math.ceil(diffDays / 30))
      data.vipLevel = 1
    } else {
      data.duration = vipForm.value.duration
    }

    saving.value = true
    await adminApi.grantVip(data)
    message.success('VIP 设置成功')
    emit('updated')
    modalVisible.value = false
  } catch (error) {
    message.error(error.response?.data?.msg || 'VIP 设置失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    preset="card"
    title="VIP 设置"
    style="width: 600px"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
  >
    <n-form :model="vipForm" label-placement="left" label-width="120">
      <n-form-item label="用户">
        <n-input :value="vipForm.username" disabled />
      </n-form-item>

      <n-form-item label="VIP 等级">
        <n-select
          v-model:value="vipForm.vipLevel"
          :options="vipLevelOptions"
          :disabled="vipForm.durationType === 'custom'"
          @update:value="handleVipLevelChange"
        />
      </n-form-item>

      <n-form-item label="设置方式">
        <n-select
          v-model:value="vipForm.durationType"
          :options="durationTypeOptions"
        />
      </n-form-item>

      <n-form-item v-if="vipForm.durationType !== 'custom'" label="时长">
        <n-input-number
          v-model:value="vipForm.duration"
          :min="1"
          :max="100"
          style="width: 100%"
        >
          <template #suffix>
            {{ vipForm.durationType === 'month' ? '个月' : vipForm.durationType === 'quarter' ? '个季度' : '年' }}
          </template>
        </n-input-number>
      </n-form-item>

      <n-form-item v-else label="到期日期">
        <AsyncDatePicker
          v-model:value="vipForm.customDate"
          type="datetime"
          clearable
          style="width: 100%"
          :is-date-disabled="(ts) => ts < Date.now()"
        />
      </n-form-item>

      <n-form-item label="每日内容生成配额">
        <n-input-number
          v-model:value="vipForm.dailyQuota"
          :min="0"
          :max="10000"
          style="width: 100%"
        >
          <template #suffix>点/天</template>
        </n-input-number>
      </n-form-item>

      <n-form-item label="说明">
        <div style="color: #999; font-size: 12px; line-height: 1.6">
          <p>• 月度会员：推荐配额 50 点/日</p>
          <p>• 季度会员：推荐配额 100 点/日</p>
          <p>• 年度会员：推荐配额 200 点/日</p>
          <p>• 自定义日期：精确指定 VIP 到期时间</p>
          <p>• 每日配额：VIP 用户每天可调用的 AI 能量值（Units）</p>
        </div>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="handleGrantVip">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>