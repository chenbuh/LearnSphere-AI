<script setup>
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { NButton, NIcon } from 'naive-ui'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  learningModules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['view-all', 'navigate'])

const focusModule = computed(() => (
  props.learningModules.find(module => module.isFocus) || props.learningModules[0] || null
))

const secondaryModules = computed(() => (
  props.learningModules.filter(module => module !== focusModule.value)
))

function getModuleStatus(module) {
  if (module?.statusText) return module.statusText
  if ((module?.progress || 0) >= 80) return '继续保持'
  if ((module?.progress || 0) >= 50) return '稳步推进'
  if ((module?.progress || 0) >= 25) return '建议补一轮'
  return '优先练习'
}

function getModuleEyebrow(module) {
  if (module?.eyebrow) return module.eyebrow
  return module?.isFocus ? '今日重点' : '学习模块'
}
</script>

<template>
  <section class="learning-modules">
    <div class="section-header">
      <div>
        <p class="section-kicker">模块捷径</p>
        <h2 class="section-title">学习模块</h2>
        <p class="section-caption">先做今日重点，再补薄弱项。</p>
      </div>
      <n-button text @click="emit('view-all')">
        学习分析
        <template #icon>
          <n-icon :component="ArrowRight" size="16" />
        </template>
      </n-button>
    </div>

    <SkeletonWrapper :loading="loading" type="card-grid" :rows="4">
      <div class="modules-stack">
        <button
          v-if="focusModule"
          type="button"
          class="module-featured"
          @click="emit('navigate', focusModule)"
        >
          <span class="module-featured-rail" :style="{ background: focusModule.color }"></span>

          <div class="module-featured-symbol" :style="{ background: focusModule.color }">
            <n-icon :component="focusModule.icon" size="26" color="#ffffff" />
          </div>

          <div class="module-featured-copy">
            <div class="module-heading">
              <div class="module-title-wrap">
                <span class="module-eyebrow">{{ getModuleEyebrow(focusModule) }}</span>
                <h3 class="module-title">{{ focusModule.title }}</h3>
              </div>
              <span class="module-progress-pill">{{ focusModule.progress }}%</span>
            </div>

            <p class="module-featured-description">{{ focusModule.description }}</p>

            <div class="module-featured-footer">
              <span class="module-status">{{ getModuleStatus(focusModule) }}</span>
              <div class="module-track" aria-hidden="true">
                <span class="module-track-fill" :style="{ width: `${focusModule.progress}%` }"></span>
              </div>
            </div>
          </div>

          <span class="module-arrow">
            <n-icon :component="ArrowRight" size="18" />
          </span>
        </button>

        <div v-if="secondaryModules.length" class="module-secondary-grid">
          <button
            v-for="module in secondaryModules"
            :key="module.id"
            type="button"
            class="module-compact"
            @click="emit('navigate', module)"
          >
            <div class="module-compact-main">
              <div class="module-compact-symbol" :style="{ background: module.color }">
                <n-icon :component="module.icon" size="20" color="#ffffff" />
              </div>

              <div class="module-compact-copy">
                <div class="module-compact-heading">
                  <div class="module-title-wrap">
                    <span class="module-eyebrow">{{ getModuleEyebrow(module) }}</span>
                    <h3 class="module-title">{{ module.title }}</h3>
                  </div>
                  <span class="module-progress-pill">{{ module.progress }}%</span>
                </div>

                <p class="module-compact-description">{{ module.description }}</p>
              </div>
            </div>

            <div class="module-compact-footer">
              <span class="module-status">{{ getModuleStatus(module) }}</span>
              <span class="module-arrow">
                <n-icon :component="ArrowRight" size="17" />
              </span>
            </div>

            <div class="module-track" aria-hidden="true">
              <span class="module-track-fill" :style="{ width: `${module.progress}%` }"></span>
            </div>
          </button>
        </div>
      </div>
    </SkeletonWrapper>
  </section>
</template>

<style scoped>
.learning-modules {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.section-kicker {
  margin: 0 0 6px;
  color: #38bdf8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.22rem;
  font-weight: 700;
}

.section-caption {
  max-width: 34rem;
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}

.modules-stack {
  display: grid;
  gap: 12px;
}

.module-featured,
.module-compact {
  position: relative;
  min-width: 0;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.module-featured {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 16px;
  padding: 20px 20px 18px 22px;
  border: 1px solid rgba(45, 212, 191, 0.18);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(8, 47, 73, 0.34)),
    radial-gradient(circle at top right, rgba(103, 232, 249, 0.08), transparent 42%);
  overflow: hidden;
}

.module-featured::after {
  content: '';
  position: absolute;
  inset: auto -30px -40px auto;
  width: 118px;
  height: 118px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.06), transparent 70%);
  pointer-events: none;
}

