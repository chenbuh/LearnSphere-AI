<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon, NProgress } from 'naive-ui'
import {
  Award,
  BookOpen,
  CheckCircle,
  Flame,
  Headset,
  Layers,
  MessageSquare,
  PenTool,
  ShieldAlert,
  Sparkles,
  Target,
  User
} from 'lucide-vue-next'

const props = defineProps({
  userStore: {
    type: Object,
    required: true
  },
  quotaInfo: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const vipPrivileges = [
  { title: 'AI 阅读深读', desc: '支持长文章 RAG 检索生成', icon: BookOpen, colorClass: 'bg-blue-500/20 text-blue-400' },
  { title: '写作精细润色', desc: '母语级纠错及多維度评价', icon: PenTool, colorClass: 'bg-emerald-500/20 text-emerald-400' },
  { title: '拟真听力生成', desc: '动态生成多场景音频练习', icon: Headset, colorClass: 'bg-amber-500/20 text-amber-400' },
  { title: '口语实时评测', desc: '1V1 模考及语义语法分析', icon: MessageSquare, colorClass: 'bg-rose-500/20 text-rose-400' },
  { title: '语法靶向训练', desc: '根据薄弱点生成针对练习', icon: Target, colorClass: 'bg-indigo-500/20 text-indigo-400' },
  { title: '安全学习环境', desc: '无广告注入，专属私密数据池', icon: ShieldAlert, colorClass: 'bg-zinc-500/20 text-zinc-300' }
]

const freeFeatures = ['词汇学习', '词汇测试', '学习记录', '基础统计']
const aiFeatures = [
  'AI 阅读理解生成',
  'AI 写作精细批改',
  'AI 听力场景训练',
  'AI 口语实时评测',
  'AI 语法靶向练习',
  'AI 1V1 口语模考',
  'AI 智能复习规划',
  'AI 深度学习分析'
]

const remainingDays = computed(() => {
  if (!props.userStore?.vipExpireTime) {
    return 0
  }

  const diff = new Date(props.userStore.vipExpireTime) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

const goToPricing = () => {
  router.push('/pricing')
}
</script>

<template>
  <div class="py-4 vip-benefits-container">
    <div v-if="userStore.isVip()">
      <div class="vip-member-card glass-glow mb-10 overflow-hidden relative">
        <div class="card-glow-bg"></div>
        <div class="card-inner p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div class="card-brand-section text-center md:text-left flex-shrink-0">
            <div class="vip-badge-outer mx-auto md:mx-0 mb-4 scale-110">
              <div class="vip-badge-inner bg-gradient-to-br from-amber-300 to-orange-500 shadow-glow-gold">
                <Award class="text-white" :size="40" />
              </div>
            </div>
            <h3 class="text-2xl font-black text-white m-0 tracking-tight">{{ userStore.getVipLabel() }}</h3>
          </div>

          <div class="card-details-section flex-1 w-full">
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="info-group">
                <div class="info-label">到期时间</div>
                <div class="info-value text-sm">{{ new Date(userStore.vipExpireTime).toLocaleDateString() }}</div>
              </div>
              <div class="info-group">
                <div class="info-label">剩余天数</div>
                <div class="info-value text-amber-300">
                  {{ remainingDays }} <small class="text-xs">天</small>
                </div>
              </div>
              <div class="info-group">
                <div class="info-label">AI 每日配额</div>
                <div class="info-value">{{ quotaInfo.dailyQuota || 500 }} <small class="text-xs">次/日</small></div>
              </div>
            </div>

            <div class="mt-8">
              <div class="flex justify-between items-end mb-2">
                <span class="quota-usage-label text-[10px] font-bold uppercase tracking-widest">今日配额使用率</span>
                <span class="text-xs font-black text-indigo-300">{{ quotaInfo.usedToday || 0 }} / {{ quotaInfo.dailyQuota || 500 }}</span>
              </div>
              <div class="premium-progress-container h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                <div
                  class="premium-progress-bar h-full transition-all duration-1000 ease-out"
                  :style="{
                    width: `${quotaInfo.usagePercent || 0}%`,
                    background: 'linear-gradient(90deg, #6366f1, #ec4899)'
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="privileges-section">
        <h4 class="privileges-title">
          <Layers :size="16" /> 全量 AI 核心特权
        </h4>
        <div class="privileges-grid">
          <div v-for="(priv, idx) in vipPrivileges" :key="idx" class="premium-priv-item group">
            <div class="priv-icon-box" :class="priv.colorClass">
              <n-icon :component="priv.icon" :size="20" />
            </div>
            <div class="priv-content">
              <div class="priv-header">
                <div class="priv-title">{{ priv.title }}</div>
                <CheckCircle :size="14" class="priv-check-icon" />
              </div>
              <div class="priv-desc">{{ priv.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="vip-promo-card">
      <div class="promo-section mb-8">
        <div class="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div class="user-identity-box flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 flex-shrink-0">
            <div class="p-3 bg-indigo-500/20 rounded-xl">
              <User :size="32" class="text-indigo-400" />
            </div>
            <div class="text-left">
              <div class="text-xs text-gray-500 font-bold uppercase tracking-wider">当前身份</div>
              <div class="text-xl font-black text-white">普通用户</div>
            </div>
          </div>

          <div class="quota-progress-box flex-1 w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-left">
            <div class="flex justify-between items-end mb-3">
              <div class="text-left">
                <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">今日 AI 能量值</div>
                <div class="text-sm font-bold text-gray-200">
                  已消耗 <span class="text-indigo-400 font-black">{{ quotaInfo.usedToday || 0 }}</span> / {{ quotaInfo.dailyQuota || 5 }}
                  <span class="text-[10px] text-gray-500 font-normal ml-1">点</span>
                </div>
              </div>
              <div class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                每日 0 点重置
              </div>
            </div>
            <n-progress
              type="line"
              :percentage="quotaInfo.usagePercent || 0"
              :color="quotaInfo.usagePercent >= 90 ? '#ef4444' : '#6366f1'"
              :height="6"
              :show-indicator="false"
              processing
            />
            <div class="mt-2 text-[10px] text-gray-500 italic">所有 AI 功能共用能量池，任务完成后将根据资源消耗自动扣除。</div>
          </div>
        </div>
      </div>

      <div class="promo-grid grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 text-left">
        <div class="feature-box">
          <div class="flex items-center gap-2 mb-4 text-xs font-black text-emerald-400 uppercase tracking-widest">
            <CheckCircle :size="14" /> 基础学习 (不消耗能量)
          </div>
          <div class="feature-tags-grid">
            <div v-for="feature in freeFeatures" :key="feature" class="feature-tag">
              <div class="dot bg-emerald-500"></div>
              <span class="text-sm text-gray-300 font-medium">{{ feature }}</span>
            </div>
          </div>
        </div>

        <div class="feature-box border-indigo-500/20 bg-indigo-500/5">
          <div class="flex items-center gap-2 mb-4 text-xs font-black text-indigo-400 uppercase tracking-widest">
            <Sparkles :size="14" /> AI 核心增强 (共用能量池)
          </div>
          <div class="feature-tags-grid">
            <div v-for="feature in aiFeatures" :key="feature" class="feature-tag">
              <div class="dot bg-indigo-500 animate-pulse"></div>
              <span class="text-sm text-gray-300 font-medium">{{ feature }}</span>
              <span class="ml-auto text-[9px] text-indigo-400/60 font-mono">消耗</span>
            </div>
          </div>
        </div>
      </div>

      <div class="upgrade-container relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/10 to-transparent overflow-hidden text-center">
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

        <Flame :size="48" class="mx-auto mb-4 text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]" />
        <h2 class="text-2xl font-black text-white m-0 mb-2">开启 AI 学习全盛时代</h2>
        <p class="text-sm text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
          升级 VIP 可立即解锁所有 AI 核心功能，并将每日调用配额提升至 <span class="text-white font-bold">50-200</span> 次。
        </p>

        <div class="pricing-cards-wrapper">
          <div class="price-item group">
            <div class="text-[10px] text-gray-500 font-bold uppercase mb-2">月度体验</div>
            <div class="text-3xl font-black text-white mb-2">¥10 <small class="text-sm font-medium text-gray-500">/月</small></div>
            <div class="text-xs text-indigo-400 font-bold bg-indigo-500/10 py-1 rounded-full">50次 AI 配额/日</div>
          </div>

          <div class="price-item featured">
            <div class="best-value-badge">最佳性价比</div>
            <div class="text-[10px] text-indigo-300 font-bold uppercase mb-2">精选季度</div>
            <div class="text-3xl font-black text-white mb-2">¥25 <small class="text-sm font-medium text-indigo-300/60">/季</small></div>
            <div class="text-xs text-indigo-200 font-bold bg-white/10 py-1 rounded-full text-shadow">100次 AI 配额/日</div>
          </div>

          <div class="price-item group">
            <div class="text-[10px] text-gray-500 font-bold uppercase mb-2">至尊年度</div>
            <div class="text-3xl font-black text-white mb-2">¥88 <small class="text-sm font-medium text-gray-500">/年</small></div>
            <div class="text-xs text-indigo-400 font-bold bg-indigo-500/10 py-1 rounded-full">200次 AI 配额/日</div>
          </div>
        </div>

        <n-button type="primary" size="large" round class="px-12 h-14 text-base font-bold shadow-indigo" @click="goToPricing">
          立即解锁全站功能特权
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vip-member-card {
  background: rgba(20, 20, 25, 0.6);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
}

.card-inner {
  background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.15), transparent 60%),
    radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.15), transparent 60%);
}

.glass-glow {
  position: relative;
  overflow: hidden;
}

.glass-glow::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(99, 102, 241, 0.05) 15deg,
    transparent 30deg,
    rgba(168, 85, 247, 0.05) 45deg,
    transparent 60deg
  );
  animation: laser-rotate 20s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes laser-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.card-glow-bg {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.05) 0%, transparent 40%);
  pointer-events: none;
}

