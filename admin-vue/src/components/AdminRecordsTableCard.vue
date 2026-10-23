<script setup>
import { computed, h } from 'vue'
import { NDataTable, NPagination, NTag } from 'naive-ui'
import { CheckCircle2, XCircle } from 'lucide-vue-next'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  records: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['page-change'])

const contentTypeMeta = {
  vocabulary: { label: '词汇', color: '#4f46e5', bg: '#eef2ff' },
  grammar: { label: '语法', color: '#7c3aed', bg: '#f5f3ff' },
  reading: { label: '阅读', color: '#0891b2', bg: '#ecfeff' }
}

const columns = computed(() => [
  { title: 'ID', key: 'id', width: 70 },
  {
    title: '用户 ID',
    key: 'userId',
    width: 110,
    render: (row) =>
      h(
        'span',
        { class: 'code-chip record-user-chip' },
        `#${row.userId}`
      )
  },
  {
    title: '内容类型',
    key: 'contentType',
    width: 110,
    render: (row) => {
      const meta = contentTypeMeta[row.contentType] || { label: row.contentType || '-', color: '#64748b', bg: '#f1f5f9' }
      return h(
        'span',
        {
          style: {
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            color: meta.color,
            backgroundColor: meta.bg
          }
        },
        meta.label
      )
    }
  },
  { title: '内容 ID', key: 'contentId', width: 95 },
  {
    title: '答题结果',
    key: 'isCorrect',
    width: 100,
    render: (row) => {
      const isOk = row.isCorrect === 1
      return h(
        NTag,
        {
          type: isOk ? 'success' : 'error',
          size: 'small',
          round: true,
          bordered: false
        },
        {
          default: () => (isOk ? '正确' : '错误'),
          icon: isOk ? () => h(CheckCircle2, { size: 12 }) : () => h(XCircle, { size: 12 })
        }
      )
    }
  },
  {
    title: '得分',
    key: 'score',
    width: 90,
    align: 'right',
    render: (row) => h('span', { class: 'score-val' }, row.score ?? '-')
  },
  {
    title: '耗时',
    key: 'timeSpent',
    width: 95,
    align: 'right',
    render: (row) => (row.timeSpent !== null && row.timeSpent !== undefined ? `${row.timeSpent}s` : '-')
  },
  {
    title: '掌握程度',
    key: 'masteryLevel',
    width: 100,
    align: 'right',
    render: (row) => (row.masteryLevel !== null && row.masteryLevel !== undefined ? `${row.masteryLevel}%` : '-')
  },
  {
    title: '学习时间',
    key: 'createTime',
    minWidth: 175,
    render: (row) => (row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  }
])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
const pageRange = computed(() => {
  if (!props.total) {
    return '0 - 0'
  }

  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.total)
  return `${start} - ${end}`
})
</script>

<template>
  <div class="records-table-wrap">
    <n-data-table
      :columns="columns"
      :data="records"
      :loading="loading"
      :bordered="false"
      :scroll-x="960"
    />

    <div class="ls-panel__foot records-foot">
      <span class="records-foot__range">显示第 {{ pageRange }} 条，共 {{ total }} 条学习记录</span>
      <n-pagination
        :page="page"
        :page-count="pageCount"
        @update:page="emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.records-foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.records-foot__range {
  color: #64748b;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.score-val {
  font-weight: 700;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}

.record-user-chip {
  font-weight: 600;
  color: #4f46e5;
  background: #eef2ff;
  border-color: #c7d2fe;
}
</style>
