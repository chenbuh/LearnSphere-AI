<script setup>
import { NCard, NGrid, NGridItem } from 'naive-ui'

defineProps({
  stats: {
    type: Object,
    default: () => ({})
  },
  uniqueIps: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  mobileRate: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div>
    <div class="page-header">
      <div class="header-eyebrow">用户日志</div>
      <h1>用户操作日志概览</h1>
      <p>先看日志总量与活跃范围，再判断访问来源、设备结构与异常行为密度。</p>
    </div>

    <n-grid :cols="4" :x-gap="20" class="mb-6">
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon"><span class="stat-index">01</span></div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalLogs || 0 }}</div>
            <div class="stat-label">总日志数</div>
            <div class="stat-note">当前筛选范围内已采集的行为记录</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon"><span class="stat-index">02</span></div>
          <div class="stat-content">
            <div class="stat-value">{{ uniqueIps }}</div>
            <div class="stat-label">独立IP数</div>
            <div class="stat-note">用于识别访问扩散与来源离散度</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon"><span class="stat-index">03</span></div>
          <div class="stat-content">
            <div class="stat-value">{{ activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
            <div class="stat-note">反映活跃会话规模与近期操作强度</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon"><span class="stat-index">04</span></div>
          <div class="stat-content">
            <div class="stat-value">{{ mobileRate }}%</div>
            <div class="stat-label">移动端占比</div>
            <div class="stat-note">帮助判断终端结构与移动访问波动</div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #6ee7d8;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #f5f7fb;
}

.page-header p {
  max-width: 760px;
  margin: 0;
  color: #9ca3af;
  line-height: 1.7;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  min-height: 132px;
  background: rgba(12, 18, 28, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 18px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(94, 234, 212, 0.24);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background: rgba(45, 212, 191, 0.08);
  border: 1px solid rgba(45, 212, 191, 0.16);
}

.stat-index {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #7dd3fc;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
  color: #f8fafc;
}

.stat-label {
  font-size: 0.875rem;
  color: #cbd5e1;
}

.stat-note {
  margin-top: 8px;
  font-size: 0.75rem;
  line-height: 1.6;
  color: #7c8799;
}

.mb-6 {
  margin-bottom: 24px;
}
</style>
