<script setup>
import { 
  NLayout, NLayoutContent, 
  NGrid, NGridItem, NCard, NButton, NIcon, NList, NListItem 
} from 'naive-ui'
import { Check } from 'lucide-vue-next'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import { useUserStore } from '../stores/user'
import { ref } from 'vue'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const userStore = useUserStore()

// 默认选中季度会员
const activePlan = ref('季度会员')

const handleSelectPlan = (plan) => {
  // 检查是否已经在当前方案
  if (activePlan.value !== plan.name) {
    // 如果不是当前方案，仅切换为选中状态，不触发弹窗
    activePlan.value = plan.name
    return
  }

  // 以下为支付逻辑（仅在已选中的情况下触发）

  // 1. 基础版无需支付
  if (plan.price === '免费') {
    message.info('基础版功能默认对所有用户开放')
    return
  }

  // 2. 检查登录状态
  if (!userStore.token) {
    message.warning('请先登录账号')
    router.push(`/login?redirect=/pricing`)
    return
  }

  // 3. 模拟支付流程
  dialog.success({
    title: '确认订阅 ' + plan.name,
    content: `您选择的是【${plan.name}】，价格为 ${plan.price + plan.period}。\n\n当前为演示模式，点击确定即可模拟支付成功，立即升级您的会员权益。`,
    positiveText: '确认支付',
    negativeText: '取消',
    onPositiveClick: () => {
      message.loading('正在支付...', { duration: 1500 })
      
      setTimeout(() => {
        message.success('支付成功！会员权益已生效')
      }, 1500)
    }
  })
}

const plans = [
  {
    name: '基础版',
    price: '免费',
    period: '永久',
    dailyQuota: '每日 5 次 AI 配额',
    features: [
      '基础词汇学习',
      '标准发音检测',
      '基础学习统计',
      '社区支持'
    ],
    recommended: false, // 保持数据结构，但主要使用 activePlan 控制样式
    highlight: false
  },
  {
    name: '月度会员',
    price: '¥10',
    period: '/月',
    dailyQuota: '每日 50 次 AI 配额',
    features: [
      '包含基础版所有功能',
      'AI 阅读/写作/听力生成',
      'AI 口语评测 & 对话',
      '全真模拟考试',
      '智能错题分析',
      '无广告纯净体验'
    ],
    recommended: false,
    highlight: false
  },
  {
    name: '季度会员',
    price: '¥25',
    period: '/季',
    dailyQuota: '每日 100 次 AI 配额',
    badge: '超值特惠',
    features: [
      '包含月度会员所有功能',
      '季度学习报告',
      '优先客服支持',
      '多设备数据同步'
    ],
    recommended: true,
    highlight: true
  },
  {
    name: '年度会员',
    price: '¥88',
    period: '/年',
    dailyQuota: '每日 200 次 AI 配额',
    badge: '最佳性价比',
    features: [
      '包含所有会员权益',
      '专属备考计划定制',
      '新功能优先体验',
      'VIP 专属徽章'
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
                    @click.stop="handleSelectPlan(plan)"
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
</style>
