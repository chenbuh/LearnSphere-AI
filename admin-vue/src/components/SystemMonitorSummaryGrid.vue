<script setup>
import { Clock, Cpu, Layers, Zap } from 'lucide-vue-next'
import { NGrid, NGridItem, NNumberAnimation } from 'naive-ui'

defineProps({
  info: {
    type: Object,
    default: () => ({})
  },
  uptimeLabel: {
    type: String,
    default: '-'
  }
})
</script>

<template>
  <n-grid :cols="4" :x-gap="20" :y-gap="20" responsive="screen" item-responsive class="summary-grid">
    <n-grid-item span="4 m:2 l:1">
      <div class="monitor-card card-indigo">
        <div class="card-icon icon-indigo">
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
      <div class="monitor-card card-emerald">
        <div class="card-icon icon-emerald">
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
      <div class="monitor-card card-amber">
        <div class="card-icon icon-amber">
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
      <div class="monitor-card card-rose">
        <div class="card-icon icon-rose">
          <Clock :size="24" />
        </div>
        <div class="card-content">
          <div class="card-label">运行时长</div>
          <div class="card-value text-small">
            {{ uptimeLabel }}
          </div>
        </div>
      </div>
    </n-grid-item>
  </n-grid>
</template>

<style scoped>
.summary-grid {
  margin-bottom: 32px;
}

.monitor-card {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.monitor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.card-indigo {
  background: linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.05));
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.card-emerald {
  background: linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.card-amber {
  background: linear-gradient(to bottom right, rgba(245, 158, 11, 0.1), rgba(249, 115, 22, 0.05));
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.card-rose {
  background: linear-gradient(to bottom right, rgba(244, 63, 94, 0.1), rgba(236, 72, 153, 0.05));
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.icon-indigo {
  color: #818cf8;
  background: rgba(99, 102, 241, 0.2);
}

.icon-emerald {
  color: #34d399;
  background: rgba(16, 185, 129, 0.2);
}

.icon-amber {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.2);
}

.icon-rose {
  color: #fb7185;
  background: rgba(244, 63, 94, 0.2);
}

.card-content {
  flex: 1;
}

.card-label {
  margin-bottom: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--n-text-color-3);
}

.card-value {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--n-text-color-1);
}

.card-value.text-small {
  font-size: 1.125rem;
}

.unit {
  margin-left: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--n-text-color-3);
}
</style>
