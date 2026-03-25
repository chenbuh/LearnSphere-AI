<script setup>
import { ref } from 'vue'
import {
  NCard, NButton, NIcon, NList, NListItem, NDivider, NModal
} from 'naive-ui'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '../stores/user'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import {
    Zap, ShieldCheck, Lock, Globe, CreditCard, Check
} from 'lucide-vue-next'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

// 默认选中季度会员
const activePlan = ref('季度会员')
const showCheckoutModal = ref(false)
const selectedPlanData = ref(null)
const isPaying = ref(false)
const paymentUnavailableMessage = '支付功能暂未开放，请联系管理员在后台手动开通会员'

const openCheckout = (plan) => {
  if (plan.price === '免费') {
    message.info('基础版功能默认对所有用户开放')
    return
  }
  if (!userStore.token) {
    message.warning('请先登录账号')
    router.push(`/login?redirect=/pricing`)
    return
  }
  selectedPlanData.value = plan
  showCheckoutModal.value = true
}

const handlePayment = async () => {
    isPaying.value = true
    try {
        await new Promise((resolve) => window.setTimeout(resolve, 320))
        message.error(paymentUnavailableMessage)
        showCheckoutModal.value = false
    } catch (e) {
        message.error(e.message || paymentUnavailableMessage)
    } finally {
        isPaying.value = false
    }
}

const plans = [
  {
    name: '基础版',
    price: '免费',
    period: '永久',
    dailyQuota: '每日 5 点 AI 能量值',
    features: [
      '基础词汇与发音练习',
      '支持所有 AI 核心功能',
      '共享 5 点/日 通用能量',
      '基础学习进度统计',
      '社区互助支持'
    ],
    recommended: false, 
    highlight: false
  },
  {
    name: '月度会员',
    price: '¥10',
    period: '/月',
    dailyQuota: '每日 50 点 AI 能量值',
    features: [
      '包含基础版所有权益',
      'AI 能量大幅扩容 (50点)',
      '解锁高阶 AI 口语对话',
      '全真模拟考试系统',
      '智能错题本与深度分析',
      '无广告纯净学习环境'
    ],
    recommended: false,
    highlight: false
  },
  {
    name: '季度会员',
    price: '¥25',
    period: '/季',
    dailyQuota: '每日 100 点 AI 能量值',
    badge: '超值特惠',
    features: [
      '包含月度会员所有功能',
      '最高性价比能量配比',
      '专属季度学习复盘报告',
      '优先专家客服通道',
      '多端学习数据同步'
    ],
    recommended: true,
    highlight: true
  },
  {
    name: '年度会员',
    price: '¥88',
    period: '/年',
    dailyQuota: '每日 200 点 AI 能量值',
    badge: '最佳性价比',
    features: [
      '解锁全站顶级会员身份',
      '海量 200 点/日 能量值',
      'AI 备考导师私人定制',
      '新功能内测优先体验权',
      '个人主页 VIP 身份标识'
    ],
    recommended: false,
    highlight: true
  }
]
</script>

