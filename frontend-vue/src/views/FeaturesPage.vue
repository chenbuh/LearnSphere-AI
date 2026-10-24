<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NButton, NAvatar, NTag } from 'naive-ui'
import {
  Brain,
  Target,
  BarChart2,
  Check,
  Search,
  Zap,
  AlertCircle,
  CheckCircle2,
  Play,
  Activity,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Bot,
  Compass,
  ShieldCheck,
  Flame,
  Layers,
  Cpu,
  Volume2,
  FileText,
  CheckCircle
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const router = useRouter()
const userStore = useUserStore()

// State
const aiStep = ref(0)
const simStep = ref(0)
const isSimulating = ref(false)
const chartStep = ref(0)
const isCharting = ref(false)
const tutorStep = ref(0)
let timer = null

// 平滑锚点跳转
const scrollToSection = sectionId => {
  const el = document.getElementById(sectionId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleStartLearning = () => {
  if (userStore.token) {
    router.push('/app/dashboard')
  } else {
    router.push({ path: '/login', query: { mode: 'register' } })
  }
}

// 仿真演练 1：自适应学习路径
const startPathSimulation = () => {
  if (isSimulating.value) return
  isSimulating.value = true
  simStep.value = 0
  const steps = [
    { time: 500, step: 1 },
    { time: 1500, step: 2 },
    { time: 2500, step: 3 },
    { time: 3500, step: 4 },
    { time: 4500, step: 5 },
    { time: 5500, step: 6 }
  ]
  let totalTime = 0
  steps.forEach(({ time, step }) => {
    setTimeout(() => {
      simStep.value = step
    }, time)
    totalTime = Math.max(totalTime, time)
  })
  setTimeout(() => {
    isSimulating.value = false
  }, totalTime + 500)
}

// 仿真演练 2：多维数据看板
const startChartSimulation = () => {
  if (isCharting.value) return
  isCharting.value = true
  chartStep.value = 0
  const steps = [
    { time: 500, step: 1 },
    { time: 1000, step: 2 },
    { time: 1500, step: 3 },
    { time: 2000, step: 4 },
    { time: 2500, step: 5 }
  ]
  let totalTime = 0
  steps.forEach(({ time, step }) => {
    setTimeout(() => {
      chartStep.value = step
    }, time)
    totalTime = Math.max(totalTime, time)
  })
  setTimeout(() => {
    isCharting.value = false
  }, totalTime + 500)
}

onMounted(() => {
  timer = setInterval(() => {
    aiStep.value = (aiStep.value + 1) % 3
  }, 4000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="features-page min-h-screen">
    <SiteHeader />

    <main>
      <!-- ==================== 1. Features Hero 展厅头部看板 ==================== -->
      <section class="features-hero-section">
        <div class="features-container">
          <div class="hero-center-deck">
            <!-- 顶部 Kicker 胶囊 -->
            <div class="features-kicker-pill">
              <span class="kicker-pulse-dot"></span>
              <span class="kicker-text">NEXT-GEN ARCHITECTURE · 新一代认知科学提分体系</span>
            </div>

            <!-- 渐变科技大标题 -->
            <h1 class="features-hero-title">
              为什么选择 <span class="title-gradient">LearnSphere?</span>
            </h1>

            <!-- 导语 -->
            <p class="features-hero-subtitle">
              深度融合认知语言学模型与前沿 AI
              推理算法，打造集“智能诊断、自适应路径、全维战力看板、1V1
              母语导师”于一体的极致备考体验。
            </p>

            <!-- 4 大核心特性快速定位锚点导航胶囊群 -->
            <div class="features-anchor-bar">
              <button class="anchor-pill is-cyan" @click="scrollToSection('feature-recommend')">
                <Brain :size="16" />
                <span>智能推荐引擎</span>
              </button>
              <button class="anchor-pill is-emerald" @click="scrollToSection('feature-path')">
                <Target :size="16" />
                <span>自适应学习路径</span>
              </button>
              <button class="anchor-pill is-amber" @click="scrollToSection('feature-analytics')">
                <BarChart2 :size="16" />
                <span>多维数据看板</span>
              </button>
              <button class="anchor-pill is-indigo" @click="scrollToSection('feature-tutor')">
                <Bot :size="16" />
                <span>AI 母语导师 1V1</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ==================== 2. 四大核心功能交错展厅 ==================== -->
      <section class="features-content-section">
        <div class="features-container">
          <div class="features-list">
            <!-- Feature 1: AI 智能推荐引擎 -->
            <div id="feature-recommend" class="feature-row scroll-mt">
              <div class="feature-content">
                <div class="feature-icon-badge is-cyan">
                  <Brain :size="28" />
                </div>
                <div class="feature-badge-row">
                  <span class="category-tag cyan">NEURAL DIAGNOSTICS</span>
                  <span class="metric-pill">提分效率提升 300%</span>
                </div>
                <h3>AI 智能推荐与认知诊断引擎</h3>
                <p>
                  告别题海战术。我们的 AI
                  引擎实时分析您的每一次答题轨迹，动态重构个人知识图谱。精准切入薄弱断层，为您精准推送最具提分价值的专项训练题组。
                </p>

                <div class="ai-points-list">
                  <div class="point-item">
                    <div class="check-box cyan"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>实时薄弱点捕获</strong>
                      <span>基于答题耗时与错误题型特征，毫秒级定位未掌握知识点</span>
                    </div>
                  </div>
                  <div class="point-item">
                    <div class="check-box cyan"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>动态难度自适应调整</strong>
                      <span>根据当前心流状态智能增减考点难度，避免挫败感与无效复习</span>
                    </div>
                  </div>
                  <div class="point-item">
                    <div class="check-box cyan"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>艾宾浩斯抗遗忘追踪</strong>
                      <span>根据动态遗忘曲线在临界点发起闪击复习，稳固长时记忆</span>
                    </div>
                  </div>
                </div>

                <div class="feature-cta-row">
                  <button class="feature-action-btn primary cyan" @click="handleStartLearning">
                    <span>立即体验智能推荐</span>
                    <ArrowRight :size="15" />
                  </button>
                </div>
              </div>

              <!-- 右侧：高科技 AI 智能演练舱 -->
              <div class="feature-visual">
                <div class="visual-card is-cyan">
                  <div class="ai-cockpit-console">
                    <!-- 控制台顶栏 -->
                    <div class="console-top-strip">
                      <div class="console-status">
                        <span class="status-pulse-dot"></span>
                        <span class="console-engine-label">AI Engine Active · 实时扫描</span>
                      </div>
                      <div class="console-mode-tag">CEFR Benchmark v2.4</div>
                    </div>

                    <!-- 交互主视口 -->
                    <div class="console-main-view">
                      <!-- 阶段 1：神经扫描 -->
                      <div v-if="aiStep === 0" key="scanning" class="console-stage animate-fade">
                        <div class="radar-scan-box">
                          <div class="radar-circle ring-outer"></div>
                          <div class="radar-circle ring-inner"></div>
                          <div class="radar-sweep"></div>
                          <Brain :size="36" class="radar-core-icon" />
                        </div>
                        <h4 class="stage-title">正在实时扫描近期作答盲区...</h4>
                        <div class="stream-data-grid">
                          <div class="data-chip">
                            <span class="chip-label">综合正确率</span>
                            <span class="chip-val text-cyan">78.5%</span>
                          </div>
                          <div class="data-chip">
                            <span class="chip-label">今日训练耗时</span>
                            <span class="chip-val text-emerald">45 min</span>
                          </div>
                          <div class="data-chip">
                            <span class="chip-label">核心词量覆盖</span>
                            <span class="chip-val text-amber">1,240 词</span>
                          </div>
                        </div>
                      </div>

                      <!-- 阶段 2：发现薄弱断层 -->
                      <div
                        v-else-if="aiStep === 1"
                        key="detection"
                        class="console-stage animate-fade"
                      >
                        <div class="alert-pulse-badge">
                          <AlertCircle :size="38" class="text-rose animate-bounce" />
                        </div>
                        <h4 class="stage-title text-rose">精准锁定学习断层</h4>
                        <div class="weak-point-card">
                          <div class="weak-head">
                            <span class="weak-name">语法专项 · 虚拟语气与倒装</span>
                            <span class="weak-score">掌握度: 42% (需强化)</span>
                          </div>
                          <div class="weak-track">
                            <div class="weak-bar" style="width: 42%"></div>
                          </div>
                          <p class="weak-desc">
                            系统检测到连续 3 次在混合条件句倒装结构中失分，建议针对性突击。
                          </p>
                        </div>
                      </div>

                      <!-- 阶段 3：推荐强化题组 -->
                      <div v-else key="recommendation" class="console-stage animate-fade">
                        <div class="rec-solution-card">
                          <div class="rec-solution-badge">
                            <Sparkles :size="14" />
                            <span>AI 智能提分方案已生成</span>
                          </div>
                          <h4 class="rec-title">虚拟语气与倒装 · 黄金真题突击</h4>
                          <div class="rec-metrics-row">
                            <span class="metric-badge">15 道真题定向训练</span>
                            <span class="metric-badge highlight">+8~12 分预期增长</span>
                          </div>
                          <button class="rec-start-btn" @click="handleStartLearning">
                            <span>立即进入强化训练</span>
                            <ArrowRight :size="14" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- 底部 3 阶段切换导航胶囊 -->
                    <div class="console-timeline-bar">
                      <button
                        v-for="(st, idx) in ['神经扫描', '盲区锁定', '靶向推荐']"
                        :key="idx"
                        class="timeline-step-btn"
                        :class="{ active: aiStep === idx }"
                        @click="aiStep = idx"
                      >
                        <span class="step-num">{{ idx + 1 }}</span>
                        <span>{{ st }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 2: 自适应学习路径 (左右反转) -->
            <div id="feature-path" class="feature-row reverse scroll-mt">
              <div class="feature-content">
                <div class="feature-icon-badge is-emerald">
                  <Target :size="28" />
                </div>
                <div class="feature-badge-row">
                  <span class="category-tag emerald">DYNAMIC PATHFINDING</span>
                  <span class="metric-pill">定制化学习大纲</span>
                </div>
                <h3>全真动态自适应学习路径</h3>
                <p>
                  每个人的知识图谱都是独一无二的。LearnSphere
                  告别线性死板的教学大纲，根据您的做题表现实时动态分支演算，无论是短期冲刺还是长线突破，始终为您开辟最高效的提分快车道。
                </p>

                <div class="ai-points-list">
                  <div class="point-item">
                    <div class="check-box emerald"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>前置能力水平精准定标</strong>
                      <span>动态校准词汇、听力、语法综合战力底色</span>
                    </div>
                  </div>
                  <div class="point-item">
                    <div class="check-box emerald"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>智能拓扑路径分流分支</strong>
                      <span>遇强出高阶考点，遇弱自动生成前置知识点搭桥拆解</span>
                    </div>
                  </div>
                  <div class="point-item">
                    <div class="check-box emerald"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>提分里程碑实时闭环验证</strong>
                      <span>每完成一个阶段靶向训练，自动验证掌握度并点亮能力勋章</span>
                    </div>
                  </div>
                </div>

                <div class="feature-cta-row">
                  <button
                    class="feature-action-btn secondary emerald"
                    @click="startPathSimulation"
                    :disabled="isSimulating"
                  >
                    <Play :size="15" class="fill-current" />
                    <span>{{ isSimulating ? '自适应演算中...' : '演示路径演算' }}</span>
                  </button>
                </div>
              </div>

              <!-- 右侧：全息路径拓扑演练台 -->
              <div class="feature-visual">
                <div class="visual-card is-emerald">
                  <div class="path-visual-console">
                    <div class="console-top-strip">
                      <div class="console-status">
                        <span class="status-pulse-dot emerald"></span>
                        <span class="console-engine-label">Adaptive Topology Matrix</span>
                      </div>
                      <div class="console-mode-tag">Dynamic Branching</div>
                    </div>

                    <!-- 拓扑节点网络 -->
                    <div class="path-network-grid">
                      <!-- 节点 1 -->
                      <div class="topo-node-card" :class="{ active: simStep >= 1 }">
                        <div class="node-icon-box emerald"><Brain :size="20" /></div>
                        <div class="node-text">
                          <span class="node-title">1. 能力测评</span>
                          <span class="node-desc">{{
                            simStep >= 1 ? '基础战力已锁定' : '待测评'
                          }}</span>
                        </div>
                        <span v-if="simStep >= 1" class="node-status-badge success">已完成</span>
                      </div>

                      <div class="topo-connect-line" :class="{ active: simStep >= 2 }"></div>

                      <!-- 节点 2 -->
                      <div
                        class="topo-node-card"
                        :class="{ active: simStep >= 2, warning: simStep >= 3 }"
                      >
                        <div class="node-icon-box cyan"><Search :size="20" /></div>
                        <div class="node-text">
                          <span class="node-title">2. 智能归因分析</span>
                          <span class="node-desc">{{
                            simStep >= 3 ? '锁定: 虚拟语气薄弱' : '全面诊断中'
                          }}</span>
                        </div>
                        <span v-if="simStep >= 3" class="node-status-badge alert">发现断层</span>
                      </div>

                      <div class="topo-connect-line branch" :class="{ active: simStep >= 4 }"></div>

                      <!-- 节点 3 -->
                      <div class="topo-node-card highlight" :class="{ active: simStep >= 4 }">
                        <div class="node-icon-box amber"><Zap :size="20" /></div>
                        <div class="node-text">
                          <span class="node-title">3. 动态专项干预</span>
                          <span class="node-desc">{{
                            simStep >= 4 ? '派生 15 道专项母题' : '等待分支'
                          }}</span>
                        </div>
                        <span v-if="simStep >= 4" class="node-status-badge processing"
                          >靶向突击</span
                        >
                      </div>

                      <div class="topo-connect-line" :class="{ active: simStep >= 5 }"></div>

                      <!-- 节点 4 -->
                      <div class="topo-node-card mastery" :class="{ active: simStep >= 5 }">
                        <div class="node-icon-box indigo"><CheckCircle2 :size="20" /></div>
                        <div class="node-text">
                          <span class="node-title">4. 能力段位突破</span>
                          <span class="node-desc">{{
                            simStep >= 6 ? '突破提分 +15 分' : '闭环考核'
                          }}</span>
                        </div>
                        <span v-if="simStep >= 6" class="node-status-badge score">+15 分</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 3: 多维数据可视化看板 -->
            <div id="feature-analytics" class="feature-row scroll-mt">
              <div class="feature-content">
                <div class="feature-icon-badge is-amber">
                  <BarChart2 :size="28" />
                </div>
                <div class="feature-badge-row">
                  <span class="category-tag amber">DEEP ANALYTICS</span>
                  <span class="metric-pill">全维学情透视</span>
                </div>
                <h3>多维学情战力数据可视化看板</h3>
                <p>
                  拒绝模糊的主观感觉，用精准数据掌控备考进度。我们提供全景学习数据看板，从高频错因分布、作答速度曲线到长效词汇留存率，清晰印证您的每一点实质性成长。
                </p>

                <div class="ai-points-list">
                  <div class="point-item">
                    <div class="check-box amber"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>全学科战力雷达图</strong>
                      <span>听力、阅读、写作、翻译全项均衡透视，无死角查缺补漏</span>
                    </div>
                  </div>
                  <div class="point-item">
                    <div class="check-box amber"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>高光做题速度与准确率双轴分析</strong>
                      <span>洞悉做题耗时瓶颈，训练考场限时抗压与节奏感</span>
                    </div>
                  </div>
                  <div class="point-item">
                    <div class="check-box amber"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>周期性提分趋势预测报告</strong>
                      <span>根据历史真题掌握率，科学推算目标分达成周期</span>
                    </div>
                  </div>
                </div>

                <div class="feature-cta-row">
                  <button
                    class="feature-action-btn secondary amber"
                    @click="startChartSimulation"
                    :disabled="isCharting"
                  >
                    <Activity :size="15" />
                    <span>{{ isCharting ? '数据看板演算中...' : '演示数据看板' }}</span>
                  </button>
                </div>
              </div>

              <!-- 右侧：极客学情数据仪表台 -->
              <div class="feature-visual">
                <div class="visual-card is-amber">
                  <div class="chart-visual-console">
                    <div class="console-top-strip">
                      <div class="console-status">
                        <span class="status-pulse-dot amber"></span>
                        <span class="console-engine-label">Learning Telemetry Center</span>
                      </div>
                      <div class="console-mode-tag">Real-Time Sync</div>
                    </div>

                    <!-- 顶部 2 核心指标卡 -->
                    <div class="chart-stats-row">
                      <div class="stat-pill-card" :class="{ active: chartStep >= 5 }">
                        <span class="stat-pill-label">累计专注时长</span>
                        <div class="stat-pill-value">
                          <span>32.5h</span>
                          <span class="trend-badge up">+4.2% 本周</span>
                        </div>
                      </div>
                      <div class="stat-pill-card" :class="{ active: chartStep >= 5 }">
                        <span class="stat-pill-label">核心词量覆盖</span>
                        <div class="stat-pill-value">
                          <span>2,480</span>
                          <span class="trend-badge up">+120 今日</span>
                        </div>
                      </div>
                    </div>

                    <!-- 动态柱状图：周学时分布 -->
                    <div class="chart-box bar-chart-box">
                      <div class="box-title-row">
                        <span>近 7 天学习时长分布 (小时)</span>
                        <span class="box-sub">均值 4.6h/天</span>
                      </div>
                      <div class="bars-container">
                        <div
                          class="bar-column"
                          v-for="b in [
                            { day: 'Mon', h: 45, val: '3.2h' },
                            { day: 'Tue', h: 68, val: '4.8h' },
                            { day: 'Wed', h: 88, val: '6.2h' },
                            { day: 'Thu', h: 55, val: '3.9h' },
                            { day: 'Fri', h: 92, val: '6.5h' },
                            { day: 'Sat', h: 75, val: '5.3h' },
                            { day: 'Sun', h: 60, val: '4.2h' }
                          ]"
                          :key="b.day"
                        >
                          <div class="bar-track">
                            <div
                              class="bar-fill"
                              :style="{ height: (chartStep >= 1 ? b.h : 20) + '%' }"
                            ></div>
                          </div>
                          <span class="bar-day">{{ b.day }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 动态贝塞尔折线图：正确率趋势 -->
                    <div class="chart-box line-chart-box" :class="{ active: chartStep >= 4 }">
                      <div class="box-title-row">
                        <span class="flex-align"
                          ><TrendingUp :size="14" class="text-emerald" />
                          综合做题正确率持续攀升</span
                        >
                        <span class="text-emerald font-bold">94.2% 最新</span>
                      </div>
                      <div class="smooth-svg-wrap">
                        <svg viewBox="0 0 320 60" class="smooth-svg">
                          <defs>
                            <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stop-color="#10b981" stop-opacity="0.3" />
                              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 0 50 Q 50 42 100 45 T 200 24 T 320 8"
                            fill="none"
                            stroke="#10b981"
                            stroke-width="3"
                            stroke-linecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 4: 母语级 AI 导师 1V1 深度交互 (左右反转) -->
            <div id="feature-tutor" class="feature-row reverse scroll-mt">
              <div class="feature-content">
                <div class="feature-icon-badge is-indigo">
                  <Bot :size="28" />
                </div>
                <div class="feature-badge-row">
                  <span class="category-tag indigo">AI 1V1 TUTORING</span>
                  <span class="metric-pill">母语级表达润色</span>
                </div>
                <h3>母语级 AI 导师 1V1 伴学与深度润色</h3>
                <p>
                  遇到长难句看不懂？写作逻辑不通畅？AI 导师 24
                  小时随时待命。不仅给出正确答案，更层层拆解逻辑思维链，支持多轮深挖追问，手把手带您掌握母语级地道表达。
                </p>

                <div class="ai-points-list">
                  <div class="point-item">
                    <div class="check-box indigo"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>长难句语法树全息拆解</strong>
                      <span>主干提取、修饰成分归位、从句嵌套逻辑一目了然</span>
                    </div>
                  </div>
                  <div class="point-item">
                    <div class="check-box indigo"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>学术写作母语级 Diff 实时润色</strong>
                      <span>告别中式英语 Chinglish，用词多样性与逻辑连贯性显著增强</span>
                    </div>
                  </div>
                  <div class="point-item">
                    <div class="check-box indigo"><Check :size="14" /></div>
                    <div class="point-text">
                      <strong>无限轮次情境式追问推导</strong>
                      <span>“为什么这里不用 which 而是 that？”随问随答，彻底吃透考点</span>
                    </div>
                  </div>
                </div>

                <div class="feature-cta-row">
                  <button class="feature-action-btn primary indigo" @click="handleStartLearning">
                    <span>体验 AI 专属导师</span>
                    <ArrowRight :size="15" />
                  </button>
                </div>
              </div>

              <!-- 右侧：AI 导师真实互动对话舱 -->
              <div class="feature-visual">
                <div class="visual-card is-indigo">
                  <div class="tutor-dialogue-console">
                    <div class="console-top-strip">
                      <div class="console-status">
                        <span class="status-pulse-dot indigo"></span>
                        <span class="console-engine-label">AI Tutor Interactive Channel</span>
                      </div>
                      <div class="console-mode-tag">Native Mentor Mode</div>
                    </div>

                    <!-- 真实对话卡片流 -->
                    <div class="dialogue-messages-stream">
                      <!-- 学员提问 -->
                      <div class="msg-bubble user">
                        <div class="bubble-header">
                          <span class="bubble-role">学员提问</span>
                          <span class="bubble-time">10:24</span>
                        </div>
                        <p class="bubble-body">
                          老师，这句写作 “I very agree that technology change life” 该怎么润色到雅思
                          7.5 分水平？
                        </p>
                      </div>

                      <!-- AI 导师深度剖析与润色 -->
                      <div class="msg-bubble ai">
                        <div class="bubble-header">
                          <div class="ai-mentor-badge">
                            <Bot :size="14" />
                            <span>LearnSphere AI Tutor</span>
                          </div>
                          <span class="bubble-time">毫秒级回复</span>
                        </div>
                        <div class="bubble-body">
                          <div class="diff-highlight-box">
                            <div class="diff-tag-row">
                              <span class="diff-tag before">中式初阶</span>
                              <span class="diff-text-del"
                                >I very agree that technology change life.</span
                              >
                            </div>
                            <div class="diff-tag-row">
                              <span class="diff-tag after">母语学术</span>
                              <span class="diff-text-ins"
                                >I strongly subscribe to the view that technological advancements
                                profoundly reshape our lives.</span
                              >
                            </div>
                          </div>
                          <div class="explanation-pill">
                            <Sparkles :size="13" class="text-amber" />
                            <span
                              >核心提分点：将 “very agree” 升级为学术级 “strongly subscribe
                              to”，引入副词 “profoundly” 增强说服力。</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ==================== 3. 核心技术底座卡片 ==================== -->
          <div class="ai-core-tech-banner">
            <div class="tech-glow-blob"></div>
            <div class="ai-core-content text-center">
              <div class="tech-badge">
                <Cpu :size="14" />
                <span>DEEP NEURAL FOUNDATION</span>
              </div>
              <h2 class="ai-title">Core Engine <span>Neural Architecture</span></h2>
              <p>
                驱动 LearnSphere 的技术底座，是基于 Transformer
                深度架构的大语言模型与认知图谱。理解复杂的语境深层隐喻，像贴身私教一样为您随时纠偏、精准提分。
              </p>
              <div class="tech-tags">
                <span class="tag-item"><Layers :size="14" /> 深度 NLP 自然语言理解</span>
                <span class="tag-item"><Brain :size="14" /> 百万级英语知识图谱</span>
                <span class="tag-item"><Target :size="14" /> 艾宾浩斯自适应推荐算法</span>
                <span class="tag-item"><Volume2 :size="14" /> 国际音标母语级声学评测</span>
              </div>
            </div>
          </div>

          <!-- ==================== 4. 底部行动呼吁 CTA ==================== -->
          <div class="features-final-cta">
            <div class="cta-inner-card text-center">
              <h2>准备好见证提分奇迹了吗？</h2>
              <p>立即免费开启体验，用真正的 AI 科技重新定义您的英语备考之路。</p>
              <button class="primary-hero-cta glow-button" @click="handleStartLearning">
                <Zap :size="18" />
                <span>{{ userStore.token ? '进入学习中心' : '立即免费注册体验' }}</span>
                <ArrowRight :size="16" class="btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
/* ==================== 1. 设计变量与基础容器 ==================== */
.features-page {
  --fp-primary: #1e6b52;
  --fp-cyan: #2b7a60;
  --fp-emerald: #10b981;
  --fp-amber: #f59e0b;
  --fp-rose: #f43f5e;

  /* 深色主题默认 (Dark Default) */
  --fp-bg: #070a12;
  --fp-text-primary: #f8fafc;
  --fp-text-secondary: #94a3b8;
  --fp-text-muted: #94a3b8;
  --fp-green-ink: #34d399;
  --fp-card-bg: rgba(15, 23, 42, 0.72);
  --fp-card-sub: rgba(30, 41, 59, 0.55);
  --fp-border: rgba(148, 163, 184, 0.16);
  --fp-border-glow: rgba(30, 107, 82, 0.35);
  --fp-shadow: 0 20px 48px -12px rgba(0, 0, 0, 0.5);

  background: transparent;
  color: var(--fp-text-primary);
  min-height: 100vh;
  overflow-x: hidden;
}

/* 浅色主题精准自适应 (Light Theme Override) */
html[data-theme='light'] .features-page,
body[data-theme='light'] .features-page {
  --fp-bg: #f8fafc;
  --fp-text-primary: #0f172a;
  --fp-text-secondary: #475569;
  --fp-text-muted: #52606f;
  --fp-green-ink: #065f46;
  --fp-card-bg: rgba(255, 255, 255, 0.94);
  --fp-card-sub: rgba(241, 245, 249, 0.88);
  --fp-border: rgba(203, 213, 225, 0.75);
  --fp-border-glow: rgba(30, 107, 82, 0.45);
  --fp-shadow: 0 20px 44px -10px rgba(15, 23, 42, 0.08);
}

.features-container {
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 clamp(16px, 3.5vw, 40px);
  box-sizing: border-box;
}

/* ==================== 2. Hero 展厅头部看板 ==================== */
.features-hero-section {
  padding: 64px 0 40px;
  position: relative;
}

.hero-center-deck {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 860px;
  margin: 0 auto;
}

.features-kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.28);
  margin-bottom: 20px;
}

.kicker-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-dot 2s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.85);
  }
}

.kicker-text {
  font-size: 0.8rem;
  font-weight: 700;
  /* #5fa88b 在浅底上只有 2.2:1；--tone-emerald 在胶囊绿底上 4.28，再深一档 */
  color: var(--fp-green-ink);
  letter-spacing: 0.04em;
}

.features-hero-title {
  font-size: clamp(2.5rem, 4.8vw, 4rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 16px 0;
  color: var(--fp-text-primary);
}

.title-gradient {
  background: none;
  color: inherit;
  display: inline-block;
}

.features-hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.75;
  color: var(--fp-text-secondary);
  margin: 0 0 36px 0;
  max-width: 680px;
}

/* 锚点导航胶囊条 */
.features-anchor-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 9999px;
  background: var(--fp-card-bg);
  border: 1px solid var(--fp-border);
}

.anchor-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 9999px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  color: var(--fp-text-secondary);
}

