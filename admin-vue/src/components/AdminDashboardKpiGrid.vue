<script setup>
import { computed } from 'vue'
import { NNumberAnimation, NSkeleton, NTag } from 'naive-ui'
import { Activity, ShieldCheck, Users, Wallet } from 'lucide-vue-next'

const props = defineProps({
  skeletonLoading: {
    type: Boolean,
    default: true
  },
  stats: {
    type: Object,
    default: () => ({ totalUsers: 0, todayNewUsers: 0 })
  },
  financeStats: {
    type: Object,
    default: () => ({ totalRevenue: 0, monthly: 0, quarterly: 0 })
  },
  aiStats: {
    type: Object,
    default: () => ({ successRate: 0, avgDuration: 0, totalCalls: 0, totalTokens: 0 })
  },
  onlineUsers: {
    type: Number,
    default: 0
  }
})

const successRate = computed(() => Number(props.aiStats?.successRate || 0).toFixed(1))
const tokenUsageInThousands = computed(() => (Number(props.aiStats?.totalTokens || 0) / 1000).toFixed(1))
const avgDuration = computed(() => Number(props.aiStats?.avgDuration || 0))
const monthlyRevenue = computed(() => Number(props.financeStats?.monthly || 0))
const quarterlyRevenue = computed(() => Number(props.financeStats?.quarterly || 0))
const totalCalls = computed(() => Number(props.aiStats?.totalCalls || 0))
</script>

