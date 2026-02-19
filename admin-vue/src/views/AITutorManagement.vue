<script setup>
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard, NTabs, NTabPane, NDataTable, NButton, NPagination, NSpace, NInput, NSelect, 
  NTag, NModal, NTimeline, NTimelineItem, NAlert, NGrid, NGridItem, 
  NStatistic, NPopconfirm, useMessage, NScrollbar, NDivider, NEmpty, NBadge
} from 'naive-ui'
import { 
  MessageSquare, User, Search, Trash, Clock, Activity, 
  AlertCircle, Eye, RefreshCw, Edit, Plus, History, 
  Settings, Zap, Brain 
} from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const router = useRouter()
const loading = ref(false)
const messages = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const roleFilter = ref(null)

const showSessionModal = ref(false)
const sessionMessages = ref([])
const sessionLoading = ref(false)
const currentSessionId = ref('')

const cleanupStats = ref({
  expiredCount: 0,
  message: ''
})

const dashboardStats = ref({
  totalMessages: 0,
  activeSessions: 0,
  todayQuestions: 0,
  sensitiveIntercepts: 0
})

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const columns = [
  {
    title: '日期',
    key: 'create_time',
    width: 170,
    render: (row) => formatTime(row.create_time)
  },
  {
    title: '用户',
    key: 'username',
    width: 120,
    render: (row) => h(NSpace, { align: 'center', inline: true }, {
      default: () => [
        h(User, { size: 14, class: 'text-zinc-500' }),
        h('span', { class: 'font-medium' }, row.username || '未知用户')
      ]
    })
  },
  {
    title: '角色',
    key: 'role',
    width: 100,
    render: (row) => {
      const isUser = row.role === 'user'
      return h(NTag, {
        type: isUser ? 'info' : 'success',
        bordered: false,
        size: 'small',
        round: true
      }, { default: () => isUser ? '用户' : '助教' })
    }
  },
  {
    title: '主题',
    key: 'topic',
    width: 150,
    ellipsis: true
  },
  {
    title: '内容',
    key: 'content',
    minWidth: 300,
    ellipsis: { tooltip: true }
  },
  {
    title: '会话ID',
    key: 'session_id',
    width: 100,
    render: (row) => h('span', { class: 'text-xs text-zinc-500' }, row.session_id.slice(0, 8) + '...')
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) => h(NButton, {
      size: 'small',
      quaternary: true,
      type: 'primary',
      onClick: () => viewSession(row.session_id)
    }, {
      default: () => h(NSpace, { align: 'center', size: 4 }, {
        default: () => [h(Eye, { size: 16 }), h('span', '查看会话')]
      })
    })
  }
]


const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await adminApi.getAITutorMessages({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value,
      role: roleFilter.value
    })
    messages.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    message.error('获取对话记录失败')
  } finally {
    loading.value = false
  }
}

const viewSession = async (sessionId) => {
  currentSessionId.value = sessionId
  showSessionModal.value = true
  sessionLoading.value = true
  try {
    const res = await adminApi.getAITutorSession(sessionId)
    sessionMessages.value = res.data
  } catch (error) {
    message.error('获取会话详情失败')
  } finally {
    sessionLoading.value = false
  }
}

const fetchCleanupStats = async () => {
  try {
    const res = await adminApi.getAITutorCleanupStats()
    cleanupStats.value = res.data
  } catch (error) {
    console.warn('获取清理统计失败')
  }
}

const fetchDashboardStats = async () => {
  try {
    const res = await adminApi.getAITutorStats()
    dashboardStats.value = res.data
  } catch (error) {
    console.error('获取统计数据失败')
  }
}

const handleCleanup = async () => {
  try {
    const res = await adminApi.triggerAITutorCleanup(30)
    message.success(res.data.message)
    fetchCleanupStats()
  } catch (error) {
    message.error('触发清理失败')
  }
}

const handlePageChange = (p) => {
  page.value = p
  fetchMessages()
}

const handleSearch = () => {
  page.value = 1
  fetchMessages()
}

const activeTab = ref('conversations')
const sensitiveLogs = ref([])
const sensitiveLoading = ref(false)

