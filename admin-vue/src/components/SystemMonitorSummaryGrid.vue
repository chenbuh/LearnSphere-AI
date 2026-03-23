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
      <div class="monitor-card">
        <div class="card-icon">
          <Cpu :size="24" />
        </div>
        <div class="card-content">
          <div class="card-kicker">计算资源</div>
          <div class="card-label">CPU 核心数</div>
          <div class="card-value">
            <n-number-animation :from="0" :to="info.processors || 0" />
            <span class="unit">核</span>
          </div>
          <div class="card-note">用于判断并发处理上限与线程调度空间</div>
        </div>
      </div>
    </n-grid-item>

    <n-grid-item span="4 m:2 l:1">
      <div class="monitor-card">
        <div class="card-icon">
          <Zap :size="24" />
        </div>
        <div class="card-content">
          <div class="card-kicker">负载</div>
          <div class="card-label">系统负载</div>
          <div class="card-value">
            {{ info.systemLoad >= 0 ? info.systemLoad.toFixed(2) : 'N/A' }}
          </div>
          <div class="card-note">优先关注持续抬升的负载趋势与峰值波动</div>
        </div>
      </div>
    </n-grid-item>

    <n-grid-item span="4 m:2 l:1">
      <div class="monitor-card">
        <div class="card-icon">
          <Layers :size="24" />
        </div>
        <div class="card-content">
          <div class="card-kicker">运行线程</div>
          <div class="card-label">活跃线程数</div>
          <div class="card-value">
            <n-number-animation :from="0" :to="info.threadCount || 0" />
          </div>
          <div class="card-note">辅助判断是否存在阻塞、堆积或异常膨胀</div>
        </div>
      </div>
    </n-grid-item>

    <n-grid-item span="4 m:2 l:1">
      <div class="monitor-card">
        <div class="card-icon">
          <Clock :size="24" />
        </div>
        <div class="card-content">
          <div class="card-kicker">运行周期</div>
          <div class="card-label">运行时长</div>
          <div class="card-value text-small">
            {{ uptimeLabel }}
          </div>
          <div class="card-note">结合重启时间与告警记录判断运行稳定性</div>
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
  height: 100%;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-radius: 18px;
  background: rgba(13, 20, 31, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.14);
  transition: all 0.3s ease;
}

.monitor-card:hover {
  transform: translateY(-2px);
  border-color: rgba(94, 234, 212, 0.2);
  box-shadow: 0 18px 30px -18px rgba(0, 0, 0, 0.55);
}

.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #86efac;
  background: rgba(45, 212, 191, 0.08);
  border: 1px solid rgba(45, 212, 191, 0.14);
}

.card-content {
  flex: 1;
}

.card-kicker {
  margin-bottom: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #67e8f9;
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

.card-note {
  margin-top: 8px;
  font-size: 0.76rem;
  line-height: 1.55;
  color: #7c8799;
}

.unit {
  margin-left: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--n-text-color-3);
}
</style>
