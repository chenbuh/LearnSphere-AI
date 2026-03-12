<script setup>
import { NCard } from 'naive-ui'
import { Activity, CheckCircle2, ShieldAlert, Users, Layers3 } from 'lucide-vue-next'

defineProps({
  total: {
    type: Number,
    default: 0
  },
  currentCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  operatorCount: {
    type: Number,
    default: 0
  },
  moduleCount: {
    type: Number,
    default: 0
  },
  keyword: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <section class="overview-section">
    <div class="stats-grid">
      <n-card class="stat-card total-card" :bordered="false">
        <div class="stat-icon">
          <Activity :size="18" />
        </div>
        <div class="stat-content">
          <span class="stat-label">总记录数</span>
          <strong class="stat-value">{{ total }}</strong>
          <p>后端分页汇总结果</p>
        </div>
      </n-card>

      <n-card class="stat-card success-card" :bordered="false">
        <div class="stat-icon">
          <CheckCircle2 :size="18" />
        </div>
        <div class="stat-content">
          <span class="stat-label">当前页成功</span>
          <strong class="stat-value">{{ successCount }}</strong>
          <p>当前页 {{ currentCount }} 条中的成功操作</p>
        </div>
      </n-card>

      <n-card class="stat-card failure-card" :bordered="false">
        <div class="stat-icon">
          <ShieldAlert :size="18" />
        </div>
        <div class="stat-content">
          <span class="stat-label">当前页失败</span>
          <strong class="stat-value">{{ failureCount }}</strong>
          <p>便于快速定位异常写操作</p>
        </div>
      </n-card>

      <n-card class="stat-card operator-card" :bordered="false">
        <div class="stat-icon">
          <Users :size="18" />
        </div>
        <div class="stat-content">
          <span class="stat-label">当前页操作人</span>
          <strong class="stat-value">{{ operatorCount }}</strong>
          <p>活跃管理员去重计数</p>
        </div>
      </n-card>

      <n-card class="stat-card module-card" :bordered="false">
        <div class="stat-icon">
          <Layers3 :size="18" />
        </div>
        <div class="stat-content">
          <span class="stat-label">当前页模块数</span>
          <strong class="stat-value">{{ moduleCount }}</strong>
          <p>覆盖的业务模块范围</p>
        </div>
      </n-card>
    </div>

    <p class="overview-note">
      <span v-if="keyword">当前按关键词“{{ keyword }}”筛选。</span>
      除“总记录数”外，其余指标均基于当前页 {{ currentCount }} 条日志实时汇总。
    </p>
  </section>
</template>

<style scoped>
.overview-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  min-height: 132px;
  background: rgba(15, 23, 42, 0.58);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.18);
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e2e8f0;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  color: #cbd5e1;
  font-size: 0.88rem;
}

.stat-value {
  color: #f8fafc;
  font-size: 1.8rem;
  line-height: 1.1;
}

.stat-content p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.45;
}

.overview-note {
  margin: 12px 4px 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

.overview-note span {
  margin-right: 6px;
  color: #cbd5e1;
}

.total-card .stat-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.38), rgba(37, 99, 235, 0.18));
}

.success-card .stat-icon {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.38), rgba(21, 128, 61, 0.16));
}

.failure-card .stat-icon {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.38), rgba(220, 38, 38, 0.16));
}

.operator-card .stat-icon {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.38), rgba(2, 132, 199, 0.16));
}

.module-card .stat-icon {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.38), rgba(126, 34, 206, 0.16));
}
</style>
