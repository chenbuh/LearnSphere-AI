<script setup>
import { computed, h } from 'vue'
import { NButton, NDataTable, NPagination, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { getExamTypeLabel } from '@/utils/examTypeMeta'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  vocabularyList: {
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

const emit = defineEmits(['edit', 'delete', 'page-change', 'page-size-change'])
const pageRange = computed(() => {
  if (!props.total) {
    return '0 - 0'
  }

  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.total)
  return `${start} - ${end}`
})

const columns = computed(() => [
  { title: 'ID', key: 'id', width: 80 },
  { title: '单词', key: 'word', width: 160 },
  { title: '音标', key: 'phonetic', width: 140 },
  // 翻译通常很长，限制两行并悬浮看全文，避免撑高整行
  {
    title: '翻译',
    key: 'translation',
    minWidth: 320,
    ellipsis: { tooltip: { width: 420 }, lineClamp: 2 }
  },
  {
    title: '考试类型',
    key: 'examType',
    width: 120,
    render: row =>
      h(
        NTag,
        {
          size: 'small',
          bordered: false
        },
        {
          default: () => getExamTypeLabel(row.examType, row.examType || '未设置')
        }
      )
  },
  { title: '难度', key: 'difficulty', width: 80 },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: row =>
      h(
        NSpace,
        { size: 4, wrap: false },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'primary',
                onClick: () => emit('edit', row)
              },
              { default: () => '编辑' }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => emit('delete', row.id)
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      quaternary: true,
                      type: 'error'
                    },
                    { default: () => '删除' }
                  ),
                default: () => '确定要删除吗？'
              }
            )
          ]
        }
      )
  }
])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
</script>

<template>
  <div class="vocab-table">
    <n-data-table
      :columns="columns"
      :data="vocabularyList"
      :loading="loading"
      :bordered="false"
      :scroll-x="980"
    />

    <div class="ls-panel__foot vocab-table__foot">
      <span class="vocab-table__range">第 {{ pageRange }} 条，共 {{ total }} 条</span>
      <n-pagination
        :page="page"
        :page-count="pageCount"
        :page-size="pageSize"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="emit('page-change', $event)"
        @update:page-size="emit('page-size-change', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.vocab-table__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.vocab-table__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* The headword carries the row; phonetics sit quietly beside it. */
.vocab-table :deep(.n-data-table-td[data-col-key='word']) {
  color: var(--ink);
  font-weight: 600;
}

.vocab-table :deep(.n-data-table-td[data-col-key='phonetic']) {
  color: var(--ink-3);
  font-family: var(--font-mono);
  font-size: 12px;
}
</style>
