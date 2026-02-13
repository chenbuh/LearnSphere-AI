<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { adminApi } from '@/api/admin'
import { NCard, NGrid, NGridItem, NProgress, NButton, NTag, NDescriptions, NDescriptionsItem, NStatistic, NNumberAnimation, NSpace } from 'naive-ui'
import { Activity, Cpu, Server, Clock, RefreshCcw, Database, HardDrive, Zap, Layers } from 'lucide-vue-next'

const loading = ref(false)
const info = ref({})
let timer = null

const fetchMonitorData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getSystemMonitor()
    if (res.data) {
        info.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formatUptime = (ms) => {
    if (!ms) return '-'
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分 ${seconds % 60}秒`;
}

onMounted(() => {
  fetchMonitorData()
  timer = setInterval(async () => {
      // Background refresh without loading spinner
      try {
        const res = await adminApi.getSystemMonitor()
        if (res.data) info.value = res.data
      } catch (e) {}
  }, 5000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="page-container p-6">
    <!-- Header -->
    <div class="flex justify-between items-end mb-8">
        <div>
            <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-2">
                系统运维监控
            </h1>
             <p class="text-zinc-400 flex items-center gap-2">
                <Activity :size="16" class="text-indigo-400"/>
                实时监控服务器核心指标与运行时状态
             </p>
        </div>
        <n-button @click="fetchMonitorData" :loading="loading" type="primary" secondary round size="large">
            <template #icon><RefreshCcw /></template>
            立即刷新
        </n-button>
    </div>

    <!-- 核心指标卡片 -->
    <n-grid :cols="4" :x-gap="20" :y-gap="20" responsive="screen" item-responsive class="mb-8">
        <n-grid-item span="4 m:2 l:1">
            <div class="monitor-card bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/20">
                <div class="card-icon bg-indigo-500/20 text-indigo-400">
                    <Cpu :size="24" />
                </div>
                <div class="card-content">
                    <div class="card-label">CPU 核心数</div>
                    <div class="card-value">
                        <n-number-animation :from="0" :to="info.processors || 0" />
                        <span class="unit">Cores</span>
                    </div>
                </div>
            </div>
        </n-grid-item>
         <n-grid-item span="4 m:2 l:1">
            <div class="monitor-card bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
                <div class="card-icon bg-emerald-500/20 text-emerald-400">
                    <Zap :size="24" />
                </div>
                <div class="card-content">
                    <div class="card-label">系统负载</div>
                    <div class="card-value">
                        {{ info.systemLoad >= 0 ? info.systemLoad.toFixed(2) : 'N/A' }}
                    </div>
                </div>
            </div>
        </n-grid-item>
         <n-grid-item span="4 m:2 l:1">
            <div class="monitor-card bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                <div class="card-icon bg-amber-500/20 text-amber-400">
                    <Layers :size="24" />
                </div>
                <div class="card-content">
                    <div class="card-label">活跃线程数</div>
                    <div class="card-value">
                        <n-number-animation :from="0" :to="info.threadCount || 0" />
                    </div>
                </div>
            </div>
        </n-grid-item>
         <n-grid-item span="4 m:2 l:1">
            <div class="monitor-card bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/20">
                <div class="card-icon bg-rose-500/20 text-rose-400">
                    <Clock :size="24" />
                </div>
                <div class="card-content">
                    <div class="card-label">运行时长</div>
                    <div class="card-value text-lg">
                        {{ formatUptime(info.uptime).split(' ')[0] }}
                    </div>
                </div>
            </div>
        </n-grid-item>
    </n-grid>

    <n-grid :cols="12" :x-gap="24" :y-gap="24" class="mb-8">
        <!-- 内存资源 -->
        <n-grid-item span="12 l:7">
            <n-card :bordered="false" class="main-card glow-effect h-full" title="JVM 内存资源">
                 <template #header-extra>
                    <div class="flex items-center gap-2 text-xs text-zinc-500">
                        <Server :size="14" />
                        <span>Heap & Non-Heap</span>
                    </div>
                 </template>
                 
                 <div class="flex flex-col gap-8 pt-2">
                    <!-- Heap -->
                    <div class="memory-section">
                        <div class="flex justify-between mb-3 text-sm">
                            <span class="font-bold flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                堆内存 (Heap)
                            </span>
                            <span class="font-mono text-zinc-400">
                                <span class="text-white font-bold">{{ info.heapUsed }} MB</span> / {{ info.heapMax }} MB
                            </span>
                        </div>
                        <n-progress 
                            type="line" 
                            :percentage="info.heapUsage || 0" 
                            :color="info.heapUsage > 80 ? '#f43f5e' : (info.heapUsage > 60 ? '#f59e0b' : '#3b82f6')"
                            :rail-color="'rgba(255,255,255,0.1)'"
                            :height="24"
                            processing
                            indicator-placement="inside"
                            border-radius="12"
                        />
                        <div class="text-xs text-zinc-500 mt-2 flex justify-between">
                            <span>初始: {{ info.heapInit || '-' }} MB</span>
                            <span>提交: {{ info.heapCommitted || '-' }} MB</span>
                        </div>
                    </div>

                    <!-- Non-Heap -->
                     <div class="memory-section">
                        <div class="flex justify-between mb-3 text-sm">
                             <span class="font-bold flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                                非堆内存 (Non-Heap)
                             </span>
                             <span class="font-mono text-zinc-400">使用中: <span class="text-white">{{ info.nonHeapUsed }} MB</span></span>
                        </div>
                        <n-progress 
                            type="line" 
                            :percentage="50" 
                             :show-indicator="false"
                            color="#6366f1"
                            :rail-color="'rgba(255,255,255,0.1)'"
                            :height="12"
                            border-radius="6"
                            class="opacity-80"
                        />
                         <div class="text-xs text-zinc-500 mt-2 flex justify-between">
                            <span>Metaspace, Code Cache, etc.</span>
                            <span>Commited: {{ info.nonHeapCommitted || 0 }} MB</span>
                        </div>
                    </div>
                 </div>
            </n-card>
        </n-grid-item>

        <!-- 磁盘资源 -->
        <n-grid-item span="12 l:5">
             <n-card :bordered="false" class="main-card glow-effect h-full" title="磁盘状态 (Root)">
                <template #header-extra>
                    <HardDrive :size="16" class="text-zinc-500" />
                 </template>
                 <div class="flex flex-col items-center justify-center h-full py-4">
                    <n-progress type="dashboard" :percentage="info.diskUsage || 0" :gap-degree="180" :width="180" :stroke-width="12"
                        :color="info.diskUsage > 85 ? '#f43f5e' : '#10b981'">
                        <template #default>
                            <div class="text-center">
                                <div class="text-4xl font-extrabold font-mono" :class="info.diskUsage > 85 ? 'text-red-500' : 'text-emerald-400'">
                                    {{ info.diskUsage }}%
                                </div>
                                <div class="text-xs text-zinc-500 mt-1 uppercase tracking-wider">Used Space</div>
                            </div>
                        </template>
                    </n-progress>
                    
                    <div class="w-full mt-6 space-y-3 px-4">
                        <div class="disk-stat-row">
                            <span class="text-zinc-400 text-xs">总空间 Total</span>
                            <span class="font-mono font-bold">{{ info.diskTotal }} GB</span>
                        </div>
                        <div class="disk-stat-row">
                            <span class="text-zinc-400 text-xs">可用 Free</span>
                            <span class="font-mono text-emerald-400">{{ info.diskFree }} GB</span>
                        </div>
                         <div class="disk-stat-row">
                            <span class="text-zinc-400 text-xs">已用 Used</span>
                            <span class="font-mono text-indigo-400">{{ info.diskUsed }} GB</span>
                        </div>
                    </div>
                 </div>
             </n-card>
        </n-grid-item>
    </n-grid>

    <!-- 运行时信息 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="info-pill">
            <div class="label">JAVA VERSION</div>
            <div class="value text-indigo-300">{{ info.javaVersion }}</div>
        </div>
        <div class="info-pill">
            <div class="label">JVM NAME</div>
            <div class="value text-zinc-300 truncate" :title="info.jvmName">{{ info.jvmName }}</div>
        </div>
        <div class="info-pill">
            <div class="label">OS ARCH</div>
            <div class="value text-zinc-300">{{ info.osName }} ({{ info.osArch }})</div>
        </div>
        <div class="info-pill">
            <div class="label">START TIME</div>
            <div class="value text-amber-300">
                {{ info.startTime ? new Date(info.startTime).toLocaleString() : '-' }}
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
    max-width: 1400px;
    margin: 0 auto;
}

/* Custom Monitor Card */
.monitor-card {
    padding: 24px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    transition: all 0.3s ease;
}
.monitor-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
}

.card-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-content {
    flex: 1;
}

.card-label {
    font-size: 0.85rem;
    color: var(--n-text-color-3);
    margin-bottom: 4px;
    font-weight: 500;
}

.card-value {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.2;
    color: var(--n-text-color-1);
}
.card-value .unit {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--n-text-color-3);
    margin-left: 4px;
}

/* Main Cards */
.main-card {
    background: var(--n-color);
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.08);
}
.glow-effect {
    box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 4px 6px -1px rgba(0,0,0,0.1);
}

.disk-stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(255,255,255,0.03);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.05);
}

/* Info Pills */
.info-pill {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 16px 20px;
}
.info-pill .label {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--n-text-color-3);
    margin-bottom: 6px;
    letter-spacing: 0.05em;
}
.info-pill .value {
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
}
</style>