.anchor-pill:hover {
  transform: translateY(-2px);
  color: var(--fp-text-primary);
}

.anchor-pill.is-cyan:hover {
  background: rgba(43, 122, 96, 0.12);
  border-color: rgba(43, 122, 96, 0.3);
  color: var(--tone-emerald);
}

.anchor-pill.is-emerald:hover {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--tone-emerald);
}

.anchor-pill.is-amber:hover {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
  color: var(--tone-amber);
}

.anchor-pill.is-indigo:hover {
  background: rgba(30, 107, 82, 0.12);
  border-color: rgba(30, 107, 82, 0.3);
  /* R1：深色主题下深绿文字压深底仅约 2.4:1，改用主题感知的品牌墨绿 */
  color: var(--fp-green-ink);
}

/* ==================== 3. 核心功能交错展厅 ==================== */
.features-content-section {
  padding: 40px 0 96px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 96px;
}

.feature-row {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 64px;
  align-items: center;
}

.feature-row.reverse {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
}

.feature-row.reverse .feature-content {
  order: 2;
}

.feature-row.reverse .feature-visual {
  order: 1;
}

.scroll-mt {
  scroll-margin-top: 100px;
}

/* 左侧文字区 */
.feature-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.feature-icon-badge {
  width: 58px;
  height: 58px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid var(--fp-border);
}