<template>
  <div class="kpi-grid mb-6">
    <template v-if="skeletonLoading">
      <div class="metric-surface metric-surface--hero">
        <div class="flex justify-between items-start mb-6">
          <div>
            <n-skeleton :width="84" :height="22" :border-radius="999" />
            <n-skeleton :height="42" width="220" style="margin-top: 14px" />
          </div>
          <n-skeleton :width="96" :height="28" :border-radius="999" />
        </div>

        <div class="metric-hero__workspace">
          <div class="metric-hero__primary-panel">
            <n-skeleton :width="44" :height="44" :border-radius="14" />
            <n-skeleton :height="42" width="120" style="margin-top: 16px" />
            <n-skeleton :height="16" width="180" style="margin-top: 12px" />
          </div>

          <div class="metric-signal-grid">
            <div v-for="i in 4" :key="`hero-signal-${i}`" class="metric-signal">
              <n-skeleton :height="14" width="72" />
              <n-skeleton :height="28" width="86" style="margin-top: 10px" />
              <n-skeleton :height="14" width="98" style="margin-top: 10px" />
            </div>
          </div>
        </div>
      </div>

      <div class="metric-column">
        <div class="metric-surface metric-surface--compact metric-surface--wide">
          <div class="flex justify-between items-start">
            <n-skeleton :width="38" :height="38" :border-radius="12" />
            <n-skeleton :width="88" :height="24" :border-radius="999" />
          </div>
          <n-skeleton :height="16" width="96" style="margin-top: 20px" />
          <n-skeleton :height="34" width="148" style="margin-top: 12px" />
        </div>

        <div
          v-for="i in 2"
          :key="`compact-skeleton-${i}`"
          class="metric-surface metric-surface--compact"
        >
          <div class="flex justify-between items-start">
            <n-skeleton :width="38" :height="38" :border-radius="12" />
            <n-skeleton :width="88" :height="24" :border-radius="999" />
          </div>
          <n-skeleton :height="16" width="96" style="margin-top: 20px" />
          <n-skeleton :height="34" width="120" style="margin-top: 12px" />
        </div>
      </div>
    </template>

    <template v-else>
      <section class="metric-surface metric-surface--hero">
        <div class="metric-hero__head">
          <div class="metric-hero__copy">
            <span class="metric-eyebrow">核心用户指标</span>
            <h2>用户规模与实时信号</h2>
            <p>先看总量、实时在线和新增变化，再决定是否需要切到用户、通知或内容页继续处理。</p>
          </div>
          <n-tag size="small" :bordered="false" round type="info">
            今日新增 {{ stats.todayNewUsers }}
          </n-tag>
        </div>

        <div class="metric-hero__workspace">
          <div class="metric-hero__primary-panel">
            <div class="metric-hero__primary">
              <div class="metric-hero__icon">
                <Users :size="24" />
              </div>
              <div>
                <div class="metric-hero__value">
                  <n-number-animation :from="0" :to="stats.totalUsers || 0" />
                </div>
                <div class="metric-hero__label">累计用户</div>
              </div>
            </div>
            <p class="metric-hero__primary-note">
              作为用户端规模基线，优先和新增、在线、通知投放结果一起看。
            </p>
          </div>

          <div class="metric-signal-grid">
            <article class="metric-signal">
              <span class="metric-signal__label">在线用户</span>
              <strong>{{ onlineUsers }}</strong>
              <span class="metric-signal__meta">实时访问基线</span>
            </article>
            <article class="metric-signal">
              <span class="metric-signal__label">今日新增</span>
              <strong>{{ stats.todayNewUsers }}</strong>
              <span class="metric-signal__meta">短时拉新变化</span>
            </article>
            <article class="metric-signal">
              <span class="metric-signal__label">AI 成功率</span>
              <strong>{{ successRate }}%</strong>
              <span class="metric-signal__meta">用户链路关联项</span>
            </article>
            <article class="metric-signal">
              <span class="metric-signal__label">AI 调用次数</span>
              <strong>{{ totalCalls }}</strong>
              <span class="metric-signal__meta">服务请求规模</span>
            </article>
          </div>
        </div>

        <div class="metric-hero__note-row">
          <div class="metric-note-block">
            <span class="metric-note-block__label">看数顺序</span>
            <strong>先核对累计用户，再看在线与新增是否背离。</strong>
          </div>
          <div class="metric-note-block">
            <span class="metric-note-block__label">处理建议</span>
            <strong>新增异常时优先联动通知、注册和内容发布链路。</strong>
          </div>
        </div>
      </section>

      <div class="metric-column">
        <section class="metric-surface metric-surface--compact metric-surface--wide gold">
          <div class="metric-compact__head">
            <div class="metric-compact__icon"><Wallet :size="22" /></div>
            <n-tag size="small" :bordered="false" round type="warning">收入</n-tag>
          </div>
          <span class="metric-compact__label">累计成交额</span>
          <div class="metric-compact__value">
            <span class="curr">¥</span>
            <n-number-animation :from="0" :to="financeStats.totalRevenue || 0" :precision="2" />
          </div>
          <div class="metric-compact__meta-grid">
            <div class="metric-compact__meta">
              <span>本月</span>
              <strong>¥{{ monthlyRevenue }}</strong>
            </div>
            <div class="metric-compact__meta">
              <span>本季度</span>
              <strong>¥{{ quarterlyRevenue }}</strong>
            </div>
          </div>
        </section>

        <section class="metric-surface metric-surface--compact green">
          <div class="metric-compact__head">
            <div class="metric-compact__icon"><ShieldCheck :size="22" /></div>
            <n-tag size="small" :bordered="false" round type="success">稳定性</n-tag>
          </div>
          <span class="metric-compact__label">AI 服务成功率</span>
          <div class="metric-compact__value">
            {{ successRate }}<span class="unit">%</span>
          </div>
          <div class="metric-compact__footer">
            <span>平均时延 {{ avgDuration }}ms</span>
            <span class="metric-compact__state metric-compact__state--good">调用 {{ totalCalls }}</span>
          </div>
        </section>

        <section class="metric-surface metric-surface--compact purple">
          <div class="metric-compact__head">
            <div class="metric-compact__icon"><Activity :size="22" /></div>
            <n-tag size="small" :bordered="false" round type="error">资源</n-tag>
          </div>
          <span class="metric-compact__label">Token 消耗量</span>
          <div class="metric-compact__value">
            {{ tokenUsageInThousands }}<span class="unit">k</span>
          </div>
          <div class="metric-compact__footer">
            <span>关注峰值与异常增长</span>
            <span class="metric-compact__state">资源监控</span>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.38fr) minmax(280px, 0.92fr);
  gap: 20px;
  align-items: start;
}