.vip-badge-outer {
  width: 70px;
  height: 70px;
  padding: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(251, 191, 36, 0.15);
}

.vip-badge-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shadow-glow-gold {
  box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.4);
}

.info-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  overflow-wrap: anywhere;
}

.quota-usage-label {
  color: rgba(255, 255, 255, 0.42);
}

.premium-progress-container {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.premium-progress-bar {
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

.premium-progress-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: bar-shine 3s infinite;
}

@keyframes bar-shine {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}

.premium-priv-item {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
  min-width: 0;
}

.premium-priv-item:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.5);
}

.privileges-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .privileges-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .privileges-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.promo-section {
  width: 100%;
}

.feature-box {
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  height: 100%;
}

.feature-tags-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .feature-tags-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid transparent;
  width: 100%;
  min-width: 0;
}

.feature-tag.locked {
  background: rgba(0, 0, 0, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.05);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.pricing-cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: stretch;
}

@media (min-width: 768px) {
  .pricing-cards-wrapper {
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
  }

  .price-item {
    flex: 1;
  }
}

.price-item {
  padding: 32px 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.price-item.featured {
  background: linear-gradient(145deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1));
  border: 2px solid rgba(99, 102, 241, 0.5);
  z-index: 10;
  box-shadow: 0 20px 40px -12px rgba(99, 102, 241, 0.3);
}