<template>
  <div class="pricing-page min-h-screen bg-dark">
    <SiteHeader />
    
    <main>
      <section class="section pricing-section">
        <div class="container">
          <div class="section-header text-center">
            <h2>简单透明的价格方案</h2>
            <p>选择最适合您的学习计划，随时可以升级或取消</p>
          </div>
          
          <div class="pricing-grid">
            <div v-for="(plan, index) in plans" :key="index" class="grid-item">
              <n-card 
                class="pricing-card" 
                :class="{ 'recommended': activePlan === plan.name }"
                @click="activePlan = plan.name"
              >
                <div class="recommended-badge" v-if="plan.badge || activePlan === plan.name">
                  {{ plan.badge || '当前选择' }}
                </div>
                <div class="plan-header">
                  <h3>{{ plan.name }}</h3>
                  <div class="price">
                    <span class="currency" v-if="plan.price !== '免费'">¥</span>
                    <span class="amount">{{ plan.price.replace('¥', '') }}</span>
                    <span class="period" v-if="plan.period">{{ plan.period }}</span>
                  </div>
                  <div class="quota-badge-text">{{ plan.dailyQuota }}</div>
                </div>
                <n-divider />
                <n-list class="features-list">
                  <n-list-item v-for="(feature, idx) in plan.features" :key="idx">
                    <template #prefix>
                      <n-icon :component="Check" color="#10b981" size="20" />
                    </template>
                    {{ feature }}
                  </n-list-item>
                </n-list>
                <div class="plan-action">
                    <n-button 
                    block 
                    :type="activePlan === plan.name ? 'primary' : 'default'" 
                    size="large"
                    :secondary="activePlan !== plan.name"
                    class="action-button"
                    @click.stop="openCheckout(plan)"
                  >
                    {{ activePlan === plan.name ? '立即订阅' : '选择此方案' }}
                  </n-button>
                </div>
              </n-card>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Secure Checkout Modal -->
    <n-modal v-model:show="showCheckoutModal" preset="card" style="width: 500px; border-radius: 24px;" :bordered="false" :trap-focus="true" :auto-focus="true" class="checkout-modal-bg">
        <template #header>
            <div class="checkout-header">
                <ShieldCheck class="text-indigo-400" :size="24" />
                <span>安全收银台</span>
            </div>
        </template>
        
        <div class="checkout-body" v-if="selectedPlanData">
            <div class="selected-plan-summary">
                <div class="selected-plan-label">您选择的方案</div>
                <div class="selected-plan-row">
                    <span class="selected-plan-name">{{ selectedPlanData.name }}</span>
                    <span class="selected-plan-price">{{ selectedPlanData.price }}<span class="selected-plan-period">{{ selectedPlanData.period }}</span></span>
                </div>
            </div>

            <div class="payment-methods">
                <div class="method-item active">
                   <div class="method-icon method-icon-primary"><CreditCard :size="20" /></div>
                   <div class="method-copy">
                       <div class="method-name">支付宝 / 微信支付</div>
                       <div class="method-desc">当前版本未开放，提交后会直接提示支付失败</div>
                   </div>
                   <div class="checked-circle"><Check :size="14" /></div>
                </div>
                <div class="method-item disabled">
                   <div class="method-icon method-icon-secondary"><Globe :size="20" /></div>
                   <div class="method-copy">
                     <div class="method-name">International Credit Card</div>
                     <div class="method-desc">暂未开放</div>
                   </div>
                </div>
            </div>

            <div class="security-guarantee">
                <div class="guarantee-item">
                    <Lock :size="12" /> 高级加密连接
                </div>
                <div class="guarantee-item">
                    <ShieldCheck :size="12" /> 防范欺诈监控
                </div>
                <div class="guarantee-item">
                    <Zap :size="12" /> 毫秒级到账
                </div>
            </div>

            <n-button 
                type="primary" 
                size="large" 
                block 
                round 
                class="checkout-final-btn" 
                :loading="isPaying"
                @click="handlePayment"
            >
                <template #icon><Lock /></template>
                确认支付 {{ selectedPlanData.price }}
            </n-button>
            <div class="checkout-footnote">
                VIP 目前仅支持管理员在后台手动开通
            </div>
        </div>
    </n-modal>

    <SiteFooter />
  </div>
</template>

<style scoped>
.pricing-page {
  color: var(--text-color);
  background:
    radial-gradient(circle at 12% 12%, rgba(99, 102, 241, 0.1), transparent 24%),
    radial-gradient(circle at 88% 16%, rgba(59, 130, 246, 0.08), transparent 22%),
    var(--bg-color);
}

.pricing-section {
  position: relative;
  overflow: hidden;
}

.section { padding: 80px 0; }
.section-header { margin-bottom: 60px; }
.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(120deg, var(--text-color), #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.section-header p {
  color: var(--secondary-text);
  font-size: 1.125rem;
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    width: 100%;
}
.grid-item {
    display: flex;
}

