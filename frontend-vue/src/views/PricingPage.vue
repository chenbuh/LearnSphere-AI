<script setup>
import { ref, onMounted } from 'vue'
import { 
  NGrid, NGridItem, NCard, NButton, NIcon, NList, NListItem, NDivider, NModal
} from 'naive-ui'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import { useUserStore } from '../stores/user'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import { paymentApi } from '@/api/payment'
import { 
    Zap, ShieldCheck, Lock, Globe, CreditCard, ShieldAlert,
    Shield, Check, ArrowRight
} from 'lucide-vue-next'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

// 默认选中季度会员
const activePlan = ref('季度会员')
const showCheckoutModal = ref(false)
const selectedPlanData = ref(null)
const isPaying = ref(false)
const paymentToken = ref('')

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
        // 1. 获取安全支付 Token (幂等性保护)
        const tokenRes = await paymentApi.getPaymentToken()
        if (tokenRes.code !== 200) throw new Error('安全校验失败')
        
        // 2. 模拟加密数据并提交
        const amount = parseFloat(selectedPlanData.value.price.replace('¥',''))
        const res = await paymentApi.checkout({
            paymentToken: tokenRes.data,
            vipLevel: plans.findIndex(p => p.name === selectedPlanData.value.name),
            amount: amount
        })

        if (res.code === 200) {
            message.success('支付成功！您的会员权益已实时解锁')
            showCheckoutModal.value = false
            await userStore.getUserInfo()
        } else {
            message.error(res.message || '支付失败')
        }
    } catch (e) {
        message.error(e.message || '支付系统异常')
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
  <div class="min-h-screen bg-dark">
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
            <div class="selected-plan-summary p-4 rounded-xl bg-white/5 border border-white/5 mb-6">
                <div class="text-xs text-gray-500 uppercase mb-1">您选择的方案</div>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-white">{{ selectedPlanData.name }}</span>
                    <span class="text-2xl font-black text-indigo-400">{{ selectedPlanData.price }}<span class="text-xs font-normal text-gray-500">{{ selectedPlanData.period }}</span></span>
                </div>
            </div>

            <div class="payment-methods space-y-3 mb-8">
                <div class="method-item active p-4 rounded-xl border-2 border-indigo-500/50 bg-indigo-500/5 flex items-center gap-3">
                   <div class="method-icon bg-indigo-500 text-white p-2 rounded-lg"><CreditCard :size="20" /></div>
                   <div class="flex-1">
                       <div class="font-bold text-sm">支付宝 / 微信支付</div>
                       <div class="text-[10px] text-gray-500">演示环境下自动授权</div>
                   </div>
                   <div class="checked-circle"><Check :size="14" /></div>
                </div>
                <div class="method-item disabled p-4 rounded-xl border border-white/5 bg-white/2 opacity-40 flex items-center gap-3">
                   <div class="method-icon bg-gray-700 text-white p-2 rounded-lg"><Globe :size="20" /></div>
                   <div class="flex-1 text-sm">International Credit Card</div>
                </div>
            </div>

            <div class="security-guarantee mb-6 flex items-center justify-center gap-6">
                <div class="guarantee-item flex items-center gap-1 text-[10px] text-gray-500">
                    <Lock :size="12" /> 高级加密连接
                </div>
                <div class="guarantee-item flex items-center gap-1 text-[10px] text-gray-500">
                    <ShieldCheck :size="12" /> 防范欺诈监控
                </div>
                <div class="guarantee-item flex items-center gap-1 text-[10px] text-gray-500">
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
            <div class="text-center mt-4 opacity-30 text-[9px] text-gray-500 uppercase tracking-widest">
                Protected by learnsphere sentinel · aes-256 standard
            </div>
        </div>
    </n-modal>

    <SiteFooter />
  </div>
</template>

<style scoped>
.section { padding: 80px 0; }
.section-header { margin-bottom: 60px; }
.section-header h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; background: linear-gradient(120deg, #fff, #a5b4fc); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.section-header p { color: #a1a1aa; font-size: 1.125rem; }

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
  height: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.pricing-card:hover {
  transform: translateY(-8px);
  background: rgba(255,255,255,0.05);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
}
.pricing-card.recommended {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.15) 0%, rgba(30, 30, 35, 0.8) 100%);
  border: 1px solid rgba(99, 102, 241, 0.6);
  box-shadow: 0 0 40px -10px rgba(99, 102, 241, 0.4);
  z-index: 1;
}
.recommended-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: #6366f1;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 99px;
}

.plan-header {
  text-align: center;
  margin-bottom: 0;
  padding: 16px 0 8px;
}
.plan-header h3 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: #fff;
  font-weight: 600;
}
.price {
  display: flex;
  justify-content: center;
  align-items: baseline;
  color: #fff;
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
  color: #a1a1aa;
  margin-left: 4px;
}
.quota-badge-text {
    margin-top: 12px;
    display: inline-block;
    background: rgba(255, 255, 255, 0.1);
    color: #a5b4fc;
    font-size: 0.85rem;
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 500;
}

.features-list {
  background: transparent;
  margin: 16px 0 32px;
}

.plan-action {
    margin-top: auto;
}
.action-button {
    font-weight: 600;
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
  .pricing-card {
    padding: 20px 12px;
  }
}

.checkout-modal-bg {
    background: rgba(20, 20, 25, 0.95) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.checkout-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    color: #fff;
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
.checkout-final-btn {
    height: 54px;
    font-size: 1.1rem;
    font-weight: 700;
    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}
</style>
