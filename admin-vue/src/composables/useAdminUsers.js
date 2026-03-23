import { computed, onMounted, ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'

export function useAdminUsers() {
  const message = useMessage()
  const dialog = useDialog()
  const loading = ref(false)
  const exportLoading = ref(false)
  const users = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')

  const showDetailModal = ref(false)
  const showEditModal = ref(false)
  const showPasswordModal = ref(false)
  const currentUser = ref({})
  const showVipModal = ref(false)

  const selectedUserIds = ref([])
  const showBatchVipModal = ref(false)
  const showBatchNotifyModal = ref(false)

  const showFilterModal = ref(false)
  const activeFilterCount = ref(0)

  const currentPageCount = computed(() => users.value.length)
  const vipUserCount = computed(() =>
    users.value.filter(
      (user) => user.vipExpireTime && new Date(user.vipExpireTime) > new Date()
    ).length
  )
  const disabledUserCount = computed(() =>
    users.value.filter((user) => Number(user.status) !== 1).length
  )
  const customQuotaCount = computed(() =>
    users.value.filter(
      (user) =>
        (user.dailyAiQuota !== null && user.dailyAiQuota !== undefined) ||
        (user.dailyTutorQuota !== null && user.dailyTutorQuota !== undefined)
    ).length
  )

  let xlsxLoader = null
  const loadXlsx = async () => {
    if (!xlsxLoader) {
      xlsxLoader = import('xlsx')
    }

    return xlsxLoader
  }

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

  const updateKeyword = (value) => {
    keyword.value = value
  }

  const updateSelectedUserIds = (value) => {
    selectedUserIds.value = value
  }

  const clearFilter = () => {
    activeFilterCount.value = 0
    fetchUsers()
  }

  const handleSearch = () => {
    page.value = 1
    fetchUsers()
  }

  const handlePageChange = (newPage) => {
    page.value = newPage
    fetchUsers()
  }

  const handlePageSizeChange = (size) => {
    pageSize.value = size
    page.value = 1
    fetchUsers()
  }

  const openBatchVipModal = () => {
    if (selectedUserIds.value.length === 0) {
      message.warning('请先选择用户')
      return
    }
    showBatchVipModal.value = true
  }

  const openBatchNotifyModal = () => {
    if (selectedUserIds.value.length === 0) {
      message.warning('请先选择用户')
      return
    }
    showBatchNotifyModal.value = true
  }

  const toggleStatus = async (row) => {
    const newStatus = row.status === 1 ? 0 : 1
    const actionText = newStatus === 0 ? '禁用' : '启用'

    dialog.warning({
      title: `${actionText}账号`,
      content: newStatus === 0
        ? `确认禁用用户“${row.username}”吗？禁用后该账号当前登录态会立即失效。`
        : `确认启用用户“${row.username}”吗？`,
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await adminApi.updateUserStatus(row.id, newStatus)
          message.success(`${actionText}成功`)
          fetchUsers()
        } catch (error) {
          message.error(`${actionText}失败`)
        }
      }
    })
  }

  const deleteUser = (row) => {
    dialog.error({
      title: '删除账号',
      content: `确认删除用户“${row.username}”吗？删除后该账号将无法继续访问。`,
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await adminApi.deleteUser(row.id)
          message.success('删除成功')
          if (selectedUserIds.value.includes(row.id)) {
            selectedUserIds.value = selectedUserIds.value.filter((id) => id !== row.id)
          }
          fetchUsers()
        } catch (error) {
          message.error('删除失败')
        }
      }
    })
  }

  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
  }

  const openVipModal = (row) => {
    currentUser.value = row
    blurActiveElement()
    showVipModal.value = true
  }

  const openDetailModal = (row) => {
    currentUser.value = row
    blurActiveElement()
    showDetailModal.value = true
  }

  const openEditModal = (row) => {
    currentUser.value = row
    blurActiveElement()
    showEditModal.value = true
  }

  const openPasswordModal = (row) => {
    currentUser.value = row
    blurActiveElement()
    showPasswordModal.value = true
  }

  const updateShowVipModal = (value) => {
    showVipModal.value = value
  }

  const updateShowDetailModal = (value) => {
    showDetailModal.value = value
  }

  const updateShowEditModal = (value) => {
    showEditModal.value = value
  }

  const updateShowPasswordModal = (value) => {
    showPasswordModal.value = value
  }

  const updateShowBatchVipModal = (value) => {
    showBatchVipModal.value = value
  }

  const updateShowBatchNotifyModal = (value) => {
    showBatchNotifyModal.value = value
  }

  const updateShowFilterModal = (value) => {
    showFilterModal.value = value
  }

  const openFilterModal = () => {
    showFilterModal.value = true
  }

  const handleUserUpdated = () => {
    fetchUsers()
  }

  const handleBatchVipUpdated = () => {
    selectedUserIds.value = []
    fetchUsers()
  }

  const handleBatchNotifyUpdated = () => {
    selectedUserIds.value = []
  }

  const handleFilterApplied = ({ records, total: filteredTotal, criteria }) => {
    users.value = records
    total.value = filteredTotal
    activeFilterCount.value = criteria?.conditions?.length || 0
  }

  const handleExport = async () => {
    exportLoading.value = true
    try {
      const res = await adminApi.getUserList({
        page: 1,
        size: 10000,
        keyword: keyword.value
      })

      if (res.code === 200) {
        const XLSX = await loadXlsx()

        const exportData = res.data.records.map((user) => {
          const isVip = user.vipExpireTime && new Date(user.vipExpireTime) > new Date()
          return {
            ID: user.id,
            用户名: user.username,
            昵称: user.nickname,
            邮箱: user.email,
            手机号: user.phone || '',
            身份: isVip ? `VIP${user.vipLevel || ''}` : '普通用户',
            VIP到期时间: user.vipExpireTime ? new Date(user.vipExpireTime).toLocaleString() : '',
            每日配额: isVip ? user.dailyAiQuota : 5,
            状态: user.status === 1 ? '正常' : '禁用',
            注册时间: user.createTime ? new Date(user.createTime).toLocaleString() : ''
          }
        })

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
        XLSX.writeFile(workbook, `User_Export_${new Date().toISOString().slice(0, 10)}.xlsx`)
        message.success('导出成功')
      }
    } catch (error) {
      console.error(error)
      message.error('导出失败')
    } finally {
      exportLoading.value = false
    }
  }

  const headerBindings = computed(() => ({
    keyword: keyword.value,
    activeFilterCount: activeFilterCount.value,
    selectedCount: selectedUserIds.value.length,
    exportLoading: exportLoading.value,
    total: total.value,
    currentPageCount: currentPageCount.value,
    vipUserCount: vipUserCount.value,
    disabledUserCount: disabledUserCount.value,
    customQuotaCount: customQuotaCount.value,
    loading: loading.value
  }))

  const headerEvents = {
    'update:keyword': updateKeyword,
    search: handleSearch,
    'open-filter': openFilterModal,
    'clear-filter': clearFilter,
    'batch-vip': openBatchVipModal,
    'batch-notify': openBatchNotifyModal,
    export: handleExport
  }

  const tableBindings = computed(() => ({
    users: users.value,
    loading: loading.value,
    selectedUserIds: selectedUserIds.value,
    page: page.value,
    pageSize: pageSize.value,
    total: total.value
  }))

  const tableEvents = {
    'update:selected-user-ids': updateSelectedUserIds,
    'page-change': handlePageChange,
    'page-size-change': handlePageSizeChange,
    detail: openDetailModal,
    edit: openEditModal,
    vip: openVipModal,
    'toggle-status': toggleStatus,
    password: openPasswordModal,
    delete: deleteUser
  }

  const modalBindings = computed(() => ({
    showVipModal: showVipModal.value,
    showDetailModal: showDetailModal.value,
    showEditModal: showEditModal.value,
    showPasswordModal: showPasswordModal.value,
    showBatchVipModal: showBatchVipModal.value,
    showBatchNotifyModal: showBatchNotifyModal.value,
    showFilterModal: showFilterModal.value,
    currentUser: currentUser.value,
    selectedUserIds: selectedUserIds.value,
    page: page.value,
    pageSize: pageSize.value
  }))

  const modalEvents = {
    'update:show-vip-modal': updateShowVipModal,
    'update:show-detail-modal': updateShowDetailModal,
    'update:show-edit-modal': updateShowEditModal,
    'update:show-password-modal': updateShowPasswordModal,
    'update:show-batch-vip-modal': updateShowBatchVipModal,
    'update:show-batch-notify-modal': updateShowBatchNotifyModal,
    'update:show-filter-modal': updateShowFilterModal,
    'user-updated': handleUserUpdated,
    'batch-vip-updated': handleBatchVipUpdated,
    'batch-notify-updated': handleBatchNotifyUpdated,
    'filter-applied': handleFilterApplied
  }

  onMounted(() => {
    fetchUsers()
  })

  return {
    headerBindings,
    headerEvents,
    modalBindings,
    modalEvents,
    tableBindings,
    tableEvents
  }
}
