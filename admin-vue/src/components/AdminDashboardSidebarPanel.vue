<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { ChevronRight } from 'lucide-vue-next'

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
  用户审计: '账户、权限与状态管理',
  词库更新: '新增、校验与批量修订',
  系统设置: '站点与 AI 配额设置',
  安全日志: '安全防护与审计记录'
}

const actionItems = computed(() =>
  props.quickActions.map((action) => ({
    ...action,
    hint: actionHintMap[action.label] || action.path
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
  if (!time) return '-'
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
  <!-- 1. 快捷入口 -->
  <section class="ls-panel dash-panel dash-area--actions">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">快捷入口</h2>
    </header>
    <div class="action-list">
      <button
        v-for="action in actionItems"
        :key="action.label"
        type="button"
        class="action-item"
        @click="navigate(action.path)"
      >
        <span class="action-icon" :style="{ backgroundColor: action.color ? `${action.color}18` : undefined, color: action.color || 'var(--accent)' }">
          <component :is="action.icon" :size="16" />
        </span>
        <span class="action-copy">
          <span class="action-label">{{ action.label }}</span>
          <span class="action-hint">{{ action.hint }}</span>
        </span>
        <ChevronRight :size="15" class="action-arrow" />
      </button>
    </div>
  </section>

  <!-- 2. 留存观察 -->
  <section class="ls-panel dash-panel dash-area--retention">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">留存观察</h2>
    </header>
    <div class="ls-panel__body dash-panel__body retention-body">
      <div class="retention-figures">
        <div class="retention-figure">
          <span class="retention-figure__label">次日留存</span>
          <strong class="retention-figure__value">{{ retentionData[0]?.rate || 0 }}<small>%</small></strong>
        </div>
        <div class="retention-figure">
          <span class="retention-figure__label">全周期均值</span>
          <strong class="retention-figure__value text-indigo">{{ retentionAverage }}<small>%</small></strong>
        </div>
        <div class="retention-figure">
          <span class="retention-figure__label">观察周期</span>
          <strong class="retention-figure__value">{{ retentionData.length }}<small>天</small></strong>
        </div>
      </div>
      <div :ref="setRetentionChartRef" class="retention-chart"></div>
    </div>
  </section>

  <!-- 3. 最新操作日志 -->
  <section class="ls-panel dash-panel dash-area--logs">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">
        最新操作日志
        <span class="ls-panel__count" :class="{ 'has-abnormal': abnormalLogCount > 0 }">
          异常 {{ abnormalLogCount }} 条
        </span>
      </h2>
      <div class="ls-panel__tools">
        <n-button size="small" quaternary type="primary" icon-placement="right" @click="navigate('/logs')">
          全部日志
          <template #icon>
            <n-icon :component="ChevronRight" />
          </template>
        </n-button>
      </div>
    </header>

    <ul v-if="recentLogs.length" class="log-list">
      <li v-for="log in recentLogs" :key="log.id" class="log-item">
        <span class="log-item__dot" :class="log.status === 1 ? 'is-success' : 'is-danger'"></span>
        <span class="log-item__action">{{ log.action }}</span>
        <span class="log-item__module">{{ log.module || '-' }}</span>
        <span class="log-item__admin">{{ log.adminUsername || '-' }}</span>
        <span class="log-item__time">{{ formatLogTime(log.createTime) }}</span>
      </li>
    </ul>
    <div v-else class="ls-empty">暂无日志数据</div>
  </section>
</template>

<style scoped>
.dash-panel {
  display: flex;
  flex-direction: column;
}

.dash-panel__body {
  flex: 1;
}

.dash-area--actions { grid-area: actions; }
.dash-area--retention { grid-area: retention; }
.dash-area--logs { grid-area: logs; }

.action-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #f8fafc;
  color: #0f172a;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-item:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  transform: translateX(3px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.action-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.action-item:hover .action-icon {
  transform: scale(1.06);
}

.action-copy {
  display: grid;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.action-label {
  color: #0f172a;
  font-size: 13.5px;
  font-weight: 600;
}

.action-hint {
  overflow: hidden;
  color: #64748b;
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-arrow {
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform 0.2s ease, color 0.2s ease;
}

.action-item:hover .action-arrow {
  color: #4f46e5;
  transform: translateX(3px);
}

/* 留存看板 */
.retention-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px 14px;
}

.retention-figures {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.retention-figure {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.retention-figure__label {
  color: #64748b;
  font-size: 11.5px;
  font-weight: 550;
}

.retention-figure__value {
  color: #0f172a;
  font-size: 19px;
  font-weight: 750;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.retention-figure__value small {
  margin-left: 2px;
  color: #64748b;
  font-size: 12px;
  font-weight: 550;
}

.text-indigo {
  color: #4f46e5 !important;
}

.retention-chart {
  flex: 1;
  min-height: 130px;
}

/* 日志列表 */
.log-list {
  margin: 0;
  padding: 8px 12px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-item {
  display: grid;
  grid-template-columns: 8px minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) 60px;
  align-items: center;
  gap: 12px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 13px;
  transition: background 0.15s ease;
}

.log-item:hover {
  background: #f8fafc;
}

.log-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.log-item__dot.is-success {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}

.log-item__dot.is-danger {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
}

.log-item__action {
  color: #0f172a;
  font-weight: 550;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-item__module,
.log-item__admin {
  color: #64748b;
  font-size: 12.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-item__time {
  color: #94a3b8;
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.has-abnormal {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  font-weight: 600;
}

@media (max-width: 768px) {
  .log-item {
    grid-template-columns: 8px minmax(0, 1fr) 50px;
  }
  .log-item__module,
  .log-item__admin {
    display: none;
  }
}
</style>