@media (min-width: 768px) {
  .price-item.featured {
    transform: scale(1.05);
  }
}

.price-item:not(.featured):hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
}

.best-value-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #6366f1;
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 4px 12px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.shadow-indigo {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.shadow-indigo:hover {
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.privileges-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
}

.privileges-title svg {
  color: #6366f1;
}

.priv-icon-box {
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.premium-priv-item:hover .priv-icon-box {
  transform: scale(1.1);
}

.priv-content {
  flex: 1;
  min-width: 0;
}

.priv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 10px;
}

.priv-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  transition: color 0.3s;
  overflow-wrap: anywhere;
}

.premium-priv-item:hover .priv-title {
  color: #a5b4fc;
}

.priv-check-icon {
  color: #6366f1;
  opacity: 0;
  transition: opacity 0.3s;
}

.premium-priv-item:hover .priv-check-icon {
  opacity: 1;
}

.priv-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
  overflow-wrap: anywhere;
}

@media (max-width: 768px) {
  .card-inner {
    padding: 20px max(20px, env(safe-area-inset-right)) calc(20px + env(safe-area-inset-bottom, 0px)) max(20px, env(safe-area-inset-left)) !important;
  }

  .card-brand-section {
    margin-bottom: 8px;
  }

  .vip-badge-outer {
    width: 60px;
    height: 60px;
    padding: 8px;
  }

  .pricing-cards-wrapper {
    gap: 12px;
  }

  .price-item {
    padding: 20px 16px;
  }

  .upgrade-container {
    padding: 24px 16px;
  }
}

