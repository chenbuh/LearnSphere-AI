<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NCard, NIcon } from 'naive-ui'
import { Check, TrendingUp, Zap } from 'lucide-vue-next'
import AIFeedback from '@/components/AIFeedback.vue'

defineProps({
  aiRecLoading: {
    type: Boolean,
    default: false
  },
  aiRecommendations: {
    type: Array,
    default: () => []
  },
  aiLogId: {
    type: [Number, String, null],
    default: null
  }
})

const { t } = useI18n()
const router = useRouter()

const goToRecommendation = item => {
  if (item?.path) {
    router.push(item.path)
  }
}
</script>

<template>
  <n-card class="ai-feature-card" content-style="padding: 0;" :bordered="false">
    <div class="ai-feature-row">
      <div class="neural-pulse-bg">
        <div class="pulse-ring ring-1"></div>
        <div class="pulse-ring ring-2"></div>
        <div class="pulse-ring ring-3"></div>
      </div>

      <div class="feature-content p-6 z-10">
        <div class="flex items-center gap-3 mb-4 ai-header-row">
          <div class="ai-icon-pulse">
            <n-icon :component="Zap" :size="32" color="#6366f1" />
          </div>
          <div>
            <h3 class="m-0 text-xl font-bold text-white">{{ t('dashboard.aiInsight') }}</h3>
            <div class="scanning-text text-xs text-indigo-400 font-mono">{{ t('dashboard.aiAnalyzing') }}</div>
          </div>
        </div>
        <p class="text-gray-400 mb-6 text-sm">{{ t('dashboard.aiDesc') }}</p>
        <div class="ai-features-list">
          <template v-if="aiRecLoading">
            <div v-for="i in 2" :key="i" class="premium-rec-item skeleton">
              <div class="rec-icon skeleton-element"></div>
              <div class="flex-1">
                <div class="skeleton-title mb-2"></div>
                <div class="skeleton-text"></div>
              </div>
            </div>
          </template>
          <template v-else-if="aiRecommendations && aiRecommendations.length > 0">
            <div v-for="(item, index) in aiRecommendations" :key="index" class="premium-rec-item" @click="goToRecommendation(item)">
              <div class="rec-icon">
                <n-icon :component="TrendingUp" color="#6366f1" size="20" />
              </div>
              <div class="rec-copy">
                <div class="rec-heading-row">
                  <div class="rec-title">{{ item.title }}</div>
                  <div class="rec-action rec-action--desktop">{{ item.action }} <n-icon :component="Check" /></div>
                </div>
                <div class="rec-desc">{{ item.content }}</div>
                <div class="rec-action rec-action--mobile">{{ item.action }} <n-icon :component="Check" /></div>
              </div>
            </div>
            <div v-if="aiLogId" class="flex justify-start mt-4 mb-2">
              <AIFeedback :log-id="aiLogId" style="transform: scale(0.9); transform-origin: left;" />
            </div>
          </template>
          <template v-else>
            <div class="empty-ai-state">
              <div class="p-4 text-center border-dashed border-1 border-white/10 rounded-2xl bg-white/2">
                <p class="text-zinc-500 text-sm m-0">{{ t('dashboard.aiEmpty') }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.ai-feature-card {
  border-radius: 24px;
  background: #111115;
  border: 1px solid rgba(99, 102, 241, 0.2);
  position: relative;
  overflow: hidden;
}

:global(html[data-theme='light'] .ai-feature-card) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 38%);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.08);
}

.neural-pulse-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.4;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(99, 102, 241, 0.1);
  border-radius: 50%;
}

:global(html[data-theme='light'] .pulse-ring) {
  border-color: rgba(99, 102, 241, 0.08);
}

.ring-1 {
  width: 200px;
  height: 200px;
  animation: pulse-expand 4s infinite;
}

.ring-2 {
  width: 400px;
  height: 400px;
  animation: pulse-expand 4s infinite 1s;
}

.ring-3 {
  width: 600px;
  height: 600px;
  animation: pulse-expand 4s infinite 2s;
}

