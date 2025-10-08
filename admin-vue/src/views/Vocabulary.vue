<script setup>
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NButton, NInput, NPagination, NSelect, NModal, NForm, NFormItem, NPopconfirm, useMessage, NSpace, NTabs, NTabPane, NInputGroup } from 'naive-ui'
import { Search, Plus, Edit, Trash, Sparkles, Layers } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const vocabularyList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const examType = ref('')
const batchLoading = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const formRef =  ref(null)

const formData = ref({
  word: '',
  phonetic: '',
  definition: '',
  translation: '',
  example: '',
  exampleTranslation: '',
  examType: 'cet4',
  difficulty: 3,
  frequency: 50
})

const examTypeOptions = [
  { label: '全部', value: '' },
  { label: 'CET-4', value: 'cet4' },
  { label: 'CET-6', value: 'cet6' },
  { label: 'IELTS', value: 'ielts' },
  { label: 'TOEFL', value: 'toefl' },
  { label: 'GRE', value: 'gre' }
]

const columns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '单词', key: 'word', width: 150 },
  { title: '音标', key: 'phonetic', width: 120 },
  { title: '翻译', key: 'translation', width: 200 },
  { title: '考试类型', key: 'examType', width: 100 },
  { title: '难度', key: 'difficulty', width: 80 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) => {
      return h(NSpace, null, {
        default: () => [
          h(NButton, {
            size: 'small',
            onClick: () => editVocab(row)
          }, { default: () => '编辑' }),
          
          h(NPopconfirm, {
            onPositiveClick: () => deleteVocab(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error'
            }, { default: () => '删除' }),
            default: () => '确定要删除吗？'
          })
        ]
      })
    }
  }
]

const fetchVocabulary = async () => {
  loading.value = true
  try {
    const res = await adminApi.getVocabularyList({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value,
      examType: examType.value
    })
    vocabularyList.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    message.error('获取词汇列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchVocabulary()
}

const handlePageChange = (newPage) => {
  page.value = newPage
  fetchVocabulary()
}

const openAddModal = () => {
  isEdit.value = false
  showModal.value = true
  formData.value = {
    word: '',
    phonetic: '',
    definition: '',
    translation: '',
    example: '',
    exampleTranslation: '',
    examType: 'cet4',
    difficulty: 3,
    frequency: 50
  }
}

const editVocab = (row) => {
  isEdit.value = true
  showModal.value = true
  formData.value = { ...row }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await adminApi.updateVocabulary(formData.value.id, formData.value)
      message.success('更新成功')
    } else {
      await adminApi.addVocabulary(formData.value)
      message.success('添加成功')
    }
    showModal.value = false
    fetchVocabulary()
  } catch (error) {
    message.error(isEdit.value ? '更新失败' : '添加失败')
  }
}

const deleteVocab = async (id) => {
  try {
    await adminApi.deleteVocabulary(id)
    message.success('删除成功')
    fetchVocabulary()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleAiFill = async () => {
  if (!formData.value.word) {
    message.warning('请先输入单词')
    return
  }

  const loading = message.loading('AI 正在思考中...', { duration: 0 })
  try {
    const res = await adminApi.generateVocabularyDetails(formData.value.word)
    if (res.code === 200) {
      // 保留原有的 id 和 examType，只更新 AI 生成的字段
      const { id, examType } = formData.value
      formData.value = { 
        ...res.data,
        id,  // 保留原 ID（编辑时需要）
        examType: examType || res.data.examType  // 优先使用已选择的考试类型
      }
      message.success('AI 补全成功')
    }
  } catch (error) {
    console.error('AI 补全失败:', error)
    message.error('AI 补全失败: ' + (error.response?.data?.msg || error.message))
  } finally {
    loading.destroy()
  }
}

const handleBatchAiFill = async () => {
  batchLoading.value = true
  const msg = message.loading('正在批量补全数据，请稍候...', { duration: 0 })
  try {
    const res = await adminApi.batchGenerateVocabularyDetails(20)
    message.success(res.data)
    fetchVocabulary()
  } catch (error) {
    message.error('批量补全失败')
  } finally {
    msg.destroy()
    batchLoading.value = false
  }
}

const handleDeduplicate = async () => {
  const msg = message.loading('正在全库排查重复词汇并清理中...', { duration: 0 })
  try {
    const res = await adminApi.deduplicateVocabulary()
    message.success(res.data)
    fetchVocabulary()
  } catch (error) {
    message.error('去重失败')
  } finally {
    msg.destroy()
  }
}

onMounted(() => {
  fetchVocabulary()
})
</script>

<template>
  <div class="vocabulary-page">
    <header class="page-header">
      <div>
        <h1>词汇库管理</h1>
        <p>管理平台词汇资源</p>
      </div>
      <n-space>
        <n-button :loading="batchLoading" secondary type="primary" @click="handleBatchAiFill">
          <template #icon>
            <Sparkles :size="16" />
          </template>
          批量 AI 补全 (20条)
        </n-button>
        <n-button secondary type="warning" @click="handleDeduplicate">
          <template #icon>
            <Layers :size="16" />
          </template>
          全库去重
        </n-button>
        <n-button type="primary" @click="openAddModal">
          <template #icon>
            <Plus :size="16" />
          </template>
          添加词汇
        </n-button>
      </n-space>
    </header>

    <!-- 考试类型标签页 -->
    <n-card class="search-card">
      <n-tabs v-model:value="examType" type="line" animated @update:value="handleSearch">
        <n-tab-pane v-for="opt in examTypeOptions" :key="opt.value" :name="opt.value" :tab="opt.label" />
      </n-tabs>
      
      <div style="margin-top: 16px;">
        <n-space align="center">
          <n-input
            v-model:value="keyword"
            placeholder="搜索单词或翻译"
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
      </div>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="vocabularyList"
        :loading="loading"
        :bordered="false"
      />
      
      <div class="pagination">
        <n-pagination
          v-model:page="page"
          :page-count="Math.ceil(total / pageSize)"
          @update:page="handlePageChange"
        />
      </div>
    </n-card>

    <!-- 添加/编辑模态框 -->
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? '编辑词汇' : '添加词汇'" style="width: 600px">
      <n-form ref="formRef" :model="formData" label-placement="top">
        <n-form-item label="单词" path="word">
          <n-input-group>
            <n-input v-model:value="formData.word" placeholder="输入单词" />
            <n-button type="primary" ghost @click="handleAiFill">
              AI 补全
            </n-button>
          </n-input-group>
        </n-form-item>
        <n-form-item label="音标" path="phonetic">
          <n-input v-model:value="formData.phonetic" placeholder="输入音标" />
        </n-form-item>
        <n-form-item label="中文翻译" path="translation">
          <n-input v-model:value="formData.translation" placeholder="输入中文翻译" type="textarea" />
        </n-form-item>
        <n-form-item label="英文释义" path="definition">
          <n-input v-model:value="formData.definition" placeholder="输入英文释义" type="textarea" />
        </n-form-item>
        <n-form-item label="例句" path="example">
          <n-input v-model:value="formData.example" placeholder="输入例句" type="textarea" />
        </n-form-item>
        <n-form-item label="例句翻译" path="exampleTranslation">
          <n-input v-model:value="formData.exampleTranslation" placeholder="输入例句翻译" type="textarea" />
        </n-form-item>
        <n-form-item label="考试类型" path="examType">
          <n-select
            v-model:value="formData.examType"
            :options="examTypeOptions.filter(item => item.value !== null)"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.vocabulary-page {
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
