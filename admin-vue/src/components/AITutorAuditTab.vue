<script setup>
import { h } from 'vue'
import { NAlert, NButton, NCard, NDataTable, NTag } from 'naive-ui'

defineProps({
  sensitiveLogs: {
    type: Array,
    default: () => []
  },
  sensitiveLoading: {
    type: Boolean,
    default: false
  },
  formatTime: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['manage-sensitive'])

const columns = [
  { title: '时间', key: 'createTime', render: (row) => row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-' },
  { title: '用户', key: 'username' },
  {
    title: '命中词',
    key: 'matchedWord',
    render: (row) => h(NTag, { type: 'error', size: 'small' }, { default: () => row.matchedWord })
  },
  { title: '拦截内容', key: 'content', ellipsis: { tooltip: true } },
  {
    title: '处理',
    key: 'actions',
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'error',
          quaternary: true,
          onClick: () => emit('manage-sensitive', row)
        },
        { default: () => '管理违规' }
      )
  }
]
</script>

<template>
  <n-card :bordered="false" class="shadow-sm">
    <div class="mb-4">
      <n-alert title="违规内容说明" type="error" closable>
        下表显示了 AI 助教在提问阶段拦截的敏感内容。这些内容由于违反合规策略已被拦截，未进入 AI 处理流程。
      </n-alert>
    </div>

    <n-data-table
      :loading="sensitiveLoading"
      :data="sensitiveLogs"
      :columns="columns"
      :bordered="false"
    />
    <div v-if="sensitiveLogs.length === 0" class="py-12 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg text-center text-zinc-400">
      暂无拦截记录
    </div>
  </n-card>
</template>
