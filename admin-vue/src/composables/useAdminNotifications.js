import { h, onMounted, ref } from 'vue'
import { useMessage, NButton, NPopconfirm, NTag } from 'naive-ui'
import { Trash2 } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const createNotificationForm = () => ({
  title: '',
  content: '',
  type: 'system',
  priority: 0,
  targetType: 'all',
  targetUserIds: '',
  expireTime: null
})

const formatDateTimePayload = (value) => {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const formatDisplayTime = (value, fallback = '-') => {
  if (!value) {
    return fallback
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString('zh-CN')
}

const typeOptions = [
  { label: '系统通知', value: 'system' },
  { label: '公告', value: 'announcement' },
  { label: '更新', value: 'update' },
  { label: '警告', value: 'warning' }
]

export function useAdminNotifications() {
  const message = useMessage()
  const loading = ref(false)
  const showSendModal = ref(false)
  const notifications = ref([])
  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const formModel = ref(createNotificationForm())

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

  const resetForm = () => {
    formModel.value = createNotificationForm()
  }

  const openSendModal = () => {
    resetForm()
    showSendModal.value = true
  }

  const updateShowSendModal = (value) => {
    showSendModal.value = value
  }

  const handleSend = async () => {
    const payload = {
      ...formModel.value,
      expireTime: formatDateTimePayload(formModel.value.expireTime)
    }

    loading.value = true
    try {
      await adminApi.sendNotification(payload)
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
        const labels = {
          all: '当前所有用户',
          all_future: '所有用户(含新注册)',
          vip: '当前VIP用户',
          vip_future: 'VIP用户(含后续开通)',
          specific: '指定用户'
        }
        return labels[row.targetType] || row.targetType
      }
    },
    {
      title: '发送时间',
      key: 'createTime',
      width: 180,
      render(row) {
        return formatDisplayTime(row.createTime)
      }
    },
    {
      title: '过期时间',
      key: 'expireTime',
      width: 180,
      render(row) {
        return formatDisplayTime(row.expireTime, '永久有效')
      }
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
            trigger: () =>
              h(
                NButton,
                { size: 'small', type: 'error', tertiary: true },
                { default: () => '删除', icon: () => h(Trash2, { size: 16 }) }
              ),
            default: () => '确定删除这条通知吗？'
          }
        )
      }
    }
  ]

  const handlePageChange = (nextPage) => {
    page.value = nextPage
    fetchNotifications()
  }

  onMounted(() => {
    fetchNotifications()
  })

  return {
    columns,
    fetchNotifications,
    formModel,
    handlePageChange,
    handleSend,
    loading,
    notifications,
    openSendModal,
    page,
    pageSize,
    showSendModal,
    total,
    typeOptions,
    updateShowSendModal
  }
}
