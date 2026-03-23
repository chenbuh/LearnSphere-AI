<script setup>
import { Cpu, Save } from 'lucide-vue-next'
import { NButton, NCard, NForm, NFormItem, NInputNumber } from 'naive-ui'

defineProps({
  configs: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save-quota-cost'])
</script>

<template>
  <n-card title="AI 模块配额消耗" class="setting-card quota-cost-card">
    <template #header-extra>
      <Cpu class="icon" />
    </template>

    <div class="card-intro">
      <strong>模块消耗系数</strong>
      <span>配置每个 AI 功能每次调用所消耗的配额次数，适合按业务成本进行差异化控制。</span>
    </div>

    <n-form label-placement="left" label-width="140">
      <div class="quota-grid">
        <n-form-item label="阅读理解生成">
          <n-input-number v-model:value="configs['quota_cost_reading']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="写作题目生成">
          <n-input-number v-model:value="configs['quota_cost_writing_topic']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="写作批改">
          <n-input-number v-model:value="configs['quota_cost_writing_eval']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="听力生成">
          <n-input-number v-model:value="configs['quota_cost_listening']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="语法生成">
          <n-input-number v-model:value="configs['quota_cost_grammar']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="口语生成">
          <n-input-number v-model:value="configs['quota_cost_speaking_topic']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="口语评测">
          <n-input-number v-model:value="configs['quota_cost_speaking_eval']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="错题深度分析">
          <n-input-number v-model:value="configs['quota_cost_error_analysis']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="口语1V1模考">
          <n-input-number v-model:value="configs['quota_cost_speaking_mock']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
        <n-form-item label="模拟考试生成">
          <n-input-number v-model:value="configs['quota_cost_mock_exam']" :min="1" :max="20" />
          <template #feedback>次/每次调用</template>
        </n-form-item>
      </div>
      <n-button type="primary" secondary style="margin-top: 16px;" @click="emit('save-quota-cost')">
        <template #icon>
          <Save />
        </template>
        保存配额消耗设置
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

.quota-cost-card {
  grid-column: span 2;
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

.quota-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .quota-cost-card {
    grid-column: span 1;
  }

  .quota-grid {
    grid-template-columns: 1fr;
  }
}
</style>
