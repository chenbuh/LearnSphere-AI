<script setup>
import { BarChart3, RefreshCw, Sparkles } from 'lucide-vue-next'
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
</script>

<template>
  <header class="analysis-header">
    <div class="analysis-header__main">
      <div class="analysis-header__copy">
        <div class="analysis-header__eyebrow">
          <span class="eyebrow-line"></span>
          <span>真实数据</span>
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
              <n-icon :component="BarChart3" :size="12" />
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
          <n-icon
            :component="generating ? RefreshCw : Sparkles"
            :size="14"
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
          {{ buttonText }}
        </n-button>
      </div>
    </div>

    <div v-if="metaItems.length" class="analysis-header__meta">
      <div
        v-for="item in metaItems"
        :key="item.label"
        class="meta-item"
      >
        <span class="meta-item__label">{{ item.label }}</span>
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
  padding: 28px max(28px, env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom, 0px)) max(28px, env(safe-area-inset-left));
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(8, 15, 30, 0.9), rgba(8, 15, 30, 0.72)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.14), transparent 32%);
  box-shadow: 0 22px 48px rgba(2, 6, 23, 0.18);
}

.analysis-header::before {
  content: '';
  position: absolute;
  inset: auto auto -120px -110px;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.12), transparent 70%);
  pointer-events: none;
}

.analysis-header__main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: start;
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
  gap: 10px;
  margin-bottom: 14px;
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: none;
}

.eyebrow-line {
  width: 38px;
  height: 1px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0), rgba(56, 189, 248, 0.9));
}

.analysis-header__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.analysis-header__title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(2.1rem, 4vw, 3.45rem);
  font-weight: 800;
  line-height: 0.96;
  letter-spacing: -0.04em;
  overflow-wrap: anywhere;
}

.analysis-header__tag {
  flex-shrink: 0;
  max-width: 100%;
  color: #dbeafe;
  background: rgba(56, 189, 248, 0.14);
}

.analysis-header__subtitle {
  max-width: 52rem;
  margin: 14px 0 0;
  color: #94a3b8;
  font-size: 0.98rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.analysis-header__actions {
  display: grid;
  justify-items: end;
  gap: 12px;
  align-self: center;
  width: min(100%, 20rem);
}

.analysis-header__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: 100%;
  padding: 7px 12px;
  color: #cbd5e1;
  font-size: 0.78rem;
  line-height: 1.45;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.48);
  overflow-wrap: anywhere;
}

.analysis-header__button {
  width: 100%;
  min-width: 188px;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.18);
}

.analysis-header__meta {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.44), rgba(15, 23, 42, 0.26)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.05), transparent 42%);
}

.meta-item {
  display: grid;
  gap: 6px;
  padding: 18px 20px;
  background: transparent;
}

.meta-item + .meta-item {
  border-left: 1px solid rgba(148, 163, 184, 0.1);
}

.meta-item__label {
  color: #7dd3fc;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-item__value {
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.meta-item__note {
  margin: 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.is-spinning {
  animation: analysis-spin 1.2s linear infinite;
}

:global(html[data-theme='light'] .analysis-header) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.12), transparent 34%);
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .analysis-header::before) {
  background: radial-gradient(circle, rgba(14, 165, 233, 0.08), transparent 70%);
}

:global(html[data-theme='light'] .analysis-header__title),
:global(html[data-theme='light'] .meta-item__value) {
  color: #0f172a;
}

:global(html[data-theme='light'] .analysis-header__subtitle),
:global(html[data-theme='light'] .meta-item__note) {
  color: #64748b;
}

:global(html[data-theme='light'] .analysis-header__status) {
  color: #475569;
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.78);
}

:global(html[data-theme='light'] .analysis-header__meta) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 42%);
}

:global(html[data-theme='light'] .meta-item + .meta-item) {
  border-left-color: rgba(148, 163, 184, 0.16);
}

@keyframes analysis-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .analysis-header {
    padding: 24px max(22px, env(safe-area-inset-right)) calc(20px + env(safe-area-inset-bottom, 0px)) max(22px, env(safe-area-inset-left));
    border-radius: 26px;
  }

  .analysis-header__main {
    grid-template-columns: 1fr;
  }

  .analysis-header__actions {
    justify-items: start;
    width: 100%;
  }

  .analysis-header__meta {
    grid-template-columns: 1fr;
    gap: 10px;
    overflow: visible;
    border: none;
    border-radius: 0;
    background: none;
  }

  .meta-item {
    padding: 14px 15px;
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(15, 23, 42, 0.54), rgba(15, 23, 42, 0.3)),
      radial-gradient(circle at top right, rgba(14, 165, 233, 0.06), transparent 42%);
  }

  :global(html[data-theme='light'] .meta-item) {
    border-color: rgba(148, 163, 184, 0.16);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
      radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 42%);
  }

  .meta-item + .meta-item {
    border-left: none;
  }
}

@media (max-width: 720px) {
  .analysis-header {
    gap: 18px;
    margin-bottom: 18px;
    padding: 20px max(18px, env(safe-area-inset-right)) calc(18px + env(safe-area-inset-bottom, 0px)) max(18px, env(safe-area-inset-left));
    border-radius: 22px;
  }

  .analysis-header__title {
    font-size: 1.82rem;
  }

  .analysis-header__subtitle {
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .analysis-header__button {
    width: 100%;
    min-width: 0;
  }

  .meta-item {
    padding: 14px 15px;
    border-radius: 18px;
  }
}

@media (max-width: 480px) {
  .analysis-header {
    gap: 14px;
    padding: 18px max(14px, env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left));
  }

  .analysis-header__main {
    gap: 14px;
  }

  .analysis-header__eyebrow {
    margin-bottom: 10px;
  }

  .analysis-header__title {
    font-size: 1.52rem;
    line-height: 1.05;
  }

  .analysis-header__title-row {
    gap: 10px;
  }

  .analysis-header__tag {
    max-width: 100%;
  }

  .analysis-header__actions {
    width: 100%;
  }

  .analysis-header__status {
    width: 100%;
    padding-inline: 10px;
    border-radius: 18px;
  }

  .meta-item {
    padding: 13px 12px;
  }

  .meta-item__value {
    font-size: 0.95rem;
  }
}

@media (max-width: 360px) {
  .analysis-header {
    padding: 16px max(12px, env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left));
    border-radius: 18px;
  }

  .analysis-header__eyebrow {
    gap: 8px;
    font-size: 0.7rem;
  }

  .eyebrow-line {
    width: 26px;
  }

  .analysis-header__title {
    font-size: 1.34rem;
  }

  .analysis-header__subtitle,
  .meta-item__note {
    font-size: 0.84rem;
    line-height: 1.55;
  }

  .analysis-header__status {
    font-size: 0.74rem;
  }

  .meta-item {
    padding: 12px 11px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .analysis-header {
    padding: 18px max(18px, env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom, 0px)) max(18px, env(safe-area-inset-left));
  }

  .analysis-header__main {
    gap: 16px;
  }

  .analysis-header__actions {
    width: min(100%, 18rem);
  }
}
</style>
