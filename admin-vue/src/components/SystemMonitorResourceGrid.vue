<script setup>
import { NCard, NGrid, NGridItem, NProgress } from 'naive-ui'
import { Server, HardDrive } from 'lucide-vue-next'

defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <n-grid :cols="12" :x-gap="24" :y-gap="24" class="resource-grid">
    <n-grid-item span="12 l:7">
      <n-card :bordered="false" class="main-card glow-effect h-full" title="JVM 内存资源">
        <template #header-extra>
          <div class="card-extra">
            <Server :size="14" />
            <span>Heap & Non-Heap</span>
          </div>
        </template>

        <div class="resource-stack">
          <div class="memory-section">
            <div class="section-head">
              <span class="section-title">
                <span class="dot dot-blue"></span>
                堆内存 (Heap)
              </span>
              <span class="section-value">
                <span class="value-strong">{{ info.heapUsed }} MB</span> / {{ info.heapMax }} MB
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
            <div class="section-foot">
              <span>初始: {{ info.heapInit || '-' }} MB</span>
              <span>提交: {{ info.heapCommitted || '-' }} MB</span>
            </div>
          </div>

          <div class="memory-section">
            <div class="section-head">
              <span class="section-title">
                <span class="dot dot-indigo"></span>
                非堆内存 (Non-Heap)
              </span>
              <span class="section-value">使用中: <span class="value-strong">{{ info.nonHeapUsed }} MB</span></span>
            </div>
            <n-progress
              type="line"
              :percentage="50"
              :show-indicator="false"
              color="#6366f1"
              :rail-color="'rgba(255,255,255,0.1)'"
              :height="12"
              border-radius="6"
              class="non-heap-progress"
            />
            <div class="section-foot">
              <span>Metaspace, Code Cache, etc.</span>
              <span>Commited: {{ info.nonHeapCommitted || 0 }} MB</span>
            </div>
          </div>
        </div>
      </n-card>
    </n-grid-item>

    <n-grid-item span="12 l:5">
      <n-card :bordered="false" class="main-card glow-effect h-full" title="磁盘状态 (Root)">
        <template #header-extra>
          <HardDrive :size="16" class="disk-icon" />
        </template>

        <div class="disk-panel">
          <n-progress
            type="dashboard"
            :percentage="info.diskUsage || 0"
            :gap-degree="180"
            :width="180"
            :stroke-width="12"
            :color="info.diskUsage > 85 ? '#f43f5e' : '#10b981'"
          >
            <template #default>
              <div class="disk-center">
                <div class="disk-percent" :class="info.diskUsage > 85 ? 'disk-percent-danger' : 'disk-percent-safe'">
                  {{ info.diskUsage }}%
                </div>
                <div class="disk-caption">Used Space</div>
              </div>
            </template>
          </n-progress>

          <div class="disk-stats">
            <div class="disk-stat-row">
              <span class="disk-label">总空间 Total</span>
              <span class="disk-value">{{ info.diskTotal }} GB</span>
            </div>
            <div class="disk-stat-row">
              <span class="disk-label">可用 Free</span>
              <span class="disk-value disk-value-safe">{{ info.diskFree }} GB</span>
            </div>
            <div class="disk-stat-row">
              <span class="disk-label">已用 Used</span>
              <span class="disk-value disk-value-info">{{ info.diskUsed }} GB</span>
            </div>
          </div>
        </div>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<style scoped>
.resource-grid {
  margin-bottom: 32px;
}

.main-card {
  background: var(--n-color);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glow-effect {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-extra {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgb(113, 113, 122);
}

.resource-stack {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 8px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.section-value {
  font-family: 'JetBrains Mono', monospace;
  color: rgb(161, 161, 170);
}

.value-strong {
  color: rgb(244, 244, 245);
  font-weight: 700;
}

.section-foot {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: rgb(113, 113, 122);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.dot-blue {
  background: rgb(59, 130, 246);
}

.dot-indigo {
  background: rgb(99, 102, 241);
}

.non-heap-progress {
  opacity: 0.8;
}

.disk-icon {
  color: rgb(113, 113, 122);
}

.disk-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 16px 0;
}

.disk-center {
  text-align: center;
}

.disk-percent {
  font-size: 2.25rem;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}

.disk-percent-safe {
  color: rgb(52, 211, 153);
}

.disk-percent-danger {
  color: rgb(239, 68, 68);
}

.disk-caption {
  margin-top: 4px;
  font-size: 12px;
  color: rgb(113, 113, 122);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.disk-stats {
  width: 100%;
  margin-top: 24px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.disk-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.disk-label {
  font-size: 12px;
  color: rgb(161, 161, 170);
}

.disk-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
}

.disk-value-safe {
  color: rgb(52, 211, 153);
}

.disk-value-info {
  color: rgb(129, 140, 248);
}
</style>
