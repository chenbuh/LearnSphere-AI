

<template>
  <n-layout class="min-h-screen bg-dark">
    <SiteHeader />

    <n-layout-content>
      <!-- Hero Section -->
      <section class="hero-section">
         <div class="container hero-content">
           <n-grid x-gap="40" y-gap="20" cols="1 800:2" item-responsive responsive="screen">
             <n-grid-item class="hero-text-col">
               <n-space vertical size="large">
                 <div class="badge-container">
                   <n-badge dot type="success" />
                   <span class="badge-text">v2.0 智能升级</span>
                 </div>
                 <h1 class="hero-title">
                   让 AI 重新定义<br>
                   <n-gradient-text type="info">你的英语学习</n-gradient-text>
                 </h1>
                 <p class="hero-subtitle">
                   不再盲目刷题。LearnSphere AI 利用先进的人工智能算法，为您量身定制学习计划，让每一次练习都直击痛点。
                 </p>
                 <n-space size="medium">
                   <n-button type="primary" size="large" class="glow-button" @click="handleMainAction">
                     <template #icon><n-icon :component="Zap" /></template>
                     {{ userStore.token ? '进入学习页面' : '开始免费学习' }}
                   </n-button>
                   <n-button size="large" ghost>
                     <template #icon><n-icon :component="Play" /></template>
                     观看演示
                   </n-button>
                 </n-space>
                 <div class="hero-stats">
                   <div class="stat">
                     <strong>10w+</strong>
                     <span>学员信赖</span>
                   </div>
                   <n-divider vertical />
                   <div class="stat">
                     <strong>95%</strong>
                     <span>提分率</span>
                   </div>
                   <n-divider vertical />
                   <div class="stat">
                     <strong>4.9</strong>
                     <span>用户评分</span>
                   </div>
                 </div>
               </n-space>
             </n-grid-item>
             <n-grid-item class="hero-img-col">
               <div class="hero-visual">
                 <div class="glass-card float-animation">
                   <div class="card-header">
                     <n-avatar round size="small" src="https://ui-avatars.com/api/?name=AI&background=6366f1&color=fff" />
                     <span>AI 学习助手</span>
                   </div>
                   <div class="card-body">
                     <p>检测到您在 "虚拟语气" 模块存在薄弱点，建议为您生成专项强化练习。</p>
                   </div>
                   <div class="card-footer">
                     <n-button size="tiny" type="primary">生成练习</n-button>
                   </div>
                 </div>
                 <div class="circle-gradient"></div>
               </div>
             </n-grid-item>
           </n-grid>
         </div>
      </section>

      <!-- Trusted By Section (New) -->
      <section class="trusted-section">
        <div class="container text-center">
          <p class="trusted-text">深受来自全球顶尖高校学员的信赖</p>
          <div class="logos-wrapper">
             <div class="logo-item">Harvard</div>
             <div class="logo-item">MIT</div>
             <div class="logo-item">Stanford</div>
             <div class="logo-item">Tsinghua</div>
             <div class="logo-item">Peking Univ.</div>
             <div class="logo-item">Yale</div>
          </div>
        </div>
      </section>



      <!-- User Testimonials (New) -->
      <section class="section testimonials-section">
        <div class="container">
          <div class="section-header text-center">
            <h2>听听学员们怎么说</h2>
            <p>他们的成功，也是 LearnSphere 的骄傲</p>
          </div>
          <n-grid x-gap="24" y-gap="24" cols="1 768:3" responsive="screen">
            <n-grid-item>
              <n-card class="testimonial-card">
                <div class="user-profile">
                   <n-avatar src="https://ui-avatars.com/api/?name=Li+Ming&background=random" round />
                   <div class="user-info">
                     <span class="name">李明</span>
                     <span class="title">考研英语 85分</span>
                   </div>
                </div>
                <p class="comment">"以前背单词总是背了忘，LearnSphere 的记忆曲线功能真的太神了，不仅帮我记住了单词，还让我学会了如何在语境中运用。"</p>
                <div class="rating">⭐⭐⭐⭐⭐</div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="testimonial-card">
                 <div class="user-profile">
                   <n-avatar src="https://ui-avatars.com/api/?name=Sarah+Chen&background=random" round />
                   <div class="user-info">
                     <span class="name">Sarah Chen</span>
                     <span class="title">雅思 8.0</span>
                   </div>
                </div>
                <p class="comment">"写作一直是我最头疼的部分，AI 批改功能给了我非常详细的反馈，每一次修改都能看到明显的进步。"</p>
                <div class="rating">⭐⭐⭐⭐⭐</div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="testimonial-card">
                 <div class="user-profile">
                   <n-avatar src="https://ui-avatars.com/api/?name=Wang+Hao&background=random" round />
                   <div class="user-info">
                     <span class="name">王浩</span>
                     <span class="title">CET-6 620分</span>
                   </div>
                </div>
                <p class="comment">"模拟考试环境非常真实，让我提前适应了考试节奏。数据分析帮我精准定位了听力弱项，针对性突击效果显著。"</p>
                <div class="rating">⭐⭐⭐⭐⭐</div>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </section>

      <!-- CTA -->
      <section class="section cta-section">
        <div class="container text-center">
          <h2>准备好开启新的学习旅程了吗？</h2>
          <p>加入数万名学习者，用 AI 提升您的竞争力。</p>
      <n-button type="primary" size="large" class="mt-6 glow-button" @click="handleMainAction">
            {{ userStore.token ? '进入学习页面' : '立即免费注册' }}
          </n-button>
        </div>
      </section>
    </n-layout-content>

    <SiteFooter />
  </n-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NLayout, NLayoutContent, NButton, NSpace, NGradientText, NGrid, NGridItem, 
  NIcon, NAvatar, NBadge, NDivider, NCard
} from 'naive-ui'
import { Zap, Play } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const router = useRouter()
const userStore = useUserStore()

