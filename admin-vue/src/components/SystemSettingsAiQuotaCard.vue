<script setup>
import { Cpu, Save } from 'lucide-vue-next'
import { NButton, NCard, NForm, NFormItem, NInputNumber } from 'naive-ui'

defineProps({
  configs: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save-ai'])
</script>

<template>
  <n-card title="AI 资源配额" class="setting-card">
    <template #header-extra>
      <Cpu class="icon" />
    </template>

    <n-form label-placement="left" label-width="140">
      <n-form-item label="普通用户每日限额">
        <n-input-number v-model:value="configs['ai.limit.daily.0']" :min="0" />
        <template #feedback>次/天</template>
      </n-form-item>
      <n-form-item label="月度会员每日限额">
        <n-input-number v-model:value="configs['ai.limit.daily.1']" :min="0" />
        <template #feedback>次/天</template>
      </n-form-item>
      <n-form-item label="季度会员每日限额">
        <n-input-number v-model:value="configs['ai.limit.daily.2']" :min="0" />
        <template #feedback>次/天</template>
      </n-form-item>
      <n-form-item label="年度会员每日限额">
        <n-input-number v-model:value="configs['ai.limit.daily.3']" :min="0" />
        <template #feedback>次/天</template>
      </n-form-item>
      <n-button type="primary" secondary @click="emit('save-ai')">
        <template #icon>
          <Save />
        </template>
        保存配额设置
      </n-button>
    </n-form>
  </n-card>
</template>

<style scoped>
.setting-card {
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(20, 20, 25, 0.6);
}

.icon {
  width: 20px;
  height: 20px;
  color: #a1a1aa;
}
</style>