.module-featured:hover,
.module-compact:hover {
  transform: translateY(-2px);
}

.module-featured:hover {
  border-color: rgba(103, 232, 249, 0.28);
}

.module-secondary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.module-compact {
  padding: 16px 16px 14px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.24);
}

.module-compact:hover {
  border-color: rgba(125, 211, 252, 0.18);
  background: rgba(15, 23, 42, 0.34);
}

.module-featured-rail {
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 999px;
}

.module-featured-symbol,
.module-compact-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
  flex-shrink: 0;
}

.module-featured-symbol {
  width: 52px;
  height: 52px;
  border-radius: 16px;
}

.module-compact-symbol {
  width: 40px;
  height: 40px;
  border-radius: 13px;
}

.module-featured-copy,
.module-compact-copy {
  min-width: 0;
}

.module-heading,
.module-compact-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.module-featured-description,
.module-compact-description {
  color: #cbd5e1;
  line-height: 1.58;
}

.module-featured-description {
  margin: 0;
  max-width: 46rem;
  font-size: 14px;
}

.module-featured-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(160px, 220px);
  gap: 16px;
  align-items: center;
}

.module-compact-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.module-compact-description {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 12px;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.module-compact-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.module-title-wrap {
  min-width: 0;
}

.module-eyebrow {
  display: inline-flex;
  margin-bottom: 5px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.module-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.08rem;
  font-weight: 700;
  line-height: 1.28;
}

.module-progress-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.46);
  color: #2dd4bf;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.module-status {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.module-track {
  height: 5px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  overflow: hidden;
}

.module-track-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #38bdf8, #2dd4bf);
}

.module-arrow {
  display: inline-flex;
  align-items: center;
  color: inherit;
  transition: transform 0.2s ease, color 0.2s ease;
}

.module-featured .module-arrow {
  align-self: center;
}

.module-featured:hover .module-arrow,
.module-compact:hover .module-arrow {
  transform: translateX(2px);
  color: #cbd5e1;
}

:global(html[data-theme='light'] .section-title),
:global(html[data-theme='light'] .module-title) {
  color: #0f172a;
}

:global(html[data-theme='light'] .section-caption),
:global(html[data-theme='light'] .module-eyebrow),
:global(html[data-theme='light'] .module-status) {
  color: #64748b;
}

:global(html[data-theme='light'] .module-featured) {
  border-color: rgba(45, 212, 191, 0.22);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(103, 232, 249, 0.12), transparent 42%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .module-featured::after) {
  background: radial-gradient(circle, rgba(14, 165, 233, 0.08), transparent 70%);
}

:global(html[data-theme='light'] .module-featured:hover) {
  border-color: rgba(56, 189, 248, 0.32);
}

:global(html[data-theme='light'] .module-compact) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04);
}

:global(html[data-theme='light'] .module-compact:hover) {
  border-color: rgba(56, 189, 248, 0.24);
  background: rgba(255, 255, 255, 0.96);
}

:global(html[data-theme='light'] .module-featured-description) {
  color: #334155;
}

:global(html[data-theme='light'] .module-compact-description) {
  color: #64748b;
}

:global(html[data-theme='light'] .module-progress-pill) {
  background: rgba(240, 253, 250, 0.92);
  color: #0f766e;
}

:global(html[data-theme='light'] .module-track) {
  background: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .module-featured:hover .module-arrow),
:global(html[data-theme='light'] .module-compact:hover .module-arrow) {
  color: #334155;
}

@media (min-width: 1100px) {
  .modules-stack {
    gap: 14px;
  }

  .module-featured {
    padding: 22px 22px 20px 24px;
  }

  .module-title {
    font-size: 1.1rem;
  }

  .module-secondary-grid {
    gap: 12px 14px;
  }

  .module-featured-description {
    font-size: 14px;
  }
}

@media (max-width: 1279px) {
  .module-secondary-grid {
    grid-template-columns: 1fr;
  }

  .module-featured {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .module-featured .module-arrow {
    display: none;
  }

  .module-featured-footer {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 640px) {
  .learning-modules {
    margin-bottom: 28px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .module-featured,
  .module-compact {
    padding: 16px 14px;
    border-radius: 18px;
  }

  .module-featured {
    grid-template-columns: auto 1fr;
    gap: 12px;
  }

  .module-heading,
  .module-compact-heading {
    gap: 10px;
  }

  .module-featured .module-arrow {
    display: none;
  }

  .module-secondary-grid {
    grid-template-columns: 1fr;
  }

  .module-title {
    font-size: 1rem;
  }

  .section-caption {
    margin-top: 6px;
    font-size: 13px;
  }

  .module-arrow {
    display: none;
  }

  .module-featured-description {
    font-size: 13px;
  }
}
</style>