@keyframes pulse-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }

  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.ai-icon-pulse {
  position: relative;
  animation: float-slow 3s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

.scanning-text {
  letter-spacing: 2px;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.premium-rec-item {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 0;
}

.rec-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.premium-rec-item > .flex-1 {
  flex: 1;
  min-width: 0;
}

.rec-heading-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.premium-rec-item > .rec-copy {
  min-width: 0;
}

.premium-rec-item:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
  transform: scale(1.02);
}

:global(html[data-theme='light'] .premium-rec-item) {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

:global(html[data-theme='light'] .premium-rec-item:hover) {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(99, 102, 241, 0.26);
}

.rec-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rec-title {
  font-weight: 700;
  color: #fff;
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: keep-all;
  overflow-wrap: break-word;
}

:global(html[data-theme='light'] .feature-content h3),
:global(html[data-theme='light'] .rec-title) {
  color: #182132 !important;
}

.rec-desc {
  font-size: 0.8rem;
  color: #cbd5e1;
  margin-top: 2px;
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: break-word;
}

:global(html[data-theme='light'] .rec-desc),
:global(html[data-theme='light'] .feature-content p) {
  color: #64748b !important;
}

:global(html[data-theme='light'] .scanning-text) {
  color: #6366f1 !important;
}

.rec-action {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6366f1;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  overflow-wrap: break-word;
  line-height: 1.35;
  text-align: right;
}

.rec-action--mobile {
  display: none;
}

.ai-features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton {
  cursor: default !important;
  pointer-events: none;
}

.skeleton-element {
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
  position: relative;
}

.skeleton-title {
  width: 40%;
  height: 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-text {
  width: 80%;
  height: 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton-element::after,
.skeleton-title::after,
.skeleton-text::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.ai-feature-row {
  display: flex;
  min-height: 280px;
  position: relative;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  min-width: 0;
}

.ai-header-row {
  min-width: 0;
}

.ai-header-row > div:last-child {
  min-width: 0;
  flex: 1;
}

.feature-content h3,
.feature-content p,
.scanning-text {
  overflow-wrap: anywhere;
}

:global(html[data-theme='light'] .skeleton-element),
:global(html[data-theme='light'] .skeleton-title) {
  background: rgba(226, 232, 240, 0.9);
}

:global(html[data-theme='light'] .skeleton-text) {
  background: rgba(241, 245, 249, 0.96);
}

:global(html[data-theme='light'] .empty-ai-state > div) {
  border-color: rgba(148, 163, 184, 0.2) !important;
  background: rgba(248, 250, 252, 0.92) !important;
}

:global(html[data-theme='light'] .empty-ai-state p) {
  color: #64748b !important;
}

@media (max-width: 768px) {
  .ai-feature-row {
    flex-direction: column;
    min-height: auto;
    padding-bottom: 24px;
  }

  .feature-content {
    padding: 20px max(20px, env(safe-area-inset-right)) calc(20px + env(safe-area-inset-bottom, 0px)) max(20px, env(safe-area-inset-left));
    text-align: center;
  }

  .ai-features-list {
    align-items: stretch;
  }

  .premium-rec-item {
    text-align: left;
  }

  .ai-header-row {
    justify-content: flex-start;
    flex-wrap: nowrap;
  }

  .feature-content {
    text-align: left;
  }
}

@media (max-width: 640px) {
  .premium-rec-item {
    align-items: flex-start;
  }

  .rec-heading-row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .rec-action--desktop {
    display: none;
  }

  .rec-action--mobile {
    display: inline-flex;
    width: fit-content;
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .ai-feature-card {
    border-radius: 20px;
  }

  .feature-content {
    padding: 16px max(14px, env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left));
    text-align: left;
  }

  .ai-header-row {
    justify-content: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    align-items: flex-start;
  }

  .feature-content h3 {
    font-size: 1rem;
    line-height: 1.35;
  }

  .scanning-text {
    letter-spacing: 1.3px;
    line-height: 1.4;
  }

  .feature-content p {
    margin-bottom: 16px;
    font-size: 0.82rem;
    line-height: 1.65;
  }

  .feature-content h3,
  .feature-content p,
  .scanning-text {
    word-break: break-word;
  }

  .premium-rec-item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: flex-start;
    gap: 12px;
    padding: 14px 12px;
    border-radius: 14px;
  }

  .premium-rec-item:hover {
    transform: none;
  }

  .premium-rec-item > .rec-copy {
    min-width: 0;
  }

  .rec-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
  }

  .rec-title {
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .rec-desc {
    font-size: 0.78rem;
    line-height: 1.55;
  }

  .rec-action--mobile {
    grid-column: 1 / -1;
    width: 100%;
    justify-content: flex-start;
    padding-top: 8px;
    margin-top: 4px;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
    max-width: none;
    text-align: left;
  }
}

@media (max-width: 360px) {
  .feature-content {
    padding: 14px max(12px, env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left));
  }

  .ai-header-row {
    gap: 10px;
  }

  .ai-icon-pulse :deep(.n-icon) {
    font-size: 28px !important;
  }

  .feature-content h3 {
    font-size: 0.96rem;
  }

  .scanning-text {
    font-size: 0.68rem;
    letter-spacing: 1px;
  }

  .premium-rec-item {
    gap: 10px;
    padding: 12px 10px;
  }

  .rec-icon {
    width: 36px;
    height: 36px;
  }

  .rec-title {
    font-size: 0.86rem;
  }

  .rec-desc,
  .rec-action {
    font-size: 0.74rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .ai-feature-row {
    padding-bottom: 18px;
  }

  .feature-content {
    padding-top: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }

  .ai-features-list {
    gap: 10px;
  }

  .premium-rec-item {
    padding: 13px 12px;
  }
}
</style>