const handleMainAction = () => {
  if (userStore.token) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}

onMounted(() => {
    // Optionally auto-start simulation on intersection or delay
    // startPathSimulation()
})
</script>
<style scoped>
/* Hero */
.hero-section {
  padding: 80px 0 60px;
  position: relative;
  overflow: hidden;
}
.hero-title {
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: 16px;
  font-weight: 800;
}
.hero-subtitle {
  font-size: 1.125rem;
  color: #a1a1aa;
  max-width: 500px;
  line-height: 1.6;
}
.hero-stats {
  margin-top: 32px;
  display: flex;
  align-items: center;
  color: #d4d4d8;
}
.stat strong {
  display: block;
  font-size: 1.25rem;
  color: #fff;
}
.badge-container {
  display: inline-flex;
  align-items: center;
  background: rgba(99, 102, 241, 0.1);
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.875rem;
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.2);
}
.badge-text { margin-left: 8px; }

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.circle-gradient {
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0) 70%);
  filter: blur(40px);
  z-index: 0;
}
.glass-card {
  position: relative;
  z-index: 1;
  background: rgba(30, 30, 35, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 20px;
  width: 320px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-weight: 600;
}
.float-animation {
  animation: float 6s ease-in-out infinite;
}
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

/* Trusted By */
.trusted-section {
    padding: 24px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02);
}
.trusted-text {
    color: #52525b;
    font-size: 0.875rem;
    margin-bottom: 16px;
    letter-spacing: 1px;
    text-transform: uppercase;
}
.logos-wrapper {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
    opacity: 0.5;
}
.logo-item {
    font-weight: 700;
    font-size: 1.25rem;
    color: #a1a1aa;
}



/* Testimonials */
.testimonials-section {
    background: linear-gradient(180deg, rgba(16,16,20,0) 0%, rgba(255,255,255,0.02) 100%);
}
.section-header { margin-bottom: 60px; }
.section-header h2 { font-size: 2rem; margin-bottom: 12px; font-weight: 700; }
.section-header p { color: #a1a1aa; }

.testimonial-card {
    background: rgba(30, 30, 35, 0.5);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 8px;
    height: 100%;
}
.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}
.user-info .name { display: block; font-weight: 600; color: #fff; }
.user-info .title { display: block; font-size: 0.8rem; color: #6366f1; }
.comment { color: #a1a1aa; line-height: 1.6; font-style: italic; margin-bottom: 16px; flex-grow: 1; }
.rating { font-size: 0.875rem; }

/* CTA */
.cta-section {
  padding: 100px 0;
  background: linear-gradient(180deg, rgba(16,16,20,0) 0%, rgba(99,102,241,0.1) 100%);
}
.glow-button {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
  transition: box-shadow 0.3s;
}
.glow-button:hover {
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.8);
}
@media (max-width: 768px) {
  .hero-title { font-size: 2rem; }
  .path-visualizer { transform: scale(0.8); height: 350px; }
}
</style>