.pricing-card {
  flex: 1;
  height: 100%;
  cursor: pointer;
  background: var(--surface-raised);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 18px 40px var(--shadow-color);
  backdrop-filter: blur(16px);
}
.pricing-card:hover {
  transform: translateY(-8px);
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 32%),
    rgba(38, 43, 58, 0.96);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.38);
}
.pricing-card.recommended {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.2) 0%, rgba(31, 41, 55, 0.96) 100%);
  border: 1px solid rgba(129, 140, 248, 0.45);
  box-shadow: 0 26px 52px rgba(79, 70, 229, 0.24);
  z-index: 1;
}
.recommended-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 99px;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.3);
}

:deep(.pricing-card .n-card__content) {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 28px 22px 22px;
}

.plan-header {
  text-align: center;
  margin-bottom: 0;
  padding: 0 0 12px;
}
.plan-header h3 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--text-color);
  font-weight: 600;
}
.price {
  display: flex;
  justify-content: center;
  align-items: baseline;
  color: var(--text-color);
}
.currency {
    font-size: 1.25rem;
    font-weight: 500;
    margin-right: 2px;
}
.price .amount {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
}
.price .period {
  font-size: 0.9rem;
  color: var(--secondary-text);
  margin-left: 4px;
}
.quota-badge-text {
    margin-top: 12px;
    display: inline-block;
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(129, 140, 248, 0.18);
    color: #c7d2fe;
    font-size: 0.85rem;
    padding: 4px 12px;
    border-radius: 999px;
    font-weight: 600;
}

.features-list {
  background: transparent;
  margin: 16px 0 32px;
}

:deep(.pricing-card .n-divider) {
  margin: 0;
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.features-list .n-list-item) {
  color: rgba(226, 232, 240, 0.82);
  padding-top: 12px;
  padding-bottom: 12px;
}

:deep(.features-list .n-list-item__prefix) {
  margin-right: 12px;
}

:deep(.pricing-card.recommended .n-list-item) {
  color: #eef2ff;
}

.plan-action {
    margin-top: auto;
}
.action-button {
    font-weight: 600;
    height: 46px;
    border-radius: 14px;
}
@media (max-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .section { padding: 40px 0; }
  .section-header h2 { font-size: 1.75rem; }
  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  :deep(.pricing-card .n-card__content) {
    padding: 24px 18px 18px;
  }
}

.checkout-modal-bg {
    background: rgba(20, 20, 25, 0.95) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.checkout-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    color: #fff;
}
.selected-plan-summary {
    padding: 16px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 24px;
}
.selected-plan-label {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 8px;
}
.selected-plan-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}
.selected-plan-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
}
.selected-plan-price {
    font-size: 1.75rem;
    font-weight: 900;
    color: #818cf8;
}
.selected-plan-period {
    margin-left: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
}
.payment-methods {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
}
.method-item {
    padding: 16px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    gap: 12px;
}
.method-item.active {
    border: 2px solid rgba(99, 102, 241, 0.4);
    background: rgba(99, 102, 241, 0.08);
}
.method-item.disabled {
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    opacity: 0.46;
}
.method-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
}
.method-icon-primary {
    background: #6366f1;
}
.method-icon-secondary {
    background: #374151;
}
.method-copy {
    flex: 1;
}
.method-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
}
.method-desc {
    margin-top: 2px;
    font-size: 0.75rem;
    color: #6b7280;
}
.method-item.active .checked-circle {
    width: 20px;
    height: 20px;
    background: #6366f1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}
.security-guarantee {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
}
.guarantee-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    color: #6b7280;
}
.checkout-final-btn {
    height: 54px;
    font-size: 1.1rem;
    font-weight: 700;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}
.checkout-footnote {
    text-align: center;
    margin-top: 16px;
    opacity: 0.34;
    font-size: 0.58rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6b7280;
}

:global(html[data-theme='light'] .pricing-page) {
  background:
    radial-gradient(circle at 12% 12%, rgba(99, 102, 241, 0.12), transparent 24%),
    radial-gradient(circle at 88% 16%, rgba(59, 130, 246, 0.08), transparent 22%),
    linear-gradient(180deg, #f9fbff 0%, #f4f7fb 48%, #eef2ff 100%);
}

:global(html[data-theme='light'] .section-header h2) {
  background: linear-gradient(120deg, #0f172a, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

:global(html[data-theme='light'] .section-header p) {
  color: #64748b;
}

:global(html[data-theme='light'] .pricing-page .pricing-card) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.96));
  border-color: rgba(203, 213, 225, 0.72);
  box-shadow: 0 20px 44px rgba(148, 163, 184, 0.14);
}