const fetchSensitiveLogs = async () => {
  sensitiveLoading.value = true
  try {
    const res = await adminApi.getSensitiveLogs({
      page: 1,
      size: 10,
      keyword: 'AITutorController' // Filter by controller name
    })
    sensitiveLogs.value = res.data.records
  } catch (error) {
    console.error('获取违规记录失败')
  } finally {
    sensitiveLoading.value = false
  }
}

const handleTabChange = (tab) => {
  activeTab.value = tab
  if (tab === 'conversations') {
    fetchMessages()
  } else if (tab === 'audit') {
    fetchSensitiveLogs()
  } else if (tab === 'settings') {
    fetchPrompts()
    fetchAIConfig()
  }
}

// Prompts Management
const promptList = ref([])
const promptLoading = ref(false)
const showPromptModal = ref(false)
const currentPrompt = ref({ content: '', promptKey: '', description: '' })

const fetchPrompts = async () => {
  promptLoading.value = true
  try {
    const res = await adminApi.getPrompts()
    // Filter for prompts related to AI Tutor
    promptList.value = res.data.filter(p => 
      p.promptKey.startsWith('AI_TUTOR_') || 
      p.promptKey === 'LEARNING_ADVICE_USER'
    )
  } catch (error) {
    message.error('加载提示词失败')
  } finally {
    promptLoading.value = false
  }
}

const handleEditPrompt = (prompt) => {
  currentPrompt.value = { ...prompt }
  showPromptModal.value = true
}

const handleSavePrompt = async () => {
  try {
    await adminApi.updatePrompt(currentPrompt.value.id, currentPrompt.value)
    message.success('更新成功')
    showPromptModal.value = false
    fetchPrompts()
  } catch (error) {
    message.error('保存失败')
  }
}

// Config Management
const aiConfig = ref({
  activeModel: 'default',
  isOverridden: false
})

const fetchAIConfig = async () => {
  try {
    const res = await adminApi.getAITutorConfig()
    aiConfig.value = res.data
  } catch (error) {
    message.error('获取配置失败')
  }
}

const handleUpdateModel = async (model) => {
  try {
    await adminApi.updateAITutorConfig({ model })
    message.success(`模型已切换至: ${model === 'default' ? '系统默认' : model}`)
    fetchAIConfig()
  } catch (error) {
    message.error('切换模型失败')
  }
}

