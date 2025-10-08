<script setup>
import { ref, onMounted } from 'vue'
import { 
  NCard, NForm, NFormItem, NInput, NSwitch, NInputNumber, 
  NButton, NDivider, useMessage, NSpace, NTag 
} from 'naive-ui'
import { Save, Settings, ShieldAlert, Cpu } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const loading = ref(false)

// Config Data structure
const configs = ref({
  'sys.site_name': '',
  'sys.announcement': '',
  'sys.user_registration': true,
  'sys.maintenance_mode': false,
  'ai.limit.daily.0': 5,
  'ai.limit.daily.1': 50,
  'ai.limit.daily.2': 100,
  'ai.limit.daily.3': 200
})

// Original raw config list for reference
const rawConfigList = ref([])

const fetchConfigs = async () => {
  loading.value = true
  try {
    const res = await adminApi.getSystemConfigs()
    rawConfigList.value = res.data
    
    // Map list to object for easier binding
    res.data.forEach(item => {
      const key = item.configKey
      let value = item.configValue
      
      // Type conversion
      if (value === 'true' || value === 'false') {
        configs.value[key] = value === 'true'
      } else if (!isNaN(Number(value)) && value.trim() !== '') {
        configs.value[key] = Number(value)
      } else {
        configs.value[key] = value
      }
    })
  } catch (error) {
    message.error('加载系统配置失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async (key) => {
  const value = String(configs.value[key])
  try {
    await adminApi.updateSystemConfig(key, value)
    message.success('配置已更新')
  } catch (error) {
    message.error('更新失败')
  }
}

// Bulk save for sections
const handleSaveBasic = () => {
  handleSave('sys.site_name')
  handleSave('sys.announcement')
}

const handleSaveSwitch = (key) => {
  handleSave(key)
}

const handleSaveAI = () => {
  handleSave('ai.limit.daily.0')
  handleSave('ai.limit.daily.1')
  handleSave('ai.limit.daily.2')
  handleSave('ai.limit.daily.3')
}

onMounted(() => {
  fetchConfigs()
})
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1>系统配置</h1>
        <p>管理全局系统设置、开关及 AI 配额</p>
      </div>
    </header>

    <div class="settings-grid">
      <!-- 基础设置 -->
      <n-card title="基础设置" class="setting-card">
        <template #header-extra><Settings class="icon" /></template>
        <n-form label-placement="top">
          <n-form-item label="网站名称">
            <n-input v-model:value="configs['sys.site_name']" placeholder="LearnSphere AI" />
          </n-form-item>
          <n-form-item label="系统公告">
            <n-input 
              v-model:value="configs['sys.announcement']" 
              type="textarea" 
              placeholder="发布全局通知..." 
              :rows="3"
            />
          </n-form-item>
          <n-button type="primary" @click="handleSaveBasic">
            <template #icon><Save /></template>
            保存基础设置
          </n-button>
        </n-form>
      </n-card>

      <!-- 系统开关 -->
      <n-card title="系统开关" class="setting-card">
        <template #header-extra><ShieldAlert class="icon" /></template>
        <n-space vertical size="large">
          <div class="switch-item">
            <div class="switch-info">
              <span class="switch-title">开放用户注册</span>
              <span class="switch-desc">关闭后新用户将无法注册，现有用户不受影响</span>
            </div>
            <n-switch 
              v-model:value="configs['sys.user_registration']" 
              @update:value="handleSaveSwitch('sys.user_registration')"
            />
          </div>
          
          <n-divider style="margin: 0" />
          
          <div class="switch-item">
            <div class="switch-info">
              <span class="switch-title">系统维护模式</span>
              <span class="switch-desc text-warning">开启后除管理员外无法访问，请谨慎操作</span>
            </div>
            <n-switch 
              v-model:value="configs['sys.maintenance_mode']"
              :rail-style="({ checked }) => checked ? { background: '#d03050' } : {}"
              @update:value="handleSaveSwitch('sys.maintenance_mode')"
            />
          </div>
        </n-space>
      </n-card>

      <!-- AI 配额管理 -->
      <n-card title="AI 资源配额" class="setting-card">
        <template #header-extra><Cpu class="icon" /></template>
        <n-form label-placement="left" label-width="140">
          <n-form-item label="普通用户每日限额">
            <n-input-number v-model:value="configs['ai.limit.daily.0']" :min="0" />
            <template #feedback>次/天</template>
          </n-form-item>
          <n-form-item label="月度会员每日限额">
            <n-input-number v-model:value="configs['ai.limit.daily.1']" :min="0" />
            <template #feedback>次/天</template>
          </n-form-item>
          <n-form-item label="季度会员每日限额">
            <n-input-number v-model:value="configs['ai.limit.daily.2']" :min="0" />
            <template #feedback>次/天</template>
          </n-form-item>
          <n-form-item label="年度会员每日限额">
            <n-input-number v-model:value="configs['ai.limit.daily.3']" :min="0" />
            <template #feedback>次/天</template>
          </n-form-item>
          <n-button type="primary" @click="handleSaveAI" secondary>
            <template #icon><Save /></template>
            保存配额设置
          </n-button>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #71717a;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.setting-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  height: 100%;
}

.icon {
  width: 20px;
  height: 20px;
  color: #a1a1aa;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.switch-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.switch-title {
  font-weight: 600;
  font-size: 1rem;
}

.switch-desc {
  font-size: 0.85rem;
  color: #71717a;
}

.text-warning {
  color: #f59e0b;
}
</style>
