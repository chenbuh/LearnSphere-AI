<script setup>
import { h } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NInputNumber,
  NSelect,
  NSpace,
  NSwitch,
  NTag
} from 'naive-ui'
import { RefreshCw, Save, Zap } from 'lucide-vue-next'

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
  { title: 'Key', key: 'promptKey', width: 220 },
  { title: '描述', key: 'description' },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          ghost: true,
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
  <div class="settings-layout">
    <div class="settings-main">
      <n-card class="panel-card" title="AI 助教核心提示词" :bordered="false">
        <template #header-extra>
          <n-button quaternary circle size="small" @click="emit('refresh-prompts')">
            <template #icon><RefreshCw :size="16" /></template>
          </n-button>
        </template>

        <n-data-table :loading="promptLoading" :data="promptList" :columns="promptColumns" />
      </n-card>
    </div>

    <div class="settings-side">
      <n-card class="panel-card" title="模型配置" :bordered="false">
        <div class="model-shell">
          <div class="model-summary">
            <div class="model-head">
              <div class="model-label">
                <Zap :size="18" />
                <span>当前运行模型</span>
              </div>
              <n-tag :type="aiConfig.isOverridden ? 'warning' : 'success'" size="small" round :bordered="false">
                {{ aiConfig.isOverridden ? '专项覆盖' : '跟随全局' }}
              </n-tag>
            </div>

            <div class="model-value">
              {{ aiConfig.activeModel === 'default' ? '系统默认' : aiConfig.activeModel }}
            </div>
          </div>

          <div class="field-group">
            <label>切换模型</label>
            <n-select
              :value="aiConfig.activeModel"
              :options="modelOptions"
              @update:value="emit('update-model', $event)"
            />
            <p>这里只覆盖 AI 助教，不再把模型切换同步到全站其它 AI 功能。</p>
          </div>
        </div>
      </n-card>

      <n-card class="panel-card" title="行为策略" :bordered="false">
        <div class="strategy-grid">
          <div class="field-group">
            <label>记忆深度</label>
            <n-input-number
              :value="aiConfig.memoryDepth"
              :min="1"
              :max="30"
              :show-button="false"
              @update:value="aiConfig.memoryDepth = $event ?? 10"
            />
            <p>控制多轮对话最多回带多少条历史消息。</p>
          </div>

          <div class="field-group">
            <label>清理保留天数</label>
            <n-input-number
              :value="aiConfig.cleanupDaysToKeep"
              :min="1"
              :max="365"
              :show-button="false"
              @update:value="aiConfig.cleanupDaysToKeep = $event ?? 30"
            />
            <p>超过该天数的对话会进入待清理范围。</p>
          </div>

          <div class="switch-row">
            <div>
              <strong>Few-shot 注入</strong>
              <span>使用纠错样例增强 AI 助教回答质量。</span>
            </div>
            <n-switch :value="aiConfig.fewShotEnabled" @update:value="aiConfig.fewShotEnabled = $event" />
          </div>

          <div class="switch-row">
            <div>
              <strong>容灾回退</strong>
              <span>主模型失败时启用降级模型和本地兜底回复。</span>
            </div>
            <n-switch :value="aiConfig.fallbackEnabled" @update:value="aiConfig.fallbackEnabled = $event" />
          </div>

          <div class="switch-row">
            <div>
              <strong>自动清理</strong>
              <span>按定时任务自动清理过期会话。</span>
            </div>
            <n-switch :value="aiConfig.autoCleanup" @update:value="aiConfig.autoCleanup = $event" />
          </div>

          <n-button type="primary" class="save-button" @click="emit('save-config')">
            <template #icon><Save :size="16" /></template>
            保存策略
          </n-button>
        </div>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.settings-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
  gap: 20px;
}

.settings-main,
.settings-side {
  display: grid;
  gap: 20px;
  align-content: start;
}

.panel-card {
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.94), rgba(10, 16, 26, 0.84));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
}

.model-shell,
.strategy-grid {
  display: grid;
  gap: 16px;
}

.model-summary {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.model-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.model-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
  font-size: 0.9rem;
  font-weight: 700;
}

.model-value {
  color: #78bbff;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.field-group {
  display: grid;
  gap: 8px;
}

.field-group label {
  color: #cbd5e1;
  font-size: 0.84rem;
  font-weight: 700;
}

.field-group p {
  margin: 0;
  color: #8ea1ba;
  font-size: 0.76rem;
  line-height: 1.6;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.switch-row div {
  display: grid;
  gap: 4px;
}

.switch-row strong {
  color: #f7fbff;
  font-size: 0.88rem;
}

.switch-row span {
  color: #8ea1ba;
  font-size: 0.76rem;
  line-height: 1.55;
}

.save-button {
  justify-self: end;
}

@media (max-width: 1200px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .switch-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .save-button {
    width: 100%;
    justify-self: stretch;
  }
}
</style>
