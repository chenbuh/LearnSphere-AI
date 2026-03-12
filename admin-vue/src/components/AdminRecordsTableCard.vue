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
    <div class="table-toolbar">
      <div>
        <h2>记录列表</h2>
        <p>当前页 {{ records.length }} 条，累计 {{ total }} 条记录</p>
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
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.table-toolbar {
  margin-bottom: 16px;
}

.table-toolbar h2 {
  margin: 0;
  color: #e4e4e7;
  font-size: 1.02rem;
  font-weight: 700;
}

.table-toolbar p {
  margin: 6px 0 0;
  color: #71717a;
  font-size: 0.9rem;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
