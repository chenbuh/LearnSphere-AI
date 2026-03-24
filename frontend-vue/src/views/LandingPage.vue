
<template>
  <div class="landing-page min-h-screen bg-dark">
    <SiteHeader />

    <main>
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
                 <n-space size="medium" class="hero-actions">
                   <n-button type="primary" size="large" class="glow-button" @click="handleMainAction">
                     <template #icon><n-icon :component="Zap" /></template>
                     {{ userStore.token ? '进入学习页面' : '开始免费学习' }}
                   </n-button>
                   <n-button size="large" ghost @click="openVideoDemo">
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
    </main>

    <!-- Cinematic AI Demo Modal -->
    <n-modal v-model:show="showVideoModal" :on-after-leave="handleVideoClose" :trap-focus="true" :auto-focus="true">
      <n-card
        style="width: 1100px; max-width: 95vw; background: #020617; border-radius: 24px;"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        content-style="padding: 0; overflow: hidden;"
      >
        <div class="cinematic-demo">
           <!-- 背景流光 -->
           <div class="demo-bg-glow"></div>
           
           <!-- 顶部状态栏 -->
           <div class="demo-top-bar">
              <div class="ai-status">
                 <div class="pulse-dot"></div>
                 <span class="status-text">LearnSphere AI core: <span class="highlight">Active</span></span>
              </div>
              <div class="demo-close" @click="showVideoModal = false">
                 <X :size="20"/>
              </div>
           </div>

           <div class="demo-main-layout">
              <!-- 中央核心演示区 -->
              <div class="demo-stage">
                 <transition name="stage-change" mode="out-in">
                    <!-- 场景 1: AI 核心诊断 -->
                    <div v-if="currentDemoStep === 0" :key="0" class="stage-scene">
                       <div class="ai-brain-viz">
                          <div class="brain-circle core"></div>
                          <div class="brain-circle ring-1"></div>
                          <div class="brain-circle ring-2"></div>
                          <Brain :size="80" class="brain-icon-float" />
                       </div>
                       <div class="diagnosis-report">
                          <div class="report-line" v-for="(line, i) in diagnosisLines" :key="i">
                             <div class="line-dot" :class="{ danger: line.val < 50 }"></div>
                             <span class="line-label">{{ line.label }}</span>
                             <div class="line-track">
                                <div class="line-fill" :style="{ width: line.val + '%', background: line.color }"></div>
                             </div>
                             <span class="line-val">{{ line.val }}%</span>
                          </div>
                       </div>
                       <div class="ai-alert-card">
                          <Zap :size="24" color="#fbbf24" />
                          <div class="alert-content">
                             <h4>发现学习断层</h4>
                             <p>你在“关系代词”理解上存在系统性偏差，建议执行第 142 号补强计划。</p>
                          </div>
                       </div>
                    </div>

                    <!-- 场景 2: 沉浸式单词记忆 -->
                    <div v-else-if="currentDemoStep === 1" :key="1" class="stage-scene">
                       <div class="neon-flashcard">
                          <div class="card-inner">
                             <h1 class="vocab-word">Empowerment</h1>
                             <div class="vocab-meta">
                                <span class="tag">IELTS</span>
                                <span class="tag">高级</span>
                             </div>
                             <div class="vocab-sound">
                                <Volume2 :size="32" />
                                <div class="sound-wave">
                                   <span></span><span></span><span></span><span></span>
                                </div>
                             </div>
                             <div class="vocab-sentence">
                                "Education is the key to female <span class="highlight">empowerment</span>."
                             </div>
                          </div>
                       </div>
                    </div>

                    <!-- 场景 3: 实时分析看板 -->
                    <div v-else-if="currentDemoStep === 2" :key="2" class="stage-scene">
                       <div class="analytics-dashboard">
                          <div class="dashboard-grid">
                             <div class="dash-item" v-for="item in dashStats" :key="item.label">
                                <div class="dash-val" :style="{ color: item.color }">{{ item.val }}</div>
                                <div class="dash-label">{{ item.label }}</div>
                                <div class="dash-chart">
                                   <div v-for="h in item.bars" :style="{ height: h + 'px', background: item.color + 'aa' }"></div>
                                </div>
                             </div>
                          </div>
                          <div class="achievement-toast">
                             <Award :size="32" color="#10b981" />
                             <div class="toast-text">
                                <strong>连续学习 14 天</strong>
                                <p>超越了全站 92% 的用户</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </transition>
              </div>

              <!-- 右侧控制指令堆栈 -->
              <div class="demo-controls-stack">
                 <div class="stack-header">学习指令集</div>
                 <div 
                   v-for="(step, index) in demoSteps" 
                   :key="index" 
                   class="stack-item"
                   :class="{ active: currentDemoStep === index }"
                   @click="currentDemoStep = index"
                 >
                    <div class="item-title">{{ step.title }}</div>
                    <div class="item-desc">{{ step.subtitle }}</div>
                    <div class="item-progress" v-if="currentDemoStep === index">
                       <div class="progress-bar"></div>
                    </div>
                 </div>
                 
                 <n-button secondary round type="primary" class="demo-cta" @click="handleMainAction">
                    立即体验完整版
                 </n-button>
              </div>
           </div>
        </div>
      </n-card>
    </n-modal>

    <SiteFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NButton, NSpace, NGradientText, NGrid, NGridItem, 
  NIcon, NAvatar, NBadge, NDivider, NCard, NModal
} from 'naive-ui'
import { Zap, Play, X, Brain, Volume2, Award } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'