:global(html[data-theme='light'] .pricing-page .pricing-card:hover) {
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.98));
  border-color: rgba(99, 102, 241, 0.28);
  box-shadow: 0 24px 50px rgba(99, 102, 241, 0.14);
}

:global(html[data-theme='light'] .pricing-page .pricing-card.recommended) {
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 32%),
    linear-gradient(180deg, rgba(238, 242, 255, 0.98), rgba(255, 255, 255, 0.96));
  border-color: rgba(99, 102, 241, 0.34);
  box-shadow: 0 28px 56px rgba(99, 102, 241, 0.18);
}

:global(html[data-theme='light'] .pricing-page .recommended-badge) {
  background: rgba(79, 70, 229, 0.12);
  color: #4338ca;
  border: 1px solid rgba(129, 140, 248, 0.28);
  box-shadow: none;
}

:global(html[data-theme='light'] .pricing-page .plan-header h3),
:global(html[data-theme='light'] .pricing-page .price) {
  color: #0f172a;
}

:global(html[data-theme='light'] .pricing-page .price .period) {
  color: #64748b;
}

:global(html[data-theme='light'] .pricing-page .quota-badge-text) {
  background: rgba(224, 231, 255, 0.82);
  border-color: rgba(165, 180, 252, 0.34);
  color: #4338ca;
}

:global(html[data-theme='light'] .pricing-page .pricing-card .n-divider) {
  border-color: rgba(203, 213, 225, 0.72);
}

:global(html[data-theme='light'] .pricing-page .features-list .n-list-item) {
  color: #334155;
}

:global(html[data-theme='light'] .pricing-page .pricing-card.recommended .n-list-item) {
  color: #1e293b;
}

:global(html[data-theme='light'] .pricing-page .action-button.n-button--default-type) {
  background: rgba(248, 250, 252, 0.92);
  color: #334155;
  border: 1px solid rgba(203, 213, 225, 0.88);
}

:global(html[data-theme='light'] .pricing-page .action-button.n-button--default-type:hover) {
  background: rgba(238, 242, 255, 0.94);
  color: #1e293b;
  border-color: rgba(129, 140, 248, 0.3);
}

:global(html[data-theme='light'] .checkout-modal-bg) {
    background: rgba(255, 255, 255, 0.96) !important;
    border-color: rgba(203, 213, 225, 0.72) !important;
    box-shadow: 0 28px 60px rgba(148, 163, 184, 0.18) !important;
}

:global(html[data-theme='light'] .checkout-header) {
    color: #0f172a;
}

:global(html[data-theme='light'] .selected-plan-summary) {
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.92));
    border-color: rgba(203, 213, 225, 0.72);
}

:global(html[data-theme='light'] .selected-plan-name),
:global(html[data-theme='light'] .method-name) {
    color: #0f172a;
}

:global(html[data-theme='light'] .selected-plan-label),
:global(html[data-theme='light'] .selected-plan-period),
:global(html[data-theme='light'] .method-desc),
:global(html[data-theme='light'] .guarantee-item),
:global(html[data-theme='light'] .checkout-footnote) {
    color: #64748b;
}

:global(html[data-theme='light'] .method-item.active) {
    background: rgba(224, 231, 255, 0.52);
    border-color: rgba(129, 140, 248, 0.35);
}

:global(html[data-theme='light'] .method-item.disabled) {
    background: rgba(248, 250, 252, 0.88);
    border-color: rgba(203, 213, 225, 0.72);
    opacity: 0.68;
}

:global(html[data-theme='light'] .method-icon-secondary) {
    background: #cbd5e1;
    color: #334155;
}

