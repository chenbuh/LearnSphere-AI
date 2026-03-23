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

    <div class="card-intro">
      <strong>会员分层每日额度</strong>
      <span>以“次数/天”为单位设置不同会员等级的 AI 调用上限，用于控制资源消耗。</span>
    </div>

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

.card-intro {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.12);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-intro strong {
  color: #e2e8f0;
  font-size: 0.92rem;
  font-weight: 700;
}

.card-intro span {
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.55;
}

.icon {
  width: 20px;
  height: 20px;
  color: #a1a1aa;
}
</style>
