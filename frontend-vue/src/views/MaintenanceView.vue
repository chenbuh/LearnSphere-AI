<template>
  <div class="maintenance-container">
    <div class="content">
      <div class="icon-wrapper">
        <n-icon size="64" color="#f59e0b">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cone"><path d="m20.9 18.55-8-15.98a1 1 0 0 0-1.8 0l-8 15.98a1 1 0 0 0 .9 1.43h14a1 1 0 0 0 .9-1.43Z"/><path d="M10 22v-8h4v8"/></svg>
        </n-icon>
      </div>
      <h1>系统维护中</h1>
      <p class="message" v-html="systemStore.maintenanceMessage || '我们正在对系统进行升级维护，以提供更好的服务。<br>预计维护时间较短，请稍后再试。'">
      </p>
      <div class="status-box">
        <span class="pulse"></span>
        <span>Maintenance in progress...</span>
      </div>
      <n-button type="primary" @click="checkStatus" :loading="loading" class="retry-btn">
        刷新重试
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemStore } from '@/stores/system'
import { useMessage, NIcon, NButton } from 'naive-ui'

const router = useRouter()
const systemStore = useSystemStore()
const message = useMessage()
const loading = ref(false)

const checkStatus = async () => {
  loading.value = true
  await systemStore.fetchSystemConfig()
  loading.value = false
  
  if (!systemStore.isMaintenanceMode) {
    message.success('维护已结束，正在进入系统...')
    router.push('/')
  } else {
    message.warning('系统仍处于维护状态，请稍候')
  }
}
</script>

<style scoped>
.maintenance-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #fff;
  padding: 20px;
}

.content {
  text-align: center;
  max-width: 500px;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.icon-wrapper {
  background: rgba(245, 158, 11, 0.1);
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.message {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 32px;
}

.status-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 999px;
  font-size: 0.875rem;
  color: #f59e0b;
  margin-bottom: 32px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.pulse {
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.retry-btn {
  width: 100%;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
