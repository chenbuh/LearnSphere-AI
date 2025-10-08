<script setup>
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NButton, NInput, NPagination, NTag, NPopconfirm, useMessage, NSpace } from 'naive-ui'
import { Search, UserX, UserCheck } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const users = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '用户名', key: 'username' },
  { title: '昵称', key: 'nickname' },
  { title: '邮箱', key: 'email', width: 200 },
  { 
    title: '状态', 
    key: 'status',
    width: 100,
    render: (row) => {
      return h(NTag, {
        type: row.status === 1 ? 'success' : 'error',
        size: 'small'
      }, { default: () => row.status === 1 ? '正常' : '禁用' })
    }
  },
  { title: '考试类型', key: 'examType', width: 100 },
  { 
    title: '打卡天数', 
    key: 'consecutiveDays',
    width: 100,
    render: (row) => row.consecutiveDays || 0
  },
  {
    title: '注册时间',
    key: 'createTime',
    width: 180,
    render: (row) => {
      return row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) => {
      return h(NSpace, null, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: row.status === 1 ? 'warning' : 'success',
            onClick: () => toggleStatus(row)
          }, { default: () => row.status === 1 ? '禁用' : '启用' }),
          
          h(NPopconfirm, {
            onPositiveClick: () => deleteUser(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error'
            }, { default: () => '删除' }),
            default: () => '确定要删除这个用户吗？'
          })
        ]
      })
    }
  }
]

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUserList({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value
    })
    users.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchUsers()
}

const handlePageChange = (newPage) => {
  page.value = newPage
  fetchUsers()
}

const toggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await adminApi.updateUserStatus(row.id, newStatus)
    message.success('状态更新成功')
    fetchUsers()
  } catch (error) {
    message.error('状态更新失败')
  }
}

const deleteUser = async (id) => {
  try {
    await adminApi.deleteUser(id)
    message.success('删除成功')
    fetchUsers()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="users-page">
    <header class="page-header">
      <div>
        <h1>用户管理</h1>
        <p>管理平台注册用户</p>
      </div>
    </header>

    <!-- 搜索栏 -->
    <n-card class="search-card">
      <n-space align="center">
        <n-input
          v-model:value="keyword"
          placeholder="搜索用户名、邮箱、昵称"
          style="width: 300px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>
        <n-button type="primary" @click="handleSearch">
          搜索
        </n-button>
      </n-space>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="users"
        :loading="loading"
        :bordered="false"
        :single-line="false"
      />
      
      <div class="pagination">
        <n-pagination
          v-model:page="page"
          :page-count="Math.ceil(total / pageSize)"
          :page-size="pageSize"
          show-size-picker
          :page-sizes="[10, 20, 30, 50]"
          @update:page="handlePageChange"
          @update:page-size="(size) => { pageSize = size; fetchUsers() }"
        />
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.users-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.search-card {
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