onMounted(() => {
  fetchMessages()
  fetchCleanupStats()
  fetchSensitiveLogs()
  fetchDashboardStats()
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <MessageSquare :size="24" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">AI 助教管理</h1>
          <p class="text-zinc-500">监控用户与 AI 导师的实时对话，管理对话数据生命周期</p>
        </div>
      </div>
      <n-space>
         <n-button secondary @click="activeTab === 'conversations' ? fetchMessages() : fetchSensitiveLogs(); fetchDashboardStats()">
            <template #icon><RefreshCw /></template>
            刷新数据
        </n-button>
        <n-popconfirm @positive-click="handleCleanup">
          <template #trigger>
            <n-button type="warning" ghost>
              <template #icon><Trash /></template>
              清理过期数据 ({{ cleanupStats.expiredCount }})
            </n-button>
          </template>
          确认要手动触发清理任务吗？将删除 30 天前的所有非关键记录。
        </n-popconfirm>
      </n-space>
    </header>

    <n-grid :cols="4" :x-gap="24" class="mb-6">
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <n-statistic label="总消息数" :value="dashboardStats.totalMessages">
            <template #prefix><Activity :size="20" class="text-indigo-500" /></template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <n-statistic label="活跃会话" :value="dashboardStats.activeSessions">
             <template #prefix><MessageSquare :size="20" class="text-emerald-500" /></template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <n-statistic label="今日提问量" :value="dashboardStats.todayQuestions">
             <template #prefix><User :size="20" class="text-amber-500" /></template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <n-statistic label="敏感拦截" :value="dashboardStats.sensitiveIntercepts">
             <template #prefix><AlertCircle :size="20" class="text-rose-500" /></template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-tabs v-model:value="activeTab" type="line" animated @update:value="handleTabChange">
      <n-tab-pane name="conversations" tab="对话流水">
        <n-card :bordered="false" class="shadow-sm">
          <n-space vertical :size="20">
            <div class="flex justify-between items-center">
                <n-space>
                    <n-input
                        v-model:value="keyword"
                        placeholder="搜索用户名、提问内容或主题..."
                        style="width: 320px"
                        @keyup.enter="handleSearch"
                    >
                        <template #prefix><Search :size="16" /></template>
                    </n-input>
                    <n-select
                        v-model:value="roleFilter"
                        placeholder="角色筛选"
                        :options="[
                            { label: '全部', value: null },
                            { label: '用户', value: 'user' },
                            { label: '助教', value: 'assistant' }
                        ]"
                        style="width: 140px"
                        @update:value="handleSearch"
                    />
                    <n-button type="primary" @click="handleSearch">搜索</n-button>
                </n-space>
            </div>

            <n-data-table
              :loading="loading"
              :columns="columns"
              :data="messages"
              :bordered="false"
              class="custom-table"
            />

            <div class="flex justify-end p-4">
              <n-pagination
                v-model:page="page"
                :item-count="total"
                :page-size="pageSize"
                @update:page="handlePageChange"
              />
            </div>
          </n-space>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="audit" tab="敏感内容审计">
        <n-card :bordered="false" class="shadow-sm">
          <div class="mb-4">
            <n-alert title="违规内容说明" type="error" closable>
              下表显示了 AI 助教在提问阶段拦截的敏感内容。这些内容由于违反合规策略已被拦截，未进入 AI 处理流程。
            </n-alert>
          </div>
          
          <n-data-table
            :loading="sensitiveLoading"
            :data="sensitiveLogs"
            :columns="[
              { title: '时间', key: 'createTime', render: (row) => formatTime(row.createTime) },
              { title: '用户', key: 'username' },
              { title: '命中词', key: 'matchedWord', render: (row) => h(NTag, { type: 'error', size: 'small' }, { default: () => row.matchedWord }) },
              { title: '拦截内容', key: 'content', ellipsis: { tooltip: true } },
              { 
                title: '处理', 
                key: 'actions', 
                render: (row) => h(NButton, { 
                  size: 'small', 
                  type: 'error', 
                  quaternary: true,
                  onClick: () => router.push({ path: '/sensitive', query: { keyword: row.username } })
                }, { default: () => '管理违规' }) 
              }
            ]"
            :bordered="false"
          />
          <div v-if="sensitiveLogs.length === 0" class="py-12 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg text-center text-zinc-400">
             暂无拦截记录
          </div>
        </n-card>
      </n-tab-pane>

      <n-tab-pane name="settings" tab="提示词与配置">
        <div class="grid grid-cols-3 gap-6">
          <div class="col-span-2 space-y-6">
            <n-card title="AI 助教核心提示词" :bordered="false" class="shadow-sm">
              <template #header-extra>
                <n-button quaternary circle size="small" @click="fetchPrompts">
                  <template #icon><RefreshCw /></template>
                </n-button>
              </template>
              <n-data-table
                :loading="promptLoading"
                :data="promptList"
                :columns="[
                  { title: 'Key', key: 'promptKey', width: 200 },
                  { title: '描述', key: 'description' },
                  { 
                    title: '操作', 
                    key: 'actions', 
                    width: 100,
                    render: (row) => h(NButton, {
                      size: 'small',
                      type: 'primary',
                      ghost: true,
                      onClick: () => handleEditPrompt(row)
                    }, { default: () => '编辑' })
                  }
                ]"
              />
            </n-card>
          </div>

          <div class="col-span-1 space-y-6">
            <n-card title="模型配置" :bordered="false" class="shadow-sm">
                <div class="space-y-4">
                    <div class="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2">
                                <Zap class="text-amber-500" :size="18" />
                                <span class="font-medium">当前运行模型</span>
                            </div>
                            <n-tag :type="aiConfig.isOverridden ? 'warning' : 'success'" size="small">
                                {{ aiConfig.isOverridden ? '专项覆盖' : '全局联动' }}
                            </n-tag>
                        </div>
                        <div class="text-2xl font-bold text-center py-2 text-indigo-500">
                            {{ aiConfig.activeModel === 'default' ? '系统默认(qwen-plus)' : aiConfig.activeModel }}
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-xs text-zinc-500">切换模版本模型</label>
                        <n-select
                            :value="aiConfig.activeModel"
                            :options="[
                                { label: '跟随系统全局设置', value: 'default' },
                                { label: 'Qwen Turbo (高响应速度)', value: 'qwen-turbo' },
                                { label: 'Qwen Plus (平衡性能)', value: 'qwen-plus' },
                                { label: 'Qwen Max (最强理解)', value: 'qwen-max' },
                                { label: 'Qwen Long (长上下文支持)', value: 'qwen-long' }
                            ]"
                            @update:value="handleUpdateModel"
                        />
                        <p class="text-[10px] text-zinc-400">
                            注：设置后仅对“AI 助教”模块生效。若选“跟随全局”，则受 AI 治理面板中的全局模型设置影响。
                        </p>
                    </div>
                </div>
            </n-card>

            <n-card title="行为策略" :bordered="false" class="shadow-sm">
                <n-space vertical>
                    <div class="flex justify-between items-center text-sm">
                        <span>记忆深度</span>
                        <n-tag size="small">最近 10 条</n-tag>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span>容灾对冲</span>
                        <n-tag size="small" type="success">已开启</n-tag>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span>自动纠错 Few-shot</span>
                        <n-tag size="small" type="info">动态注入</n-tag>
                    </div>
                </n-space>
            </n-card>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>

    <!-- 会话详情 Modal -->
    <n-modal
      v-model:show="showSessionModal"
      preset="card"
      style="width: 600px; max-height: 80vh"
      title="完整会话追踪"
      :bordered="false"
    >
      <div class="session-container">
        <n-alert v-if="sessionMessages.length === 0 && !sessionLoading" type="info">
          暂无对话内容
        </n-alert>
        
        <n-scrollbar style="max-height: 60vh">
          <div class="p-2">
            <div v-for="(msg, index) in sessionMessages" :key="index" class="mb-6 flex flex-col" :class="msg.role === 'user' ? 'items-end' : 'items-start'">
                <div class="flex items-center gap-2 mb-1" :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
                    <n-tag :type="msg.role === 'user' ? 'info' : 'success'" size="small" round quaternary>
                        {{ msg.role === 'user' ? 'User' : 'AI Tutor' }}
                    </n-tag>
                    <span class="text-xs text-zinc-500">{{ formatTime(msg.createTime) }}</span>
                </div>
                <div 
                    class="p-3 rounded-2xl max-w-[90%] text-sm"
                    :class="msg.role === 'user' ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200 dark:border-zinc-700'"
                >
                    {{ msg.content }}
                </div>
                <div v-if="msg.topic" class="mt-1 text-[10px] text-zinc-400">
                    主题: {{ msg.topic }}
                </div>
            </div>
          </div>
        </n-scrollbar>
      </div>
      
      <n-divider dashed />
      <div class="flex justify-between items-center text-xs text-zinc-500">
          <span>Session ID: {{ currentSessionId }}</span>
          <n-button quaternary size="tiny" @click="viewSession(currentSessionId)">再刷刷新</n-button>
      </div>
    </n-modal>

    <!-- 提示词编辑 Modal -->
    <n-modal
      v-model:show="showPromptModal"
      preset="card"
      style="width: 800px"
      :title="'编辑提示词: ' + currentPrompt.promptKey"
      :bordered="false"
    >
      <n-space vertical :size="20">
        <n-alert type="info" show-icon>
          修改提示词将立即影响 AI 助教的回答风格和准则。请确保内容中包含必要的占位符（如 %s）。
        </n-alert>
        
        <div class="space-y-2">
            <span class="text-sm font-medium">提示词内容</span>
            <n-input
                v-model:value="currentPrompt.content"
                type="textarea"
                :autosize="{ minRows: 10, maxRows: 20 }"
                placeholder="在此输入系统提示词内容..."
            />
        </div>

        <div class="space-y-2">
            <span class="text-sm font-medium">更新说明/备注</span>
            <n-input v-model:value="currentPrompt.remark" placeholder="记录本次修改的原因，方便后续回滚..." />
        </div>

        <div class="flex justify-end gap-3 mt-4">
            <n-button @click="showPromptModal = false">取消</n-button>
            <n-button type="primary" @click="handleSavePrompt">保存更改</n-button>
        </div>
      </n-space>
    </n-modal>
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
}
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.stat-card {
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
}
.custom-table :deep(.n-data-table-thead) {
  background-color: transparent;
}
.session-container {
  padding: 12px 0;
}
</style>
