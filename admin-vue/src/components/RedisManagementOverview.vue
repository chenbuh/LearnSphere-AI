<script setup>
import { Activity, Cpu, Database } from 'lucide-vue-next'
</script>

<template>
  <div class="redis-overview">
    <!-- 内存水位卡片 -->
    <section class="ls-panel redis-overview__panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">内存健康水位</h2>
        <span class="redis-status-tag">实时监控</span>
      </header>
      <div class="ls-panel__body redis-overview__chart">
        <slot name="memory-chart" />
      </div>
    </section>

    <!-- 缓存核心指标卡片 -->
    <section class="ls-panel redis-overview__panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">缓存核心运行指标</h2>
        <span class="redis-status-tag">每秒刷新</span>
      </header>
      <div class="redis-overview__metrics">
        <!-- 指标 1 -->
        <div class="redis-metric-card redis-metric--indigo">
          <div class="redis-metric__top">
            <span class="redis-metric__label">活动 Key 总数</span>
            <div class="redis-metric__icon redis-icon--indigo">
              <Database :size="16" />
            </div>
          </div>
          <strong class="redis-metric__val">842</strong>
          <span class="redis-metric__hint">常驻热点数据</span>
        </div>

        <!-- 指标 2 -->
        <div class="redis-metric-card redis-metric--emerald">
          <div class="redis-metric__top">
            <span class="redis-metric__label">缓存命中率</span>
            <div class="redis-metric__icon redis-icon--emerald">
              <Activity :size="16" />
            </div>
          </div>
          <strong class="redis-metric__val text-emerald">94.2<small>%</small></strong>
          <span class="redis-metric__hint">命中性能极高</span>
        </div>

        <!-- 指标 3 -->
        <div class="redis-metric-card redis-metric--cyan">
          <div class="redis-metric__top">
            <span class="redis-metric__label">实时 QPS 吞吐</span>
            <div class="redis-metric__icon redis-icon--cyan">
              <Cpu :size="16" />
            </div>
          </div>
          <strong class="redis-metric__val text-cyan">1,245</strong>
          <span class="redis-metric__hint">次 / 秒并发请求</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.redis-overview {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.9fr);
  gap: 16px;
  align-items: stretch;
}

.redis-overview__panel {
  display: flex;
  flex-direction: column;
}

.redis-status-tag {
  font-size: 11.5px;
  font-weight: 550;
  color: #4f46e5;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 9999px;
}

.redis-overview__chart {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 8px 16px 12px;
}

.redis-overview__metrics {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 18px 20px 20px;
}

.redis-metric-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 16px;
  min-height: 110px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.2s ease,
    border-color 0.2s ease;
}

.redis-metric-card:hover {
  background: #ffffff;
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.08);
}

.redis-metric__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.redis-metric__label {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.redis-metric__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.redis-metric-card:hover .redis-metric__icon {
  transform: scale(1.08);
}

.redis-icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
}
.redis-icon--emerald {
  background: #ecfdf5;
  color: #059669;
}
.redis-icon--cyan {
  background: #ecfeff;
  color: #0891b2;
}

.redis-metric__val {
  color: #0f172a;
  font-size: 24px;
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin: 6px 0 2px;
}

.redis-metric__val small {
  font-size: 14px;
  margin-left: 2px;
}

.redis-metric__hint {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
}

.text-emerald {
  color: #059669 !important;
}
.text-cyan {
  color: #0891b2 !important;
}

@media (max-width: 1100px) {
  .redis-overview {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .redis-overview__metrics {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
