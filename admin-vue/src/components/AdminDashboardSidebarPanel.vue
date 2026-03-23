<script setup>
import { computed } from 'vue'
import { NButton } from 'naive-ui'
import { ChevronRight, Clock, LayoutDashboard, MousePointer2 } from 'lucide-vue-next'

const props = defineProps({
  quickActions: {
    type: Array,
    default: () => []
  },
  retentionChartRef: {
    type: Object,
    default: null
  },
  setRetentionChartRef: {
    type: Function,
    default: null
  },
  retentionData: {
    type: Array,
    default: () => []
  },
  recentLogs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['navigate'])

const actionHintMap = {
  用户审计: '查看账户、权限和状态',
  词库更新: '进入词库处理新增和修订',
  系统设置: '调整站点和配额配置',
  安全日志: '查看异常和审计记录'
}

const actionItems = computed(() =>
  props.quickActions.map((action) => ({
    ...action,
    hint: actionHintMap[action.label] || '进入对应页面继续处理'
  }))
)

const abnormalLogCount = computed(() =>
  props.recentLogs.filter((log) => Number(log.status) !== 1).length
)

const retentionAverage = computed(() => {
  if (!props.retentionData.length) return '0.0'
  const total = props.retentionData.reduce((sum, item) => sum + Number(item.rate || 0), 0)
  return (total / props.retentionData.length).toFixed(1)
})

const formatLogTime = (time) => {
  if (!time) {
    return '-'
  }

  return new Date(time).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const navigate = (path) => {
  emit('navigate', path)
}
</script>

<template>
  <aside class="side-rail">
    <section class="side-surface">
      <div class="sub-head">
        <span class="sub-head__eyebrow">快捷处理</span>
        <div class="card-title"><LayoutDashboard :size="18" /><span>常用后台动作</span></div>
        <p class="panel-note">把高频动作收在同一区，减少在侧栏和页面间反复切换。</p>
      </div>

      <div class="signal-grid">
        <article class="signal-tile">
          <span class="signal-tile__label">快捷入口</span>
          <strong>{{ actionItems.length }}</strong>
          <span class="signal-tile__meta">高频后台动作</span>
        </article>
        <article class="signal-tile">
          <span class="signal-tile__label">异常日志</span>
          <strong>{{ abnormalLogCount }}</strong>
          <span class="signal-tile__meta">最近操作中需回看项</span>
        </article>
      </div>

      <div class="action-list">
        <button
          v-for="action in actionItems"
          :key="action.label"
          type="button"
          class="action-item"
          @click="navigate(action.path)"
        >
          <div class="action-item__leading">
            <div
              class="action-icon"
              :style="{ backgroundColor: `${action.color}20`, color: action.color }"
            >
              <component :is="action.icon" :size="18" />
            </div>
            <div class="action-copy">
              <span class="action-label">{{ action.label }}</span>
              <span class="action-hint">{{ action.hint }}</span>
            </div>
          </div>
          <ChevronRight :size="14" class="action-arrow" />
        </button>
      </div>
    </section>

    <section class="side-surface">
      <div class="sub-head">
        <span class="sub-head__eyebrow">留存</span>
        <div class="card-title"><MousePointer2 :size="18" /><span>留存观察</span></div>
        <p class="panel-note">用于快速判断近期拉新是否转化为稳定活跃。</p>
      </div>

      <div class="retention-panel">
        <div class="retention-value">
          <div class="val">{{ retentionData[0]?.rate || 0 }}%</div>
          <div class="lab">次日留存</div>
          <div class="retention-meta">先看首日转化，再回到用户和内容页排查。</div>
        </div>

        <div class="retention-chart-wrap">
          <div :ref="setRetentionChartRef" class="retention-chart"></div>
          <div class="retention-extra">
            <div class="retention-extra__item">
              <span>均值</span>
              <strong>{{ retentionAverage }}%</strong>
            </div>
            <div class="retention-extra__item">
              <span>观察天数</span>
              <strong>{{ retentionData.length }}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="side-surface side-surface--logs">
      <div class="sub-head">
        <span class="sub-head__eyebrow">审计记录</span>
        <div class="card-title">
          <Clock :size="18" />
          <span>最新操作日志</span>
          <n-button quaternary circle size="tiny" class="ml-auto" @click="navigate('/logs')">
            <ChevronRight :size="14" />
          </n-button>
        </div>
        <p class="panel-note">保留最近操作时间、模块和管理员信息，便于快速回看异常动作。</p>
      </div>

      <div v-if="recentLogs.length" class="log-list">
        <article v-for="log in recentLogs" :key="log.id" class="log-item">
          <div class="log-item__head">
            <span
              class="log-item__dot"
              :class="log.status === 1 ? 'is-success' : 'is-danger'"
            ></span>
            <strong class="log-item__action">{{ log.action }}</strong>
            <span class="log-item__time">{{ formatLogTime(log.createTime) }}</span>
          </div>
          <div class="log-item__meta">{{ log.adminUsername }} · {{ log.module }}</div>
        </article>
      </div>
      <div v-else class="empty-state">暂无实时审计记录</div>
    </section>
  </aside>
</template>

<style scoped>
.side-rail {
  display: grid;
  gap: 16px;
}

.side-surface {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background: rgba(10, 18, 29, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  transition: border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.side-surface:hover {
  border-color: rgba(62, 207, 188, 0.18);
  transform: translateY(-2px);
}

.side-surface--logs {
  min-height: 0;
}

.sub-head {
  display: grid;
  gap: 8px;
}

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

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #f7fbff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.panel-note {
  margin: 0;
  color: #8ea1ba;
  font-size: 0.82rem;
  line-height: 1.6;
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.signal-tile {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.signal-tile__label,
.retention-extra__item span {
  color: #68809c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.signal-tile strong {
  color: #f7fbff;
  font-size: 1.2rem;
  letter-spacing: -0.03em;
}

.signal-tile__meta {
  color: #8ea1ba;
  font-size: 0.76rem;
  line-height: 1.45;
}

.action-list {
  display: grid;
  gap: 10px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 68px;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(62, 207, 188, 0.16);
  transform: translateY(-1px);
}

.action-item__leading {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.action-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  flex-shrink: 0;
}

.action-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
  text-align: left;
}

.action-label {
  color: #d7e2f1;
  font-size: 0.88rem;
  font-weight: 700;
}

.action-hint {
  color: #68809c;
  font-size: 0.76rem;
  line-height: 1.45;
}

.action-arrow {
  color: #68809c;
  flex-shrink: 0;
}

.retention-panel {
  display: grid;
  gap: 14px;
}

.retention-value {
  display: grid;
  gap: 4px;
}

.retention-value .val {
  font-size: 2rem;
  font-weight: 800;
  color: #7ee6d8;
  letter-spacing: -0.04em;
}

.retention-value .lab {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #c7d3e3;
  text-transform: uppercase;
}

.retention-meta {
  color: #68809c;
  font-size: 0.76rem;
  line-height: 1.55;
}

.retention-chart-wrap {
  display: grid;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.retention-chart {
  height: 88px;
}

.retention-extra {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.retention-extra__item {
  display: grid;
  gap: 6px;
}

.retention-extra__item strong {
  color: #f7fbff;
  font-size: 1rem;
  letter-spacing: -0.02em;
}

.log-list {
  display: grid;
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
}

.log-list::-webkit-scrollbar {
  width: 6px;
}

.log-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.log-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.log-item__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.log-item__dot.is-success {
  background: #47cf9f;
  box-shadow: 0 0 0 4px rgba(71, 207, 159, 0.12);
}

.log-item__dot.is-danger {
  background: #ee8a97;
  box-shadow: 0 0 0 4px rgba(238, 138, 151, 0.12);
}

.log-item__action {
  flex: 1;
  min-width: 0;
  color: #f7fbff;
  font-size: 0.84rem;
  line-height: 1.4;
}

.log-item__time {
  color: #68809c;
  font-size: 0.74rem;
  font-weight: 700;
  flex-shrink: 0;
}

.log-item__meta {
  color: #8ea1ba;
  font-size: 0.76rem;
  line-height: 1.5;
}

.empty-state {
  padding: 18px 0 4px;
  color: #8ea1ba;
  font-size: 0.82rem;
  text-align: center;
}

@media (max-width: 768px) {
  .signal-grid,
  .retention-extra {
    grid-template-columns: 1fr;
  }

  .action-item {
    min-height: 60px;
  }
}
</style>
