<script setup>
import { ref, onMounted, computed, h } from 'vue'
import { 
  NCard, NSpace, NInput, NButton, NDataTable, NTag, 
  NModal, NDescriptions, NDescriptionsItem, NPopconfirm,
  useMessage, NIcon, NLayout, NLayoutHeader, NLayoutContent,
  NEmpty, NSpin, NTooltip
} from 'naive-ui'
import { 
  Search, RefreshCw, Trash2, Database, Info, 
  ArrowLeft, Terminal, ShieldAlert 
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import axios from 'axios'

const message = useMessage()
const router = useRouter()
const loading = ref(false)
const searchPattern = ref('*')
const keys = ref([])
const showDetail = ref(false)
const detailLoading = ref(false)
const selectedKey = ref(null)
const keyDetail = ref({
  key: '',
  value: null,
  ttl: -1,
  type: ''
})

const columns = [
  {
    title: '键名 (Key)',
    key: 'key',
    sorter: 'default',
    render(row) {
      return h(NSpace, { align: 'center', size: 'small' }, {
        default: () => [
          h(NIcon, { component: Database, style: 'color: #6366f1; opacity: 0.8' }),
          h('span', { style: 'font-family: monospace; color: #d4d4d8' }, row.key)
        ]
      })
    }
  },
  {
    title: '数据类型',
    key: 'type',
    width: 120,
    render(row) {
      const typeMap = {
        'STRING': 'success',
        'LIST': 'info',
        'SET': 'warning',
        'ZSET': 'error',
        'HASH': 'primary'
      }
      return h(NTag, { size: 'small', type: typeMap[row.type] || 'default' }, { default: () => row.type })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, { 
            size: 'tiny', 
            secondary: true, 
            onClick: () => fetchDetail(row.key) 
          }, { default: () => '详情' }),
          h(NPopconfirm, { 
            onPositiveClick: () => deleteKey(row.key) 
          }, {
            trigger: () => h(NButton, { size: 'tiny', secondary: true, type: 'error' }, { default: () => '删除' }),
            default: () => '确定要删除此键吗？'
          })
        ]
      })
    }
  }
]

const fetchKeys = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/admin/redis/keys', {
      params: { pattern: searchPattern.value },
      headers: { 'Authorization': localStorage.getItem('admin-token') }
    })
    if (res.data.code === 200) {
      keys.value = res.data.data
    }
  } catch (error) {
    message.error('获取 Redis 键列表失败')
  } finally {
    loading.value = false
  }
}

const fetchDetail = async (key) => {
  selectedKey.value = key
  detailLoading.value = true
  showDetail.value = true
  try {
    const res = await axios.get('/api/admin/redis/detail', {
      params: { key },
      headers: { 'Authorization': localStorage.getItem('admin-token') }
    })
    if (res.data.code === 200) {
      keyDetail.value = res.data.data
    }
  } catch (error) {
    message.error('获取键详情失败')
  } finally {
    detailLoading.value = false
  }
}

const deleteKey = async (key) => {
  try {
    const res = await axios.delete('/api/admin/redis/key', {
      params: { key },
      headers: { 'Authorization': localStorage.getItem('admin-token') }
    })
    if (res.data.code === 200) {
      message.success('删除成功')
      fetchKeys()
      if (showDetail.value && selectedKey.value === key) {
        showDetail.value = false
      }
    }
  } catch (error) {
    message.error('删除失败')
  }
}

const clearKeys = async () => {
  if (searchPattern.value === '*' || searchPattern.value === '') {
    message.warning('出于安全考虑，禁止全局通配符清理，请输入具体前缀')
    return
  }
  
  try {
    const res = await axios.delete('/api/admin/redis/clear', {
      params: { pattern: searchPattern.value },
      headers: { 'Authorization': localStorage.getItem('admin-token') }
    })
    if (res.data.code === 200) {
      message.success(res.data.data)
      fetchKeys()
    }
  } catch (error) {
    message.error('清理失败')
  }
}

const formatValue = (val) => {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'object') return JSON.stringify(val, null, 2)
  return String(val)
}

