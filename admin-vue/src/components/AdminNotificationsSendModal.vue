<script setup>
import { defineAsyncComponent } from 'vue'
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NRadioButton,
  NRadioGroup,
  NSelect,
  NSpace
} from 'naive-ui'
import { Send } from 'lucide-vue-next'

const AsyncDatePicker = defineAsyncComponent(() => import('@/components/AsyncDatePicker.vue'))

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  formModel: {
    type: Object,
    required: true
  },
  typeOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'send'])
</script>

<template>
  <n-modal v-if="show" :show="show" preset="card" title="发送通知" style="width: 600px" @update:show="emit('update:show', $event)">
    <n-form :model="formModel" label-placement="top">
      <n-form-item label="通知标题" required>
        <n-input v-model:value="formModel.title" placeholder="请输入通知标题" />
      </n-form-item>

      <n-form-item label="通知内容" required>
        <n-input
          v-model:value="formModel.content"
          type="textarea"
          :rows="4"
          placeholder="请输入通知内容"
        />
      </n-form-item>

      <n-form-item label="通知类型">
        <n-select v-model:value="formModel.type" :options="typeOptions" />
      </n-form-item>

      <n-form-item label="优先级">
        <n-radio-group v-model:value="formModel.priority">
          <n-radio-button :value="0">普通</n-radio-button>
          <n-radio-button :value="1">重要</n-radio-button>
          <n-radio-button :value="2">紧急</n-radio-button>
        </n-radio-group>
      </n-form-item>

      <n-form-item label="发送对象">
        <n-radio-group v-model:value="formModel.targetType">
          <n-radio-button value="all">所有用户</n-radio-button>
          <n-radio-button value="vip">VIP用户</n-radio-button>
          <n-radio-button value="specific">指定用户</n-radio-button>
        </n-radio-group>
      </n-form-item>

      <n-form-item v-if="formModel.targetType === 'specific'" label="用户ID列表">
        <n-input
          v-model:value="formModel.targetUserIds"
          placeholder="多个ID用逗号分隔，例如: 1,2,3"
        />
      </n-form-item>

      <n-form-item label="过期时间（可选）">
        <AsyncDatePicker
          v-model:value="formModel.expireTime"
          type="datetime"
          clearable
          style="width: 100%"
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" :loading="loading" @click="emit('send')">
          <template #icon><Send :size="16" /></template>
          立即发送
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
