<script setup>
import { computed, ref, watch } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSpace,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'

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

const createEditForm = (user = {}) => ({
  id: user.id ?? null,
  nickname: user.nickname ?? '',
  email: user.email ?? '',
  phone: user.phone ?? '',
  dailyAiQuota: user.dailyAiQuota ?? null,
  dailyTutorQuota: user.dailyTutorQuota ?? null
})

const editForm = ref(createEditForm())

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

watch(
  () => props.show,
  (show) => {
    if (show) {
      editForm.value = createEditForm(props.user)
    }
  },
  { immediate: true }
)

const handleUpdateProfile = async () => {
  try {
    saving.value = true
    await adminApi.updateUserProfile(editForm.value.id, editForm.value)
    message.success('用户信息更新成功')
    emit('updated')
    modalVisible.value = false
  } catch (error) {
    message.error('更新失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" title="编辑资料" style="width: 500px">
    <n-form>
      <n-form-item label="昵称">
        <n-input v-model:value="editForm.nickname" />
      </n-form-item>
      <n-form-item label="邮箱">
        <n-input v-model:value="editForm.email" />
      </n-form-item>
      <n-form-item label="手机号">
        <n-input v-model:value="editForm.phone" />
      </n-form-item>
      <n-form-item label="每日 AI 助教提问配额 (留空跟随系统)">
        <n-input-number
          v-model:value="editForm.dailyTutorQuota"
          :min="0"
          :max="10000"
          placeholder="留空则按 VIP 等级计算"
          style="width: 100%"
        >
          <template #suffix>次/天</template>
        </n-input-number>
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="primary" :loading="saving" @click="handleUpdateProfile">保存</n-button>
      </n-space>
    </template>
  </n-modal>
</template>