.metric-surface {
  background: rgba(10, 18, 29, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-surface:hover {
  border-color: rgba(62, 207, 188, 0.18);
  transform: translateY(-2px);
}

.metric-surface--hero {
  min-height: 100%;
}

.metric-column {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-content: start;
}

.metric-surface--compact {
  min-height: 168px;
}

.metric-surface--wide {
  grid-column: 1 / -1;
}

.metric-hero__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.metric-hero__copy {
  min-width: 0;
}

.metric-eyebrow {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(62, 207, 188, 0.12);
  color: #87e9dc;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-hero__copy h2 {
  margin: 14px 0 0;
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f7fbff;
}

.metric-hero__copy p {
  max-width: 60ch;
  margin: 10px 0 0;
  color: #8ea1ba;
  font-size: 0.9rem;
  line-height: 1.7;
}

.metric-hero__workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 0.95fr);
  gap: 18px;
  margin-top: 24px;
}

.metric-hero__primary-panel {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.metric-hero__primary {
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-hero__icon,
.metric-compact__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
}

.metric-hero__icon {
  background: rgba(92, 168, 255, 0.16);
  color: #78bbff;
}

.metric-hero__value {
  display: flex;
  align-items: flex-end;
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: #fff;
}

.metric-hero__label {
  margin-top: 8px;
  font-size: 0.82rem;
  color: #8ea1ba;
  font-weight: 700;
}

.metric-hero__primary-note {
  margin: 0;
  color: #8ea1ba;
  font-size: 0.82rem;
  line-height: 1.6;
}

.metric-signal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric-signal {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.metric-signal__label,
.metric-note-block__label,
.metric-compact__label,
.metric-compact__meta span {
  color: #68809c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-signal strong {
  font-size: 1.35rem;
  color: #f7fbff;
  letter-spacing: -0.03em;
}

.metric-signal__meta {
  color: #8ea1ba;
  font-size: 0.76rem;
  line-height: 1.45;
}

.metric-hero__note-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.metric-note-block {
  display: grid;
  gap: 6px;
}

.metric-note-block strong {
  color: #d7e2f1;
  font-size: 0.84rem;
  line-height: 1.6;
}

.metric-compact__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-compact__value {
  display: flex;
  align-items: flex-end;
  margin-top: 12px;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: #fff;
}

.metric-compact__value .unit {
  margin-left: 3px;
  font-size: 0.95rem;
}

.metric-compact__value .curr {
  margin-right: 4px;
  font-size: 1rem;
  color: #f59e0b;
}

.metric-compact__meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.metric-compact__meta {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.metric-compact__meta strong {
  color: #f7fbff;
  font-size: 0.98rem;
  letter-spacing: -0.02em;
}

.metric-compact__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  color: #8ea1ba;
  font-size: 0.8rem;
}

.metric-compact__state {
  color: #d7e2f1;
}

.metric-compact__state--good {
  color: #6ee0d0;
}

.metric-surface.gold .metric-compact__icon {
  background: rgba(242, 186, 103, 0.16);
  color: #f3c172;
}

.metric-surface.green .metric-compact__icon {
  background: rgba(62, 207, 188, 0.16);
  color: #6ee0d0;
}

.metric-surface.purple .metric-compact__icon {
  background: rgba(105, 125, 255, 0.16);
  color: #9eb2ff;
}

@media (max-width: 1500px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1360px) {
  .metric-hero__workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .metric-column,
  .metric-signal-grid,
  .metric-hero__note-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metric-surface--hero,
  .metric-surface--compact {
    min-height: auto;
  }

  .metric-hero__copy h2 {
    font-size: 1.28rem;
  }

  .metric-hero__value {
    font-size: 2rem;
  }

  .metric-compact__value {
    font-size: 1.72rem;
  }

  .metric-compact__meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