// State
const router = useRouter()
const userStore = useUserStore()
const showVideoModal = ref(false)

const handleMainAction = () => {
  if (userStore.token) {
    router.push('/app/dashboard')
  } else {
    router.push({
      path: '/login',
      query: {
        mode: 'register'
      }
    })
  }
}

// Demo Tour State
const currentDemoStep = ref(0)
const demoSteps = [
  { title: 'Neural Diagnose', subtitle: 'AI 神经网络全维度诊断弱项' },
  { title: 'Smart Mastery', subtitle: '艾宾浩斯记忆曲线动态适配' },
  { title: 'Data Analytics', subtitle: '可视化学习进度与能力图谱' }
]

const diagnosisLines = [
  { label: '语法结构', val: 42, color: '#ef4444' },
  { label: '词汇储备', val: 88, color: '#10b981' },
  { label: '听力感知', val: 65, color: '#6366f1' },
  { label: '逻辑表达', val: 30, color: '#ef4444' }
]

const dashStats = [
  { label: '正确率', val: '94%', color: '#10b981', bars: [20, 30, 45, 60, 50, 70] },
  { label: '掌握词汇', val: '1,248', color: '#6366f1', bars: [10, 25, 40, 35, 55, 80] },
  { label: '专注时长', val: '32h', color: '#fbbf24', bars: [30, 40, 20, 50, 40, 60] }
]

const openVideoDemo = () => {
  showVideoModal.value = true
  startAutoPlay()
}

let autoPlayTimer = null
const startAutoPlay = () => {
   if(autoPlayTimer) clearInterval(autoPlayTimer)
   autoPlayTimer = setInterval(() => {
      if(currentDemoStep.value < demoSteps.length -1) {
         currentDemoStep.value++
      } else {
         currentDemoStep.value = 0
      }
   }, 5000)
}

const handleVideoClose = () => {
    currentDemoStep.value = 0
    if(autoPlayTimer) clearInterval(autoPlayTimer)
}

onMounted(() => {
  // 不再自动跳转，让用户留在首页
})
</script>


<style scoped>
.landing-page {
  color: var(--text-color);
  background:
    radial-gradient(circle at 14% 12%, rgba(99, 102, 241, 0.1), transparent 26%),
    radial-gradient(circle at 84% 18%, rgba(56, 189, 248, 0.08), transparent 22%),
    var(--bg-color);
}