.feature-icon-badge.is-cyan {
  background: rgba(43, 122, 96, 0.15);
  color: var(--tone-emerald);
  border-color: rgba(43, 122, 96, 0.3);
}

.feature-icon-badge.is-emerald {
  background: rgba(16, 185, 129, 0.15);
  color: var(--tone-emerald);
  border-color: rgba(16, 185, 129, 0.3);
}

.feature-icon-badge.is-amber {
  background: rgba(245, 158, 11, 0.15);
  color: var(--tone-amber);
  border-color: rgba(245, 158, 11, 0.3);
}

.feature-icon-badge.is-indigo {
  background: rgba(30, 107, 82, 0.15);
  color: var(--tone-emerald);
  border-color: rgba(30, 107, 82, 0.3);
}

.feature-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.category-tag {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 3px 10px;
  border-radius: 9999px;
}

/* 半透明绿底会抬高背景亮度，绿色字压上去只有 4.35，故改用更深一档 */
.category-tag.cyan {
  background: rgba(43, 122, 96, 0.12);
  color: var(--fp-green-ink);
}
.category-tag.emerald {
  background: rgba(16, 185, 129, 0.12);
  color: var(--tone-emerald);
}
.category-tag.amber {
  background: rgba(245, 158, 11, 0.12);
  color: var(--tone-amber);
}
.category-tag.indigo {
  background: rgba(30, 107, 82, 0.12);
  color: var(--fp-green-ink);
}

