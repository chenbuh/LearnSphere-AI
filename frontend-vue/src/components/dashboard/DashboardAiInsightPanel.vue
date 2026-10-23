<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NCard, NIcon } from 'naive-ui'
import { ArrowRight, BookOpen, Check, Sparkles, TrendingUp, Zap } from 'lucide-vue-next'
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
      <div class="neural-pulse-bg" hidden>
      </div>

      <div class="feature-content p-6 z-10">
        <div class="flex items-center gap-3 mb-4 ai-header-row">
          <div class="ai-icon-pulse">
            <n-icon :component="Zap" :size="20" color="var(--brand)" />
          </div>
          <div>
            <h3 class="m-0 text-xl font-bold ai-feature-title">{{ t('dashboard.aiInsight') }}</h3>
          </div>
        </div>
        <p class="ai-feature-desc mb-6 text-sm">{{ t('dashboard.aiDesc') }}</p>
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
                <n-icon :component="TrendingUp" color="var(--brand)" size="20" />
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
              <div class="empty-ai-card">
                <div class="empty-ai-icon-box">
                  <n-icon :component="Sparkles" :size="24" color="var(--brand)" />
                </div>
                <div class="empty-ai-info">
                  <div class="empty-ai-title">暂无建议</div>
                  <p class="empty-ai-desc">
                    {{ t('dashboard.aiEmpty') }}。
                  </p>
                </div>
                <div class="empty-ai-actions">
                  <button type="button" class="quick-action-pill" @click="router.push('/vocabulary')">
                    <n-icon :component="BookOpen" :size="14" />
                    <span>前往词汇背诵</span>
                  </button>
                  <button type="button" class="quick-action-pill" @click="router.push('/daily-tasks')">
                    <n-icon :component="ArrowRight" :size="14" />
                    <span>每日任务看板</span>
                  </button>
                </div>
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
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  position: relative;
  overflow: hidden;
}

.empty-ai-card {
  padding: 20px;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  border: 1px dashed var(--card-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  transition: all 0.25s ease;
}


.empty-ai-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--brand-soft);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.empty-ai-info {
  flex: 1 1 280px;
  min-width: 0;
}

.empty-ai-title {
  color: var(--text-color);
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.empty-ai-desc {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.85rem;
  line-height: 1.5;
}

.empty-ai-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-action-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  background: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--card-border);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-pill:hover {
  border-color: var(--brand);
  color: var(--brand);
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
  border: 2px solid rgba(30, 107, 82, 0.1);
  border-radius: 50%;
}

:global(html[data-theme='light'] .pulse-ring) {
  border-color: rgba(30, 107, 82, 0.08);
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
  color: var(--secondary-text);
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
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
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
  background: var(--surface-muted);
  border-color: var(--brand);
}

.rec-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--brand-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rec-title {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: keep-all;
  overflow-wrap: break-word;
}

.ai-feature-title {
  color: var(--text-color);
}

.ai-feature-desc {
  color: var(--secondary-text);
}

html[data-theme='light'] .ai-feature-title,
:global(html[data-theme='light'] .ai-feature-title),
:global(html[data-theme='light'] .feature-content h3),
:global(html[data-theme='light'] .empty-ai-title),
:global(html[data-theme='light'] .rec-title) {
  color: var(--text-color) !important;
}

.rec-desc {
  font-size: 0.8rem;
  color: var(--secondary-text);
  margin-top: 2px;
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: break-word;
}

html[data-theme='light'] .ai-feature-desc,
:global(html[data-theme='light'] .ai-feature-desc),
:global(html[data-theme='light'] .feature-content p),
:global(html[data-theme='light'] .empty-ai-desc),
:global(html[data-theme='light'] .rec-desc) {
  color: var(--secondary-text) !important;
}

:global(html[data-theme='light'] .scanning-text) {
  color: #1e6b52 !important;
}

.rec-action {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--brand);
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
  background: transparent;
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
  color: var(--secondary-text) !important;
}

@media (max-width: 768px) {
  .ai-feature-row {
    flex-direction: column;
    min-height: auto;
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
    border-radius: var(--radius-lg);
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
    border-radius: var(--radius-lg);
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
    border-radius: var(--radius-md);
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

@media (max-width: 640px) {
  .empty-ai-card {
    padding: 16px;
    gap: 12px;
    align-items: flex-start;
  }

  .empty-ai-icon-box {
    display: none;
  }

  .empty-ai-info {
    flex-basis: 100%;
  }

  .empty-ai-actions {
    width: 100%;
    gap: 8px;
  }

  .quick-action-pill {
    flex: 1 1 0;
    justify-content: center;
    padding: 8px 10px;
  }
}
</style>