/* Hero */
.hero-section {
  padding: 84px 0 72px;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(99, 102, 241, 0.16), transparent 28%),
    radial-gradient(circle at 78% 30%, rgba(59, 130, 246, 0.12), transparent 24%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: clamp(3rem, 6vw, 4.8rem);
  line-height: 1.02;
  margin: 0;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: var(--text-color);
}
.hero-subtitle {
  font-size: 1.125rem;
  color: var(--secondary-text);
  max-width: 560px;
  line-height: 1.75;
}
.hero-actions {
  align-items: center;
  flex-wrap: wrap;
}
.hero-stats {
  margin-top: 32px;
  display: inline-flex;
  align-items: center;
  color: var(--secondary-text);
  gap: 24px;
  padding: 18px 20px;
  border-radius: 22px;
  background: var(--surface-muted);
  border: 1px solid var(--glass-border);
  box-shadow: 0 18px 40px var(--shadow-color);
  backdrop-filter: blur(18px);
}
.hero-stats :deep(.n-divider.n-divider--vertical) {
  height: 36px;
  background-color: var(--card-border);
}
.stat strong {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-color);
}
.stat span {
  font-size: 0.875rem;
  color: var(--secondary-text);
}
.badge-container {
  display: inline-flex;
  align-items: center;
  background: var(--accent-fill);
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.875rem;
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.16);
  box-shadow: 0 10px 26px rgba(99, 102, 241, 0.12);
  backdrop-filter: blur(18px);
}
.badge-text { margin-left: 8px; }

/* Responsive Grid Adjustments */
@media (max-width: 800px) {
  .hero-section { padding: 48px 0 24px; }
  .hero-text-col { text-align: center; display: flex; flex-direction: column; align-items: center; }
  .hero-subtitle { margin: 0 auto; }
  .hero-actions { justify-content: center; width: 100%; }
  .hero-stats { justify-content: center; width: 100%; gap: 12px; }
  .hero-visual { height: 320px; margin-top: 40px; }
  .glass-card { width: 90%; max-width: 320px; }
}

@media (max-width: 480px) {
  .hero-actions { flex-direction: column; align-items: stretch; gap: 12px !important; width: 100%; }
  .hero-actions > * { margin: 0 !important; }
  .hero-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stat strong { font-size: 1.1rem; }
  .stat span { font-size: 0.75rem; }
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 440px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.circle-gradient {
  position: absolute;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(99,102,241,0.26) 0%, rgba(99,102,241,0.08) 46%, rgba(99,102,241,0) 72%);
  filter: blur(28px);
  z-index: 0;
}
.glass-card {
  position: relative;
  z-index: 1;
  background: var(--glass-bg);
  backdrop-filter: blur(22px);
  border: 1px solid var(--glass-border);
  padding: 24px;
  border-radius: 24px;
  width: 340px;
  box-shadow: 0 24px 60px var(--shadow-color);
  color: var(--text-color);
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--text-color);
}
.card-body p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.75;
}
.card-footer {
  margin-top: 18px;
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
    padding: 28px 0 34px;
    border-bottom: 1px solid var(--card-border);
    background: rgba(255,255,255,0.02);
}
.trusted-text {
    color: var(--secondary-text);
    font-size: 0.875rem;
    margin-bottom: 16px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}
.logos-wrapper {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
    opacity: 0.62;
}
.logo-item {
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--text-color);
}



/* Testimonials */
.testimonials-section {
    background: linear-gradient(180deg, rgba(16,16,20,0) 0%, rgba(99,102,241,0.06) 100%);
}
.section-header { margin-bottom: 60px; }
.section-header h2 { font-size: 2rem; margin-bottom: 12px; font-weight: 700; color: var(--text-color); }
.section-header p { color: var(--secondary-text); }