@media (max-width: 640px) {
  .vip-benefits-container,
  .vip-member-card,
  .vip-promo-card,
  .promo-section,
  .quota-progress-box,
  .user-identity-box,
  .premium-priv-item,
  .feature-box,
  .feature-tag,
  .price-item,
  .upgrade-container {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .card-details-section > .grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }

  .promo-section > .flex {
    gap: 14px !important;
  }

  .upgrade-container .shadow-indigo {
    width: 100%;
    min-width: 0;
  }

  .priv-header {
    flex-wrap: wrap;
  }

  .feature-tag span,
  .info-value,
  .priv-title,
  .priv-desc,
  .vip-benefits-container h2,
  .vip-benefits-container h3,
  .vip-benefits-container p {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}

@media (max-width: 480px) {
  .card-inner {
    padding: 16px max(14px, env(safe-area-inset-right)) calc(16px + env(safe-area-inset-bottom, 0px)) max(14px, env(safe-area-inset-left)) !important;
    gap: 16px !important;
  }

  .card-details-section > .grid {
    gap: 12px !important;
  }

  .vip-badge-outer {
    width: 56px;
    height: 56px;
    padding: 7px;
  }

  .info-label {
    margin-bottom: 6px;
    letter-spacing: 1.4px;
  }

  .info-value {
    font-size: 1rem;
  }

  .premium-priv-item {
    gap: 12px;
    padding: 14px 12px;
    border-radius: 16px;
  }

  .priv-icon-box {
    padding: 10px;
  }

  .feature-box,
  .upgrade-container {
    padding: 18px 14px;
    border-radius: 18px;
  }

  .feature-tags-grid {
    gap: 10px;
  }

  .feature-tag {
    padding: 10px 12px;
    gap: 8px;
  }

  .pricing-cards-wrapper {
    gap: 10px;
  }

  .price-item {
    padding: 18px 14px;
    border-radius: 18px;
  }

  .best-value-badge {
    top: -10px;
    font-size: 9px;
    padding: 4px 10px;
  }

  .upgrade-container .shadow-indigo {
    height: 50px !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
    font-size: 0.95rem !important;
  }
}

@media (max-width: 360px) {
  .card-inner {
    padding: 14px max(12px, env(safe-area-inset-right)) calc(14px + env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left)) !important;
  }

  .vip-badge-outer {
    width: 52px;
    height: 52px;
    padding: 6px;
  }

  .premium-priv-item,
  .feature-box,
  .price-item,
  .upgrade-container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .priv-title {
    font-size: 0.82rem;
  }

  .priv-desc,
  .feature-tag span {
    font-size: 0.76rem !important;
  }

  .best-value-badge {
    max-width: calc(100% - 24px);
    white-space: normal;
    text-align: center;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .card-inner {
    padding-top: 16px !important;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
  }

  .pricing-cards-wrapper {
    gap: 12px;
  }

  .price-item.featured {
    transform: none;
  }

  .upgrade-container {
    padding-top: 18px;
    padding-bottom: 18px;
  }
}

:global(html[data-theme='light'] .vip-member-card),
:global(html[data-theme='light'] .feature-box),
:global(html[data-theme='light'] .price-item),
:global(html[data-theme='light'] .upgrade-container),
:global(html[data-theme='light'] .user-identity-box),
:global(html[data-theme='light'] .quota-progress-box),
:global(html[data-theme='light'] .premium-priv-item),
:global(html[data-theme='light'] .vip-benefits-container .premium-progress-container) {
  border-color: rgba(148, 163, 184, 0.2) !important;
  box-shadow: 0 24px 50px -36px rgba(15, 23, 42, 0.22);
}

:global(html[data-theme='light'] .vip-member-card),
:global(html[data-theme='light'] .feature-box),
:global(html[data-theme='light'] .price-item),
:global(html[data-theme='light'] .user-identity-box),
:global(html[data-theme='light'] .quota-progress-box),
:global(html[data-theme='light'] .premium-priv-item) {
  background: rgba(255, 255, 255, 0.9);
}

:global(html[data-theme='light'] .card-inner) {
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.1), transparent 58%),
    radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.08), transparent 58%);
}

