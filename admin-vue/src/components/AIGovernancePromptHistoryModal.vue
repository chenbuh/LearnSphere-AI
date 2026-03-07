<script setup>
import { computed, ref, watch } from 'vue'
import {
  NButton,
  NGrid,
  NGridItem,
  NModal,
  NPopconfirm,
  NScrollbar,
  NSpin,
  NTag,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  prompt: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:show', 'rolled-back'])

const message = useMessage()
const historyList = ref([])
const historyLoading = ref(false)
const comparingHistory = ref(null)
const rollingBackId = ref(null)

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const modalTitle = computed(() => `版本历史: ${props.prompt?.promptKey || ''}`)

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const loadHistory = async () => {
  if (!props.prompt?.id) {
    historyList.value = []
    return
  }

  historyLoading.value = true
  comparingHistory.value = null

  try {
    const res = await adminApi.getPromptHistory(props.prompt.id)
    historyList.value = res.data || []
  } catch (error) {
    console.error(error)
    historyList.value = []
    message.error('获取历史记录失败')
  } finally {
    historyLoading.value = false
  }
}

const handleRollback = async (historyId) => {
  if (!props.prompt?.id) {
    return
  }

  rollingBackId.value = historyId

  try {
    const res = await adminApi.rollbackPrompt(props.prompt.id, historyId)
    if (res.code === 200) {
      message.success('回滚成功')
      emit('rolled-back')
      modalVisible.value = false
    }
  } catch (error) {
    console.error(error)
    message.error('回滚失败')
  } finally {
    rollingBackId.value = null
  }
}

watch(
  () => [props.show, props.prompt?.id],
  ([show, promptId]) => {
    if (show && promptId) {
      loadHistory()
      return
    }

    if (!show) {
      historyList.value = []
      comparingHistory.value = null
    }
  },
  { immediate: true }
)
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" style="width: 1000px" :title="modalTitle">
    <n-spin :show="historyLoading">
      <n-grid :cols="comparingHistory ? 2 : 1" :x-gap="24">
        <n-grid-item>
          <div class="mb-4 flex justify-between items-center">
            <span class="text-xs text-zinc-500">所有历史版本 (倒序保存旧版本)</span>
          </div>
          <n-scrollbar style="max-height: 600px">
            <div
              v-for="item in historyList"
              :key="item.id"
              class="history-item p-4 mb-3 border border-zinc-800 rounded-xl transition-all cursor-pointer"
              :class="{ active: comparingHistory?.id === item.id }"
              @click="comparingHistory = item"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                  <n-tag size="small" type="info">V{{ item.version }}</n-tag>
                  <span class="text-sm font-bold">{{ item.remark || '手动更新' }}</span>
                </div>
                <span class="text-[10px] text-zinc-500">{{ formatTime(item.createTime) }}</span>
              </div>
              <div class="text-[11px] text-zinc-400 line-clamp-2 italic">
                {{ (item.content || '').substring(0, 100) }}...
              </div>
              <div class="mt-3 flex justify-end gap-2">
                <n-popconfirm @positive-click="handleRollback(item.id)">
                  <template #trigger>
                    <n-button size="tiny" secondary type="warning" :loading="rollingBackId === item.id">
                      回滚此版本
                    </n-button>
                  </template>
                  确定要回滚到 V{{ item.version }} 吗？当前内容将被存入新版本。
                </n-popconfirm>
              </div>
            </div>
          </n-scrollbar>
        </n-grid-item>

        <n-grid-item v-if="comparingHistory">
          <div class="sticky top-0">
            <div class="mb-4 flex justify-between items-center">
              <span class="text-xs text-zinc-500">版本 V{{ comparingHistory.version }} 内容详情</span>
              <n-button size="tiny" quaternary @click="comparingHistory = null">关闭详情</n-button>
            </div>
            <div class="bg-black/40 p-6 rounded-xl border border-zinc-800 font-mono text-xs overflow-auto max-h-[600px]">
              <pre class="whitespace-pre-wrap text-zinc-300">{{ comparingHistory.content }}</pre>
            </div>
          </div>
        </n-grid-item>
      </n-grid>
    </n-spin>
  </n-modal>
</template>

<style scoped>
.history-item:hover {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(99, 102, 241, 0.3);
}

.history-item.active {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.05);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
}
</style>