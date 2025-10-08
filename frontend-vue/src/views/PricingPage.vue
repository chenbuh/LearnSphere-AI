<script setup>
import { 
  NLayout, NLayoutContent, 
  NGrid, NGridItem, NCard, NButton, NIcon, NList, NListItem 
} from 'naive-ui'
import { Check } from 'lucide-vue-next'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'

const plans = [
  {
    name: '基础版',
    price: '免费',
    period: '永久',
    features: ['每日 50 个单词上限', '基础语法练习', '标准发音检测', '社区支持'],
    recommended: false
  },
  {
    name: '专业版',
    price: '¥29',
    period: '/月',
    features: ['无限单词学习', '智能错题分析', '全真模拟考试', '写作 AI 批改', '专属客服'],
    recommended: true
  },
  {
    name: '终身版',
    price: '¥299',
    period: '/一次性',
    features: ['包含专业版所有功能', '离线学习模式', '多设备同步', '优先体验新功能', '终身免费更新'],
    recommended: false
  }
]
</script>

<template>
  <n-layout class="min-h-screen bg-dark">
    <SiteHeader />
    
    <n-layout-content>
      <section class="section pricing-section">
        <div class="container">
          <div class="section-header text-center">
            <h2>简单透明的价格方案</h2>
            <p>选择最适合您的学习计划，随时可以升级或取消</p>
          </div>
          
          <div class="pricing-grid">
            <div v-for="(plan, index) in plans" :key="index" class="grid-item">
              <n-card class="pricing-card" :class="{ 'recommended': plan.recommended }">
                <div class="recommended-badge" v-if="plan.recommended">Most Popular</div>
                <div class="plan-header">
                  <h3>{{ plan.name }}</h3>
                  <div class="price">
                    <span class="currency" v-if="plan.price !== '免费'">¥</span>
                    <span class="amount">{{ plan.price.replace('¥', '') }}</span>
                    <span class="period" v-if="plan.period">{{ plan.period }}</span>
                  </div>
                  <p class="description" v-if="plan.name === '基础版'">适合初学者体验</p>
                  <p class="description" v-if="plan.name === '专业版'">适合大多数备考学生</p>
                  <p class="description" v-if="plan.name === '终身版'">一次付费，永久受益</p>
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
                    :type="plan.recommended ? 'primary' : 'default'" 
                    size="large"
                    :secondary="!plan.recommended"
                    class="action-button"
                  >
                    {{ plan.recommended ? '立即订阅' : '选择此方案' }}
                  </n-button>
                </div>
              </n-card>
            </div>
          </div>
        </div>
      </section>
    </n-layout-content>

    <SiteFooter />
  </n-layout>
</template>

<style scoped>
.section { padding: 80px 0; }
.section-header { margin-bottom: 60px; }
.section-header h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 16px; background: linear-gradient(120deg, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-header p { color: #a1a1aa; font-size: 1.125rem; }

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
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
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(30, 30, 35, 0.6) 100%);
  border: 1px solid rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 40px -10px rgba(99, 102, 241, 0.3);
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
  margin-bottom: 16px;
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
    font-size: 1.5rem;
    font-weight: 500;
    margin-right: 2px;
}
.price .amount {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}
.price .period {
  font-size: 1rem;
  color: #a1a1aa;
  margin-left: 4px;
}
.description {
    margin-top: 12px;
    color: #a1a1aa;
    font-size: 0.9rem;
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
</style>
