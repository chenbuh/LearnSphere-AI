<script setup>
import { ref, onMounted, h, reactive } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, NTabs, NTabPane, useMessage,
  NSpace, NModal, NForm, NFormItem, NInput, NSelect, NPopconfirm, NTag, NInputNumber
} from 'naive-ui'
import { Plus, Edit, Trash } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import QuestionEditor from '@/components/QuestionEditor.vue'

const message = useMessage()
const loading = ref(false)
const activeTab = ref('listening')
const listeningList = ref([])
const readingList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// 弹窗相关
const showModal = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = ref({
  id: null,
  title: '',
  content: '',
  script: '',
  source: '',
  category: '',
  difficulty: 'Medium',
  type: 'Conversation',
  wordCount: 0,
  questions: '[]'
})

const difficultyOptions = [
  { label: '简单', value: 'Easy' },
  { label: '中等', value: 'Medium' },
  { label: '困难', value: 'Hard' }
]

const listeningTypeOptions = [
  { label: '对话', value: 'Conversation' },
  { label: '讲座', value: 'Lecture' },
  { label: 'TED演讲', value: 'TED' },
  { label: '新闻', value: 'News' }
]

const readingCategoryOptions = [
  { label: '科技', value: 'Technology' },
  { label: '科普', value: 'Science' },
  { label: '文化', value: 'Culture' },
  { label: '历史', value: 'History' },
  { label: '健康', value: 'Health' }
]

const renderActions = (row, type) => {
  return h(NSpace, null, {
    default: () => [
      h(NButton, {
        size: 'small',
        type: 'primary',
        ghost: true,
        onClick: () => handleEdit(row, type)
      }, { default: () => h(Edit, { size: 14 }) }),
      h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id, type)
      }, {
        trigger: () => h(NButton, {
          size: 'small',
          type: 'error',
          ghost: true
        }, { default: () => h(Trash, { size: 14 }) }),
        default: () => `确定要删除此${type === 'listening' ? '听力材料' : '阅读文章'}吗？`
      })
    ]
  })
}

const listeningColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', width: 250 },
  { title: '类型', key: 'type', width: 100 },
  { 
    title: '难度', 
    key: 'difficulty', 
    width: 100,
    render: (row) => h(NTag, { type: row.difficulty === 'Hard' ? 'error' : (row.difficulty === 'Medium' ? 'warning' : 'success') }, { default: () => row.difficulty })
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: (row) => row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
  },
  { title: '操作', key: 'actions', width: 120, render: (row) => renderActions(row, 'listening') }
]

const readingColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', width: 250 },
  { title: '分类', key: 'category', width: 100 },
  { 
    title: '难度', 
    key: 'difficulty', 
    width: 100,
    render: (row) => h(NTag, { type: row.difficulty === 'Hard' ? 'error' : (row.difficulty === 'Medium' ? 'warning' : 'success') }, { default: () => row.difficulty })
  },
  { title: '词数', key: 'wordCount', width: 80 },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: (row) => row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
  },
  { title: '操作', key: 'actions', width: 120, render: (row) => renderActions(row, 'reading') }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = activeTab.value === 'listening' 
      ? await adminApi.getListeningList({ page: page.value, size: pageSize.value })
      : await adminApi.getReadingList({ page: page.value, size: pageSize.value })
    
    if (activeTab.value === 'listening') {
      listeningList.value = res.data.records
    } else {
      readingList.value = res.data.records
    }
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
    title: '',
    content: '',
    script: '',
    source: '',
    category: 'Technology',
    difficulty: 'Medium',
    type: 'Conversation',
    wordCount: 0,
    questions: '[]'
  }
  showModal.value = true
}

const handleEdit = (row, type) => {
  isEdit.value = true
  formData.value = { ...row }
  showModal.value = true
}

const handleDelete = async (id, type) => {
  try {
    if (type === 'listening') {
      await adminApi.deleteListening(id)
    } else {
      await adminApi.deleteReading(id)
    }
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleSave = async () => {
  try {
    if (activeTab.value === 'listening') {
      if (isEdit.value) {
        await adminApi.updateListening(formData.value.id, formData.value)
      } else {
        await adminApi.addListening(formData.value)
      }
    } else {
      if (isEdit.value) {
        await adminApi.updateReading(formData.value.id, formData.value)
      } else {
        await adminApi.addReading(formData.value)
      }
    }
    message.success('保存成功')
    showModal.value = false
    fetchData()
  } catch (error) {
    message.error('保存失败')
  }
}

const handleTabChange = (value) => {
  activeTab.value = value
  page.value = 1
  fetchData()
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
  <div class="content-page">
    <header class="page-header">
      <div>
        <h1>内容管理</h1>
        <p>维护平台的听力、阅读等核心学习素材</p>
      </div>
      <n-button type="primary" @click="handleAdd">
        <template #icon>
          <Plus />
        </template>
        添加素材
      </n-button>
    </header>

    <n-card class="content-card">
      <n-tabs :value="activeTab" type="segment" animated @update:value="handleTabChange">
        <n-tab-pane name="listening" tab="听力材料">
          <n-data-table
            :columns="listeningColumns"
            :data="listeningList"
            :loading="loading"
            :bordered="false"
            :single-line="false"
          />
        </n-tab-pane>

        <n-tab-pane name="reading" tab="阅读文章">
          <n-data-table
            :columns="readingColumns"
            :data="readingList"
            :loading="loading"
            :bordered="false"
            :single-line="false"
          />
        </n-tab-pane>
      </n-tabs>

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
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑内容' : '添加内容'" style="width: 800px">
      <n-form ref="formRef" :model="formData" label-placement="top">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="formData.title" placeholder="输入内容标题" />
        </n-form-item>

        <n-space item-style="flex: 1">
          <n-form-item :label="activeTab === 'listening' ? '听力类型' : '文章分类'" path="category">
            <n-select 
              v-if="activeTab === 'listening'"
              v-model:value="formData.type" 
              :options="listeningTypeOptions" 
            />
            <n-select 
              v-else
              v-model:value="formData.category" 
              :options="readingCategoryOptions" 
            />
          </n-form-item>
          <n-form-item label="难度等级" path="difficulty">
            <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
          </n-form-item>
          <n-form-item v-if="activeTab === 'reading'" label="词数" path="wordCount">
            <n-input-number v-model:value="formData.wordCount" :min="0" />
          </n-form-item>
        </n-space>

        <n-form-item :label="activeTab === 'listening' ? '听力原文/脚本' : '文章正文'" path="content">
          <n-input
            v-if="activeTab === 'listening'"
            v-model:value="formData.script"
            type="textarea"
            placeholder="输入原文内容"
            :autosize="{ minRows: 5, maxRows: 15 }"
          />
          <n-input
            v-else
            v-model:value="formData.content"
            type="textarea"
            placeholder="输入正文内容"
            :autosize="{ minRows: 5, maxRows: 15 }"
          />
        </n-form-item>

        <n-form-item label="题目 (可视化编辑)" path="questions">
          <QuestionEditor v-model:value="formData.questions" />
        </n-form-item>

        <n-form-item label="来源 (可选)" path="source">
          <n-input v-model:value="formData.source" placeholder="如：Economist, TED" />
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
.content-page {
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