.metric-pill {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--fp-text-muted);
}

.feature-content h3 {
  font-size: clamp(1.8rem, 3.2vw, 2.4rem);
  font-weight: 800;
  line-height: 1.25;
  color: var(--fp-text-primary);
  margin: 0 0 16px 0;
}

.feature-content p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--fp-text-secondary);
  margin: 0 0 28px 0;
}

/* 优势列表 */
.ai-points-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin-bottom: 32px;
}

.point-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.check-box {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.check-box.cyan {
  background: rgba(43, 122, 96, 0.15);
  color: var(--tone-emerald);
}
.check-box.emerald {
  background: rgba(16, 185, 129, 0.15);
  color: var(--tone-emerald);
}
.check-box.amber {
  background: rgba(245, 158, 11, 0.15);
  color: var(--tone-amber);
}
.check-box.indigo {
  background: rgba(30, 107, 82, 0.15);
  color: var(--tone-emerald);
}

.point-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.point-text strong {
  font-size: 0.95rem;
  color: var(--fp-text-primary);
}

.point-text span {
  font-size: 0.85rem;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}

.feature-cta-row {
  display: flex;
  gap: 14px;
}

.feature-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: var(--radius-md);
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.25s ease;
}

.feature-action-btn.primary {
  color: var(--brand-ink);
  background: var(--brand);
}

