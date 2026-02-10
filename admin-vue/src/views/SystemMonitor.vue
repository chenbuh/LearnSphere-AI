<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { adminApi } from '@/api/admin'
import { NCard, NGrid, NGridItem, NProgress, NButton, NTag, NDescriptions, NDescriptionsItem } from 'naive-ui'
import { Activity, Cpu, Calculator, Clock, RefreshCcw } from 'lucide-vue-next'

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
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-2xl font-bold mb-2">系统运维监控</h1>
             <p class="text-zinc-500">实时监控服务器资源使用情况与 JVM 状态</p>
        </div>
        <n-button @click="fetchMonitorData" :loading="loading" secondary>
            <template #icon><RefreshCcw /></template>
            立即刷新
        </n-button>
    </div>

    <!-- 核心指标卡片 -->
    <n-grid :cols="4" :x-gap="24" :y-gap="24" class="mb-6">
        <n-grid-item>
            <n-card :bordered="false" class="h-full stat-card">
                <div class="flex items-center gap-4">
                    <div class="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Cpu :size="24" />
                    </div>
                    <div>
                        <div class="text-zinc-500 text-xs mb-1">CPU 核心数</div>
                        <div class="text-2xl font-bold">{{ info.processors || '-' }} <span class="text-sm font-normal text-zinc-500">Cores</span></div>
                    </div>
                </div>
            </n-card>
        </n-grid-item>
         <n-grid-item>
            <n-card :bordered="false" class="h-full stat-card">
                <div class="flex items-center gap-4">
                    <div class="p-3 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Calculator :size="24" />
                    </div>
                    <div>
                        <div class="text-zinc-500 text-xs mb-1">系统负载</div>
                        <div class="text-2xl font-bold">{{ info.systemLoad >= 0 ? info.systemLoad.toFixed(2) : 'N/A' }}</div>
                    </div>
                </div>
            </n-card>
        </n-grid-item>
         <n-grid-item>
            <n-card :bordered="false" class="h-full stat-card">
                <div class="flex items-center gap-4">
                    <div class="p-3 rounded-lg bg-amber-500/20 text-amber-400">
                        <Activity :size="24" />
                    </div>
                    <div>
                        <div class="text-zinc-500 text-xs mb-1">活跃线程数</div>
                        <div class="text-2xl font-bold">{{ info.threadCount || '-' }}</div>
                    </div>
                </div>
            </n-card>
        </n-grid-item>
         <n-grid-item>
            <n-card :bordered="false" class="h-full stat-card">
                <div class="flex items-center gap-4">
                    <div class="p-3 rounded-lg bg-rose-500/20 text-rose-400">
                        <Clock :size="24" />
                    </div>
                    <div>
                        <div class="text-zinc-500 text-xs mb-1">运行时长</div>
                        <div class="text-lg font-mono font-bold">{{ formatUptime(info.uptime) }}</div>
                    </div>
                </div>
            </n-card>
        </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="24" :y-gap="24" class="mb-6">
        <!-- 内存资源 -->
        <n-grid-item>
            <n-card title="JVM 内存资源" :bordered="false" class="h-full main-card">
                 <div class="flex flex-col gap-6 pt-4">
                    <div>
                        <div class="flex justify-between mb-2">
                            <span>堆内存 (Heap)</span>
                            <span class="text-zinc-400 font-mono">{{ info.heapUsed }} MB / {{ info.heapMax }} MB</span>
                        </div>
                        <n-progress 
                            type="line" 
                            :percentage="info.heapUsage || 0" 
                            :status="info.heapUsage > 80 ? 'error' : (info.heapUsage > 60 ? 'warning' : 'success')"
                            :height="12"
                            processing
                        />
                    </div>
                     <div>
                        <div class="flex justify-between mb-2">
                             <span>非堆内存 (Non-Heap)</span>
                             <span class="text-zinc-400 font-mono">{{ info.nonHeapUsed }} MB 使用中</span>
                        </div>
                        <n-progress 
                            type="line" 
                            :percentage="50" 
                             :show-indicator="false"
                            status="info"
                            :height="6"
                            class="opacity-50"
                        />
                    </div>
                 </div>
            </n-card>
        </n-grid-item>

        <!-- 磁盘资源 -->
        <n-grid-item>
             <n-card title="磁盘状态 (Root)" :bordered="false" class="h-full main-card">
                 <div class="flex items-center justify-around h-full pt-4">
                    <div class="text-center">
                        <n-progress type="dashboard" :percentage="info.diskUsage || 0" :gap-degree="180" :width="160">
                            <template #default>
                                <div class="text-center">
                                    <div class="text-3xl font-bold">{{ info.diskUsage }}%</div>
                                    <div class="text-xs text-zinc-500 mt-1">已用空间</div>
                                </div>
                            </template>
                        </n-progress>
                    </div>
                    <div class="space-y-4 min-w-[200px]">
                        <div class="flex justify-between items-center bg-zinc-800/50 p-3 rounded">
                            <span class="text-zinc-400">总空间</span>
                            <span class="font-mono font-bold">{{ info.diskTotal }} GB</span>
                        </div>
                         <div class="flex justify-between items-center bg-zinc-800/50 p-3 rounded">
                            <span class="text-zinc-400">已用</span>
                            <span class="font-mono text-amber-400">{{ info.diskUsed }} GB</span>
                        </div>
                         <div class="flex justify-between items-center bg-zinc-800/50 p-3 rounded">
                            <span class="text-zinc-400">可用</span>
                            <span class="font-mono text-emerald-400">{{ info.diskFree }} GB</span>
                        </div>
                    </div>
                 </div>
             </n-card>
        </n-grid-item>
    </n-grid>

    <n-card title="运行时环境详情" :bordered="false" class="main-card">
        <n-descriptions label-placement="left" bordered :column="2">
            <n-descriptions-item label="Java 版本">
               <n-tag :bordered="false" type="success" size="small">{{ info.javaVersion }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="虚拟机名称">
                {{ info.jvmName }}
            </n-descriptions-item>
            <n-descriptions-item label="操作系统">
                {{ info.osName }} ({{ info.osArch }})
            </n-descriptions-item>
             <n-descriptions-item label="守护线程">
                {{ info.daemonThreadCount }}
            </n-descriptions-item>
             <n-descriptions-item label="启动时间">
                {{ new Date(info.startTime).toLocaleString() }}
            </n-descriptions-item>
        </n-descriptions>
    </n-card>
  </div>
</template>

<style scoped>
.stat-card {
    transition: transform 0.2s;
}
.stat-card:hover {
    transform: translateY(-2px);
}
</style>
