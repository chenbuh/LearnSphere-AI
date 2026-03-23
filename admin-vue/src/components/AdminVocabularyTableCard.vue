<script setup>
import { computed, h } from 'vue'
import { NButton, NCard, NDataTable, NPagination, NPopconfirm, NSpace, NTag } from 'naive-ui'
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
  { title: 'ID', key: 'id', width: 60 },
  { title: '单词', key: 'word', width: 150 },
  { title: '音标', key: 'phonetic', width: 120 },
  { title: '翻译', key: 'translation', width: 200 },
  {
    title: '考试类型',
    key: 'examType',
    width: 110,
    render: (row) =>
      h(
        NTag,
        {
          type: 'info',
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
    width: 150,
    render: (row) =>
      h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
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
                    type: 'error'
                  },
                  { default: () => '删除' }
                ),
              default: () => '确定要删除吗？'
            }
          )
        ]
      })
  }
])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
</script>

<template>
  <n-card class="table-card">
    <div class="table-head">
      <div>
        <span class="table-label">词条列表</span>
        <h2>词汇资产与考试归档</h2>
        <p>当前展示 {{ pageRange }} / {{ total }}，优先检查考试类型和翻译完整性。</p>
      </div>
      <div class="table-meta">
        <span class="table-pill">本页 {{ vocabularyList.length }} 条</span>
        <span class="table-pill">每页 {{ pageSize }} 条</span>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="vocabularyList"
      :loading="loading"
      :bordered="false"
    />

    <div class="pagination">
      <n-pagination
        :page="page"
        :page-count="pageCount"
        :page-size="pageSize"
        show-size-picker
        @update:page="emit('page-change', $event)"
        @update:page-size="emit('page-size-change', $event)"
      />
    </div>
  </n-card>
</template>

<style scoped>
.table-card {
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.94), rgba(10, 16, 26, 0.84));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
}

.table-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.table-label {
  display: inline-block;
  margin-bottom: 6px;
  color: #8fe7dc;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.table-head h2 {
  margin: 0;
  color: #f7fbff;
  font-size: 1.1rem;
  font-weight: 700;
}

.table-head p {
  margin: 6px 0 0;
  color: #8ea1ba;
  font-size: 0.88rem;
}

.table-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.table-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #c7d3e3;
  font-size: 0.8rem;
  font-weight: 600;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .table-head {
    flex-direction: column;
  }

  .table-meta {
    justify-content: flex-start;
  }
}
</style>