.feature-action-btn.primary:hover {
  transform: translateY(-2px);
}

.feature-action-btn.secondary {
  background: var(--fp-card-sub);
  color: var(--fp-text-primary);
  border-color: var(--fp-border);
}

.feature-action-btn.secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--fp-card-bg);
  border-color: var(--fp-border-glow);
}

/* ==================== 4. 右侧视觉演练舱 (Visual Decks) ==================== */
.feature-visual {
  width: 100%;
}

.visual-card {
  width: 100%;
  border-radius: var(--radius-lg);
  background: var(--fp-card-bg);
  border: 1px solid var(--fp-border);
  overflow: hidden;
  position: relative;
  transition: border-color 0.3s ease;
}

.visual-card:hover {
  border-color: var(--fp-border-glow);
}

/* 演练舱控制台统一外壳 */
.ai-cockpit-console,
.path-visual-console,
.chart-visual-console,
.tutor-dialogue-console {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.console-top-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--fp-border);
  margin-bottom: 18px;
}

.console-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2b7a60;
  animation: pulse-dot 1.8s infinite;
}

.status-pulse-dot.emerald {
  background: #10b981;
}
.status-pulse-dot.amber {
  background: #f59e0b;
}
.status-pulse-dot.indigo {
  background: #1e6b52;
}

