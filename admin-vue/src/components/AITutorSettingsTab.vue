<script setup>
import { h } from 'vue'
import { NButton, NCard, NDataTable, NSpace, NSelect, NTag } from 'naive-ui'
import { RefreshCw, Zap } from 'lucide-vue-next'

defineProps({
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
      isOverridden: false
    })
  }
})

const emit = defineEmits(['refresh-prompts', 'edit-prompt', 'update-model'])

const promptColumns = [
  { title: 'Key', key: 'promptKey', width: 200 },
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
  { label: 'Qwen Turbo (高响应速度)', value: 'qwen-turbo' },
  { label: 'Qwen Plus (平衡性能)', value: 'qwen-plus' },
  { label: 'Qwen Max (最强理解)', value: 'qwen-max' },
  { label: 'Qwen Long (长上下文支持)', value: 'qwen-long' }
]
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <div class="col-span-2 space-y-6">
      <n-card title="AI 助教核心提示词" :bordered="false" class="shadow-sm">
        <template #header-extra>
          <n-button quaternary circle size="small" @click="emit('refresh-prompts')">
            <template #icon><RefreshCw /></template>
          </n-button>
        </template>
        <n-data-table
          :loading="promptLoading"
          :data="promptList"
          :columns="promptColumns"
        />
      </n-card>
    </div>

    <div class="col-span-1 space-y-6">
      <n-card title="模型配置" :bordered="false" class="shadow-sm">
        <div class="space-y-4">
          <div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <Zap class="text-amber-500" :size="18" />
                <span class="font-medium">当前运行模型</span>
              </div>
              <n-tag :type="aiConfig.isOverridden ? 'warning' : 'success'" size="small">
                {{ aiConfig.isOverridden ? '全站覆盖' : '系统默认' }}
              </n-tag>
            </div>
            <div class="text-2xl font-bold text-center py-2 text-indigo-500">
              {{ aiConfig.activeModel === 'default' ? '系统默认(qwen-plus)' : aiConfig.activeModel }}
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs text-zinc-500">切换模版本模型</label>
            <n-select
              :value="aiConfig.activeModel"
              :options="modelOptions"
              @update:value="emit('update-model', $event)"
            />
            <p class="text-[10px] text-zinc-400">
              注：在此切换后，将同步到 AI 学习助手、词汇分析、模拟考试等全站 AI 功能。
            </p>
          </div>
        </div>
      </n-card>

      <n-card title="行为策略" :bordered="false" class="shadow-sm">
        <n-space vertical>
          <div class="flex justify-between items-center text-sm">
            <span>记忆深度</span>
            <n-tag size="small">最近 10 条</n-tag>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span>容灾对冲</span>
            <n-tag size="small" type="success">已开启</n-tag>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span>自动纠错 Few-shot</span>
            <n-tag size="small" type="info">动态注入</n-tag>
          </div>
        </n-space>
      </n-card>
    </div>
  </div>
</template>
