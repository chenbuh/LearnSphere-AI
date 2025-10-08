<script setup>
import { ref, onMounted, h } from 'vue'
import { 
  NCard, NDataTable, NButton, NInput, NPagination, NTag, NPopconfirm, useMessage, 
  NSpace, NModal, NForm, NFormItem, NSelect, NDatePicker, NInputNumber,
  NDescriptions, NDescriptionsItem, NStatistic, NGrid, NGridItem, NDivider
} from 'naive-ui'
import { Search, Crown, UserX, UserCheck, Edit, KeyRound, FileText } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const users = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

// Modal States
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showPasswordModal = ref(false)

// Logic Data
const currentUser = ref({})
const userDetail = ref({})
const editForm = ref({
  id: null,
  nickname: '',
  email: '',
  phone: ''
})
const passwordForm = ref({
  id: null,
  password: ''
})

// VIP 设置弹窗
const showVipModal = ref(false)
const vipForm = ref({
  userId: null,
  username: '',
  vipLevel: 1,
  durationType: 'month', // month, quarter, year, custom
  duration: 1,
  customDate: null,
  dailyQuota: 200
})

const vipLevelOptions = [
  { label: '月度会员', value: 1 },
  { label: '季度会员', value: 2 },
  { label: '年度会员', value: 3 }
]

const durationTypeOptions = [
  { label: '按月设置', value: 'month' },
  { label: '按季度设置', value: 'quarter' },
  { label: '按年设置', value: 'year' },
  { label: '自定义日期', value: 'custom' }
]

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickname', width: 120 },
  { 
    title: 'VIP', 
    key: 'vipStatus',
    width: 100,
    render: (row) => {
      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      return h(NTag, {
        type: isVip ? 'warning' : 'default',
        size: 'small',
        bordered: false
      }, { 
        default: () => isVip ? `VIP${row.vipLevel || ''}` : '普通',
        icon: isVip ? () => h(Crown, { size: 14 }) : undefined
      })
    }
  },
  {
    title: 'VIP 到期时间',
    key: 'vipExpireTime',
    width: 160,
    render: (row) => {
      if (!row.vipExpireTime) return '-'
      const expireDate = new Date(row.vipExpireTime)
      const isExpired = expireDate < new Date()
      return h('span', {
        style: { color: isExpired ? '#999' : '#18a058' }
      }, expireDate.toLocaleString('zh-CN'))
    }
  },
  {
    title: '每日配额',
    key: 'dailyAiQuota',
    width: 90,
    render: (row) => row.dailyAiQuota || 0
  },
  { title: '邮箱', key: 'email', width: 180 },
  { 
    title: '状态', 
    key: 'status',
    width: 80,
    render: (row) => {
      return h(NTag, {
        type: row.status === 1 ? 'success' : 'error',
        size: 'small'
      }, { default: () => row.status === 1 ? '正常' : '禁用' })
    }
  },
  {
    title: '注册时间',
    key: 'createTime',
    width: 160,
    render: (row) => {
      return row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
    }
  },
  {
    key: 'actions',
    width: 320,
    fixed: 'right',
    render: (row) => {
      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'info',
            secondary: true,
            onClick: () => openDetailModal(row)
          }, { default: () => '详情' }),

          h(NButton, {
            size: 'small',
            secondary: true,
            onClick: () => openEditModal(row)
          }, { default: () => '编辑' }),

          h(NButton, {
            size: 'small',
            type: 'warning',
            secondary: true,
            onClick: () => openVipModal(row)
          }, { default: () => h(Crown, { size: 14 }) }),
          
          h(NButton, {
            size: 'small',
            type: row.status === 1 ? 'error' : 'success',
            secondary: true,
            onClick: () => toggleStatus(row)
          }, { default: () => row.status === 1 ? '禁用' : '启用' }),
          
          h(NButton, {
            size: 'small',
            secondary: true,
            onClick: () => openPasswordModal(row)
          }, { default: () => h(KeyRound, { size: 14 }) })
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

// 打开 VIP 设置弹窗
const openVipModal = (row) => {
  vipForm.value = {
    userId: row.id,
    username: row.username,
    vipLevel: row.vipLevel || 1,
    durationType: 'month',
    duration: 1,
    customDate: row.vipExpireTime ? new Date(row.vipExpireTime).getTime() : null,
    dailyQuota: row.dailyAiQuota || 200
  }
  showVipModal.value = true
}

// 提交 VIP 设置
const handleGrantVip = async () => {
  try {
    const data = {
      userId: vipForm.value.userId,
      vipLevel: vipForm.value.vipLevel,
      dailyQuota: vipForm.value.dailyQuota
    }

    // 根据类型计算 duration
    if (vipForm.value.durationType === 'custom') {
      // 自定义日期：计算当前时间到目标日期的天数，转换为月数
      if (!vipForm.value.customDate) {
        message.error('请选择 VIP 到期日期')
        return
      }
      const now = new Date()
      const target = new Date(vipForm.value.customDate)
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
      data.duration = Math.max(1, Math.ceil(diffDays / 30))
      data.vipLevel = 1 // 自定义日期使用月度会员级别
    } else {
      data.duration = vipForm.value.duration
    }

    await adminApi.grantVip(data)
    message.success('VIP 设置成功')
    showVipModal.value = false
    fetchUsers()
  } catch (error) {
    message.error(error.response?.data?.msg || 'VIP 设置失败')
  }
}

const handleRevokeVip = async (userId) => {
  try {
    await adminApi.revokeVip(userId)
    message.success('VIP 已取消')
    fetchUsers()
  } catch (error) {
    message.error('取消 VIP 失败')
  }
}

