<script setup>
import { CircleSlash2, Crown, ShieldCheck, UserRound, Users } from 'lucide-vue-next'

// 用户页 KPI 条：总量 + 当前页的会员 / 禁用 / 配额调整分布
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
</script>

<template>
  <section class="ls-stats users-kpis" aria-label="用户摘要">
    <!-- 1. 总用户 -->
    <div class="ls-stat user-kpi-card user-kpi--indigo">
      <div class="user-kpi__head">
        <span class="ls-stat__label">总用户数</span>
        <div class="user-kpi__icon user-kpi__icon--indigo">
          <Users :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value">{{ total }}</strong>
      <span class="ls-stat__hint">{{ activeFilterCount ? `已筛选 ${activeFilterCount} 项` : '全站注册账号' }}</span>
    </div>

    <!-- 2. 本页账号 -->
    <div class="ls-stat user-kpi-card user-kpi--slate">
      <div class="user-kpi__head">
        <span class="ls-stat__label">本页账号</span>
        <div class="user-kpi__icon user-kpi__icon--slate">
          <UserRound :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value">{{ currentPageCount }}</strong>
      <span class="ls-stat__hint">当前视图呈现</span>
    </div>

    <!-- 3. 有效 VIP -->
    <div class="ls-stat user-kpi-card user-kpi--amber">
      <div class="user-kpi__head">
        <span class="ls-stat__label">本页有效 VIP</span>
        <div class="user-kpi__icon user-kpi__icon--amber">
          <Crown :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value text-amber">{{ vipUserCount }}</strong>
      <span class="ls-stat__hint">尊享特权会员</span>
    </div>

    <!-- 4. 本页禁用 -->
    <div class="ls-stat user-kpi-card" :class="disabledUserCount > 0 ? 'user-kpi--danger' : 'user-kpi--slate'">
      <div class="user-kpi__head">
        <span class="ls-stat__label">本页禁用</span>
        <div class="user-kpi__icon" :class="disabledUserCount > 0 ? 'user-kpi__icon--danger' : 'user-kpi__icon--slate'">
          <CircleSlash2 :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value" :class="{ 'text-danger': disabledUserCount > 0 }">{{ disabledUserCount }}</strong>
      <span class="ls-stat__hint">{{ disabledUserCount > 0 ? '限制登录访问' : '状态正常' }}</span>
    </div>

    <!-- 5. 配额调整 -->
    <div class="ls-stat user-kpi-card user-kpi--cyan">
      <div class="user-kpi__head">
        <span class="ls-stat__label">本页配额调整</span>
        <div class="user-kpi__icon user-kpi__icon--cyan">
          <ShieldCheck :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value text-cyan">{{ customQuotaCount }}</strong>
      <span class="ls-stat__hint">独立 AI 额度</span>
    </div>
  </section>
</template>

<style scoped>
.users-kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.user-kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 18px;
  min-height: 104px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.2s ease;
  overflow: hidden;
}

.user-kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background 0.2s ease;
}

.user-kpi-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 24px -4px rgba(15, 23, 42, 0.08), 0 3px 6px -2px rgba(15, 23, 42, 0.04);
}

.user-kpi--indigo:hover::before { background: linear-gradient(90deg, #4f46e5, #818cf8); }
.user-kpi--slate:hover::before { background: #64748b; }
.user-kpi--amber:hover::before { background: #f59e0b; }
.user-kpi--danger:hover::before { background: #ef4444; }
.user-kpi--cyan:hover::before { background: #06b6d4; }

.user-kpi__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.user-kpi__head .ls-stat__label {
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  margin: 0;
}

.user-kpi__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.user-kpi-card:hover .user-kpi__icon {
  transform: scale(1.08);
}

.user-kpi__icon--indigo { background: #eef2ff; color: #4f46e5; }
.user-kpi__icon--slate { background: #f1f5f9; color: #475569; }
.user-kpi__icon--amber { background: #fffbeb; color: #d97706; }
.user-kpi__icon--danger { background: #fef2f2; color: #dc2626; }
.user-kpi__icon--cyan { background: #ecfeff; color: #0891b2; }

.user-kpi-card .ls-stat__value {
  color: #0f172a;
  font-size: 26px;
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 6px 0 2px 0;
}

.user-kpi-card .ls-stat__hint {
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 500;
}

.text-amber { color: #d97706 !important; }
.text-danger { color: #dc2626 !important; }
.text-cyan { color: #0891b2 !important; }

@media (max-width: 1200px) {
  .users-kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .users-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .users-kpis {
    grid-template-columns: 1fr;
  }
}
</style>
