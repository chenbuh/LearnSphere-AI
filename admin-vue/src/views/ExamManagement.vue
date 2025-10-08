<script setup>
import { ref, onMounted, h } from 'vue'
import { 
  NCard, NDataTable, NButton, NInput, NPagination, NTag, NPopconfirm, useMessage, 
  NSpace, NModal, NForm, NFormItem, NSelect, NTabs, NTabPane, NSpin
} from 'naive-ui'
import { Search, FileText, Trash2, Eye } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)
const modalLoading = ref(false)
const exams = ref([])
const records = ref([])
const totalExams = ref(0)
const totalRecords = ref(0)
const examPage = ref(1)
const examPageSize = ref(10)
const recordPage = ref(1)
const recordPageSize = ref(10)
const keyword = ref('')
const selectedTab = ref('exams')
const showDetailModal = ref(false)
const currentExam = ref({})

// Exam Columns
const examColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '试卷标题', key: 'title', width: 200, ellipsis: { tooltip: true } },
  { 
    title: '类型', 
    key: 'examType',
    width: 100,
    render: (row) => h(NTag, { type: 'primary', bordered: false }, { default: () => row.examType })
  },
  { title: '时长(分钟)', key: 'duration', width: 90 },
  { title: '题数', key: 'totalQuestions', width: 70 },
  { 
    title: '难度', 
    key: 'difficulty',
    width: 80,
    render: (row) => {
      const diffMap = { 2: '简单', 3: '中等', 4: '困难' }
      return h(NTag, { 
        type: row.difficulty > 3 ? 'error' : 'success', 
        size: 'small' 
      }, { default: () => diffMap[row.difficulty] || '未知' })
    }
  },
  { title: '参与人数', key: 'participants', width: 90 },
  { 
    title: '创建时间', 
    key: 'createTime',
    width: 160,
    render: (row) => row.createTime ? new Date(row.createTime).toLocaleString() : '-'
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render: (row) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'info',
            secondary: true,
            onClick: () => fetchExamDetail(row.id)
          }, { icon: () => h(Eye, { size: 14 }) }),
          
          h(NPopconfirm, {
            onPositiveClick: () => handleDeleteExam(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error',
              secondary: true
            }, { icon: () => h(Trash2, { size: 14 }) }),
            default: () => '确定要删除这份试卷吗？'
          })
        ]
      })
    }
  }
]

// Record Columns
const recordColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户ID', key: 'userId', width: 80 },
  { title: '试卷ID', key: 'examId', width: 80 },
  { 
    title: '得分', 
    key: 'score',
    width: 80,
    render: (row) => h('span', { 
      style: { fontWeight: 'bold', color: row.score >= 60 ? '#18a058' : '#d03050' } 
    }, row.score)
  },
  { title: '正确/总数', key: 'correctCount', width: 100, render: (row) => `${row.correctCount} / ${row.totalCount}` },
  { title: '用时(秒)', key: 'timeSpent', width: 90 },
  { 
    title: '考试时间', 
    key: 'createTime',
    width: 160,
    render: (row) => row.createTime ? new Date(row.createTime).toLocaleString() : '-'
  }
]

const fetchExams = async () => {
  loading.value = true
  try {
    const res = await adminApi.getExamList({
      page: examPage.value,
      size: examPageSize.value,
      keyword: keyword.value
    })
    exams.value = res.data.records
    totalExams.value = res.data.total
  } catch (error) {
    message.error('获取试卷列表失败')
  } finally {
    loading.value = false
  }
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await adminApi.getExamRecords({
      page: recordPage.value,
      size: recordPageSize.value
    })
    records.value = res.data.records
    totalRecords.value = res.data.total
  } catch (error) {
    message.error('获取考试记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (selectedTab.value === 'exams') {
    examPage.value = 1
    fetchExams()
  } else {
    recordPage.value = 1
    fetchRecords()
  }
}

const handleDeleteExam = async (id) => {
  try {
    await adminApi.deleteExam(id)
    message.success('试卷已删除')
    fetchExams()
  } catch (error) {
    message.error('删除失败')
  }
}

const fetchExamDetail = async (id) => {
  // Fix: Blocked aria-hidden warning by blurring the trigger button first
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur()
  }

  // Open modal immediately to reset focus
  currentExam.value = { title: '加载中...' }
  showDetailModal.value = true
  modalLoading.value = true
  
  try {
    const res = await adminApi.getExamDetail(id)
    currentExam.value = res.data
  } catch (error) {
    message.error('获取试卷详情失败')
    showDetailModal.value = false
  } finally {
    modalLoading.value = false
  }
}

// Group questions by section
const getQuestionsBySection = (section) => {
  if (!currentExam.value.questions) return []
  return currentExam.value.questions.filter(q => q.section && q.section.includes(section))
}

const handleTabChange = (val) => {
  selectedTab.value = val
  if (val === 'exams' && exams.value.length === 0) fetchExams()
  if (val === 'records' && records.value.length === 0) fetchRecords()
}