.console-engine-label {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--fp-text-primary);
}

.console-mode-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--fp-text-muted);
  background: rgba(148, 163, 184, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
}

/* ---------------- 演练舱 1: AI 推荐 ---------------- */
.console-main-view {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.console-stage {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.animate-fade {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.radar-scan-box {
  position: relative;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.radar-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(43, 122, 96, 0.3);
}

.ring-outer {
  width: 90px;
  height: 90px;
  animation: spin-slow 20s linear infinite;
}
.ring-inner {
  width: 60px;
  height: 60px;
  border-style: solid;
  border-color: rgba(43, 122, 96, 0.2);
}
.radar-sweep {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--card-bg);
  animation: spin-sweep 3s linear infinite;
}

@keyframes spin-sweep {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.radar-core-icon {
  color: var(--tone-emerald);
  position: relative;
  z-index: 2;
}

.stage-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--fp-text-primary);
}

.stream-data-grid {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.data-chip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: var(--fp-card-sub);
  border: 1px solid var(--fp-border);
}

.chip-label {
  font-size: 0.72rem;
  color: var(--fp-text-muted);
}
.chip-val {
  font-size: 0.95rem;
  font-weight: 800;
  font-family: inherit;
}

.text-cyan {
  color: var(--tone-emerald);
}
.text-emerald {
  color: var(--tone-emerald);
}
.text-amber {
  color: var(--tone-amber);
}
.text-rose {
  color: var(--tone-red);
}

/* 弱项警告卡 */
.alert-pulse-badge {
  margin-bottom: 10px;
}

.weak-point-card {
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-lg);
  background: rgba(244, 63, 94, 0.06);
  border: 1px solid rgba(244, 63, 94, 0.25);
  text-align: left;
}

