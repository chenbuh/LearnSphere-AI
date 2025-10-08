<script setup>
import { ref, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, useMessage,
  NSpace, NModal, NForm, NFormItem, NInput, NSelect, NPopconfirm, NTag, NInputNumber
} from 'naive-ui'
import { Plus, Edit, Trash } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const dataList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const showModal = ref(false)
const isEdit = ref(false)
const formData = ref({
  id: null,
  examType: 'ielts',
  mode: 'task1',
  title: '',
  prompt: '',
  minWords: 250,
  tips: '[]',
  difficulty: 'medium'
})

const examTypeOptions = [
  { label: 'IELTS', value: 'ielts' },
  { label: 'TOEFL', value: 'toefl' },
  { label: 'CET-4', value: 'cet4' },
  { label: 'CET-6', value: 'cet6' }
]

const modeOptions = [
  { label: 'Task 1', value: 'task1' },
  { label: 'Task 2', value: 'task2' },
  { label: '议论文', value: 'argumentative' },
  { label: '说明文', value: 'expository' }
]

const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', width: 300 },
  { 
    title: '考试类型', 
    key: 'examType', 
    width: 100,
    render: (row) => h(NTag, { type: 'info' }, { default: () => row.examType?.toUpperCase() })
  },
  { title: '模式', key: 'mode', width: 100 },
  { title: '最小词数', key: 'minWords', width: 100 },
  { 
    title: '难度', 
    key: 'difficulty', 
    width: 100,
    render: (row) => h(NTag, { 
      type: row.difficulty === 'hard' ? 'error' : (row.difficulty === 'medium' ? 'warning' : 'success') 
    }, { default: () => row.difficulty })
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: (row) => row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
  },
  { 
    title: '操作', 
    key: 'actions', 
    width: 120, 
    render: (row) => h(NSpace, null, {
      default: () => [
        h(NButton, {
          size: 'small',
          type: 'primary',
          ghost: true,
          onClick: () => handleEdit(row)
        }, { default: () => h(Edit, { size: 14 }) }),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row.id)
        }, {
          trigger: () => h(NButton, {
            size: 'small',
            type: 'error',
            ghost: true
          }, { default: () => h(Trash, { size: 14 }) }),
          default: () => '确定要删除此写作话题吗？'
        })
      ]
    })
  }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getWritingList({ page: page.value, size: pageSize.value })
    dataList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    id: null,
    examType: 'ielts',
    mode: 'task1',
    title: '',
    prompt: '',
    minWords: 250,
    tips: '[]',
    difficulty: 'medium'
  }
  showModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formData.value = { ...row }
  showModal.value = true
}

const handleDelete = async (id) => {
  try {
    await adminApi.deleteWriting(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await adminApi.updateWriting(formData.value.id, formData.value)
    } else {
      await adminApi.addWriting(formData.value)
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

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="writing-page">
    <header class="page-header">
      <div>
        <h1>写作话题管理</h1>
        <p>管理 IELTS、TOEFL 等各类写作练习话题</p>
      </div>
      <n-button type="primary" @click="handleAdd">
        <template #icon>
          <Plus />
        </template>
        添加话题
      </n-button>
    </header>

    <n-card class="content-card">
      <n-data-table
        :columns="columns"
        :data="dataList"
        :loading="loading"
        :bordered="false"
        :single-line="false"
      />

      <div class="pagination">
        <n-pagination
          v-model:page="page"
          :page-count="Math.ceil(total / pageSize)"
          show-size-picker
          @update:page="handlePageChange"
        />
      </div>
    </n-card>

    <!-- 弹窗：添加/编辑 -->
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑写作话题' : '添加写作话题'" style="width: 700px">
      <n-form :model="formData" label-placement="top">
        <n-form-item label="话题标题" path="title">
          <n-input v-model:value="formData.title" placeholder="输入话题标题" />
        </n-form-item>

        <n-space item-style="flex: 1">
          <n-form-item label="考试类型" path="examType">
            <n-select v-model:value="formData.examType" :options="examTypeOptions" />
          </n-form-item>
          <n-form-item label="写作模式" path="mode">
            <n-select v-model:value="formData.mode" :options="modeOptions" />
          </n-form-item>
          <n-form-item label="难度" path="difficulty">
            <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
          </n-form-item>
        </n-space>

        <n-form-item label="最小词数" path="minWords">
          <n-input-number v-model:value="formData.minWords" :min="100" :step="50" />
        </n-form-item>

        <n-form-item label="写作提示/要求" path="prompt">
          <n-input
            v-model:value="formData.prompt"
            type="textarea"
            placeholder="输入详细的写作要求和提示"
            :autosize="{ minRows: 4, maxRows: 10 }"
          />
        </n-form-item>

        <n-form-item label="写作技巧提示 (JSON数组)" path="tips">
          <n-input
            v-model:value="formData.tips"
            type="textarea"
            placeholder='例如: ["明确观点", "逻辑清晰"]'
            :autosize="{ minRows: 2, maxRows: 5 }"
          />
        </n-form-item>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">确定保存</n-button>
        </div>
      </n-form>
    </n-modal>
  </div>
</template>

<style scoped>
.writing-page {
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

.content-card {
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
