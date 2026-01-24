<script setup>
import { ref, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, useMessage,
  NSpace, NInput, NTag, NIcon, NTooltip
} from 'naive-ui'
import { FileClock, User, Search, RefreshCw, CheckCircle, XCircle } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const columns = [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  { 
    title: '操作人', 
    key: 'adminUsername', 
    width: 120,
    render: (row) => h(NSpace, { align: 'center', size: 4 }, {
      default: () => [
        h(NIcon, { component: User, size: 14, class: 'text-zinc-500' }),
        h('span', { class: 'font-medium' }, row.adminUsername)
      ]
    })
  },
  { 
    title: '模块', 
    key: 'module', 
    width: 120,
    render: (row) => h(NTag, { type: 'info', bordered: false, size: 'small' }, {
      default: () => row.module
    })
  },
  { 
    title: '动作', 
    key: 'action', 
    width: 150,
    render: (row) => h('span', { class: 'font-bold' }, row.action)
  },
  { 
    title: '详情', 
    key: 'details',
    ellipsis: { tooltip: true }, 
    render: (row) => h('code', { class: 'text-xs text-zinc-400' }, row.details)
  },
  { 
    title: '状态', 
    key: 'status', 
    width: 100,
    render: (row) => {
        const isSuccess = row.status === 1
        return h(NTag, { 
            type: isSuccess ? 'success' : 'error', 
            bordered: false, 
            size: 'small' 
        }, { 
            default: () => isSuccess ? '成功' : '失败',
            icon: () => h(NIcon, { component: isSuccess ? CheckCircle : XCircle })
        })
    }
  },
  { 
    title: '时间', 
    key: 'createTime', 
    width: 180, 
    render: (row) => new Date(row.createTime).toLocaleString() 
  },
    { 
    title: 'IP', 
    key: 'ip', 
    width: 130 
  }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getOperationLogs({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value
    })
    if (res.code === 200) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    message.error('加载操作日志失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (p) => {
  page.value = p
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="flex items-center gap-3">
        <div class="header-icon bg-blue-500/20 text-blue-500 p-2 rounded-xl">
           <FileClock :size="28" />
        </div>
        <div>
          <h1>管理员操作日志</h1>
          <p class="text-zinc-500">记录系统的关键操作与变更</p>
        </div>
      </div>
      <n-space>
        <n-input
          v-model:value="keyword"
          placeholder="搜索用户名/动作/模块"
          clearable
          style="width: 300px"
          @keyup.enter="() => { page = 1; fetchData() }"
        >
          <template #prefix><n-icon :component="Search" /></template>
        </n-input>
        <n-button secondary @click="fetchData">
          <template #icon><n-icon :component="RefreshCw" /></template>
          刷新
        </n-button>
      </n-space>
    </header>

    <n-card class="main-card" :bordered="false">
      <n-data-table
        :columns="columns"
        :data="list"
        :loading="loading"
        :bordered="false"
        striped
        remote
        size="large"
      />

      <div class="pagination-wrapper mt-6 flex justify-end">
        <n-pagination
          v-model:page="page"
          :item-count="total"
          :page-size="pageSize"
          @update:page="handlePageChange"
        />
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.main-card {
  background: rgba(24, 24, 27, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.02) !important;
  color: #71717a !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.n-data-table-td) {
  background: transparent !important;
  color: #e4e4e7 !important;
}

:deep(.n-data-table .n-data-table-tr--striped .n-data-table-td) {
  background: rgba(255, 255, 255, 0.01) !important;
  color: #e4e4e7 !important;
}

.header-icon {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}
</style>