onMounted(() => {
  fetchExams()
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1>试卷与模考管理</h1>
        <p>查看系统内的 AI 模拟试卷及用户考试记录</p>
      </div>
    </header>

    <div class="main-content">
      <n-card class="search-card" v-if="selectedTab === 'exams'">
        <n-space align="center">
          <n-input
            v-model:value="keyword"
            placeholder="搜索试卷标题..."
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

      <n-card content-style="padding: 0;">
        <n-tabs type="line" size="large" :tabs-padding="20" :on-update:value="handleTabChange">
          <n-tab-pane name="exams" tab="试卷列表">
             <div class="table-container">
                <n-data-table
                  :columns="examColumns"
                  :data="exams"
                  :loading="loading"
                  :bordered="false"
                  :single-line="false"
                />
                <div class="pagination">
                  <n-pagination
                    v-model:page="examPage"
                    :page-count="Math.ceil(totalExams / examPageSize)"
                    :page-size="examPageSize"
                    show-size-picker
                    :page-sizes="[10, 20, 30, 50]"
                    @update:page="val => { examPage = val; fetchExams() }"
                    @update:page-size="val => { examPageSize = val; fetchExams() }"
                  />
                </div>
             </div>
          </n-tab-pane>
          <n-tab-pane name="records" tab="考试记录">
             <div class="table-container">
                <n-data-table
                  :columns="recordColumns"
                  :data="records"
                  :loading="loading"
                  :bordered="false"
                  :single-line="false"
                />
                <div class="pagination">
                  <n-pagination
                    v-model:page="recordPage"
                    :page-count="Math.ceil(totalRecords / recordPageSize)"
                    :page-size="recordPageSize"
                    show-size-picker
                    :page-sizes="[10, 20, 30, 50]"
                    @update:page="val => { recordPage = val; fetchRecords() }"
                    @update:page-size="val => { recordPageSize = val; fetchRecords() }"
                  />
                </div>
             </div>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>

    <!-- 试卷详情弹窗 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      :title="currentExam.title"
      style="width: 900px; max-height: 800px; overflow-y: auto"
      :bordered="false"
      size="huge"
    >
      <n-spin :show="modalLoading">
        <div v-if="currentExam.questions" style="min-height: 200px">
          <!-- Writing -->
          <n-card title="Part I Writing" size="small" class="mb-4 question-section" v-if="getQuestionsBySection('Writing').length">
            <div v-for="q in getQuestionsBySection('Writing')" :key="q.id">
              <div class="question-text" v-html="q.text.replace(/\n/g, '<br/>')"></div>
            </div>
          </n-card>

          <!-- Listening -->
          <n-card title="Part II Listening" size="small" class="mb-4 question-section" v-if="getQuestionsBySection('Listening').length">
             <div v-for="(q, index) in getQuestionsBySection('Listening')" :key="q.id" class="mb-4">
                <div v-if="index === 0 || q.audioScript !== getQuestionsBySection('Listening')[index-1].audioScript" class="script-box">
                  <strong>(听力原文)</strong>
                  <p>{{ q.audioScript }}</p>
                </div>
                <div class="question-item">
                   <div class="q-title">{{ index + 1 }}. {{ q.text }}</div>
                   <div class="options-grid">
                      <div v-for="(opt, i) in q.options" :key="i" :class="{'correct-opt': i === q.correct}">
                         {{ String.fromCharCode(65+i) }}. {{ opt }}
                      </div>
                   </div>
                   <div class="explanation">💡 {{ q.explanation }}</div>
                </div>
             </div>
          </n-card>

          <!-- Reading -->
          <n-card title="Part III Reading" size="small" class="mb-4 question-section" v-if="getQuestionsBySection('Reading').length">
             <div v-for="(q, index) in getQuestionsBySection('Reading')" :key="q.id" class="mb-4">
                <div v-if="index === 0 || q.passage !== getQuestionsBySection('Reading')[index-1].passage" class="script-box">
                  <strong>(阅读文章)</strong>
                  <p>{{ q.passage }}</p>
                </div>
                <div class="question-item">
                   <div class="q-title">{{ index + 11 }}. {{ q.text }}</div>
                   <div class="options-grid">
                      <div v-for="(opt, i) in q.options" :key="i" :class="{'correct-opt': i === q.correct}">
                         {{ String.fromCharCode(65+i) }}. {{ opt }}
                      </div>
                   </div>
                   <div class="explanation">💡 {{ q.explanation }}</div>
                </div>
             </div>
          </n-card>

          <!-- Translation -->
          <n-card title="Part IV Translation" size="small" class="mb-4 question-section" v-if="getQuestionsBySection('Translation').length">
            <div v-for="q in getQuestionsBySection('Translation')" :key="q.id">
              <div class="question-text mb-2" v-html="q.text.replace(/\n/g, '<br/>')"></div>
              <div class="script-box">
                 <strong>参考译文：</strong>
                 <p>{{ q.explanation }}</p>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
            <!-- Placeholder for loading -->
        </div>
      </n-spin>
    </n-modal>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #71717a;
}

.search-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 16px;
}

.table-container {
  padding: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}


.question-section {
  background: transparent; 
}

/* Dark mode safe styles */
.script-box {
  background: rgba(16, 185, 129, 0.1);
  border: 1px dashed rgba(16, 185, 129, 0.5);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.95em;
  color: #10b981;
  white-space: pre-wrap;
  line-height: 1.6;
}

.question-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.q-title {
  font-weight: bold;
  font-size: 1.05rem;
  margin-bottom: 12px;
  color: #e4e4e7;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr); /* Mobile first */
  gap: 12px;
  margin-bottom: 12px;
}

@media (min-width: 640px) {
  .options-grid {
      grid-template-columns: repeat(2, 1fr);
  }
}

.options-grid > div {
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  color: #a1a1aa;
}

.options-grid > div:hover {
  background: rgba(255, 255, 255, 0.05);
}

.correct-opt {
  color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1) !important;
  font-weight: bold;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.explanation {
  font-size: 0.9em;
  color: #a1a1aa;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 12px;
  margin-top: 12px;
  background: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 6px;
}

.mb-4 { margin-bottom: 24px; }
.mb-2 { margin-bottom: 12px; }

/* Ensure modal text is readable */
.question-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #e4e4e7;
}

/* Naive UI dark theme adaptation */
:deep(.n-card) {
  background-color: rgba(30, 30, 35, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