.weak-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.weak-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--fp-text-primary);
}
.weak-score {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--tone-red);
}

.weak-track {
  width: 100%;
  height: 6px;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.2);
  margin-bottom: 10px;
  overflow: hidden;
}

.weak-bar {
  height: 100%;
  background: #f43f5e;
  border-radius: 9999px;
}

.weak-desc {
  font-size: 0.78rem;
  color: var(--fp-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* 推荐卡 */
.rec-solution-card {
  width: 100%;
  padding: 18px;
  border-radius: var(--radius-lg);
  background: rgba(30, 107, 82, 0.1);
  border: 1px solid rgba(30, 107, 82, 0.28);
  text-align: center;
}

.rec-solution-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--tone-emerald);
  margin-bottom: 8px;
}

.rec-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--fp-text-primary);
  margin: 0 0 10px 0;
}

.rec-metrics-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 14px;
}

.metric-badge {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 9999px;
  background: var(--fp-card-sub);
  color: var(--fp-text-secondary);
}

.metric-badge.highlight {
  background: rgba(16, 185, 129, 0.15);
  color: var(--tone-emerald);
  font-weight: 700;
}

.rec-start-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  background: #1e6b52;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.rec-start-btn:hover {
  background: #1e6b52;
  transform: scale(1.03);
}

/* 时间线胶囊 */
.console-timeline-bar {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--fp-border);
  justify-content: center;
}

.timeline-step-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--fp-text-muted);
  background: var(--fp-card-sub);
  border: 1px solid var(--fp-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-step-btn.active {
  color: #ffffff;
  background: #2b7a60;
  border-color: var(--tone-emerald);
}

.step-num {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: var(--brand-ink);
}

/* ---------------- 演练舱 2: 自适应拓扑 ---------------- */
.path-network-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topo-node-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  background: var(--fp-card-sub);
  border: 1px solid var(--fp-border);
  transition: all 0.3s ease;
}

.topo-node-card.active {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.06);
}

.topo-node-card.warning {
  border-color: rgba(244, 63, 94, 0.4);
  background: rgba(244, 63, 94, 0.06);
}

.node-icon-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-icon-box.emerald {
  background: rgba(16, 185, 129, 0.15);
  color: var(--tone-emerald);
}
.node-icon-box.cyan {
  background: rgba(43, 122, 96, 0.15);
  color: var(--tone-emerald);
}
.node-icon-box.amber {
  background: rgba(245, 158, 11, 0.15);
  color: var(--tone-amber);
}
.node-icon-box.indigo {
  background: rgba(30, 107, 82, 0.15);
  color: var(--tone-emerald);
}

.node-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.node-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--fp-text-primary);
}
.node-desc {
  font-size: 0.75rem;
  color: var(--fp-text-secondary);
}

.node-status-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.node-status-badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: var(--tone-emerald);
}
.node-status-badge.alert {
  background: rgba(244, 63, 94, 0.15);
  color: var(--tone-red);
}
.node-status-badge.processing {
  background: rgba(245, 158, 11, 0.15);
  color: var(--tone-amber);
}
/* R5：底色 alpha 0.15 把深绿字压到 4.4:1，降到 0.10 回到 4.7:1 */
.node-status-badge.score {
  background: rgba(30, 107, 82, 0.1);
  color: var(--tone-emerald);
}

.topo-connect-line {
  width: 2px;
  height: 12px;
  background: var(--fp-border);
  margin-left: 32px;
  transition: background 0.3s ease;
}

.topo-connect-line.active {
  background: #10b981;
}
.topo-connect-line.branch.active {
  background: #f59e0b;
}

/* ---------------- 演练舱 3: 数据看板 ---------------- */
.chart-stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-pill-card {
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  background: var(--fp-card-sub);
  border: 1px solid var(--fp-border);
}

.stat-pill-label {
  font-size: 0.75rem;
  color: var(--fp-text-muted);
  display: block;
  margin-bottom: 4px;
}
.stat-pill-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-pill-value span {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--fp-text-primary);
}

.trend-badge.up {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
}

.chart-box {
  padding: 14px;
  border-radius: var(--radius-lg);
  background: var(--fp-card-sub);
  border: 1px solid var(--fp-border);
  margin-bottom: 12px;
}

.box-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--fp-text-secondary);
  font-weight: 600;
  margin-bottom: 12px;
}

.box-sub {
  font-size: 0.72rem;
  color: var(--fp-text-muted);
}

.bars-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 80px;
  padding: 0 4px;
}

.bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.bar-track {
  width: 14px;
  height: 60px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: #f59e0b;
  border-radius: 4px;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.bar-day {
  font-size: 0.7rem;
  color: var(--fp-text-muted);
}

.smooth-svg-wrap {
  width: 100%;
  height: 48px;
}

.smooth-svg {
  width: 100%;
  height: 100%;
}

.flex-align {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ---------------- 演练舱 4: AI 导师 1V1 ---------------- */
.dialogue-messages-stream {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.msg-bubble {
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.msg-bubble.user {
  background: var(--fp-card-sub);
  border: 1px solid var(--fp-border);
  align-self: stretch;
}

.msg-bubble.ai {
  background: rgba(30, 107, 82, 0.08);
  border: 1px solid rgba(30, 107, 82, 0.25);
  align-self: stretch;
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.bubble-role {
  font-weight: 700;
  color: var(--fp-text-muted);
}
.bubble-time {
  color: var(--fp-text-muted);
  font-size: 0.7rem;
}

.ai-mentor-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  color: var(--tone-emerald);
}

.bubble-body {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--fp-text-primary);
  margin: 0;
}

.diff-highlight-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  /* 原来固定 rgba(0,0,0,.2)：浅色主题下叠成中灰底，
     把里面的红/绿文字压到 2.9~3.3:1。改用随主题的浅底。 */
  background: var(--surface-muted);
  margin-bottom: 8px;
}

html[data-theme='dark'] .diff-highlight-box {
  background: rgba(0, 0, 0, 0.2);
}

.diff-tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
}

.diff-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}

.diff-tag.before {
  background: rgba(244, 63, 94, 0.07);
  color: var(--tone-red);
}
/* 半透明底会把 --tone-emerald 拉到 4.50 临界值，直接去掉底色保证余量 */
.diff-tag.after {
  background: transparent;
  color: var(--tone-emerald);
}

/* R8：去掉 opacity 0.8，避免删除线文字被整体削弱对比度 */
.diff-text-del {
  color: var(--tone-red);
  text-decoration: line-through;
  background: rgba(244, 63, 94, 0.06);
}
.diff-text-ins {
  color: var(--tone-emerald);
  font-weight: 700;
  background: rgba(16, 185, 129, 0.06);
}

.explanation-pill {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--fp-text-secondary);
  line-height: 1.5;
}

/* ==================== 5. 核心技术底座 ==================== */
.ai-core-tech-banner {
  position: relative;
  border-radius: var(--radius-lg);
  padding: 60px 32px;
  background: var(--fp-card-bg);
  border: 1px solid var(--fp-border);
  margin: 96px 0 60px;
  overflow: hidden;
}

.tech-glow-blob {
  position: absolute;
  top: -40%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 300px;
  background: transparent;
  pointer-events: none;
}

.tech-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--tone-emerald);
  margin-bottom: 14px;
}

.ai-title {
  font-size: clamp(2rem, 3.5vw, 2.6rem);
  font-weight: 900;
  color: var(--fp-text-primary);
  margin: 0 0 14px 0;
}

.ai-title span {
  color: var(--tone-emerald);
}

.ai-core-content p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--fp-text-secondary);
  max-width: 680px;
  margin: 0 auto 28px;
}

.tech-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 9999px;
  background: var(--fp-card-sub);
  border: 1px solid var(--fp-border);
  color: var(--fp-text-primary);
}

/* ==================== 6. 底部行动转化 ==================== */
.features-final-cta {
  padding-bottom: 40px;
}

.cta-inner-card {
  padding: 56px 32px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid var(--fp-border-glow);
}

.cta-inner-card h2 {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 900;
  color: var(--fp-text-primary);
  margin: 0 0 12px 0;
}

.cta-inner-card p {
  font-size: 1rem;
  color: var(--fp-text-secondary);
  margin: 0 0 28px 0;
}

.primary-hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 32px;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 700;
  color: var(--brand-ink);
  background: var(--brand);
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
}

.primary-hero-cta:hover {
  transform: translateY(-2px);
}

.primary-hero-cta:hover .btn-arrow {
  transform: translateX(4px);
}
.btn-arrow {
  transition: transform 0.2s ease;
}

/* ==================== 7. 响应式适配 ==================== */
@media (max-width: 1024px) {
  .feature-row,
  .feature-row.reverse {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .feature-row.reverse .feature-content {
    order: 1;
  }
  .feature-row.reverse .feature-visual {
    order: 2;
  }
}

@media (max-width: 768px) {
  .features-hero-section {
    padding: 40px 0 24px;
  }

  .features-hero-title {
    font-size: 2.2rem;
  }

  .features-anchor-bar {
    border-radius: var(--radius-lg);
    padding: 8px;
  }

  .anchor-pill {
    padding: 6px 12px;
    font-size: 0.8rem;
    /* 触控目标：窄屏下 0.8rem 字高叠加 --font-scale 后实测仅 31px，补足到 32px */
    min-height: 32px;
    min-width: 32px;
  }

  .features-list {
    gap: 64px;
  }

  .ai-cockpit-console,
  .path-visual-console,
  .chart-visual-console,
  .tutor-dialogue-console {
    padding: 16px;
  }

  .chart-stats-row {
    grid-template-columns: 1fr;
  }

  .tech-tags {
    flex-direction: column;
    align-items: center;
  }

  /* 时间线胶囊：0.75rem 字号在窄屏实测仅 30–31px 高，补足触控目标 */
  .timeline-step-btn {
    min-height: 32px;
    min-width: 32px;
    padding: 6px 14px;
  }

  .console-timeline-bar {
    flex-wrap: wrap;
    row-gap: 8px;
    column-gap: 8px;
  }

  /* 装饰性光斑固定 500px 宽，在 360/390 视口造成横向溢出；限宽到容器内 */
  .tech-glow-blob {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .tech-glow-blob {
    display: none;
  }
}
</style>