const formatTTL = (ttl) => {
  if (ttl === -1) return '永久有效'
  if (ttl === -2) return '已过期/不存在'
  
  const m = Math.floor(ttl / 60)
  const s = ttl % 60
  const h = Math.floor(m / 60)
  const mm = m % 60
  
  if (h > 0) return `${h}h ${mm}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

onMounted(() => {
  fetchKeys()
})
</script>

<template>
  <div class="redis-manager" style="padding: 24px; max-width: 1200px; margin: 0 auto;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
      <n-space align="center" size="large">
        <n-button circle secondary @click="router.back()">
          <template #icon><ArrowLeft /></template>
        </n-button>
        <div>
          <h2 style="font-size: 24px; font-weight: bold; margin: 0; display: flex; align-items: center; gap: 8px;">
            <n-icon :component="Database" style="color: #6366f1" />
            Redis 缓存管理
          </h2>
          <p style="color: #71717a; font-size: 14px; margin: 0;">运维利器：实时监控与清理 Redis 缓存键值</p>
        </div>
      </n-space>
      
      <n-space>
        <n-button @click="fetchKeys" :loading="loading">
          <template #icon><n-icon :component="RefreshCw" /></template>
          刷新
        </n-button>
        <n-popconfirm @positive-click="clearKeys">
          <template #trigger>
            <n-button type="error" ghost shadow>
              <template #icon><n-icon :component="Trash2" /></template>
              按搜索条件清理
            </n-button>
          </template>
          确定要清理所有匹配 "{{ searchPattern }}" 的键吗？此操作不可逆！
        </n-popconfirm>
      </n-space>
    </div>

    <n-card class="mb-6" style="background: rgba(24, 24, 28, 0.5); border-color: #333; margin-bottom: 24px;">
      <n-space vertical>
        <div style="display: flex; align-items: center; gap: 16px;">
          <n-input 
            v-model:value="searchPattern" 
            placeholder="输入键名模式，如: ai:cache:* 或 metrics:*" 
            style="flex: 1"
            @keyup.enter="fetchKeys"
          >
            <template #prefix>
              <n-icon :component="Search" style="opacity: 0.4" />
            </template>
          </n-input>
          <n-button type="primary" @click="fetchKeys" :loading="loading">检索</n-button>
        </div>
        <div style="font-size: 12px; color: #71717a; display: flex; align-items: center; gap: 4px;">
          <n-icon :component="Info" :size="12" />
          <span>支持通配符 * (星号)，默认检索所有键。出于性能考虑，生产环境建议缩小范围进行扫描。</span>
        </div>
      </n-space>
    </n-card>

    <n-card :bordered="false" style="box-shadow: 0 4px 20px rgba(0,0,0,0.3); border-radius: 12px;">
      <n-data-table
        :columns="columns"
        :data="keys"
        :loading="loading"
        :pagination="{ pageSize: 15 }"
        max-height="650"
      />
    </n-card>

    <n-modal v-model:show="showDetail" preset="card" style="width: 800px; border-radius: 16px;" title="键值详情">
      <n-spin :show="detailLoading">
        <div v-if="keyDetail" class="detail-container">
          <n-descriptions bordered label-column-width="120" :column="1">
            <n-descriptions-item label="Key 名称">
              <span style="font-family: monospace; color: #6366f1; font-weight: bold;">{{ keyDetail.key }}</span>
            </n-descriptions-item>
            <n-descriptions-item label="数据类型">
              <n-tag type="info" size="small">{{ keyDetail.type }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="过期时间 (TTL)">
              <n-tag :type="keyDetail.ttl === -1 ? 'success' : 'warning'" size="small">
                {{ formatTTL(keyDetail.ttl) }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="存储值 (Value)">
              <div style="background: #000; padding: 16px; border-radius: 8px; border: 1px solid #333; margin-top: 8px; max-height: 400px; overflow: auto; width: 100%;">
                <pre style="font-family: monospace; font-size: 13px; color: #d4d4d8; white-space: pre-wrap; word-break: break-all; margin: 0;">{{ formatValue(keyDetail.value) }}</pre>
              </div>
            </n-descriptions-item>
          </n-descriptions>
        </div>
        <n-empty v-else description="未找到详情" />
      </n-spin>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetail = false">关闭</n-button>
          <n-button type="error" ghost @click="deleteKey(keyDetail.key)">删除此键</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
:deep(.n-data-table-td) {
  padding: 12px 16px;
}
</style>
