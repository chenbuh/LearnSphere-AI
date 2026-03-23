<script setup>
import { NTag } from 'naive-ui'
import { CircleSlash2, Crown, ShieldCheck, SlidersHorizontal, Users } from 'lucide-vue-next'
import AdminUsersToolbar from '@/components/AdminUsersToolbar.vue'

defineProps({
  keyword: {
    type: String,
    default: ''
  },
  activeFilterCount: {
    type: Number,
    default: 0
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  exportLoading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  currentPageCount: {
    type: Number,
    default: 0
  },
  vipUserCount: {
    type: Number,
    default: 0
  },
  disabledUserCount: {
    type: Number,
    default: 0
  },
  customQuotaCount: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:keyword',
  'search',
  'open-filter',
  'clear-filter',
  'batch-vip',
  'batch-notify',
  'export'
])
</script>

<template>
  <section class="users-board">
    <div class="overview-panel">
      <div class="overview-panel__head">
        <div class="overview-copy">
          <span class="overview-eyebrow">用户工作区</span>
          <h2>当前用户范围</h2>
          <p>先看当前页的会员、禁用和配额调整，再决定后续筛选或批量处理。</p>
        </div>

        <div class="overview-meta">
          <span class="meta-pill">总用户 {{ total }}</span>
          <span class="meta-pill">当前页 {{ currentPageCount }}</span>
          <span class="meta-pill" :class="{ active: exportLoading || loading }">
            {{ loading ? '列表刷新中' : exportLoading ? '导出处理中' : '工作区就绪' }}
          </span>
        </div>
      </div>

      <div class="overview-grid">
        <article class="metric-card metric-card--primary">
          <div class="metric-card__icon"><Users :size="18" /></div>
          <div class="metric-card__body">
            <span class="metric-label">当前页结果</span>
            <strong>{{ currentPageCount }}</strong>
            <span class="metric-note">本轮查询命中的账号数量</span>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-card__icon"><Crown :size="16" /></div>
          <div class="metric-card__body">
            <span class="metric-label">有效 VIP</span>
            <strong>{{ vipUserCount }}</strong>
            <span class="metric-note">当前页仍在有效期内的会员账号</span>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-card__icon"><CircleSlash2 :size="16" /></div>
          <div class="metric-card__body">
            <span class="metric-label">禁用账号</span>
            <strong>{{ disabledUserCount }}</strong>
            <span class="metric-note">优先回看处理原因</span>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-card__icon"><ShieldCheck :size="16" /></div>
          <div class="metric-card__body">
            <span class="metric-label">配额调整</span>
            <strong>{{ customQuotaCount }}</strong>
            <span class="metric-note">已设置自定义生成或助教配额</span>
          </div>
        </article>

        <article class="metric-card metric-card--accent">
          <div class="metric-card__icon"><SlidersHorizontal :size="16" /></div>
          <div class="metric-card__body">
            <span class="metric-label">筛选条件</span>
            <strong>{{ activeFilterCount }}</strong>
            <span class="metric-note">条件越多，结果范围越窄</span>
          </div>
        </article>
      </div>
    </div>

    <div class="control-panel">
      <div class="control-panel__head">
        <div class="control-copy">
          <span class="control-label">查询与批量处理</span>
          <p>在这里完成搜索、筛选和批量处理。</p>
        </div>

        <div class="control-meta">
          <n-tag size="small" round :bordered="false" type="info">
            {{ keyword ? `关键词 ${keyword}` : '未输入关键词' }}
          </n-tag>
          <n-tag size="small" round :bordered="false" type="success">
            已筛选 {{ activeFilterCount }} 项
          </n-tag>
          <n-tag size="small" round :bordered="false" type="warning">
            已选 {{ selectedCount }} 人
          </n-tag>
        </div>
      </div>

      <AdminUsersToolbar
        :keyword="keyword"
        :active-filter-count="activeFilterCount"
        :selected-count="selectedCount"
        :export-loading="exportLoading"
        @update:keyword="emit('update:keyword', $event)"
        @search="emit('search')"
        @open-filter="emit('open-filter')"
        @clear-filter="emit('clear-filter')"
        @batch-vip="emit('batch-vip')"
        @batch-notify="emit('batch-notify')"
        @export="emit('export')"
      />
    </div>
  </section>
</template>

<style scoped>
.users-board {
  display: grid;
  grid-template-columns: minmax(0, 1.22fr) minmax(360px, 0.9fr);
  gap: 20px;
  align-items: start;
}

.overview-panel,
.control-panel {
  display: grid;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background:
    linear-gradient(180deg, rgba(13, 20, 32, 0.92), rgba(10, 16, 26, 0.82)),
    rgba(10, 16, 26, 0.84);
  box-shadow: 0 18px 48px rgba(3, 6, 14, 0.22);
}

.overview-panel__head,
.control-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.overview-copy,
.control-copy {
  min-width: 0;
}

.overview-eyebrow,
.control-label {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(62, 207, 188, 0.12);
  color: #8fe7dc;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.overview-copy h2 {
  margin: 12px 0 0;
  color: #f7fbff;
  font-size: 1.28rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.overview-copy p,
.control-copy p {
  margin: 8px 0 0;
  color: #8ea1ba;
  font-size: 0.88rem;
  line-height: 1.65;
}

.overview-meta,
.control-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #c7d3e3;
  font-size: 0.8rem;
  font-weight: 600;
}

.meta-pill.active {
  color: #8fe7dc;
  border-color: rgba(62, 207, 188, 0.22);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-height: 132px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.metric-card--primary {
  grid-column: span 1;
  background:
    linear-gradient(135deg, rgba(92, 168, 255, 0.12), rgba(62, 207, 188, 0.08)),
    rgba(255, 255, 255, 0.03);
  border-color: rgba(92, 168, 255, 0.18);
}

.metric-card--accent {
  background:
    linear-gradient(135deg, rgba(62, 207, 188, 0.1), rgba(255, 255, 255, 0.03)),
    rgba(255, 255, 255, 0.03);
  border-color: rgba(62, 207, 188, 0.16);
}

.metric-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  color: #d7e2f1;
}

.metric-card__body {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.metric-label {
  color: #68809c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-card__body strong {
  color: #f7fbff;
  font-size: 1.44rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}

.metric-note {
  color: #8ea1ba;
  font-size: 0.78rem;
  line-height: 1.55;
}

@media (max-width: 1440px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1320px) {
  .users-board {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .overview-panel__head,
  .control-panel__head {
    flex-direction: column;
  }

  .overview-meta,
  .control-meta {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .overview-panel,
  .control-panel {
    padding: 18px;
  }

  .overview-copy h2 {
    font-size: 1.18rem;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