.testimonial-card {
    background: var(--surface-raised);
    border: 1px solid var(--glass-border);
    padding: 8px;
    height: 100%;
    box-shadow: 0 22px 46px var(--shadow-color);
    backdrop-filter: blur(18px);
    display: flex;
    flex-direction: column;
}
.user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}
.user-info .name { display: block; font-weight: 600; color: var(--text-color); }
.user-info .title { display: block; font-size: 0.8rem; color: #6366f1; }
.comment { color: var(--secondary-text); line-height: 1.7; font-style: italic; margin-bottom: 16px; flex-grow: 1; }
.rating { font-size: 0.875rem; }

/* CTA */
.cta-section {
  padding: 100px 0;
  background: linear-gradient(180deg, rgba(16,16,20,0) 0%, rgba(99,102,241,0.1) 100%);
}
.cta-section h2 {
  color: var(--text-color);
}
.cta-section p {
  color: var(--secondary-text);
}
.glow-button {
  box-shadow: 0 18px 36px rgba(99, 102, 241, 0.22);
  transition: box-shadow 0.3s, transform 0.3s;
}
.glow-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 24px 46px rgba(99, 102, 241, 0.3);
}

:global(html[data-theme='light'] .landing-page) {
  background:
    radial-gradient(circle at 12% 10%, rgba(99, 102, 241, 0.14), transparent 24%),
    radial-gradient(circle at 82% 16%, rgba(56, 189, 248, 0.12), transparent 22%),
    linear-gradient(180deg, #f8fbff 0%, #f4f7fb 42%, #eef2ff 100%);
}

:global(html[data-theme='light'] .hero-stats) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 250, 252, 0.94));
  border-color: rgba(148, 163, 184, 0.22);
  box-shadow: 0 22px 46px rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .glass-card) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(248, 250, 252, 0.92));
  border-color: rgba(148, 163, 184, 0.24);
  box-shadow: 0 28px 60px rgba(148, 163, 184, 0.22);
}

:global(html[data-theme='light'] .circle-gradient) {
  background: radial-gradient(circle, rgba(99,102,241,0.24) 0%, rgba(59,130,246,0.08) 44%, rgba(99,102,241,0) 72%);
}

:global(html[data-theme='light'] .trusted-section) {
  background: linear-gradient(180deg, rgba(255,255,255,0.52), rgba(248,250,252,0.72));
}

:global(html[data-theme='light'] .logo-item) {
  color: #475569;
  opacity: 0.78;
}

:global(html[data-theme='light'] .testimonial-card) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.96));
  border-color: rgba(203, 213, 225, 0.72);
  box-shadow: 0 20px 42px rgba(148, 163, 184, 0.14);
}

:global(html[data-theme='light'] .cta-section) {
  background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(99,102,241,0.1) 100%);
}

:global(html[data-theme='light'] .glow-button) {
  box-shadow: 0 18px 38px rgba(99, 102, 241, 0.24);
}
@media (max-width: 768px) {
  .hero-title { font-size: 2rem; line-height: 1.3; }
  .hero-subtitle { font-size: 1rem; }
  .section { padding: 48px 0; }
  .section-header { margin-bottom: 40px; }
  .section-header h2 { font-size: 1.75rem; }
  .section-header p { font-size: 1rem; }
  .logos-wrapper { gap: 20px; }
  .testimonial-card { margin-bottom: 16px; }
  .cta-section { padding: 60px 0; }
  .cta-section h2 { font-size: 1.75rem; }
  
  /* 优化 Cinematic Demo */
  .cinematic-demo { height: auto; min-height: 400px; }
  .demo-main-layout { flex-direction: column; }
  .demo-controls-stack { width: 100%; border-left: none; border-top: 1px solid rgba(255,255,255,0.05); padding: 20px; }
  .demo-stage { padding: 20px; }
}

@media (max-width: 480px) {
  .container { padding: 0 16px; }
  .hero-title { font-size: 1.75rem; }
  .hero-subtitle { font-size: 0.9rem; }
  .badge-container { font-size: 0.75rem; padding: 3px 10px; }
  .section-header h2 { font-size: 1.5rem; }
  .cta-section h2 { font-size: 1.5rem; }
  .glass-card { padding: 20px; }
}

/* Cinematic Demo Styles */
.cinematic-demo {
  position: relative;
  height: 650px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #f8fafc;
}

.demo-bg-glow {
  position: absolute;
  top: -20%; left: -10%; right: -10%; bottom: -20%;
  background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
  filter: blur(80px);
  z-index: 0;
}

.demo-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 10;
}

