<script setup>
import { Brain, Filter, TrendingUp } from 'lucide-vue-next'

defineProps({
  contentRadarRef: {
    type: Object,
    default: null
  },
  setContentRadarRef: {
    type: Function,
    default: null
  },
  funnelChartRef: {
    type: Object,
    default: null
  },
  setFunnelChartRef: {
    type: Function,
    default: null
  },
  userChartRef: {
    type: Object,
    default: null
  },
  setUserChartRef: {
    type: Function,
    default: null
  }
})
</script>

<template>
  <div class="analysis-layout">
    <section class="analysis-surface analysis-surface--lead">
      <div class="analysis-head">
        <div class="analysis-head__copy">
          <span class="analysis-head__eyebrow">活跃趋势</span>
          <div class="analysis-head__title">
            <TrendingUp :size="18" />
            <span>用户活跃趋势</span>
          </div>
          <p class="analysis-head__summary">
            用于判断活跃、留存和内容消耗是否同步变化。出现明显波动时，优先联动用户、通知和内容页继续排查。
          </p>
        </div>
        <div class="analysis-head__meta">
          <span class="analysis-meta-pill">默认近 30 天</span>
          <span class="analysis-meta-pill analysis-meta-pill--accent">用户 / 内容 / 转化联动</span>
        </div>
      </div>

      <div :ref="setUserChartRef" class="chart-box chart-box--large"></div>

      <div class="analysis-foot">
        <div class="analysis-note">
          <span class="analysis-note__label">关注重点</span>
          <strong>新增、留存与内容消耗是否同步增长</strong>
        </div>
        <div class="analysis-note">
          <span class="analysis-note__label">建议动作</span>
          <strong>波动放大时先检查用户、通知和内容发布链路</strong>
        </div>
      </div>
    </section>

    <div class="analysis-secondary">
      <section class="analysis-surface analysis-surface--sub">
        <div class="sub-head">
          <span class="sub-head__eyebrow">内容分布</span>
          <div class="sub-head__title">
            <Brain :size="18" />
            <span>内容库结构</span>
          </div>
          <p class="sub-head__summary">检查各模块内容供给是否均衡，便于安排补量与校对。</p>
        </div>
        <div :ref="setContentRadarRef" class="chart-box chart-box--medium"></div>
      </section>

      <section class="analysis-surface analysis-surface--sub">
        <div class="sub-head">
          <span class="sub-head__eyebrow">转化漏斗</span>
          <div class="sub-head__title">
            <Filter :size="18" />
            <span>核心转化路径</span>
          </div>
          <p class="sub-head__summary">定位注册、学习、付费和复访环节的主要流失段。</p>
        </div>
        <div :ref="setFunnelChartRef" class="chart-box chart-box--medium"></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.analysis-layout {
  display: grid;
  gap: 20px;
}

.analysis-surface {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(10, 18, 29, 0.68);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.analysis-surface--lead {
  gap: 18px;
}

.analysis-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.analysis-head__copy {
  min-width: 0;
}

.analysis-head__eyebrow,
.sub-head__eyebrow {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: #8ea1ba;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.analysis-head__title,
.sub-head__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  color: #f7fbff;
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.analysis-head__summary,
.sub-head__summary {
  margin: 8px 0 0;
  color: #8ea1ba;
  font-size: 0.88rem;
  line-height: 1.65;
}

.analysis-head__summary {
  max-width: 64ch;
}

.analysis-head__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.analysis-meta-pill {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #d7e2f1;
  font-size: 0.78rem;
  font-weight: 700;
}

.analysis-meta-pill--accent {
  border-color: rgba(62, 207, 188, 0.16);
  background: rgba(62, 207, 188, 0.1);
  color: #87e9dc;
}

.chart-box {
  width: 100%;
}

.chart-box--large {
  height: 320px;
}

.chart-box--medium {
  height: 260px;
}

.analysis-foot {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.analysis-note {
  display: grid;
  gap: 6px;
}

.analysis-note__label {
  color: #68809c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.analysis-note strong {
  color: #d7e2f1;
  font-size: 0.86rem;
  line-height: 1.55;
}

.analysis-secondary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.sub-head {
  display: grid;
  gap: 0;
}

@media (max-width: 1200px) {
  .analysis-head {
    flex-direction: column;
  }

  .analysis-head__meta {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .analysis-secondary,
  .analysis-foot {
    grid-template-columns: 1fr;
  }

  .chart-box--large {
    height: 280px;
  }

  .chart-box--medium {
    height: 220px;
  }
}
</style>
