<script setup>
import { computed } from 'vue'
import { BarChart3, RefreshCw, Sparkles, Clock, Database, Target, ShieldCheck, Zap, Activity } from 'lucide-vue-next'
import { NButton, NIcon, NTag } from 'naive-ui'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    required: true
  },
  generating: {
    type: Boolean,
    default: false
  },
  metaItems: {
    type: Array,
    default: () => []
  },
  badgeText: {
    type: String,
    default: ''
  },
  statusText: {
    type: String,
    default: ''
  }
})

defineEmits(['regenerate'])

const getMetaConfig = (label) => {
  const l = (label || '').toLowerCase()
  if (l.includes('时间') || l.includes('time') || l.includes('刷新')) {
    return { icon: Clock, tone: 'time', color: '#38bdf8' }
  }
  if (l.includes('依据') || l.includes('basis') || l.includes('数据') || l.includes('data')) {
    return { icon: Database, tone: 'data', color: 'var(--tone-emerald)' }
  }
  if (l.includes('补强') || l.includes('focus') || l.includes('优先') || l.includes('priority')) {
    return { icon: Target, tone: 'focus', color: '#f59e0b' }
  }
  return { icon: Activity, tone: 'default', color: '#34d399' }
}
</script>

<template>
  <header class="analysis-header">
    <!-- 背景流光与纳米星尘装饰 -->
    <div class="analysis-header__ambient-1"></div>
    <div class="analysis-header__ambient-2"></div>

    <div class="analysis-header__main">
      <div class="analysis-header__copy">
        <div class="analysis-header__eyebrow">
          <span class="eyebrow-dot"></span>
          <span>全真诊断桌面</span>
          <span class="eyebrow-divider">/</span>
          <span class="eyebrow-sub">LIVE DIAGNOSTICS</span>
        </div>

        <div class="analysis-header__title-row">
          <h1 class="analysis-header__title">{{ title }}</h1>
          <n-tag
            v-if="badgeText"
            size="small"
            :bordered="false"
            class="analysis-header__tag"
          >
            <template #icon>
              <n-icon :component="BarChart3" :size="13" />
            </template>
            {{ badgeText }}
          </n-tag>
        </div>

        <p v-if="subtitle" class="analysis-header__subtitle">
          {{ subtitle }}
        </p>
      </div>

      <div class="analysis-header__actions">
        <div v-if="statusText" class="analysis-header__status">
          <span class="status-pulse-dot" :class="{ 'is-active': generating }"></span>
          <n-icon
            :component="generating ? RefreshCw : Sparkles"
            :size="13"
            :class="{ 'is-spinning': generating }"
          />
          <span>{{ statusText }}</span>
        </div>

        <n-button
          type="primary"
          size="large"
          class="analysis-header__button"
          :loading="generating"
          @click="$emit('regenerate')"
        >
          <template #icon>
            <n-icon :component="RefreshCw" :class="{ 'is-spinning': generating }" />
          </template>
          <span class="button-label">{{ buttonText }}</span>
        </n-button>
      </div>
    </div>

    <!-- 底部 3 柱元数据悬浮晶体舱 -->
    <div v-if="metaItems.length" class="analysis-header__meta">
      <div
        v-for="item in metaItems"
        :key="item.label"
        class="meta-item"
        :class="`meta-item--${getMetaConfig(item.label).tone}`"
      >
        <div class="meta-item__header">
          <div class="meta-item__icon-wrap">
            <n-icon :component="getMetaConfig(item.label).icon" :size="16" />
          </div>
          <span class="meta-item__label">{{ item.label }}</span>
        </div>

        <strong class="meta-item__value">{{ item.value }}</strong>

        <p v-if="item.note" class="meta-item__note">
          {{ item.note }}
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.analysis-header {
  position: relative;
  display: grid;
  gap: 22px;
  margin-bottom: 24px;
  padding: 30px max(32px, env(safe-area-inset-right)) calc(26px + env(safe-area-inset-bottom, 0px)) max(32px, env(safe-area-inset-left));
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.analysis-header__ambient-1 {
  position: absolute;
  top: -120px;
  left: -90px;
  width: 320px;
  height: 320px;
  border-radius: 999px;
  background: transparent;
  pointer-events: none;
}

.analysis-header__ambient-2 {
  position: absolute;
  bottom: -140px;
  right: 10%;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  background: transparent;
  pointer-events: none;
}

.analysis-header__main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
}

.analysis-header__copy,
.analysis-header__actions,
.analysis-header__meta,
.meta-item {
  min-width: 0;
}