.ai-status { display: flex; align-items: center; gap: 12px; }
.pulse-dot {
  width: 8px; height: 8px; background: #10b981; border-radius: 50%;
  box-shadow: 0 0 12px #10b981;
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
.status-text { font-family: monospace; font-size: 0.9rem; color: #94a3b8; }
.highlight { color: #6366f1; font-weight: bold; }
.demo-close { cursor: pointer; opacity: 0.6; transition: 0.3s; }
.demo-close:hover { opacity: 1; transform: rotate(90deg); }

.demo-main-layout { display: flex; flex: 1; z-index: 1; position: relative; }

.demo-stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }

/* Scene 1: Brain Viz */
.ai-brain-viz { position: relative; width: 150px; height: 150px; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; }
.brain-circle { position: absolute; border: 2px solid rgba(99, 102, 241, 0.2); border-radius: 50%; }
.core { width: 100px; height: 100px; background: rgba(99, 102, 241, 0.1); border-color: #6366f1; }
.ring-1 { width: 180px; height: 180px; animation: rotate 10s linear infinite; border-style: dashed; }
.ring-2 { width: 240px; height: 240px; animation: rotate 15s linear reverse infinite; opacity: 0.3; }
.brain-icon-float { color: #6366f1; filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.8)); animation: float 3s ease-in-out infinite; }

.diagnosis-report { width: 100%; max-width: 350px; display: flex; flex-direction: column; gap: 16px; margin-left: 60px; }
.report-line { display: flex; align-items: center; gap: 12px; }
.line-dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
.line-dot.danger { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
.line-label { width: 80px; font-size: 0.85rem; color: #94a3b8; }
.line-track { flex: 1; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
.line-fill { height: 100%; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
.line-val { font-family: monospace; width: 40px; text-align: right; font-size: 0.85rem; }

.ai-alert-card {
  position: absolute; bottom: 40px; left: 40px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 16px 20px; border-radius: 16px;
  display: flex; gap: 16px; align-items: center;
  backdrop-filter: blur(10px);
  animation: slide-up 0.5s ease-out;
}
@keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.alert-content h4 { margin: 0; color: #fbbf24; font-size: 0.9rem; }
.alert-content p { margin: 4px 0 0; font-size: 0.8rem; color: #d4d4d8; }

/* Scene 2: Neon Flashcard */
.neon-flashcard {
  width: 450px; padding: 40px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 32px;
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.15);
  position: relative; overflow: hidden;
}
.neon-flashcard::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #6366f1, transparent);
  animation: scan-line 2s linear infinite;
}
@keyframes scan-line { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
.vocab-word { font-size: 3.5rem; font-weight: 800; margin: 0; letter-spacing: -2px; }
.vocab-meta { display: flex; gap: 10px; margin: 20px 0; }
.tag { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; color: #818cf8; }
.vocab-sound { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; color: #6366f1; }
.sound-wave { display: flex; align-items: center; gap: 4px; height: 32px; }
.sound-wave span { width: 3px; background: #6366f1; border-radius: 2px; animation: wave 1s infinite; }
.sound-wave span:nth-child(1) { height: 12px; animation-delay: 0s; }
.sound-wave span:nth-child(2) { height: 24px; animation-delay: 0.2s; }
.sound-wave span:nth-child(3) { height: 18px; animation-delay: 0.4s; }
.sound-wave span:nth-child(4) { height: 14px; animation-delay: 0.6s; }
@keyframes wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
.vocab-sentence { font-size: 1.1rem; color: #94a3b8; line-height: 1.6; }

/* Scene 3: Dashboard */
.analytics-dashboard { width: 100%; max-width: 600px; }
.dashboard-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.dash-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 24px; border-radius: 20px; transition: 0.3s; }
.dash-item:hover { transform: translateY(-5px); background: rgba(255,255,255,0.05); }
.dash-val { font-size: 1.75rem; font-weight: bold; margin-bottom: 8px; }
.dash-label { font-size: 0.8rem; color: #64748b; margin-bottom: 16px; }
.dash-chart { display: flex; gap: 4px; align-items: flex-end; height: 40px; }
.dash-chart div { flex: 1; border-radius: 2px; }

.achievement-toast {
  margin-top: 40px; background: #064e3b; border: 1px solid #10b981;
  padding: 16px 24px; border-radius: 20px; display: flex; gap: 20px; align-items: center;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
}
.toast-text strong { display: block; color: #10b981; }
.toast-text p { margin: 0; font-size: 0.85rem; color: #a7f3d0; }

/* Right Controls Stack */
.demo-controls-stack {
  width: 320px; background: rgba(255, 255, 255, 0.02);
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px; display: flex; flex-direction: column; gap: 16px;
}
.stack-header { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
.stack-item {
  padding: 20px; border-radius: 16px; background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent; cursor: pointer; transition: 0.3s;
}
.stack-item:hover { background: rgba(255, 255, 255, 0.05); }
.stack-item.active { background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.3); }
.item-title { font-weight: bold; font-size: 0.95rem; margin-bottom: 4px; }
.item-desc { font-size: 0.75rem; color: #64748b; line-height: 1.4; }
.item-progress { margin-top: 12px; height: 2px; background: rgba(255,255,255,0.05); }
.progress-bar { height: 100%; background: #6366f1; animation: bar-load 5s linear infinite; }
@keyframes bar-load { from { width: 0; } to { width: 100%; } }

.demo-cta { margin-top: auto; padding: 24px; font-weight: bold; }

/* Transitions */
.stage-change-enter-active, .stage-change-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.stage-change-enter-from { opacity: 0; transform: translateX(30px) scale(0.95); }
.stage-change-leave-to { opacity: 0; transform: translateX(-30px) scale(1.05); }

@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .demo-main-layout { flex-direction: column; }
  .demo-controls-stack { width: 100%; border-left: none; border-top: 1px solid rgba(255,255,255,0.05); }
  .cinematic-demo { height: auto; max-height: 90vh; overflow-y: auto; }
}

/* Leaderboard Section Styles */
.leaderboard-section {
  background: radial-gradient(circle at 10% 90%, rgba(99, 102, 241, 0.05) 0%, transparent 40%);
}
.top-three-showcase {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.top-user-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  transition: 0.3s;
}
.top-user-card:hover {
  transform: translateX(10px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(99, 102, 241, 0.3);
}
.crown-box {
  position: absolute;
  top: -12px;
  left: 20px;
  background: #1e1e22;
  border-radius: 50%;
  padding: 4px;
}
.medal-1 { color: #fbbf24; filter: drop-shadow(0 0 8px #fbbf24); }
.medal-2 { color: #94a3b8; filter: drop-shadow(0 0 8px #94a3b8); }
.medal-3 { color: #b45309; filter: drop-shadow(0 0 8px #b45309); }

.rank-1 { border-left: 4px solid #fbbf24; }
.rank-2 { border-left: 4px solid #94a3b8; }
.rank-3 { border-left: 4px solid #b45309; }

.top-avatar { border: 2px solid rgba(255,255,255,0.1); }
.top-name { font-size: 1.2rem; color: #fff; }

.mini-rank-list {
  background: rgba(255, 255, 255, 0.02) !important;
  border-radius: 24px !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
}
.rank-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.rank-item:last-child { border-bottom: none; }
.rank-num { width: 24px; color: #64748b; font-family: monospace; font-size: 1rem; }
.rank-name { color: #d4d4d8; font-weight: 500; }

@media (max-width: 768px) {
  .hero-section {
    padding: 28px 0 14px !important;
  }

  .hero-text-col :deep(.n-space) {
    gap: 18px !important;
  }

  .hero-title {
    font-size: 1.96rem !important;
    line-height: 1.08 !important;
  }

  .hero-subtitle {
    max-width: 34rem;
    font-size: 0.95rem !important;
    line-height: 1.62 !important;
  }

  .hero-actions {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px !important;
    width: 100%;
  }

  .hero-actions > * {
    margin: 0 !important;
    width: 100%;
  }

  .hero-actions :deep(.n-space-item) {
    width: 100%;
  }

  .hero-actions :deep(.n-button) {
    width: 100%;
    height: 44px;
    border-radius: 14px;
    font-size: 0.95rem;
  }

  .hero-stats {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    width: 100%;
    gap: 8px !important;
    margin-top: 16px;
    padding: 14px 12px;
    border-radius: 20px;
  }

  .hero-stats :deep(.n-divider.n-divider--vertical) {
    display: none !important;
  }

  .stat {
    min-width: 0;
    text-align: center;
  }

  .stat strong {
    font-size: 1.08rem;
  }

  .stat span {
    font-size: 0.72rem;
    line-height: 1.3;
  }

  .hero-visual {
    height: 172px;
    margin-top: 14px !important;
    align-items: flex-start;
  }

  .circle-gradient {
    width: 270px;
    height: 270px;
    filter: blur(22px);
  }

  .glass-card {
    width: min(100%, 316px) !important;
    max-width: 316px;
    padding: 16px;
    border-radius: 20px;
  }

  .card-header {
    gap: 10px;
    margin-bottom: 10px;
  }

  .card-header span {
    font-size: 0.96rem;
  }

  .card-body p {
    font-size: 0.86rem;
    line-height: 1.6;
  }

  .card-footer {
    margin-top: 12px;
  }

  .float-animation {
    animation: none;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 20px 0 10px !important;
  }

  .hero-text-col :deep(.n-space) {
    gap: 16px !important;
  }

  .hero-title {
    font-size: 1.72rem !important;
  }

  .hero-subtitle {
    font-size: 0.88rem !important;
    line-height: 1.55 !important;
  }

  .badge-container {
    padding: 4px 10px;
    font-size: 0.72rem;
  }

  .hero-stats {
    padding: 12px 10px;
  }

  .hero-visual {
    height: 146px;
    margin-top: 10px !important;
  }

  .glass-card {
    width: 100% !important;
    max-width: none;
    padding: 14px;
    border-radius: 18px;
  }

  .card-body p {
    font-size: 0.8rem;
  }
}

@media (max-width: 430px) {
  .hero-section {
    padding: 16px 0 8px !important;
  }

  .hero-text-col :deep(.n-space) {
    gap: 14px !important;
  }

  .hero-title {
    font-size: 1.58rem !important;
    line-height: 1.06 !important;
  }

  .hero-subtitle {
    max-width: 100%;
    font-size: 0.84rem !important;
    line-height: 1.48 !important;
  }

  .badge-container {
    padding: 4px 9px;
    font-size: 0.68rem;
  }

  .hero-actions {
    gap: 8px !important;
  }

  .hero-actions :deep(.n-button) {
    height: 42px;
    border-radius: 12px;
    font-size: 0.88rem;
  }

  .hero-stats {
    margin-top: 12px;
    gap: 6px !important;
    padding: 10px 8px;
    border-radius: 18px;
  }

  .stat strong {
    font-size: 0.98rem;
  }

  .stat span {
    font-size: 0.68rem;
    line-height: 1.22;
  }

  .hero-visual {
    height: 122px;
    margin-top: 8px !important;
  }

  .circle-gradient {
    width: 220px;
    height: 220px;
    filter: blur(18px);
  }

  .glass-card {
    width: min(100%, 292px) !important;
    padding: 12px;
    border-radius: 16px;
  }

  .card-header {
    gap: 8px;
    margin-bottom: 8px;
  }

  .card-header span {
    font-size: 0.88rem;
  }

  .card-body p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    font-size: 0.76rem;
    line-height: 1.42;
  }

  .card-footer {
    margin-top: 10px;
  }

  .card-footer :deep(.n-button) {
    height: 28px;
    padding: 0 10px;
    border-radius: 10px;
    font-size: 0.74rem;
  }
}

@media (max-width: 360px) {
  .hero-actions {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 1.6rem !important;
  }

  .hero-visual {
    height: 108px;
  }

  .glass-card {
    width: 100% !important;
    padding: 11px;
  }

  .hero-stats {
    padding: 9px 7px;
  }

  .stat strong {
    font-size: 0.92rem;
  }

  .stat span {
    font-size: 0.64rem;
  }
}
</style>