:global(html[data-theme='light'] .vip-badge-outer) {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(245, 158, 11, 0.2);
}

:global(html[data-theme='light'] .info-label),
:global(html[data-theme='light'] .privileges-title),
:global(html[data-theme='light'] .quota-usage-label),
:global(html[data-theme='light'] .vip-benefits-container .text-gray-500),
:global(html[data-theme='light'] .vip-benefits-container .text-gray-400) {
  color: #64748b !important;
}

:global(html[data-theme='light'] .info-value),
:global(html[data-theme='light'] .priv-title),
:global(html[data-theme='light'] .vip-benefits-container .text-white),
:global(html[data-theme='light'] .vip-benefits-container .text-gray-300),
:global(html[data-theme='light'] .vip-benefits-container .text-gray-200),
:global(html[data-theme='light'] .vip-benefits-container h2),
:global(html[data-theme='light'] .vip-benefits-container h3) {
  color: #18243d !important;
}

:global(html[data-theme='light'] .priv-desc) {
  color: #6b7280;
}

:global(html[data-theme='light'] .premium-priv-item:hover) {
  background: rgba(238, 242, 255, 0.92);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 26px 36px -28px rgba(79, 70, 229, 0.25);
}

:global(html[data-theme='light'] .feature-tag) {
  background: rgba(248, 250, 252, 0.96);
  border-color: rgba(148, 163, 184, 0.14);
}

:global(html[data-theme='light'] .upgrade-container) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(244, 247, 255, 0.94));
}

:global(html[data-theme='light'] .price-item.featured) {
  background: linear-gradient(145deg, rgba(99, 102, 241, 0.14), rgba(168, 85, 247, 0.08));
  border-color: rgba(99, 102, 241, 0.36);
  box-shadow: 0 26px 46px -26px rgba(99, 102, 241, 0.28);
}

:global(html[data-theme='light'] .price-item:not(.featured):hover) {
  background: rgba(248, 250, 252, 1);
}

:global(html[data-theme='light'] .vip-benefits-container .text-indigo-300),
:global(html[data-theme='light'] .vip-benefits-container .text-indigo-400),
:global(html[data-theme='light'] .vip-benefits-container .text-indigo-200) {
  color: #4f46e5 !important;
}
</style>
