<script setup>
import { ref, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, useMessage,
  NSpace, NInput, NTag, NPopconfirm, NIcon, NTooltip
} from 'naive-ui'
import { Trash, ShieldAlert, User, Search, RefreshCw, AlertTriangle } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const checkedRowKeys = ref([])

const columns = [
  { type: 'selection', width: 40 },
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  { 
    title: '用户', 
    key: 'username', 
    width: 150,
    render: (row) => h(NSpace, { align: 'center', size: 4 }, {
      default: () => [
        h(NIcon, { component: User, size: 14, class: 'text-zinc-500' }),
        h('span', { class: 'font-medium' }, row.username || '未知用户 (' + row.userId + ')')
      ]
    })
  },
  { 
    title: '命中的敏感词', 
    key: 'matchedWord', 
    width: 150,
    render: (row) => h(NTag, { type: 'error', bordered: false, round: true, size: 'small' }, {
      default: () => row.matchedWord
    })
  },
  { 
    title: '触发动作', 
    key: 'action', 
    width: 180,
    render: (row) => h('code', { class: 'text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded' }, row.action)
  },
  { 
    title: '违规内容片段', 
    key: 'content', 
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-zinc-400 italic' }, row.content)
  },
  { 
    title: '发生时间', 
    key: 'createTime', 
    width: 180, 
    render: (row) => new Date(row.createTime).toLocaleString() 
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    render(row) {
      return h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id)
      }, {
        trigger: () => h(NButton, {
          size: 'small',
          type: 'error',
          ghost: true,
          circle: true
        }, { default: () => h(NIcon, { component: Trash, size: 14 }) }),
        default: () => '确定要删除这条审计记录吗？'
      })
    }
  }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getSensitiveLogs({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value
    })
    if (res.code === 200) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    message.error('加载审计日志失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await adminApi.deleteSensitiveLog(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const handlePageChange = (p) => {
  page.value = p
  fetchData()
}

const handleBatchDelete = async () => {
    if (checkedRowKeys.value.length === 0) return
    try {
        await adminApi.deleteSensitiveLogsBatch(checkedRowKeys.value)
        message.success(`成功删除 ${checkedRowKeys.value.length} 条记录`)
        checkedRowKeys.value = []
        fetchData()
    } catch (error) {
        message.error('批量删除失败')
    }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="flex items-center gap-3">
        <div class="header-icon bg-red-500/20 text-red-500 p-2 rounded-xl">
           <ShieldAlert :size="28" />
        </div>
        <div>
          <h1>敏感内容审计</h1>
          <p class="text-zinc-500">监控并管理系统检测到的敏感内容尝试</p>
        </div>
      </div>
      <n-space>
        <n-popconfirm v-if="checkedRowKeys.length > 0" @positive-click="handleBatchDelete">
            <template #trigger>
                <n-button type="error" secondary>
                    <template #icon><n-icon :component="Trash" /></template>
                    批量删除 ({{ checkedRowKeys.length }})
                </n-button>
            </template>
            确定要删除选中的 {{ checkedRowKeys.length }} 条记录吗？
        </n-popconfirm>

        <n-input
          v-model:value="keyword"
          placeholder="搜索用户名/内容/敏感词"
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
      <template #header>
        <div class="flex items-center gap-2 text-sm font-bold text-zinc-400">
           <AlertTriangle :size="16" class="text-amber-500" />
           当前共有 {{ total }} 条违规预警记录
        </div>
      </template>

      <n-data-table
        :columns="columns"
        :data="list"
        :loading="loading"
        :bordered="false"
        striped
        remote
        size="large"
        :row-key="(row) => row.id"
        v-model:checked-row-keys="checkedRowKeys"
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
}

.header-icon {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
}
</style>
