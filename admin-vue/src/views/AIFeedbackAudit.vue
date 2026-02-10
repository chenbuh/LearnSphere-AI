<script setup>
import { ref, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, useMessage,
  NSpace, NTag, NIcon, NTooltip, NGrid, NGridItem, NStatistic,
  NModal, NForm, NFormItem, NInput, NSelect, NDivider
} from 'naive-ui'
import { MessageSquare, User, Clock, CheckCircle, XCircle, Eye, Edit, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const statusFilter = ref(0) // 0: Pending, 1: Processed, 2: Ignored
const ratingFilter = ref(null)

const showAuditModal = ref(false)
const auditLoading = ref(false)
const currentFeedback = ref(null)
const auditForm = ref({
  status: 1,
  correctedContent: '',
  adminNotes: ''
})

const statusOptions = [
  { label: '待处理', value: 0 },
  { label: '已处理', value: 1 },
  { label: '已忽略', value: 2 }
]

const ratingOptions = [
  { label: '全部评分', value: null },
  { label: '正向 (👍)', value: 1 },
  { label: '负向 (👎)', value: -1 }
]

const columns = [
  { 
    title: '用户', 
    key: 'username', 
    width: 120,
    render: (row) => h(NSpace, { align: 'center', size: 4 }, {
      default: () => [
        h(NIcon, { component: User, size: 14, class: 'text-zinc-500' }),
        h('span', { class: 'font-medium' }, row.username || 'System')
      ]
    })
  },
  { 
    title: '内容类型', 
    key: 'action_type', 
    width: 150,
    render: (row) => h(NTag, { type: 'info', bordered: false, size: 'small' }, {
      default: () => row.action_type
    })
  },
  { 
    title: '评分', 
    key: 'rating', 
    width: 80,
    align: 'center',
    render: (row) => h('div', { 
        class: row.rating === 1 ? 'text-emerald-500' : 'text-rose-500' 
    }, [
        h(NIcon, { component: row.rating === 1 ? ThumbsUp : ThumbsDown, size: 20 })
    ])
  },
  { 
    title: '反馈说明', 
    key: 'feedback_text',
    ellipsis: { tooltip: true },
    render: (row) => row.feedback_text || h('span', { class: 'text-zinc-500 italic' }, '无说明')
  },
  { 
    title: '时间', 
    key: 'create_time', 
    width: 180, 
    render: (row) => new Date(row.create_time).toLocaleString() 
  },
  { 
    title: '状态', 
    key: 'status', 
    width: 100,
    render: (row) => {
        const statusMap = {
            0: { label: '待处理', type: 'warning' },
            1: { label: '已处理', type: 'success' },
            2: { label: '已忽略', type: 'default' }
        }
        const s = statusMap[row.status]
        return h(NTag, { type: s.type, bordered: false, size: 'small' }, { default: () => s.label })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => h(NSpace, {}, {
        default: () => [
            h(NButton, {
                size: 'small',
                type: 'primary',
                ghost: true,
                onClick: () => handleOpenAudit(row)
            }, { 
                default: () => row.status === 0 ? '审核' : '查看',
                icon: () => h(NIcon, { component: row.status === 0 ? Edit : Eye })
            })
        ]
    })
  }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getAIFeedbackList({
      page: page.value,
      size: pageSize.value,
      status: statusFilter.value,
      rating: ratingFilter.value
    })
    if (res.code === 200) {
      list.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    message.error('加载反馈数据失败')
  } finally {
    loading.value = false
  }
}

const handleOpenAudit = (row) => {
  currentFeedback.value = row
  auditForm.value = {
    status: row.status === 0 ? 1 : row.status,
    correctedContent: row.corrected_content || row.original_content,
    adminNotes: row.admin_notes || ''
  }
  showAuditModal.value = true
}

const submitAudit = async () => {
  auditLoading.value = true
  try {
    const res = await adminApi.auditAIFeedback({
      id: currentFeedback.value.id,
      ...auditForm.value
    })
    if (res.code === 200) {
      message.success('审核处理成功')
      showAuditModal.value = false
      fetchData()
    }
  } catch (error) {
    message.error('处理失败')
  } finally {
    auditLoading.value = false
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
        <div class="header-icon bg-indigo-500/20 text-indigo-500 p-2 rounded-xl">
           <MessageSquare :size="28" />
        </div>
        <div>
          <h1>AI 内容反馈审核池</h1>
          <p class="text-zinc-500">收集用户对 AI 生成内容的质量反馈，持续进化提示词</p>
        </div>
      </div>
      <n-space>
        <n-select
          v-model:value="ratingFilter"
          :options="ratingOptions"
          style="width: 150px"
          @update:value="() => { page = 1; fetchData() }"
        />
        <n-select
          v-model:value="statusFilter"
          :options="statusOptions"
          style="width: 150px"
          @update:value="() => { page = 1; fetchData() }"
        />
        <n-button secondary @click="fetchData">
          刷新
        </n-button>
      </n-space>
    </header>

    <n-grid :cols="4" :x-gap="24" class="mb-6">
        <n-grid-item>
            <n-card class="stat-card" :bordered="false">
                <n-statistic label="待处理反馈" :value="total">
                    <template #prefix><AlertCircle :size="20" class="mr-2 text-warning" /></template>
                </n-statistic>
            </n-card>
        </n-grid-item>
        <n-grid-item>
            <n-card class="stat-card" :bordered="false">
                <n-statistic label="正向反馈率" value="85.4" suffix="%">
                    <template #prefix><ThumbsUp :size="20" class="mr-2 text-success" /></template>
                </n-statistic>
            </n-card>
        </n-grid-item>
    </n-grid>

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

    <!-- 审核弹窗 -->
    <n-modal
      v-model:show="showAuditModal"
      preset="card"
      style="width: 900px"
      :title="statusFilter === 0 ? '处理 AI 内容反馈' : '查看反馈详情'"
    >
        <div v-if="currentFeedback" class="audit-content">
            <n-grid :cols="2" :x-gap="24">
                <n-grid-item>
                    <div class="section-title">原始内容</div>
                    <div class="content-preview bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-sm font-mono whitespace-pre-wrap max-h-[400px] overflow-auto">
                        {{ currentFeedback.original_content }}
                    </div>
                </n-grid-item>
                <n-grid-item>
                    <div class="section-title">修正内容 (用于优化模型数据集)</div>
                    <n-input
                        v-model:value="auditForm.correctedContent"
                        type="textarea"
                        placeholder="在此输入修正后的高质量内容..."
                        :autosize="{ minRows: 15, maxRows: 15 }"
                        :disabled="currentFeedback.status !== 0"
                    />
                </n-grid-item>
            </n-grid>

            <n-divider />

            <n-form :model="auditForm">
                <n-form-item label="处理状态" v-if="currentFeedback.status === 0">
                    <n-select v-model:value="auditForm.status" :options="statusOptions.filter(o => o.value !== 0)" />
                </n-form-item>
                <n-form-item label="管理员备注">
                    <n-input v-model:value="auditForm.adminNotes" placeholder="记录修正原因或 Prompt 调整建议..." :disabled="currentFeedback.status !== 0" />
                </n-form-item>
            </n-form>
        </div>

        <template #footer>
            <n-space justify="end">
                <n-button @click="showAuditModal = false">取消</n-button>
                <n-button 
                    v-if="currentFeedback?.status === 0" 
                    type="primary" 
                    :loading="auditLoading"
                    @click="submitAudit"
                >
                    提交处理
                </n-button>
            </n-space>
        </template>
    </n-modal>
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

.header-icon {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.section-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #71717a;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.02) !important;
  color: #71717a !important;
  font-weight: 700 !important;
}

.text-warning {
    color: #f59e0b;
}

/* 适配暗黑模式 */
.content-preview {
    color: #d4d4d8;
}
</style>
