<script setup>
import { ref, onMounted, h, computed } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, NTabs, NTabPane, useMessage,
  NSpace, NModal, NForm, NFormItem, NInput, NSelect, NPopconfirm, NTag, NInputNumber
} from 'naive-ui'
import { Plus, Edit, Trash, Bot, Sparkles, AlertTriangle } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import QuestionEditor from '@/components/QuestionEditor.vue'

const message = useMessage()
const loading = ref(false)
const activeTab = ref('listening')
const listeningList = ref([])
const readingList = ref([])
const grammarList = ref([])
const speakingList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// Audit State
const showAuditModal = ref(false)
const auditResult = ref(null)
const auditingId = ref(null)

const handleAudit = async (row, type) => {
    auditingId.value = row.id
    try {
        const res = await adminApi.auditContent({ type, id: row.id })
        if (res.code === 200) {
            auditResult.value = res.data
            showAuditModal.value = true
        }
    } catch (e) {
        message.error('审查请求失败')
    } finally {
        auditingId.value = null
    }
}

const handleBatchAudit = async () => {
    loading.value = true
    try {
        const list = getCurrentList()
        let count = 0
        for (const item of list) {
            await adminApi.auditContent({ type: activeTab.value, id: item.id })
            count++
        }
        message.success(`已批量审查 ${count} 条内容`)
    } catch (e) {
        message.error('批量审查过程中出错')
    } finally {
        loading.value = false
    }
}

// Form Data
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
  difficulty: 'medium',
  type: 'Conversation',
  wordCount: 0,
  questions: '[]',
  topic: 'Tenses',
  question: '',
  keywords: '[]',
  tips: '[]'
})

// Options
const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
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

const grammarTopicOptions = [
  { label: '时态（Tenses）', value: 'Tenses' },
  { label: '语态（Voice）', value: 'Voice' },
  { label: '从句（Clauses）', value: 'Clauses' },
  { label: '虚拟语气（Subjunctive）', value: 'Subjunctive' },
  { label: '非谓语（Non-finite）', value: 'Non-finite' },
  { label: '介词（Prepositions）', value: 'Prepositions' },
  { label: '冠词（Articles）', value: 'Articles' }
]

const speakingTypeOptions = [
  { label: 'IELTS Part 1', value: 'ielts_part1' },
  { label: 'IELTS Part 2', value: 'ielts_part2' },
  { label: 'IELTS Part 3', value: 'ielts_part3' },
  { label: 'TOEFL Independent', value: 'toefl_independent' },
  { label: 'Business English', value: 'business' },
  { label: 'Daily Life', value: 'daily' }
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
      ...(type === 'listening' || type === 'reading' ? [h(NButton, {
        size: 'small',
        type: 'info',
        ghost: true,
        loading: auditingId.value === row.id,
        onClick: () => handleAudit(row, type)
      }, { default: () => h(Bot, { size: 14 }) })] : []),
      h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id, type)
      }, {
        trigger: () => h(NButton, {
          size: 'small',
          type: 'error',
          ghost: true
        }, { default: () => h(Trash, { size: 14 }) }),
        default: () => `确定要删除此${getModuleName(type)}吗？`
      })
    ]
  })
}

const getModuleName = (type) => {
  const names = {
    listening: '听力材料',
    reading: '阅读文章',
    grammar: '语法练习',
    speaking: '口语话题'
  }
  return names[type] || '内容'
}

// Columns
const listeningColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', width: 250 },
  { title: '类型', key: 'type', width: 100 },
  { 
    title: '难度', 
    key: 'difficulty', 
    width: 100,
    render: (row) => h(NTag, { type: row.difficulty === 'hard' ? 'error' : (row.difficulty === 'medium' ? 'warning' : 'success') }, { default: () => row.difficulty })
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: (row) => row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
  },
  { title: '操作', key: 'actions', width: 150, render: (row) => renderActions(row, 'listening') }
]

const readingColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', width: 250 },
  { title: '分类', key: 'category', width: 100 },
  { 
    title: '难度', 
    key: 'difficulty', 
    width: 100,
    render: (row) => h(NTag, { type: row.difficulty === 'hard' ? 'error' : (row.difficulty === 'medium' ? 'warning' : 'success') }, { default: () => row.difficulty })
  },
  { title: '词数', key: 'wordCount', width: 80 },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: (row) => row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
  },
  { title: '操作', key: 'actions', width: 150, render: (row) => renderActions(row, 'reading') }
]

const grammarColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '语法主题', key: 'topic', width: 200 },
  { 
    title: '难度', 
    key: 'difficulty', 
    width: 100,
    render: (row) => h(NTag, { type: row.difficulty === 'hard' ? 'error' : (row.difficulty === 'medium' ? 'warning' : 'success') }, { default: () => row.difficulty })
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
  { title: '操作', key: 'actions', width: 120, render: (row) => renderActions(row, 'grammar') }
]

const speakingColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: '话题标题', key: 'title', width: 300 },
  { 
    title: '类型', 
    key: 'type', 
    width: 150,
    render: (row) => h(NTag, { type: 'info' }, { default: () => row.type })
  },
  { 
    title: '难度', 
    key: 'difficulty', 
    width: 100,
    render: (row) => h(NTag, { type: row.difficulty === 'hard' ? 'error' : (row.difficulty === 'medium' ? 'warning' : 'success') }, { default: () => row.difficulty })
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: (row) => row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
  },
  { title: '操作', key: 'actions', width: 120, render: (row) => renderActions(row, 'speaking') }
]

const getCurrentColumns = () => {
  const columns = {
    listening: listeningColumns,
    reading: readingColumns,
    grammar: grammarColumns,
    speaking: speakingColumns
  }
  return columns[activeTab.value] || []
}

const getCurrentList = () => {
  const lists = {
    listening: listeningList.value,
    reading: readingList.value,
    grammar: grammarList.value,
    speaking: speakingList.value
  }
  return lists[activeTab.value] || []
}

