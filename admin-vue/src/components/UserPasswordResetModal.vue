<script setup>
import { computed, ref, watch } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
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

const emit = defineEmits(['update:show'])

const message = useMessage()
const saving = ref(false)
const passwordForm = ref({
  id: null,
  password: ''
})

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

watch(
  () => props.show,
  (show) => {
    if (show) {
      passwordForm.value = {
        id: props.user?.id ?? null,
        password: ''
      }
    }
  },
  { immediate: true }
)

const handleResetPassword = async () => {
  if (!passwordForm.value.password || passwordForm.value.password.length < 6) {
    message.error('密码至少6位')
    return
  }

  try {
    saving.value = true
    await adminApi.resetUserPassword(passwordForm.value.id, passwordForm.value.password)
    message.success('密码重置成功')
    modalVisible.value = false
  } catch (error) {
    message.error('重置失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" title="重置密码" style="width: 400px">
    <n-form>
      <n-form-item label="新密码">
        <n-input
          v-model:value="passwordForm.password"
          type="password"
          show-password-on="click"
          placeholder="请输入新密码（至少6位）"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="modalVisible = false">取消</n-button>
        <n-button type="error" :loading="saving" @click="handleResetPassword">确认重置</n-button>
      </n-space>
    </template>
  </n-modal>
</template>