@media (max-width: 640px) {
  .section {
    padding: 28px 0 26px;
  }

  .section-header {
    margin-bottom: 22px;
  }

  .section-header h2 {
    font-size: 1.68rem;
    margin-bottom: 10px;
  }

  .section-header p {
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .pricing-grid {
    gap: 18px;
  }

  .pricing-card {
    border-radius: 18px;
    box-shadow: 0 16px 34px var(--shadow-color);
  }

  .recommended-badge {
    top: 10px;
    right: 10px;
    padding: 4px 10px;
    font-size: 0.68rem;
  }

  :deep(.pricing-card .n-card__content) {
    padding: 20px 16px 16px;
  }

  .plan-header {
    padding-bottom: 10px;
  }

  .plan-header h3 {
    font-size: 1.14rem;
    margin-bottom: 10px;
  }

  .currency {
    font-size: 1.02rem;
  }

  .price .amount {
    font-size: 2.18rem;
  }

  .price .period {
    font-size: 0.82rem;
  }

  .quota-badge-text {
    margin-top: 10px;
    font-size: 0.78rem;
    padding: 4px 10px;
  }

  .features-list {
    margin: 12px 0 20px;
  }

  :deep(.features-list .n-list-item) {
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 0.92rem;
  }

  .action-button {
    height: 44px;
    border-radius: 12px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .section {
    padding: 20px 0 22px;
  }

  .section-header {
    margin-bottom: 16px;
  }

  .section-header h2 {
    font-size: 1.52rem;
  }

  .section-header p {
    font-size: 0.86rem;
  }

  :deep(.pricing-card .n-card__content) {
    padding: 18px 14px 14px;
  }

  .plan-header h3 {
    font-size: 1.08rem;
  }

  .price .amount {
    font-size: 1.98rem;
  }

  .features-list {
    margin: 10px 0 16px;
  }

  :deep(.features-list .n-list-item__prefix) {
    margin-right: 10px;
  }
}

@media (max-width: 430px) {
  .section {
    padding: 14px 0 18px;
  }

  .section-header {
    margin-bottom: 12px;
  }

  .section-header h2 {
    font-size: 1.42rem;
    margin-bottom: 8px;
    line-height: 1.18;
  }

  .section-header p {
    max-width: 19rem;
    margin: 0 auto;
    font-size: 0.8rem;
    line-height: 1.45;
  }

  .pricing-grid {
    gap: 14px;
  }

  .pricing-card {
    border-radius: 16px;
  }

  .recommended-badge {
    top: 8px;
    right: 8px;
    padding: 3px 8px;
    font-size: 0.64rem;
  }

  :deep(.pricing-card .n-card__content) {
    padding: 16px 12px 12px;
  }

  .plan-header {
    padding-bottom: 8px;
  }

  .plan-header h3 {
    font-size: 1rem;
    margin-bottom: 8px;
  }

  .price .amount {
    font-size: 1.8rem;
  }

  .price .period {
    font-size: 0.78rem;
    margin-left: 3px;
  }

  .quota-badge-text {
    margin-top: 8px;
    font-size: 0.72rem;
    padding: 3px 9px;
  }

  .features-list {
    margin: 8px 0 12px;
  }

  :deep(.features-list .n-list-item) {
    padding-top: 8px;
    padding-bottom: 8px;
    font-size: 0.84rem;
    line-height: 1.4;
  }

  :deep(.features-list .n-list-item__prefix) {
    margin-right: 8px;
  }

  .action-button {
    height: 42px;
    font-size: 0.9rem;
    border-radius: 11px;
  }
}

@media (max-width: 360px) {
  .section {
    padding: 10px 0 16px;
  }

  .section-header h2 {
    font-size: 1.32rem;
  }

  .section-header p {
    font-size: 0.76rem;
  }

  :deep(.pricing-card .n-card__content) {
    padding: 14px 11px 11px;
  }

  .plan-header h3 {
    font-size: 0.96rem;
  }

  .price .amount {
    font-size: 1.68rem;
  }

  .quota-badge-text {
    font-size: 0.68rem;
  }

  :deep(.features-list .n-list-item) {
    font-size: 0.8rem;
    padding-top: 7px;
    padding-bottom: 7px;
  }

  .action-button {
    height: 40px;
    font-size: 0.86rem;
  }
}
</style>
