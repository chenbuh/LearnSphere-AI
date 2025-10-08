<script setup>
import { ref, onMounted, h } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, useMessage,
  NSpace, NModal, NForm, NFormItem, NInput, NSelect, NPopconfirm, NTag
} from 'naive-ui'
import { Plus, Edit, Trash } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import QuestionEditor from '@/components/QuestionEditor.vue'

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
  topic: 'Tenses',
  difficulty: 'medium',
  questions: '[]'
})

const topicOptions = [
  { label: '时态（Tenses）', value: 'Tenses' },
  { label: '语态（Voice）', value: 'Voice' },
  { label: '从句（Clauses）', value: 'Clauses' },
  { label: '虚拟语气（Subjunctive）', value: 'Subjunctive' },
  { label: '非谓语（Non-finite）', value: 'Non-finite' },
  { label: '介词（Prepositions）', value: 'Prepositions' },
  { label: '冠词（Articles）', value: 'Articles' }
]

const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '语法主题', key: 'topic', width: 200 },
  { 
    title: '难度', 
    key: 'difficulty', 
    width: 100,
    render: (row) => h(NTag, { 
      type: row.difficulty === 'hard' ? 'error' : (row.difficulty === 'medium' ? 'warning' : 'success') 
    }, { default: () => row.difficulty })
  },
  { 
    title: '题目数量', 
    key: 'questions', 
    width: 100,
    render: (row) => {
      try {
        const questions = JSON.parse(row.questions || '[]')
        return h('span', questions.length + ' 题')
      } catch {
        return h('span', '0 题')
      }
    }
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
          default: () => '确定要删除此语法练习吗？'
        })
      ]
    })
  }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getGrammarList({ page: page.value, size: pageSize.value })
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
    topic: 'Tenses',
    difficulty: 'medium',
    questions: '[]'
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
    await adminApi.deleteGrammar(id)
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await adminApi.updateGrammar(formData.value.id, formData.value)
    } else {
      await adminApi.addGrammar(formData.value)
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
  <div class="grammar-page">
    <header class="page-header">
      <div>
        <h1>语法练习管理</h1>
        <p>管理各类语法知识点的练习题目</p>
      </div>
      <n-button type="primary" @click="handleAdd">
        <template #icon>
          <Plus />
        </template>
        添加练习
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
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑语法练习' : '添加语法练习'" style="width: 800px">
      <n-form :model="formData" label-placement="top">
        <n-space item-style="flex: 1">
          <n-form-item label="语法主题" path="topic">
            <n-select v-model:value="formData.topic" :options="topicOptions" />
          </n-form-item>
          <n-form-item label="难度" path="difficulty">
            <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
          </n-form-item>
        </n-space>

        <n-form-item label="练习题目 (可视化编辑)" path="questions">
          <QuestionEditor v-model:value="formData.questions" />
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
.grammar-page {
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
