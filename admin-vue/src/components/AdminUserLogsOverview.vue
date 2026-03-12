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
      <h1>📊 用户操作日志</h1>
      <p>实时监控用户行为，查看IP地址、设备信息和操作统计</p>
    </div>

    <n-grid :cols="4" :x-gap="20" class="mb-6">
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            📝
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalLogs || 0 }}</div>
            <div class="stat-label">总日志数</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            🌍
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ uniqueIps }}</div>
            <div class="stat-label">独立IP数</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            👥
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            📱
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ mobileRate }}%</div>
            <div class="stat-label">移动端占比</div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #999;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #999;
}

.mb-6 {
  margin-bottom: 24px;
}
</style>
