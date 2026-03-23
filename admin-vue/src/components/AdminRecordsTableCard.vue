<script setup>
import { computed, h } from 'vue'
import { NCard, NDataTable, NPagination, NTag } from 'naive-ui'

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

const accuracyRate = computed(() => {
  if (!props.records.length) {
    return '0%'
  }

  const correctCount = props.records.filter((row) => row.isCorrect === 1).length
  return `${Math.round((correctCount / props.records.length) * 100)}%`
})

const averageScore = computed(() => {
  const validScores = props.records
    .map((row) => Number(row.score))
    .filter((value) => Number.isFinite(value))

  if (!validScores.length) {
    return 0
  }

  const totalScore = validScores.reduce((sum, value) => sum + value, 0)
  return Math.round((totalScore / validScores.length) * 10) / 10
})

const contentTypeMeta = {
  vocabulary: { text: '词汇', type: 'info' },
  grammar: { text: '语法', type: 'success' },
  reading: { text: '阅读', type: 'warning' }
}

const columns = computed(() => [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户ID', key: 'userId', width: 80 },
  {
    title: '内容类型',
    key: 'contentType',
    width: 100,
    render: (row) => {
      const info = contentTypeMeta[row.contentType] || { text: row.contentType || '-', type: 'default' }
      return h(NTag, { type: info.type, size: 'small', bordered: false }, { default: () => info.text })
    }
  },
  { title: '内容ID', key: 'contentId', width: 80 },
  {
    title: '是否正确',
    key: 'isCorrect',
    width: 100,
    render: (row) =>
      h(
        NTag,
        {
          type: row.isCorrect === 1 ? 'success' : 'error',
          size: 'small',
          bordered: false
        },
        { default: () => (row.isCorrect === 1 ? '正确' : '错误') }
      )
  },
  { title: '得分', key: 'score', width: 80 },
  { title: '耗时(秒)', key: 'timeSpent', width: 100 },
  { title: '掌握程度', key: 'masteryLevel', width: 100 },
  {
    title: '学习时间',
    key: 'createTime',
    width: 180,
    render: (row) => (row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  }
])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
</script>

<template>
  <n-card class="table-card">
    <div class="table-head">
      <div>
        <span class="table-label">学习记录</span>
        <h2>答题明细与成绩结果</h2>
        <p>当前页 {{ records.length }} 条，累计 {{ total }} 条记录。</p>
      </div>
      <div class="table-meta">
        <span class="table-pill">第 {{ page }} 页</span>
        <span class="table-pill">正确率 {{ accuracyRate }}</span>
        <span class="table-pill">平均分 {{ averageScore }}</span>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="records"
      :loading="loading"
      :bordered="false"
    />

    <div class="pagination">
      <n-pagination
        :page="page"
        :page-count="pageCount"
        @update:page="emit('page-change', $event)"
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
  margin-bottom: 16px;
  padding-bottom: 16px;
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
  font-size: 1.08rem;
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