.analysis-header__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(30, 107, 82, 0.1);
  border: 1px solid rgba(30, 107, 82, 0.2);
  color: var(--brand);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand);
}

.eyebrow-divider {
  color: var(--secondary-text);
}

.eyebrow-sub {
  color: var(--tone-blue);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  font-weight: 800;
}

.analysis-header__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.analysis-header__title {
  margin: 0;
  color: var(--text-color);
  font-size: clamp(2.2rem, 4.2vw, 3.4rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
}

.analysis-header__tag {
  flex-shrink: 0;
  max-width: 100%;
  color: var(--brand);
  border: 1px solid rgba(30, 107, 82, 0.3) !important;
  background: rgba(30, 107, 82, 0.12) !important;
  font-weight: 700;
  border-radius: 999px;
}

.analysis-header__subtitle {
  max-width: 48rem;
  margin: 12px 0 0;
  color: var(--secondary-text);
  font-size: 0.95rem;
  line-height: 1.65;
}

.analysis-header__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  width: min(100%, 22rem);
}

.analysis-header__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 6px 14px;
  color: var(--secondary-text);
  font-size: 0.76rem;
  line-height: 1.45;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;
  background: var(--card-bg);
}

.status-pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #34d399;
}

.status-pulse-dot.is-active {
  background: var(--brand);
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.4); }
}

/* 流光科技操作按钮 */
.analysis-header__button {
  height: 46px;
  min-width: 200px;
  border-radius: var(--radius-lg) !important;
  font-size: 0.94rem !important;
  font-weight: 700 !important;
  border: none !important;
  background: var(--brand) !important;
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease !important;
  /* 品牌实心底：必须用品牌前景色，否则继承正文色只有 ~2.5:1 */
  color: var(--brand-ink);
}

.analysis-header__button:hover {
  transform: translateY(-2px);
}

.button-label {
  letter-spacing: 0.02em;
}

/* ==========================================================================
   元数据悬浮晶体舱
   ========================================================================== */
.analysis-header__meta {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: var(--card-bg);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.meta-item:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.26);
}

.meta-item__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meta-item__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.meta-item--time .meta-item__icon-wrap {
  color: var(--brand);
  background: rgba(30, 107, 82, 0.14);
  border: 1px solid rgba(30, 107, 82, 0.24);
}

.meta-item--data .meta-item__icon-wrap {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.14);
  border: 1px solid rgba(95, 168, 139, 0.24);
}

.meta-item--focus .meta-item__icon-wrap {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(251, 191, 36, 0.24);
}

.meta-item--default .meta-item__icon-wrap {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.24);
}

.meta-item__label {
  color: var(--secondary-text);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-item__value {
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.meta-item__note {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.8rem;
  line-height: 1.5;
}

.is-spinning {
  animation: analysis-spin 1.2s linear infinite;
}

@keyframes analysis-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==========================================================================
   浅色模式高质感白金极光适配
   ========================================================================== */
:global(html[data-theme='light'] .analysis-header) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .analysis-header__title),
:global(html[data-theme='light'] .meta-item__value) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .analysis-header__subtitle),
:global(html[data-theme='light'] .meta-item__label),
:global(html[data-theme='light'] .meta-item__note) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .analysis-header__status) {
  border-color: rgba(148, 163, 184, 0.24);
  background: var(--card-bg);
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .meta-item) {
  border-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .meta-item:hover) {
  border-color: rgba(30, 107, 82, 0.35);
}

/* ==========================================================================
   响应式断点适配
   ========================================================================== */
@media (max-width: 1100px) {
  .analysis-header {
    padding: 24px max(24px, env(safe-area-inset-right)) calc(22px + env(safe-area-inset-bottom, 0px)) max(24px, env(safe-area-inset-left));
    border-radius: var(--radius-lg);
  }

  .analysis-header__main {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .analysis-header__actions {
    align-items: flex-start;
    width: 100%;
  }

  .analysis-header__meta {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 720px) {
  .analysis-header {
    gap: 18px;
    margin-bottom: 18px;
    padding: 20px max(18px, env(safe-area-inset-right)) calc(18px + env(safe-area-inset-bottom, 0px)) max(18px, env(safe-area-inset-left));
    border-radius: var(--radius-lg);
  }

  .analysis-header__title {
    font-size: 1.88rem;
  }

  .analysis-header__button {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .analysis-header {
    padding: 18px max(14px, env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left));
  }

  .analysis-header__title {
    font-size: 1.55rem;
  }

  .meta-item {
    padding: 14px 15px;
  }
}
</style>

