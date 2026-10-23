<script setup>
import { h } from 'vue'
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInputNumber,
  NSelect,
  NSwitch,
  NTag
} from 'naive-ui'
import { RefreshCw, Save } from 'lucide-vue-next'

const props = defineProps({
  promptList: {
    type: Array,
    default: () => []
  },
  promptLoading: {
    type: Boolean,
    default: false
  },
  aiConfig: {
    type: Object,
    default: () => ({
      activeModel: 'default',
      isOverridden: false,
      memoryDepth: 10,
      fewShotEnabled: true,
      fallbackEnabled: true,
      cleanupDaysToKeep: 30,
      autoCleanup: true
    })
  }
})

const emit = defineEmits(['refresh-prompts', 'edit-prompt', 'update-model', 'save-config'])

const promptColumns = [
  { title: 'Key', key: 'promptKey', width: 220, ellipsis: { tooltip: true } },
  { title: '描述', key: 'description', ellipsis: { tooltip: true } },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          quaternary: true,
          onClick: () => emit('edit-prompt', row)
        },
        { default: () => '编辑' }
      )
  }
]

const modelOptions = [
  { label: '跟随系统全局设置', value: 'default' },
  { label: 'Qwen Turbo', value: 'qwen-turbo' },
  { label: 'Qwen Plus', value: 'qwen-plus' },
  { label: 'Qwen Max', value: 'qwen-max' },
  { label: 'Qwen3.5 Turbo', value: 'qwen3.5-turbo' },
  { label: 'Qwen3.5 Plus', value: 'qwen3.5-plus' },
  { label: 'Qwen3.5 Max', value: 'qwen3.5-max' }
]
</script>

<template>
  <div class="settings-split">
    <div class="settings-col">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">
          核心提示词 <span class="ls-panel__count">共 {{ promptList.length }} 条</span>
        </h2>
        <div class="ls-panel__tools">
          <n-button size="small" secondary :loading="promptLoading" @click="emit('refresh-prompts')">
            <template #icon><RefreshCw :size="14" /></template>
            刷新
          </n-button>
        </div>
      </header>
      <n-data-table
        class="prompt-table"
        :loading="promptLoading"
        :data="promptList"
        :columns="promptColumns"
        :bordered="false"
      />
    </div>

    <div class="settings-col settings-col--side">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">模型与策略</h2>
        <div class="ls-panel__tools">
          <n-button size="small" type="primary" @click="emit('save-config')">
            <template #icon><Save :size="14" /></template>
            保存策略
          </n-button>
        </div>
      </header>

      <div class="ls-panel__body">
        <n-form label-placement="left" label-width="120" label-align="left" :show-feedback="false" class="config-form">
          <n-form-item label="当前模型">
            <div class="model-current">
              <span class="model-value">
                {{ aiConfig.activeModel === 'default' ? '系统默认' : aiConfig.activeModel }}
              </span>
              <n-tag :type="aiConfig.isOverridden ? 'warning' : 'success'" size="small" :bordered="false">
                {{ aiConfig.isOverridden ? '专项覆盖' : '跟随全局' }}
              </n-tag>
            </div>
          </n-form-item>

          <n-form-item label="切换模型">
            <n-select
              :value="aiConfig.activeModel"
              :options="modelOptions"
              title="仅覆盖 AI 助教，不影响其它 AI 功能"
              @update:value="emit('update-model', $event)"
            />
          </n-form-item>

          <n-form-item label="记忆深度">
            <n-input-number
              :value="aiConfig.memoryDepth"
              :min="1"
              :max="30"
              :show-button="false"
              class="num-input"
              @update:value="aiConfig.memoryDepth = $event ?? 10"
            >
              <template #suffix>条</template>
            </n-input-number>
          </n-form-item>

          <n-form-item label="会话保留">
            <n-input-number
              :value="aiConfig.cleanupDaysToKeep"
              :min="1"
              :max="365"
              :show-button="false"
              class="num-input"
              @update:value="aiConfig.cleanupDaysToKeep = $event ?? 30"
            >
              <template #suffix>天</template>
            </n-input-number>
          </n-form-item>

          <n-form-item label="Few-shot 注入">
            <n-switch :value="aiConfig.fewShotEnabled" @update:value="aiConfig.fewShotEnabled = $event" />
          </n-form-item>

          <n-form-item label="容灾回退">
            <n-switch :value="aiConfig.fallbackEnabled" @update:value="aiConfig.fallbackEnabled = $event" />
          </n-form-item>

          <n-form-item label="自动清理">
            <n-switch :value="aiConfig.autoCleanup" @update:value="aiConfig.autoCleanup = $event" />
          </n-form-item>
        </n-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Two columns inside the tab panel, split by a rule; both run full height so edges line up. */
.settings-split {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: stretch;
}

.settings-col {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.settings-col--side {
  border-left: 1px solid var(--line);
}

.prompt-table {
  flex: 1;
}

.prompt-table :deep(.n-data-table-td[data-col-key='promptKey']) {
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 12px;
}

.config-form {
  display: grid;
  gap: 14px;
}

.config-form :deep(.n-form-item-label) {
  color: var(--ink-2);
  white-space: nowrap;
}

.model-current {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
}

.model-value {
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
}

.num-input {
  width: 140px;
}

@media (max-width: 1100px) {
  .settings-split {
    grid-template-columns: 1fr;
  }

  .settings-col--side {
    border-left: 0;
    border-top: 1px solid var(--line);
  }
}
</style>
