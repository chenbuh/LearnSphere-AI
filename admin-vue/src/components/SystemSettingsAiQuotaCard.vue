<script setup>
import { Save } from 'lucide-vue-next'
import { NButton, NForm, NFormItem, NIcon, NInputNumber } from 'naive-ui'

defineProps({
  configs: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save-ai'])

const tiers = [
  { level: 0, label: '普通用户' },
  { level: 1, label: '月度会员' },
  { level: 2, label: '季度会员' },
  { level: 3, label: '年度会员' }
]
</script>

<template>
  <section class="ls-panel settings-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">每日 AI 额度</h2>
    </header>
    <div class="ls-panel__body settings-body">
      <n-form label-placement="left" label-width="120" label-align="left" :show-feedback="false" class="settings-form">
        <div class="settings-row settings-row--head">
          <span>AI 能量值</span>
          <span>AI 助教次数</span>
        </div>
        <n-form-item v-for="tier in tiers" :key="tier.level" :label="tier.label">
          <div class="settings-row">
            <n-input-number v-model:value="configs[`ai.limit.daily.${tier.level}`]" :min="0" class="settings-number">
              <template #suffix>点/天</template>
            </n-input-number>
            <n-input-number v-model:value="configs[`ai.tutor.limit.daily.${tier.level}`]" :min="0" class="settings-number">
              <template #suffix>次/天</template>
            </n-input-number>
          </div>
        </n-form-item>
        <p class="settings-note">能量值由各 AI 功能按「AI 功能消耗」扣减；AI 助教单独计次。用户单独设置的额度优先。</p>
      </n-form>
    </div>
    <footer class="ls-panel__foot">
      <n-button type="primary" secondary @click="emit('save-ai')">
        <template #icon>
          <n-icon :component="Save" />
        </template>
        保存额度设置
      </n-button>
    </footer>
  </section>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
}

.settings-body {
  flex: 1;
}

.settings-form {
  display: grid;
  gap: 12px;
}

.settings-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.settings-row--head {
  padding-left: 120px;
  color: var(--ink-3);
  font-size: 12px;
}

.settings-row--head span {
  width: 150px;
}

.settings-number {
  width: 150px;
}

.settings-note {
  margin: 0;
  color: var(--ink-3);
  font-size: 12px;
}

.settings-number :deep(.n-input__suffix) {
  color: var(--ink-3);
  font-size: 12px;
}
</style>