// 详情
const openDetailModal = async (row) => {
  currentUser.value = row
  try {
    const res = await adminApi.getUserDetails(row.id)
    userDetail.value = res.data
    showDetailModal.value = true
  } catch (error) {
    message.error('获取详情失败')
  }
}

// 编辑
const openEditModal = (row) => {
  editForm.value = {
    id: row.id,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone
  }
  showEditModal.value = true
}

const handleUpdateProfile = async () => {
  try {
    await adminApi.updateUserProfile(editForm.value.id, editForm.value)
    message.success('用户信息更新成功')
    showEditModal.value = false
    fetchUsers()
  } catch (error) {
    message.error('更新失败')
  }
}

// 重置密码
const openPasswordModal = (row) => {
  passwordForm.value = {
    id: row.id,
    password: ''
  }
  showPasswordModal.value = true
}

const handleResetPassword = async () => {
  if (!passwordForm.value.password || passwordForm.value.password.length < 6) {
    message.error('密码至少6位')
    return
  }
  try {
    await adminApi.resetUserPassword(passwordForm.value.id, passwordForm.value.password)
    message.success('密码重置成功')
    showPasswordModal.value = false
  } catch (error) {
    message.error('重置失败')
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
        <p>管理平台注册用户及 VIP 权限</p>
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
        :scroll-x="1400"
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

    <!-- VIP 设置弹窗 -->
    <n-modal
      v-model:show="showVipModal"
      preset="card"
      title="VIP 设置"
      style="width: 600px"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
    >
      <n-form :model="vipForm" label-placement="left" label-width="120">
        <n-form-item label="用户">
          <n-input :value="vipForm.username" disabled />
        </n-form-item>

        <n-form-item label="VIP 等级">
          <n-select
            v-model:value="vipForm.vipLevel"
            :options="vipLevelOptions"
            :disabled="vipForm.durationType === 'custom'"
          />
        </n-form-item>

        <n-form-item label="设置方式">
          <n-select
            v-model:value="vipForm.durationType"
            :options="durationTypeOptions"
          />
        </n-form-item>

        <n-form-item v-if="vipForm.durationType !== 'custom'" label="时长">
          <n-input-number
            v-model:value="vipForm.duration"
            :min="1"
            :max="100"
            style="width: 100%"
          >
            <template #suffix>
              {{ vipForm.durationType === 'month' ? '个月' : vipForm.durationType === 'quarter' ? '个季度' : '年' }}
            </template>
          </n-input-number>
        </n-form-item>

        <n-form-item v-else label="到期日期">
          <n-date-picker
            v-model:value="vipForm.customDate"
            type="datetime"
            clearable
            style="width: 100%"
            :is-date-disabled="(ts) => ts < Date.now()"
          />
        </n-form-item>

        <n-form-item label="每日 AI 配额">
          <n-input-number
            v-model:value="vipForm.dailyQuota"
            :min="0"
            :max="10000"
            style="width: 100%"
          >
            <template #suffix>次/天</template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="说明">
          <div style="color: #999; font-size: 12px; line-height: 1.6">
            <p>• 月度会员：按月计费，每月自动续费</p>
            <p>• 季度会员：按季度计费，3个月一期</p>
            <p>• 年度会员：按年计费，12个月一期</p>
            <p>• 自定义日期：精确指定 VIP 到期时间</p>
            <p>• 每日配额：VIP 用户每天可调用的 AI 次数（建议 200-500）</p>
          </div>
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showVipModal = false">取消</n-button>
          <n-button type="primary" @click="handleGrantVip">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="用户详情" style="width: 700px">
      <n-grid :cols="3" :x-gap="12" style="margin-bottom: 24px">
        <n-grid-item>
          <n-card embedded size="small">
            <n-statistic label="累计学习单词" :value="userDetail.totalWordsLearned || 0" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card embedded size="small">
             <n-statistic label="AI 调用次数" :value="userDetail.totalAiUsage || 0" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card embedded size="small">
            <n-statistic label="VIP 状态" :value="userDetail.isVip ? '会员' : '普通用户'">
               <template #suffix><Crown v-if="userDetail.isVip" class="text-yellow-500" /></template>
            </n-statistic>
          </n-card>
        </n-grid-item>
      </n-grid>
      
      <n-descriptions bordered :column="2">
        <n-descriptions-item label="ID">{{ userDetail.user?.id }}</n-descriptions-item>
        <n-descriptions-item label="用户名">{{ userDetail.user?.username }}</n-descriptions-item>
        <n-descriptions-item label="昵称">{{ userDetail.user?.nickname }}</n-descriptions-item>
        <n-descriptions-item label="邮箱">{{ userDetail.user?.email || '-' }}</n-descriptions-item>
        <n-descriptions-item label="VIP 到期">{{ userDetail.vipExpireTime ? new Date(userDetail.vipExpireTime).toLocaleString() : '-' }}</n-descriptions-item>
        <n-descriptions-item label="注册时间">{{ userDetail.user?.createTime ? new Date(userDetail.user.createTime).toLocaleString() : '-' }}</n-descriptions-item>
      </n-descriptions>
    </n-modal>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑资料" style="width: 500px">
      <n-form>
        <n-form-item label="昵称">
          <n-input v-model:value="editForm.nickname" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="editForm.email" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="editForm.phone" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleUpdateProfile">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 重置密码弹窗 -->
    <n-modal v-model:show="showPasswordModal" preset="card" title="重置密码" style="width: 400px">
      <n-form>
        <n-form-item label="新密码">
          <n-input 
            v-model:value="passwordForm.password" 
            type="password" 
            show-password-on="click" 
            placeholder="请输入新密码（至少6位）"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showPasswordModal = false">取消</n-button>
          <n-button type="error" @click="handleResetPassword">确认重置</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.users-page {
  max-width: 1600px;
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
