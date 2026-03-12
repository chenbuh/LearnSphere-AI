import { computed, h, onMounted, ref } from 'vue'
import { NButton, NPopconfirm, NSpace, useMessage } from 'naive-ui'
import { Edit, Trash } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import { createDefaultSpeakingForm, createSpeakingColumns } from '@/utils/adminSpeakingConfig'

export function useAdminSpeaking() {
  const message = useMessage()
  const loading = ref(false)
  const dataList = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const showModal = ref(false)
  const isEdit = ref(false)
  const formData = ref(createDefaultSpeakingForm())

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await adminApi.getSpeakingList({ page: page.value, size: pageSize.value })
      dataList.value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      loading.value = false
    }
  }

  const handleEdit = (row) => {
    isEdit.value = true
    formData.value = { ...row }
    showModal.value = true
  }

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteSpeaking(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const renderActions = (row) =>
    h(NSpace, null, {
      default: () => [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => handleEdit(row)
          },
          { default: () => h(Edit, { size: 14 }) }
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id)
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  ghost: true
                },
                { default: () => h(Trash, { size: 14 }) }
              ),
            default: () => '确定要删除此口语话题吗？'
          }
        )
      ]
    })

  const handleAdd = () => {
    isEdit.value = false
    formData.value = createDefaultSpeakingForm()
    showModal.value = true
  }

  const handleSave = async () => {
    try {
      if (isEdit.value) {
        await adminApi.updateSpeaking(formData.value.id, formData.value)
      } else {
        await adminApi.addSpeaking(formData.value)
      }
      message.success('保存成功')
      showModal.value = false
      fetchData()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handlePageChange = (newPage) => {
    page.value = newPage
    fetchData()
  }

  const handlePageSizeChange = (newPageSize) => {
    pageSize.value = newPageSize
    page.value = 1
    fetchData()
  }

  const columns = computed(() => createSpeakingColumns({ renderActions }))
  const pageCount = computed(() => Math.ceil(total.value / pageSize.value))

  onMounted(() => {
    fetchData()
  })

  return {
    columns,
    dataList,
    formData,
    handleAdd,
    handlePageChange,
    handlePageSizeChange,
    handleSave,
    isEdit,
    loading,
    page,
    pageCount,
    pageSize,
    showModal
  }
}