const fetchData = async () => {
  loading.value = true
  try {
    const apiMap = {
      listening: () => adminApi.getListeningList({ page: page.value, size: pageSize.value }),
      reading: () => adminApi.getReadingList({ page: page.value, size: pageSize.value }),
      grammar: () => adminApi.getGrammarList({ page: page.value, size: pageSize.value }),
      speaking: () => adminApi.getSpeakingList({ page: page.value, size: pageSize.value })
    }
    
    const res = await apiMap[activeTab.value]()
    
    const listMap = {
      listening: listeningList,
      reading: readingList,
      grammar: grammarList,
      speaking: speakingList
    }
    listMap[activeTab.value].value = res.data.records
    total.value = res.data.total
  } catch (error) {
    message.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  const defaults = {
    listening: {
      id: null, title: '', script: '', type: 'Conversation', difficulty: 'medium', source: '', questions: '[]'
    },
    reading: {
      id: null, title: '', content: '', category: 'Technology', difficulty: 'medium', wordCount: 0, source: '', questions: '[]'
    },
    grammar: {
      id: null, topic: 'Tenses', difficulty: 'medium', questions: '[]'
    },
    speaking: {
      id: null, type: 'ielts_part1', difficulty: 'medium', title: '', question: '', keywords: '[]', tips: '[]'
    }
  }
  formData.value = defaults[activeTab.value]
  showModal.value = true
}

const handleEdit = (row, type) => {
  isEdit.value = true
  formData.value = { ...row }
  showModal.value = true
}

const handleDelete = async (id, type) => {
  try {
    const apiMap = {
      listening: () => adminApi.deleteListening(id),
      reading: () => adminApi.deleteReading(id),
      grammar: () => adminApi.deleteGrammar(id),
      speaking: () => adminApi.deleteSpeaking(id)
    }
    await apiMap[type]()
    message.success('删除成功')
    fetchData()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleSave = async () => {
  try {
    const apiMap = {
      listening: {
        add: (data) => adminApi.addListening(data),
        update: (id, data) => adminApi.updateListening(id, data)
      },
      reading: {
        add: (data) => adminApi.addReading(data),
        update: (id, data) => adminApi.updateReading(id, data)
      },
      grammar: {
        add: (data) => adminApi.addGrammar(data),
        update: (id, data) => adminApi.updateGrammar(id, data)
      },
      speaking: {
        add: (data) => adminApi.addSpeaking(data),
        update: (id, data) => adminApi.updateSpeaking(id, data)
      }
    }
    
    if (isEdit.value) {
      await apiMap[activeTab.value].update(formData.value.id, formData.value)
    } else {
      await apiMap[activeTab.value].add(formData.value)
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
        <h1>学习内容管理</h1>
        <p>统一管理听力、阅读、语法、口语等核心学习素材</p>
      </div>
      <n-space>
        <n-button v-if="activeTab === 'listening' || activeTab === 'reading'" secondary type="info" :loading="loading" @click="handleBatchAudit">
           <template #icon><Bot /></template>
           AI 批量审查
        </n-button>
        <n-button type="primary" @click="handleAdd">
          <template #icon>
            <Plus />
          </template>
          添加{{ getModuleName(activeTab) }}
        </n-button>
      </n-space>
    </header>

    <n-card class="content-card">
      <n-tabs :value="activeTab" type="segment" animated @update:value="handleTabChange">
        <n-tab-pane name="listening" tab="🎧 听力材料">
          <n-data-table
            :columns="listeningColumns"
            :data="listeningList"
            :loading="loading"
            :bordered="false"
            :single-line="false"
          />
        </n-tab-pane>

        <n-tab-pane name="reading" tab="📖 阅读文章">
          <n-data-table
            :columns="readingColumns"
            :data="readingList"
            :loading="loading"
            :bordered="false"
            :single-line="false"
          />
        </n-tab-pane>

        <n-tab-pane name="grammar" tab="📝 语法练习">
          <n-data-table
            :columns="grammarColumns"
            :data="grammarList"
            :loading="loading"
            :bordered="false"
            :single-line="false"
          />
        </n-tab-pane>

        <n-tab-pane name="speaking" tab="🗣️ 口语话题">
          <n-data-table
            :columns="speakingColumns"
            :data="speakingList"
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
    <n-modal v-model:show="showModal" preset="card" :title="isEdit ? `编辑${getModuleName(activeTab)}` : `添加${getModuleName(activeTab)}`" style="width: 800px">
      <n-form ref="formRef" :model="formData" label-placement="top">
        <!-- 听力表单 -->
        <template v-if="activeTab === 'listening'">
          <n-form-item label="标题" path="title">
            <n-input v-model:value="formData.title" placeholder="输入内容标题" />
          </n-form-item>

          <n-space item-style="flex: 1">
            <n-form-item label="听力类型" path="type">
              <n-select v-model:value="formData.type" :options="listeningTypeOptions" />
            </n-form-item>
            <n-form-item label="难度等级" path="difficulty">
              <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
            </n-form-item>
          </n-space>

          <n-form-item label="听力原文/脚本" path="script">
            <n-input
              v-model:value="formData.script"
              type="textarea"
              placeholder="输入原文内容"
              :autosize="{ minRows: 5, maxRows: 15 }"
            />
          </n-form-item>

          <n-form-item label="题目 (可视化编辑)" path="questions">
            <QuestionEditor v-model:value="formData.questions" />
          </n-form-item>

          <n-form-item label="来源 (可选)" path="source">
            <n-input v-model:value="formData.source" placeholder="如：TED, BBC" />
          </n-form-item>
        </template>

        <!-- 阅读表单 -->
        <template v-if="activeTab === 'reading'">
          <n-form-item label="标题" path="title">
            <n-input v-model:value="formData.title" placeholder="输入内容标题" />
          </n-form-item>

          <n-space item-style="flex: 1">
            <n-form-item label="文章分类" path="category">
              <n-select v-model:value="formData.category" :options="readingCategoryOptions" />
            </n-form-item>
            <n-form-item label="难度等级" path="difficulty">
              <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
            </n-form-item>
            <n-form-item label="词数" path="wordCount">
              <n-input-number v-model:value="formData.wordCount" :min="0" />
            </n-form-item>
          </n-space>

          <n-form-item label="文章正文" path="content">
            <n-input
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
            <n-input v-model:value="formData.source" placeholder="如：Economist, NYT" />
          </n-form-item>
        </template>

        <!-- 语法表单 -->
        <template v-if="activeTab === 'grammar'">
          <n-space item-style="flex: 1">
            <n-form-item label="语法主题" path="topic">
              <n-select v-model:value="formData.topic" :options="grammarTopicOptions" />
            </n-form-item>
            <n-form-item label="难度" path="difficulty">
              <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
            </n-form-item>
          </n-space>

          <n-form-item label="练习题目 (可视化编辑)" path="questions">
            <QuestionEditor v-model:value="formData.questions" />
          </n-form-item>
        </template>

        <!-- 口语表单 -->
        <template v-if="activeTab === 'speaking'">
          <n-form-item label="话题标题" path="title">
            <n-input v-model:value="formData.title" placeholder="输入话题标题" />
          </n-form-item>

          <n-space item-style="flex: 1">
            <n-form-item label="口语类型" path="type">
              <n-select v-model:value="formData.type" :options="speakingTypeOptions" />
            </n-form-item>
            <n-form-item label="难度" path="difficulty">
              <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
            </n-form-item>
          </n-space>

          <n-form-item label="详细问题/话题描述" path="question">
            <n-input
              v-model:value="formData.question"
              type="textarea"
              placeholder="输入详细的口语问题或话题描述"
              :autosize="{ minRows: 3, maxRows: 8 }"
            />
          </n-form-item>

          <n-form-item label="关键词 (JSON数组)" path="keywords">
            <n-input
              v-model:value="formData.keywords"
              type="textarea"
              placeholder='例如: ["travel", "adventure", "culture"]'
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </n-form-item>

          <n-form-item label="提示/建议 (JSON数组)" path="tips">
            <n-input
              v-model:value="formData.tips"
              type="textarea"
              placeholder='例如: ["使用过去时态", "描述细节"]'
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </n-form-item>
        </template>

        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave">确定保存</n-button>
        </div>
      </n-form>
    </n-modal>

    <!-- AI 审查机器人报告弹窗 -->
    <n-modal v-model:show="showAuditModal" preset="card" title="AI 内容质量深度审查报告" style="width: 600px; border-radius: 20px;">
        <div v-if="auditResult" class="audit-report">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-4">
                    <div class="audit-icon-wrap" :class="auditResult.qualityScore >= 80 ? 'pass' : 'fail'">
                        <Bot :size="24" />
                    </div>
                    <div>
                        <h4 class="text-lg font-bold">审查评分：{{ auditResult.qualityScore }}/100</h4>
                        <p class="text-zinc-500 text-xs">{{ auditResult.isPassed ? '✅ 质量达标，允许发布' : '⚠️ 建议优化后发布' }}</p>
                    </div>
                </div>
                <div class="score-pill" :class="auditResult.qualityScore >= 80 ? 'pass' : 'fail'">
                    {{ auditResult.qualityScore >= 80 ? 'HIGH QUALITY' : 'LOW QUALITY' }}
                </div>
            </div>

            <div class="section mb-6">
                <p class="section-title flex items-center gap-2"><AlertTriangle :size="16" class="text-amber-500" /> 检出问题</p>
                <ul class="issue-list mt-2">
                    <li v-for="issue in auditResult.issues" :key="issue">{{ issue }}</li>
                </ul>
                <p v-if="!auditResult.issues?.length" class="text-zinc-500 italic text-sm">未检测到显著异常</p>
            </div>

            <div class="section">
                <p class="section-title flex items-center gap-2"><Sparkles :size="16" class="text-indigo-400" /> AI 建议</p>
                <div class="suggestion-box mt-2">
                    {{ auditResult.suggestion }}
                </div>
            </div>
        </div>
    </n-modal>
  </div>
</template>

<style scoped>
.audit-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.audit-icon-wrap.pass { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.audit-icon-wrap.fail { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.score-pill { padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 800; }
.score-pill.pass { background: #10b981; color: #fff; }
.score-pill.fail { background: #ef4444; color: #fff; }

.section-title { font-weight: 800; font-size: 0.9rem; color: #fff; }
.issue-list { list-style: none; padding: 0; }
.issue-list li { padding: 6px 12px; background: rgba(239, 68, 68, 0.05); border-left: 3px solid #ef4444; border-radius: 4px; font-size: 0.85rem; color: #fca5a5; margin-bottom: 6px; }

.suggestion-box { background: rgba(99, 102, 241, 0.05); padding: 16px; border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.1); font-size: 0.85rem; color: #a5b4fc; line-height: 1.6; }

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
