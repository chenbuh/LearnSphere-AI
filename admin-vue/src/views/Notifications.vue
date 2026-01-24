<script setup>
import { ref, onMounted, h } from 'vue'
import {
  NCard, NButton, NInput, NSelect, NDataTable, NTag, NPopconfirm,
  NModal, NForm, NFormItem, NRadioGroup, NRadioButton, NDatePicker, useMessage, NSpace
} from 'naive-ui'
import { Send, Trash2, RefreshCw, Bell } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'


const message = useMessage()
const loading = ref(false)
const showSendModal = ref(false)

// 通知列表
const notifications = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 发送表单
const formModel = ref({
  title: '',
  content: '',
  type: 'system',
  priority: 0,
  targetType: 'all',
  targetUserIds: '',
  expireTime: null
})

const typeOptions = [
  { label: '系统通知', value: 'system' },
  { label: '公告', value: 'announcement' },
  { label: '更新', value: 'update' },
  { label: '警告', value: 'warning' }
]

const priorityOptions = [
  { label: '普通', value: 0 },
  { label: '重要', value: 1 },
  { label: '紧急', value: 2 }
]

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { 
    title: '标题', 
    key: 'title',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 100,
    render(row) {
      const colorMap = {
        system: 'default',
        announcement: 'info',
        update: 'success',
        warning: 'warning'
      }
      return h(
        NTag,
        { type: colorMap[row.type] || 'default', size: 'small' },
        { default: () => row.type }
      )
    }
  },
  {
    title: '优先级',
    key: 'priority',
    width: 100,
    render(row) {
      const labels = ['普通', '重要', '紧急']
      const colors = ['default', 'warning', 'error']
      return h(
        NTag,
        { type: colors[row.priority || 0], size: 'small' },
        { default: () => labels[row.priority || 0] }
      )
    }
  },
  {
    title: '目标',
    key: 'targetType',
    width: 120,
    render(row) {
      const labels = { all: '所有用户', vip: 'VIP用户', specific: '指定用户' }
      return labels[row.targetType] || row.targetType
    }
  },
  {
    title: '发送时间',
    key: 'createTime',
    width: 180
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render(row) {
      return h(
        NPopconfirm,
        {
          onPositiveClick: () => handleDelete(row.id)
        },
        {
          trigger: () => h(
            NButton,
            { size: 'small', type: 'error',  tertiary: true },
            { default: () =>  '删除', icon: () => h(Trash2, { size: 16 }) }
          ),
          default: () => '确定删除这条通知吗？'
        }
      )
    }
  }
]

const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await adminApi.getNotifications({ page: page.value, size: pageSize.value })
    notifications.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (error) {
    message.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

const handleSend = async () => {
  loading.value = true
  try {
    await adminApi.sendNotification(formModel.value)
    message.success('通知发送成功')
    showSendModal.value = false
    resetForm()
    fetchNotifications()
  } catch (error) {
    message.error('发送失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await adminApi.deleteNotification(id)
    message.success('删除成功')
    fetchNotifications()
  } catch (error) {
    message.error('删除失败')
  }
}

const resetForm = () => {
  formModel.value = {
    title: '',
    content: '',
    type: 'system',
    priority: 0,
    targetType: 'all',
    targetUserIds: '',
    expireTime: null
  }
}

const openSendModal = () => {
  resetForm()
  showSendModal.value = true
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="notification-page">
    <header class="page-header">
      <div>
        <h1>通知管理</h1>
        <p>管理和发送系统通知、公告</p>
      </div>
      <n-space>
        <n-button secondary @click="fetchNotifications">
          <template #icon><RefreshCw :size="18" /></template>
          刷新
        </n-button>
        <n-button type="primary" @click="openSendModal">
          <template #icon><Send :size="18" /></template>
          发送通知
        </n-button>
      </n-space>
    </header>

    <n-card class="main-card">
      <n-data-table
        :columns="columns"
        :data="notifications"
        :loading="loading"
        :pagination="{
          page,
          pageSize,
          itemCount: total,
          onChange: (p) => { page = p; fetchNotifications() }
        }"
      />
    </n-card>

    <!-- 发送通知弹窗 -->
    <n-modal v-model:show="showSendModal" preset="card" title="发送通知" style="width: 600px">
      <n-form :model="formModel" label-placement="top">
        <n-form-item label="通知标题" required>
          <n-input v-model:value="formModel.title" placeholder="请输入通知标题" />
        </n-form-item>

        <n-form-item label="通知内容" required>
          <n-input
            v-model:value="formModel.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
          />
        </n-form-item>

        <n-form-item label="通知类型">
          <n-select v-model:value="formModel.type" :options="typeOptions" />
        </n-form-item>

        <n-form-item label="优先级">
          <n-radio-group v-model:value="formModel.priority">
            <n-radio-button :value="0">普通</n-radio-button>
            <n-radio-button :value="1">重要</n-radio-button>
            <n-radio-button :value="2">紧急</n-radio-button>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="发送对象">
          <n-radio-group v-model:value="formModel.targetType">
            <n-radio-button value="all">所有用户</n-radio-button>
            <n-radio-button value="vip">VIP用户</n-radio-button>
            <n-radio-button value="specific">指定用户</n-radio-button>
          </n-radio-group>
        </n-form-item>

        <n-form-item v-if="formModel.targetType === 'specific'" label="用户ID列表">
          <n-input
            v-model:value="formModel.targetUserIds"
            placeholder="多个ID用逗号分隔，例如: 1,2,3"
          />
        </n-form-item>

        <n-form-item label="过期时间（可选）">
          <n-date-picker
            v-model:value="formModel.expireTime"
            type="datetime"
            clearable
            style="width: 100%"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showSendModal = false">取消</n-button>
          <n-button type="primary" :loading="loading" @click="handleSend">
            <template #icon><Send :size="16" /></template>
            立即发送
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.notification-page {
  padding: 24px;
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
  margin-bottom: 4px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #71717a;
  font-size: 0.875rem;
}

.main-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
</style>
