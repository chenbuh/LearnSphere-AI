<script setup>
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NPagination, NSelect, NTag, useMessage, NSpace } from 'naive-ui'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const records = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const contentType = ref(null)

const contentTypeOptions = [
  { label: '全部', value: null },
  { label: '词汇', value: 'vocabulary' },
  { label: '语法', value: 'grammar' },
  { label: '阅读', value: 'reading' }
]

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户ID', key: 'userId', width: 80 },
  { 
    title: '内容类型', 
    key: 'contentType',
    width: 100,
    render: (row) => {
      const typeMap = {
        vocabulary: { text: '词汇', type: 'info' },
        grammar: { text: '语法', type: 'success' },
        reading: { text: '阅读', type: 'warning' }
      }
      const info = typeMap[row.contentType] || { text: row.contentType, type: 'default' }
      return h(NTag, { type: info.type, size: 'small' }, { default: () => info.text })
    }
  },
  { title: '内容ID', key: 'contentId', width: 80 },
  { 
    title: '是否正确', 
    key: 'isCorrect',
    width: 100,
    render: (row) => {
      return h(NTag, {
        type: row.isCorrect === 1 ? 'success' : 'error',
        size: 'small'
      }, { default: () => row.isCorrect === 1 ? '正确' : '错误' })
    }
  },
  { title: '得分', key: 'score', width: 80 },
  { title: '耗时(秒)', key: 'timeSpent', width: 100 },
  { title: '掌握程度', key: 'masteryLevel', width: 100 },
  {
    title: '学习时间',
    key: 'createTime',
    width: 180,
    render: (row) => {
      return row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
    }
  }
]

const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await adminApi.getLearningRecords({
      page: page.value,
      size: pageSize.value,
      contentType: contentType.value
    })
    records.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    message.error('获取学习记录失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage) => {
  page.value = newPage
  fetchRecords()
}

const handleFilter = () => {
  page.value = 1
  fetchRecords()
}

onMounted(() => {
  fetchRecords()
})
</script>

<template>
  <div class="records-page">
    <header class="page-header">
      <div>
        <h1>学习记录</h1>
        <p>查看用户学习数据统计</p>
      </div>
    </header>

    <!-- 筛选栏 -->
    <n-card class="filter-card">
      <n-space align="center">
        <n-select
          v-model:value="contentType"
          :options="contentTypeOptions"
          placeholder="内容类型"
          style="width: 150px"
          @update:value="handleFilter"
        />
      </n-space>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="records"
        :loading="loading"
        :bordered="false"
      />
      
      <div class="pagination">
        <n-pagination
          v-model:page="page"
          :page-count="Math.ceil(total / pageSize)"
          @update:page="handlePageChange"
        />
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.records-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #71717a;
  font-size: 0.95rem;
}

.filter-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 24px;
}

.table-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
