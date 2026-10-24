<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NTag, NTooltip } from 'naive-ui'
import {
  GraduationCap,
  BookOpen,
  Award,
  Globe,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Compass,
  Flame,
  Brain,
  Zap,
  ChevronRight,
  RotateCcw,
  AlertCircle
} from 'lucide-vue-next'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'

const router = useRouter()

// 选中的考试分类
const activeExamCategory = ref('domestic')

// 考试分类元数据
const categories = [
  { id: 'domestic', label: '国内主流考试', badge: '4 门全真库', icon: GraduationCap },
  { id: 'international', label: '国际出国考试', badge: '4 门对标库', icon: Globe },
  { id: 'professional', label: '职场与专业拓展', badge: '4 门备考库', icon: Award }
]

// 考试详细数据
const examsData = {
  domestic: [
    {
      id: 'cet4',
      name: '大学英语四级',
      code: 'CET-4',
      badge: '大纲高频同步',
      badgeColor: 'primary',
      target: '目标 425+ / 550+ 卓越',
      icon: GraduationCap,
      accentColor: '#3b82f6',
      accentInk: 'var(--tone-blue)',
      avatarInk: '#ffffff',
      gradient: '#3b82f6',
      papersCount: 28,
      wordsCount: 4500,
      participants: '18.5w',
      avgImprovement: '+56分',
      tags: ['听力短文理解', '选词填空突破', '仔细阅读剖析', '议论文写作'],
      description:
        '全面对齐教育部考试中心最新大纲，收录近 10 年 28 套真题，含听力原版原声磨耳朵与作文 AI 智能秒批。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'cet6',
      name: '大学英语六级',
      code: 'CET-6',
      badge: '硬核深度攻坚',
      badgeColor: 'info',
      target: '目标 425+ / 580+ 卓越',
      icon: GraduationCap,
      accentColor: '#2b7a60',
      accentInk: 'var(--tone-emerald)',
      avatarInk: '#ffffff',
      gradient: '#2b7a60',
      papersCount: 32,
      wordsCount: 5500,
      participants: '15.2w',
      avgImprovement: '+64分',
      tags: ['长篇新闻听力', '高难度长难句', '段落翻译精析', '批判性思维写作'],
      description:
        '覆盖历年六级全部题型变式，强化高频学术派生词与英美报刊语篇，AI 深度归因错误阅读陷阱。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'ky',
      name: '全国考研英语 (一/二)',
      code: 'KY-ENG',
      badge: '百万考研首选',
      badgeColor: 'warning',
      target: '目标 65+ / 80+ 冲刺',
      icon: BookOpen,
      accentColor: '#f59e0b',
      accentInk: 'var(--tone-amber)',
      avatarInk: '#3b2600',
      gradient: '#f59e0b',
      papersCount: 24,
      wordsCount: 6200,
      participants: '22.8w',
      avgImprovement: '+21分',
      tags: ['长难句语法树', '阅读逻辑题眼', '新题型七选五', '大小作文模板升格'],
      description:
        '专为考研学子打造的逻辑提分体系。逐字精析历年考研长难句，解构命题人主旨与细节干扰项逻辑。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'tem4',
      name: '专业英语四级',
      code: 'TEM-4',
      badge: '英语专业基石',
      badgeColor: 'success',
      target: '目标 60+ / 80+ 优秀',
      icon: Award,
      accentColor: '#10b981',
      accentInk: 'var(--tone-emerald)',
      avatarInk: '#04321f',
      gradient: '#10b981',
      papersCount: 16,
      wordsCount: 8000,
      participants: '6.3w',
      avgImprovement: '+18分',
      tags: ['听写 Dictation', '微型讲座听力', '语法词汇辨析', '便条与概要写作'],
      description:
        '针对英专生大纲定制听写实战模拟器、便条写作母语级批阅与人文社科阅读题眼穿透训练。',
      mockRoute: '/mock-exam'
    }
  ],
  international: [
    {
      id: 'ielts',
      name: '雅思学术类 (IELTS Academic)',
      code: 'IELTS',
      badge: '剑桥真题同步',
      badgeColor: 'primary',
      target: '目标 6.5+ / 7.5+ 冲顶',
      icon: Globe,
      accentColor: '#2b7a60',
      accentInk: 'var(--tone-emerald)',
      avatarInk: '#ffffff',
      gradient: '#2b7a60',
      papersCount: 40,
      wordsCount: 7500,
      participants: '9.8w',
      avgImprovement: '+1.0Band',
      tags: ['学术类图表小作文', '大作文逻辑链', '长对话多口音听力', '口语母语对话'],
      description:
        '收录剑桥雅思 8-19 全套全真机考流程。支持 Task 1 数据图表精准描述与 Task 2 评分准则深度纠偏。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'toefl',
      name: '新托福 (TOEFL iBT)',
      code: 'TOEFL',
      badge: 'ETS 官方题型对齐',
      badgeColor: 'info',
      target: '目标 95+ / 105+ 梦校',
      icon: Globe,
      accentColor: '#1e6b52',
      accentInk: 'var(--tone-emerald)',
      avatarInk: '#ffffff',
      gradient: '#1e6b52',
      papersCount: 35,
      wordsCount: 8200,
      participants: '7.6w',
      avgImprovement: '+14分',
      tags: ['学术学术讨论写作', '多段落听力笔记', '口语机考语音评估', '学术文章阅读'],
      description:
        '全面对齐最新精简版 TOEFL iBT 机考机制。特训 Academic Discussion 写作与真实大学讲座听力。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'gre',
      name: 'GRE 通用考试',
      code: 'GRE',
      badge: '高难逻辑思维',
      badgeColor: 'warning',
      target: '目标 325+ (Verbal 155+)',
      icon: Brain,
      accentColor: '#b4543a',
      accentInk: 'var(--tone-orange)',
      avatarInk: '#ffffff',
      gradient: '#b4543a',
      papersCount: 20,
      wordsCount: 12000,
      participants: '5.1w',
      avgImprovement: '+8分',
      tags: ['填空等价双空三空', '长短阅读逻辑推断', 'Argument批判论证', '高阶学术派生'],
      description:
        '主攻 Verbal Reasoning 逻辑解题链与 Analytical Writing，攻克极端生僻词与反直觉学术论证。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'det',
      name: '多邻国英语测试',
      code: 'DET',
      badge: '自适应极速出分',
      badgeColor: 'success',
      target: '目标 115+ / 130+ 冲刺',
      icon: Zap,
      accentColor: '#10b981',
      accentInk: 'var(--tone-emerald)',
      avatarInk: '#04321f',
      gradient: '#10b981',
      papersCount: 18,
      wordsCount: 5000,
      participants: '4.9w',
      avgImprovement: '+15分',
      tags: ['看图说写题型', '完形填空快速补全', '自适应难度跳跃', '互动听说模拟'],
      description:
        '1:1 还原 CAT 计算机自适应出题算法，精炼单词听辨、段落填空与高频看图说写实战模考。',
      mockRoute: '/mock-exam'
    }
  ],
  professional: [
    {
      id: 'bec',
      name: '剑桥商务英语 (BEC)',
      code: 'BEC-V/H',
      badge: '外企白领必备',
      badgeColor: 'primary',
      target: '目标 Vantage / Higher 认证',
      icon: Award,
      accentColor: '#2563eb',
      accentInk: 'var(--tone-blue)',
      avatarInk: '#ffffff',
      gradient: '#2563eb',
      papersCount: 15,
      wordsCount: 6500,
      participants: '3.8w',
      avgImprovement: '+Grade B',
      tags: ['商务往来邮件', '商业报告摘要', '跨国会议听力', '商务谈判演讲'],
      description: '真实商业场景实战。涵盖国际贸易、金融分析、企业管理对话与商务文书写作规范。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'catti',
      name: '全国翻译专业资格 (CATTI)',
      code: 'CATTI-3/2',
      badge: '国家级职业资格',
      badgeColor: 'warning',
      target: '目标 笔译/口译 60+ 通过',
      icon: BookOpen,
      accentColor: '#d97706',
      accentInk: 'var(--tone-amber)',
      avatarInk: '#3b2600',
      gradient: '#d97706',
      papersCount: 12,
      wordsCount: 10000,
      participants: '4.2w',
      avgImprovement: '+12分',
      tags: ['政经文献汉英互译', '文化社科长句翻译', '词法转换增减词', '译文忠实通顺'],
      description: '国家翻译大纲对标训练。配备官方参考译文对齐与 AI 逐句信达雅翻译评估批改。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'tem8',
      name: '专业英语八级',
      code: 'TEM-8',
      badge: '最高级别英专认证',
      badgeColor: 'info',
      target: '目标 60+ / 80+ 卓越',
      icon: Award,
      accentColor: '#1e6b52',
      accentInk: 'var(--tone-emerald)',
      avatarInk: '#ffffff',
      gradient: '#1e6b52',
      papersCount: 14,
      wordsCount: 13000,
      participants: '2.9w',
      avgImprovement: '+14分',
      tags: ['英美文学与语言学', '长篇微型讲座听力', '学术论文概要写作', '复杂文学汉英互译'],
      description:
        '英专最高荣誉挑战。全面强化人文社科深层阅读、Mini-lecture 听力笔记与学术文风写作。',
      mockRoute: '/mock-exam'
    },
    {
      id: 'toeic',
      name: '托业国际交流英语 (TOEIC)',
      code: 'TOEIC',
      badge: '跨国招聘通行证',
      badgeColor: 'success',
      target: '目标 800+ / 900+ 卓越',
      icon: Globe,
      accentColor: '#059669',
      accentInk: 'var(--tone-emerald)',
      avatarInk: '#04321f',
      gradient: '#059669',
      papersCount: 22,
      wordsCount: 5500,
      participants: '5.5w',
      avgImprovement: '+110分',
      tags: ['职场多国口音听力', '商业广告与图表', '邮件链式阅读', '高效答题配速'],
      description: '200 道高强度商务沟通题型演练，训练极速阅读反应力与跨国商务场景听觉敏锐度。',
      mockRoute: '/mock-exam'
    }
  ]
}

// 三大核心支撑特性
// color 用于图标和标签文字：深色主题用亮色，浅色主题用同色系深色档。
// 原来只给一个亮色，浅色主题下压在白色底上只有 1.4:1，标签几乎看不见。
const corePillars = [
  {
    icon: ShieldCheck,
    title: '1:1 全真机考环境还原',
    tag: '99.8% 仿真度',
    color: 'var(--tone-blue)',
    desc: '完全复刻官方机考全流程。严格遵循真实考试时间倒计时、试卷模块跳转机制、双声道听力原声与标准答题卡交互。'
  },
  {
    icon: TrendingUp,
    title: '大数据考情图谱与预测',
    tag: '近 10 年 120+ 套真题',
    color: 'var(--tone-emerald)',
    desc: '深度分析近十年命题趋势，实时锁定各科目高频核心词汇、语法题眼分布与高权重得分点，拒绝盲目刷题。'
  },
  {
    icon: Sparkles,
    title: '母语级 AI 主观题即时精批',
    tag: '秒级出分 · 逐句精修',
    color: 'var(--tone-emerald)',
    desc: '集成教育微调大模型，秒级对写作与翻译进行全维度评分。精准标记中式表达缺陷，推荐地道母语替换与逻辑链重构。'
  }
]

// 模拟实战演示舱的状态交互
const simQuestionState = ref({
  selectedOption: 'B',
  isAnswerSubmitted: true,
  currentQuestionIndex: 18,
  timerSeconds: 5882 // 01:38:02
})

// 模拟考场选项
const simOptions = [
  { key: 'A', text: 'It ignores the historical roots of cognitive linguistics.' },
  { key: 'B', text: 'It bridges theoretical hypotheses with empirical neural evidence.' },
  { key: 'C', text: 'It overly relies on classical behaviorist conditioning models.' },
  { key: 'D', text: 'It neglects the influence of cross-cultural syntactic variations.' }
]

// 格式化时间
const formattedTimer = computed(() => {
  const hours = Math.floor(simQuestionState.value.timerSeconds / 3600)
  const minutes = Math.floor((simQuestionState.value.timerSeconds % 3600) / 60)
  const seconds = simQuestionState.value.timerSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 切换模拟答题选项
const selectSimOption = key => {
  simQuestionState.value.selectedOption = key
}

// 模拟答题卡矩阵（1~30）
const sheetItems = Array.from({ length: 30 }, (_, i) => {
  const id = i + 1
  let status = 'unanswered'
  if (id < 18) status = 'answered'
  else if (id === 18) status = 'current'
  else if (id === 22) status = 'flagged'
  return { id, status }
})

// 备考学霸提分榜数据
const highScorers = [
  {
    name: '林同学 · 浙江大学',
    exam: '大学英语六级 (CET-6)',
    scoreChange: '428 ➔ 612 分',
    boost: '+184 分',
    feedback:
      '通过 LearnSphere 的真题模考和听力长对话拆解，两周内纠正了听音迟钝，模考界面和真实考场一模一样！',
    avatar: '👨‍🎓',
    tag: '听力单项 228分'
  },
  {
    name: '周同学 · 中国人民大学',
    exam: '全国硕士考研英语一',
    scoreChange: '51 ➔ 78 分',
    boost: '+27 分',
    feedback:
      '考研阅读的长难句分析真的绝了！AI 把每个句子的从句套从句拆成结构树，主观题作文批改让我的大作文拿到了 17 分。',
    avatar: '👩‍🎓',
    tag: '考研顺利上岸'
  },
  {
    name: '陈同学 · 悉尼大学研究生在读',
    exam: '雅思学术类 (IELTS)',
    scoreChange: '5.5 ➔ 7.5 Band',
    boost: '+2.0 Band',
    feedback:
      '最头疼的写作从 5.5 冲到了 7.0。AI 导师每一篇都指出逻辑断层和中式硬译，给出的学术表达替换让我受益终身。',
    avatar: '🧑‍💻',
    tag: '写作单项 7.0'
  }
]

// 路由跳转
const handleStartMock = route => {
  router.push(route || '/mock-exam')
}

const handleExplorePractice = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="exams-page min-h-screen">
    <SiteHeader />

    <main class="exams-main">
      <!-- 1. Hero 展厅看板与分类切换 -->
      <section class="exams-hero-section">
        <div class="exams-container">
          <div class="hero-center-deck text-center">
            <div class="hero-kicker-badge">
              <span class="pulsing-beacon"></span>
              <span class="kicker-text">OFFICIAL EXAM SUITE · 2026 最新大纲深度适配</span>
            </div>

            <h1 class="hero-title">
              全方位覆盖主流考试
              <span class="gradient-text">1:1 还原真实模考机房</span>
            </h1>

            <p class="hero-subtitle">
              收录近 10
              年权威全套真题，结合大模型考情图谱穿透与主客观题秒级精批，让每一次模拟都是精准提分实战。
            </p>

            <!-- 分类选项卡 -->
            <div class="category-tabs-container">
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="category-tab-btn"
                :class="{ active: activeExamCategory === cat.id }"
                @click="activeExamCategory = cat.id"
              >
                <component :is="cat.icon" class="tab-btn-icon" />
                <span class="tab-btn-label">{{ cat.label }}</span>
                <span class="tab-btn-badge">{{ cat.badge }}</span>
              </button>
            </div>
          </div>

          <!-- 2. 三大核心支柱卡片（升级版） -->
          <div class="core-pillars-grid">
            <div
              v-for="(pillar, idx) in corePillars"
              :key="idx"
              class="pillar-card"
              :style="{ '--pillar-color': pillar.color }"
            >
              <div class="pillar-header">
                <div class="pillar-icon-box">
                  <component :is="pillar.icon" class="pillar-icon" />
                </div>
                <span class="pillar-tag">{{ pillar.tag }}</span>
              </div>
              <h3 class="pillar-title">{{ pillar.title }}</h3>
              <p class="pillar-desc">{{ pillar.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 考试卡片矩阵展示区 -->
      <section class="exams-grid-section">
        <div class="exams-container">
          <div class="section-title-bar">
            <div>
              <h2 class="sub-section-title">
                {{ categories.find(c => c.id === activeExamCategory)?.label }}专区
              </h2>
              <p class="sub-section-desc">点击卡片可快速调取专项试卷题库与全真模拟机考</p>
            </div>
            <div class="stats-badge-chip">
              <Flame class="chip-icon" />
              <span>本周已有 <strong>42,890</strong> 次模考交卷</span>
            </div>
          </div>

          <div class="exam-cards-grid">
            <div
              v-for="exam in examsData[activeExamCategory]"
              :key="exam.id"
              class="exam-rich-card"
              :style="{ '--exam-accent': exam.accentColor, '--exam-accent-ink': exam.accentInk }"
            >
              <div class="card-glow-halo"></div>

              <div class="card-inner-body">
                <!-- 顶栏状态与徽章 -->
                <div class="card-top-row">
                  <div
                    class="exam-brand-avatar"
                    :style="{ background: exam.gradient, color: exam.avatarInk }"
                  >
                    <component :is="exam.icon" class="avatar-icon" />
                  </div>
                  <div class="card-badges">
                    <span class="code-pill">{{ exam.code }}</span>
                    <span class="status-pill">{{ exam.badge }}</span>
                  </div>
                </div>

                <!-- 标题与目标 -->
                <div class="card-title-group">
                  <h3 class="exam-name">{{ exam.name }}</h3>
                  <div class="target-score-pill">
                    <Target class="target-icon" />
                    <span>{{ exam.target }}</span>
                  </div>
                </div>

                <p class="exam-description">{{ exam.description }}</p>

                <!-- 关键量化指标栏 -->
                <div class="exam-metrics-row">
                  <div class="metric-item">
                    <span class="metric-val">{{ exam.papersCount }} 套</span>
                    <span class="metric-lbl">历年真题</span>
                  </div>
                  <div class="metric-divider"></div>
                  <div class="metric-item">
                    <span class="metric-val">{{ exam.wordsCount }} 词</span>
                    <span class="metric-lbl">考纲核心词</span>
                  </div>
                  <div class="metric-divider"></div>
                  <div class="metric-item">
                    <span class="metric-val text-accent">{{ exam.avgImprovement }}</span>
                    <span class="metric-lbl">平均提分</span>
                  </div>
                </div>

                <!-- 专项突破标签 -->
                <div class="exam-tags-flow">
                  <span v-for="(tag, tIdx) in exam.tags" :key="tIdx" class="exam-tag-pill">
                    {{ tag }}
                  </span>
                </div>

                <!-- 底部操作按钮 -->
                <div class="card-actions-dock">
                  <button class="primary-mock-btn" @click="handleStartMock(exam.mockRoute)">
                    <span>进入全真模考</span>
                    <ArrowRight class="btn-arrow" />
                  </button>
                  <button class="secondary-view-btn" @click="handleExplorePractice">
                    <span>专项刷题</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. 全真机考 1:1 沉浸式实战演算舱（Interactive Cockpit） -->
      <section class="live-simulator-section">
        <div class="exams-container">
          <div class="section-center-head">
            <span class="micro-kicker">LIVE SIMULATION PREVIEW</span>
            <h2 class="section-heading">真实机考全景演练舱</h2>
            <p class="section-subtext">
              不仅是题目练习，更是与真实考场一模一样的全仿真抗压测试环境
            </p>
          </div>

          <div class="simulator-cockpit-frame">
            <!-- 考场顶栏模拟 -->
            <div class="cockpit-header-bar">
              <div class="header-left-meta">
                <div class="live-exam-chip">
                  <span class="live-indicator-dot"></span>
                  <span>全真考场环境 · 正在测试</span>
                </div>
                <div class="exam-subject-label">
                  2025年12月 大学英语六级真题 (全国卷一) · 阅读理解仔细阅读
                </div>
              </div>

              <div class="header-right-clock">
                <Clock class="clock-icon" />
                <span class="countdown-val">{{ formattedTimer }}</span>
                <span class="countdown-sub">剩余考试时间</span>
              </div>
            </div>

            <!-- 考场操作中枢主体 -->
            <div class="cockpit-body-layout">
              <!-- 左侧答题卡矩阵导航 -->
              <aside class="sheet-sidebar">
                <div class="sheet-title-row">
                  <FileCheck class="sheet-icon" />
                  <span>答题卡矩阵 (Part II)</span>
                </div>
                <div class="sheet-legend-row">
                  <span class="legend-item"><i class="dot answered"></i>已作答 (17)</span>
                  <span class="legend-item"><i class="dot current"></i>当前题 (1)</span>
                  <span class="legend-item"><i class="dot flagged"></i>已标记 (1)</span>
                </div>

                <div class="sheet-matrix-grid">
                  <div
                    v-for="item in sheetItems"
                    :key="item.id"
                    class="sheet-bubble"
                    :class="[
                      item.status,
                      { active: simQuestionState.currentQuestionIndex === item.id }
                    ]"
                    @click="simQuestionState.currentQuestionIndex = item.id"
                  >
                    {{ item.id }}
                  </div>
                </div>

                <div class="sheet-action-box">
                  <div class="sheet-progress-text">已答 18 / 30 题 (完成度 60%)</div>
                  <div class="sheet-progress-bar">
                    <div class="sheet-progress-fill" style="width: 60%"></div>
                  </div>
                </div>
              </aside>

              <!-- 中间全真题目实战区 -->
              <div class="question-main-content">
                <div class="question-header-row">
                  <div class="q-index-pill">Question 18 of 30</div>
                  <div class="q-type-pill">单项选择题 · 分值 7.1 分</div>
                  <div class="q-flag-action">
                    <button class="flag-btn">
                      <span>标记此题</span>
                    </button>
                  </div>
                </div>

                <div class="reading-passage-snippet">
                  <p>
                    ...Recent neuroimaging methodologies have called into question the traditional
                    boundary between syntactic processing and lexical memory.
                    <span class="highlight-sentence"
                      >Contrary to earlier structuralist models, cognitive integration appears to be
                      dynamically mediated across distributed cortical networks,</span
                    >
                    suggesting that grammatical competence cannot be isolated from broader
                    contextual schemas...
                  </p>
                </div>

                <div class="q-prompt-text">
                  What does the author suggest about recent neuroimaging findings regarding
                  cognitive integration?
                </div>

                <div class="options-list-deck">
                  <div
                    v-for="opt in simOptions"
                    :key="opt.key"
                    class="option-item-card"
                    :class="{ selected: simQuestionState.selectedOption === opt.key }"
                    @click="selectSimOption(opt.key)"
                  >
                    <div class="option-key-badge">{{ opt.key }}</div>
                    <div class="option-content-text">{{ opt.text }}</div>
                    <div
                      v-if="simQuestionState.selectedOption === opt.key"
                      class="option-check-icon"
                    >
                      <CheckCircle2 class="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </div>

                <!-- 选定后的 AI 即时考点透视 -->
                <div class="ai-insight-drawer">
                  <div class="ai-insight-title">
                    <Sparkles class="w-4 h-4 text-indigo-400" />
                    <span>AI 实时考点剖析与题眼定位</span>
                    <span class="correct-badge">标准答案: B (已匹配)</span>
                  </div>
                  <p class="ai-insight-explanation">
                    <strong>【定位题眼】</strong> 原文倒数第二句明确指出
                    <em>"cognitive integration appears to be dynamically mediated..."</em>。选项 B
                    中
                    <em>"bridges theoretical hypotheses with empirical neural evidence"</em>
                    正确同义替换了原句主旨。干扰项 A 混淆了历史渊源，C 偷换了行为主义范式。
                  </p>
                </div>
              </div>

              <!-- 右侧 AI 主客观测评与战力雷达 -->
              <aside class="cockpit-ai-sidebar">
                <div class="ai-eval-card">
                  <div class="ai-eval-head">
                    <Brain class="w-5 h-5 text-indigo-400" />
                    <h4>全真模考综合态势</h4>
                  </div>

                  <div class="predicted-score-display">
                    <div class="score-number">596</div>
                    <div class="score-label">预测模考总分 (预估达成 85%)</div>
                    <div class="score-tag">超过全站 92.4% 考生</div>
                  </div>

                  <div class="skills-mini-bars">
                    <div class="mini-bar-row">
                      <div class="mini-bar-info">
                        <span>听力辨音速率</span>
                        <strong>94%</strong>
                      </div>
                      <div class="mini-track"><div class="mini-fill" style="width: 94%"></div></div>
                    </div>

                    <div class="mini-bar-row">
                      <div class="mini-bar-info">
                        <span>长难句结构穿透</span>
                        <strong>88%</strong>
                      </div>
                      <div class="mini-track"><div class="mini-fill" style="width: 88%"></div></div>
                    </div>

                    <div class="mini-bar-row">
                      <div class="mini-bar-info">
                        <span>仔细阅读题眼定位</span>
                        <strong>92%</strong>
                      </div>
                      <div class="mini-track"><div class="mini-fill" style="width: 92%"></div></div>
                    </div>

                    <div class="mini-bar-row">
                      <div class="mini-bar-info">
                        <span>写作逻辑连贯度</span>
                        <strong>86%</strong>
                      </div>
                      <div class="mini-track"><div class="mini-fill" style="width: 86%"></div></div>
                    </div>
                  </div>

                  <div class="simulator-cta-box">
                    <button class="cockpit-submit-btn" @click="handleStartMock('/mock-exam')">
                      <Zap class="w-4 h-4" />
                      <span>开启完整模考演练</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. 科学提分 4 步闭环工作流 -->
      <section class="mastery-pipeline-section">
        <div class="exams-container">
          <div class="section-center-head">
            <span class="micro-kicker">SCIENTIFIC METHODOLOGY</span>
            <h2 class="section-heading">4 步科学模考提分闭环</h2>
            <p class="section-subtext">
              拒绝无效盲目刷题，通过诊断、专攻、高压模考与雷达归因完成能力升维
            </p>
          </div>

          <div class="pipeline-steps-grid">
            <div class="pipeline-step-card">
              <div class="step-num-pill">01</div>
              <div class="step-icon-deck">
                <Compass class="w-6 h-6 text-blue-400" />
              </div>
              <h4 class="step-title">全真摸底诊断</h4>
              <p class="step-desc">
                30 分钟极速自适应诊断，全面测定当前词汇量、听音反应时及语法骨架缺陷。
              </p>
            </div>

            <div class="pipeline-arrow-deck">
              <ChevronRight class="w-6 h-6" />
            </div>

            <div class="pipeline-step-card">
              <div class="step-num-pill">02</div>
              <div class="step-icon-deck">
                <Zap class="w-6 h-6 text-indigo-400" />
              </div>
              <h4 class="step-title">AI 靶向专项专攻</h4>
              <p class="step-desc">
                根据诊断错因图谱，每日智能推送同源长难句、干扰项辨析与同类变式真题练习。
              </p>
            </div>

            <div class="pipeline-arrow-deck">
              <ChevronRight class="w-6 h-6" />
            </div>

            <div class="pipeline-step-card">
              <div class="step-num-pill">03</div>
              <div class="step-icon-deck">
                <Clock class="w-6 h-6 text-amber-400" />
              </div>
              <h4 class="step-title">1:1 限时高压模考</h4>
              <p class="step-desc">
                严格按照官方时钟倒计时、全真机考排版进行全套演练，提前适应考试心理抗压能力。
              </p>
            </div>

            <div class="pipeline-arrow-deck">
              <ChevronRight class="w-6 h-6" />
            </div>

            <div class="pipeline-step-card">
              <div class="step-num-pill">04</div>
              <div class="step-icon-deck">
                <TrendingUp class="w-6 h-6 text-emerald-400" />
              </div>
              <h4 class="step-title">多维归因与提分突破</h4>
              <p class="step-desc">
                秒级输出主客观详尽双评报告，自动将错题收录进智能错题本并制定 14 天冲刺策略。
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. 备考学霸提分荣誉榜 -->
      <section class="high-scorers-section">
        <div class="exams-container">
          <div class="section-center-head">
            <span class="micro-kicker">SUCCESS STORIES</span>
            <h2 class="section-heading">备考学员提分战报</h2>
            <p class="section-subtext">真实备考轨迹，见证每一个从迷茫到高分自信跨越的真实蜕变</p>
          </div>

          <div class="scorers-cards-grid">
            <div v-for="(scorer, sIdx) in highScorers" :key="sIdx" class="scorer-card">
              <div class="scorer-header">
                <div class="scorer-avatar-box">
                  <span class="scorer-avatar">{{ scorer.avatar }}</span>
                </div>
                <div class="scorer-meta">
                  <h4 class="scorer-name">{{ scorer.name }}</h4>
                  <span class="scorer-exam">{{ scorer.exam }}</span>
                </div>
                <div class="scorer-tag-pill">
                  {{ scorer.tag }}
                </div>
              </div>

              <div class="score-jump-strip">
                <div class="jump-label">提分战果</div>
                <div class="jump-value">{{ scorer.scoreChange }}</div>
                <div class="jump-boost">{{ scorer.boost }}</div>
              </div>

              <p class="scorer-quote">“{{ scorer.feedback }}”</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. 宇宙极光模考邀请 CTA 横幅 -->
      <section class="exam-launch-cta-section">
        <div class="exams-container">
          <div class="launch-cta-banner">
            <div class="cta-aurora-bg"></div>

            <div class="cta-content-wrapper">
              <div class="cta-kicker-pill">
                <Sparkles class="w-4 h-4 text-emerald-400" />
                <span>立即检验你的真实应试战力</span>
              </div>

              <h2 class="cta-headline">准备好在下一次考试中脱颖而出了吗？</h2>

              <p class="cta-subhead">
                已有超过 200,000+ 学员在 LearnSphere 开启全真模考训练。无需安装，即刻体验 1:1
                权威仿真考场。
              </p>

              <div class="cta-btn-group">
                <button class="cta-primary-btn" @click="handleStartMock('/mock-exam')">
                  <Zap class="w-5 h-5" />
                  <span>立即免费进入全真模考</span>
                  <ArrowRight class="w-5 h-5" />
                </button>

                <button class="cta-secondary-btn" @click="handleExplorePractice">
                  <span>查看我的学习看板</span>
                </button>
              </div>

              <div class="cta-guarantee-row">
                <span class="guarantee-item">
                  <CheckCircle2 class="w-4 h-4 text-emerald-400" /> 近 10 年权威真题全量收录
                </span>
                <span class="guarantee-item">
                  <CheckCircle2 class="w-4 h-4 text-emerald-400" /> AI 主观题秒级多维评分
                </span>
                <span class="guarantee-item">
                  <CheckCircle2 class="w-4 h-4 text-emerald-400" /> 错题本无缝自动归因
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
/* ========================================================
   1. 统一设计系统 CSS 变量与基础画布
   ======================================================== */
.exams-page {
  --ep-bg: #060813;
  --ep-card-bg: rgba(15, 23, 42, 0.72);
  --ep-card-border: rgba(255, 255, 255, 0.08);
  --ep-card-hover-border: rgba(30, 107, 82, 0.4);
  --ep-text-primary: #f8fafc;
  --ep-text-secondary: #94a3b8;
  --ep-text-muted: #94a3b8;
  --ep-surface-muted: rgba(255, 255, 255, 0.04);
  /* 默认（深色主题）块：原 #1e6b52 是深绿，
     作为文字色压在深底上只有 2.43:1。改用浅一档的品牌绿。 */
  --ep-accent: #5fa88b;
  --ep-accent-glow: rgba(95, 168, 139, 0.25);
  --ep-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.6);
  --ep-chip-bg: rgba(255, 255, 255, 0.06);
  /* 卡片 accentColor 来自 JS 数据，只适合做边框/装饰；
     文字另走主题令牌，避免亮色字压浅色主题的浅底 */
  --exam-accent-ink: var(--tone-emerald);

  min-height: 100vh;
  background-color: var(--ep-bg);
  color: var(--ep-text-primary);
  background-image: transparent;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 浅色白金极光主题适配 (WCAG AA 高对比度) */
html[data-theme='light'] .exams-page {
  --ep-bg: #f8fafc;
  --ep-card-bg: rgba(255, 255, 255, 0.94);
  --ep-card-border: rgba(203, 213, 225, 0.85);
  --ep-card-hover-border: rgba(30, 107, 82, 0.45);
  --ep-text-primary: #0f172a;
  --ep-text-secondary: #475569;
  --ep-text-muted: #52606f;
  --ep-surface-muted: rgba(241, 245, 249, 0.85);
  --ep-accent: #1e6b52;
  --ep-accent-glow: rgba(30, 107, 82, 0.15);
  --ep-shadow: 0 16px 36px -10px rgba(148, 163, 184, 0.22);
  --ep-chip-bg: rgba(241, 245, 249, 0.95);
  /* 浅色主题：与深色档同用语义令牌，随主题自动取深绿档 */
  --exam-accent-ink: var(--tone-emerald);

  background-color: var(--ep-bg);
}

.exams-container {
  max-width: 1380px;
  width: 100%;
  margin: 0 auto;
  padding: 0 clamp(16px, 3.5vw, 40px);
}

.exams-main {
  position: relative;
  z-index: 1;
}

/* ========================================================
   2. Hero 看板与分类 Tabs
   ======================================================== */
.exams-hero-section {
  padding: 64px 0 36px;
  position: relative;
}

.hero-center-deck {
  max-width: 880px;
  margin: 0 auto 48px;
}

.hero-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  border-radius: 9999px;
  margin-bottom: 20px;
}

.pulsing-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: beacon-pulse 2s infinite ease-in-out;
}

@keyframes beacon-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}

.kicker-text {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--ep-text-secondary);
  text-transform: uppercase;
}

.hero-title {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: var(--ep-text-primary);
  margin-bottom: 18px;
}

.gradient-text {
  display: block;
  background: none;
  color: inherit;
}

html[data-theme='light'] .gradient-text {
  background: none;
  color: inherit;
}

.hero-subtitle {
  font-size: clamp(1rem, 1.3vw, 1.15rem);
  line-height: 1.65;
  color: var(--ep-text-secondary);
  max-width: 720px;
  margin: 0 auto 36px;
}

/* 分类选项卡 Tabs */
.category-tabs-container {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
  justify-content: center;
}

.category-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--ep-text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.category-tab-btn:hover {
  color: var(--ep-text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.category-tab-btn.active {
  background: var(--ep-card-bg);
  color: var(--ep-text-primary);
  border-color: var(--ep-accent);
}

.tab-btn-icon {
  width: 18px;
  height: 18px;
}

.category-tab-btn.active .tab-btn-icon {
  color: var(--ep-accent);
}

.tab-btn-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: var(--ep-chip-bg);
  border: 1px solid var(--ep-card-border);
  color: var(--ep-text-muted);
}

.category-tab-btn.active .tab-btn-badge {
  color: var(--ep-accent);
  border-color: var(--ep-accent);
}

/* ========================================================
   3. 三大核心支撑特性卡片 (Pillars)
   ======================================================== */
.core-pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 24px;
}

.pillar-card {
  background: var(--ep-card-bg);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease;
}

.pillar-card:hover {
  transform: translateY(-4px);
  border-color: var(--pillar-color);
}

.pillar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pillar-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: rgba(30, 107, 82, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pillar-color);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.pillar-icon {
  width: 24px;
  height: 24px;
}

.pillar-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--pillar-color);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--ep-card-border);
}

.pillar-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ep-text-primary);
  margin-bottom: 8px;
}

.pillar-desc {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--ep-text-secondary);
  margin: 0;
}

/* ========================================================
   4. 考试卡片矩阵
   ======================================================== */
.exams-grid-section {
  padding: 40px 0 60px;
}

.section-title-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.sub-section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ep-text-primary);
  margin-bottom: 6px;
}

.sub-section-desc {
  font-size: 0.92rem;
  color: var(--ep-text-secondary);
  margin: 0;
}

.stats-badge-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  border-radius: 9999px;
  font-size: 0.85rem;
  color: var(--ep-text-secondary);
}

.stats-badge-chip .chip-icon {
  width: 16px;
  height: 16px;
  color: var(--tone-amber);
}

.exam-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 24px;
  align-items: stretch;
}

.exam-rich-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--ep-card-bg);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-lg);
  transition:
    transform 0.28s ease,
    border-color 0.28s ease,
    box-shadow 0.28s ease;
  height: 100%;
}

.exam-rich-card:hover {
  transform: translateY(-6px);
  border-color: var(--exam-accent);
}

.card-glow-halo {
  position: absolute;
  top: 0;
  right: 0;
  width: 140px;
  height: 140px;
  background: transparent;
  opacity: 0.08;
  border-radius: var(--radius-lg);
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.exam-rich-card:hover .card-glow-halo {
  opacity: 0.2;
}

.card-inner-body {
  padding: 22px 20px 24px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  box-sizing: border-box;
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.exam-brand-avatar {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  /* R4：底色是各考试主题亮色，图标色改由数据层 avatarInk 给出固定深色 */
}

.avatar-icon {
  width: 24px;
  height: 24px;
}

.card-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-pill {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ep-text-muted);
  background: var(--ep-chip-bg);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--ep-card-border);
}

.status-pill {
  font-size: 0.72rem;
  font-weight: 700;
  /* 底色固定是 8% 品牌绿，文字改用随主题切换的墨绿令牌 */
  color: var(--exam-accent-ink);
  background: rgba(30, 107, 82, 0.08);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--ep-card-border);
}

.card-title-group {
  margin-bottom: 8px;
}

.exam-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ep-text-primary);
  margin-bottom: 4px;
}

.target-score-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--exam-accent-ink);
}

.target-icon {
  width: 14px;
  height: 14px;
}

.exam-description {
  font-size: 0.84rem;
  line-height: 1.5;
  color: var(--ep-text-secondary);
  margin-bottom: 14px;
}

/* 关键指标栏 */
.exam-metrics-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  margin-bottom: 12px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-val {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--ep-text-primary);
}

.metric-val.text-accent {
  color: var(--tone-emerald);
}

.metric-lbl {
  font-size: 0.68rem;
  color: var(--ep-text-muted);
  margin-top: 2px;
}

.metric-divider {
  width: 1px;
  height: 20px;
  background: var(--ep-card-border);
}

/* 专项标签流 */
.exam-tags-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.exam-tag-pill {
  font-size: 0.72rem;
  padding: 3px 8px;
  border-radius: 6px;
  background: var(--ep-chip-bg);
  border: 1px solid var(--ep-card-border);
  color: var(--ep-text-secondary);
}

/* 底部操作 Dock */
.card-actions-dock {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 6px;
}

.primary-mock-btn {
  flex: 1;
  min-height: 42px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-md);
  border: 1px solid var(--exam-accent);
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.primary-mock-btn:hover {
  transform: translateY(-2px);
}

.btn-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.primary-mock-btn:hover .btn-arrow {
  transform: translateX(4px);
}

.secondary-view-btn {
  padding: 8px 14px;
  min-height: 42px;
  border-radius: var(--radius-md);
  border: 1px solid var(--ep-card-border);
  background: var(--ep-surface-muted);
  color: var(--ep-text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.secondary-view-btn:hover {
  color: var(--ep-text-primary);
  background: rgba(255, 255, 255, 0.08);
}

/* ========================================================
   5. 全真机考 1:1 沉浸式实战演算舱 (Live Simulator)
   ======================================================== */
.live-simulator-section {
  padding: 60px 0 80px;
}

.section-center-head {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 40px;
}

.micro-kicker {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--tone-emerald);
  text-transform: uppercase;
  margin-bottom: 8px;
  display: block;
}

.section-heading {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 800;
  color: var(--ep-text-primary);
  margin-bottom: 12px;
}

.section-subtext {
  font-size: 1rem;
  color: var(--ep-text-secondary);
  line-height: 1.6;
}

.simulator-cockpit-frame {
  background: var(--ep-card-bg);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 顶栏控制条 */
.cockpit-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(15, 23, 42, 0.85);
  border-bottom: 1px solid var(--ep-card-border);
  flex-wrap: wrap;
  gap: 12px;
}

html[data-theme='light'] .cockpit-header-bar {
  background: rgba(241, 245, 249, 0.95);
}

.header-left-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.live-exam-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--tone-emerald);
}

.live-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: beacon-pulse 1.6s infinite ease-in-out;
}

.exam-subject-label {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ep-text-primary);
}

.header-right-clock {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 6px 14px;
  border-radius: var(--radius-md);
}

.clock-icon {
  width: 18px;
  height: 18px;
  color: var(--tone-red);
}

.countdown-val {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--tone-red);
  letter-spacing: 0.05em;
}

.countdown-sub {
  font-size: 0.72rem;
  color: var(--ep-text-muted);
}

/* 考场三栏主体布局 */
.cockpit-body-layout {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  min-height: 540px;
}

/* 左侧答题卡矩阵 */
.sheet-sidebar {
  padding: 20px;
  background: var(--ep-surface-muted);
  border-right: 1px solid var(--ep-card-border);
  display: flex;
  flex-direction: column;
}

.sheet-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--ep-text-primary);
  margin-bottom: 12px;
}

.sheet-icon {
  width: 16px;
  height: 16px;
  color: var(--ep-accent);
}

.sheet-legend-row {
  display: flex;
  gap: 12px;
  font-size: 0.72rem;
  color: var(--ep-text-muted);
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-item .dot.answered {
  background: #10b981;
}
.legend-item .dot.current {
  background: #3b82f6;
}
.legend-item .dot.flagged {
  background: #f59e0b;
}

.sheet-matrix-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.sheet-bubble {
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--ep-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--ep-chip-bg);
  color: var(--ep-text-muted);
  transition: all 0.2s ease;
}

.sheet-bubble.answered {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.4);
  color: var(--tone-emerald);
}

.sheet-bubble.current,
.sheet-bubble.active {
  background: rgba(59, 130, 246, 0.25);
  border-color: var(--tone-blue);
  color: var(--tone-blue);
}

.sheet-bubble.flagged {
  background: rgba(245, 158, 11, 0.18);
  border-color: var(--tone-amber);
  color: var(--tone-amber);
}

.sheet-action-box {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--ep-card-border);
}

.sheet-progress-text {
  font-size: 0.76rem;
  color: var(--ep-text-secondary);
  margin-bottom: 6px;
}

.sheet-progress-bar {
  height: 6px;
  background: var(--ep-chip-bg);
  border-radius: 9999px;
  overflow: hidden;
}

.sheet-progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 9999px;
}

/* 中间题目区 */
.question-main-content {
  padding: 24px 30px;
  display: flex;
  flex-direction: column;
}

.question-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.q-index-pill {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--tone-blue);
  background: rgba(59, 130, 246, 0.12);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.q-type-pill {
  font-size: 0.78rem;
  color: var(--ep-text-muted);
}

.q-flag-action {
  margin-left: auto;
}

.flag-btn {
  background: transparent;
  border: 1px solid var(--ep-card-border);
  color: var(--ep-text-secondary);
  font-size: 0.76rem;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.flag-btn:hover {
  color: var(--tone-amber);
  border-color: var(--tone-amber);
}

.reading-passage-snippet {
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-md);
  padding: 16px;
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--ep-text-secondary);
  margin-bottom: 20px;
}

.highlight-sentence {
  color: var(--ep-text-primary);
  background: rgba(30, 107, 82, 0.15);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 600;
  border-bottom: 1.5px dashed #5fa88b;
}

.q-prompt-text {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--ep-text-primary);
  margin-bottom: 16px;
}

.options-list-deck {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.option-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(30, 107, 82, 0.3);
}

.option-item-card.selected {
  background: rgba(30, 107, 82, 0.12);
  border-color: var(--ep-accent);
}

.option-key-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--ep-chip-bg);
  border: 1px solid var(--ep-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ep-text-primary);
}

.option-item-card.selected .option-key-badge {
  background: var(--ep-accent);
  /* R4：实心品牌底不再跟随主题文字色，固定用品牌墨色保证 4.5:1 */
  color: var(--brand-ink);
  border-color: var(--ep-accent);
}

.option-content-text {
  font-size: 0.9rem;
  color: var(--ep-text-secondary);
  flex: 1;
}

.option-item-card.selected .option-content-text {
  color: var(--ep-text-primary);
  font-weight: 500;
}

.option-check-icon {
  margin-left: 8px;
}

/* AI 即时分析抽屉 */
.ai-insight-drawer {
  background: rgba(30, 107, 82, 0.08);
  border: 1px solid rgba(30, 107, 82, 0.25);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
}

.ai-insight-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--tone-emerald);
  margin-bottom: 6px;
}

.correct-badge {
  font-size: 0.72rem;
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: auto;
}

.ai-insight-explanation {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--ep-text-secondary);
  margin: 0;
}

/* 右侧评估态势 */
.cockpit-ai-sidebar {
  padding: 20px;
  background: var(--ep-surface-muted);
  border-left: 1px solid var(--ep-card-border);
}

.ai-eval-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ai-eval-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.ai-eval-head h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ep-text-primary);
  margin: 0;
}

.predicted-score-display {
  text-align: center;
  padding: 18px;
  background: var(--ep-card-bg);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
}

.score-number {
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1;
  background: none;
  color: inherit;
  margin-bottom: 4px;
}

.score-label {
  font-size: 0.75rem;
  color: var(--ep-text-muted);
  margin-bottom: 8px;
}

.score-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.08);
  padding: 2px 8px;
  border-radius: 6px;
}

.skills-mini-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.mini-bar-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mini-bar-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  color: var(--ep-text-secondary);
}

.mini-bar-info strong {
  color: var(--ep-text-primary);
}

.mini-track {
  height: 5px;
  background: var(--ep-chip-bg);
  border-radius: 9999px;
  overflow: hidden;
}

.mini-fill {
  height: 100%;
  background: var(--brand);
  border-radius: 9999px;
}

.simulator-cta-box {
  margin-top: auto;
}

.cockpit-submit-btn {
  width: 100%;
  min-height: 42px;
  border-radius: var(--radius-md);
  background: var(--brand);
  border: none;
  color: var(--brand-ink);
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cockpit-submit-btn:hover {
  transform: translateY(-2px);
}

/* ========================================================
   6. 4 步科学模考闭环
   ======================================================== */
.mastery-pipeline-section {
  padding: 60px 0;
  border-top: 1px solid var(--ep-card-border);
}

.pipeline-steps-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.pipeline-step-card {
  flex: 1;
  min-width: 220px;
  background: var(--ep-card-bg);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  position: relative;
  transition: transform 0.25s ease;
}

.pipeline-step-card:hover {
  transform: translateY(-4px);
}

.step-num-pill {
  position: absolute;
  top: 18px;
  right: 18px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 1.1rem;
  font-weight: 800;
  /* R8：去掉 0.5 透明度，改用更亮的次要文字色表达层级 */
  color: var(--ep-text-secondary);
}

.step-icon-deck {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ep-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.step-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ep-text-primary);
  margin-bottom: 8px;
}

.step-desc {
  font-size: 0.84rem;
  line-height: 1.6;
  color: var(--ep-text-secondary);
  margin: 0;
}

.pipeline-arrow-deck {
  /* R8：箭头图标原本 0.6 透明，压到 3:1 以下，改为直接用次要文字色 */
  color: var(--ep-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1024px) {
  .pipeline-arrow-deck {
    display: none;
  }
}

/* ========================================================
   7. 备考学霸提分荣誉榜
   ======================================================== */
.high-scorers-section {
  padding: 60px 0;
}

.scorers-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.scorer-card {
  background: var(--ep-card-bg);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.scorer-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.scorer-avatar-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.scorer-meta {
  flex: 1;
}

.scorer-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ep-text-primary);
  margin: 0 0 2px 0;
}

.scorer-exam {
  font-size: 0.78rem;
  color: var(--ep-text-muted);
}

.scorer-tag-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.08);
  padding: 3px 8px;
  border-radius: 6px;
}

.score-jump-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  margin-bottom: 14px;
}

.jump-label {
  font-size: 0.75rem;
  color: var(--ep-text-muted);
}

.jump-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--ep-text-primary);
}

.jump-boost {
  font-size: 0.82rem;
  font-weight: 800;
  /* R5：低透明度红底上的文字改用暗/亮主题语义红 */
  color: var(--tone-red);
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
}

.scorer-quote {
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--ep-text-secondary);
  margin: 0;
  font-style: italic;
}

/* ========================================================
   8. 极光模考邀请 CTA 横幅
   ======================================================== */
.exam-launch-cta-section {
  padding: 40px 0 90px;
}

.launch-cta-banner {
  position: relative;
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.3);
  border-radius: var(--radius-lg);
  padding: 60px clamp(20px, 4vw, 56px);
  overflow: hidden;
  text-align: center;
}

html[data-theme='light'] .launch-cta-banner {
  border-color: rgba(30, 107, 82, 0.35);
}

.cta-aurora-bg {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 300px;
  background: transparent;
  filter: blur(60px);
  pointer-events: none;
}

.cta-content-wrapper {
  position: relative;
  z-index: 1;
  max-width: 820px;
  margin: 0 auto;
}

.cta-kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--ep-card-border);
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ep-text-primary);
  margin-bottom: 20px;
}

.cta-headline {
  font-size: clamp(1.8rem, 3.2vw, 2.6rem);
  font-weight: 800;
  color: var(--ep-text-primary);
  line-height: 1.25;
  margin-bottom: 16px;
}

.cta-subhead {
  font-size: clamp(0.95rem, 1.2vw, 1.08rem);
  line-height: 1.65;
  color: var(--ep-text-secondary);
  max-width: 680px;
  margin: 0 auto 36px;
}

.cta-btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.cta-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: var(--radius-lg);
  background: var(--brand);
  border: none;
  color: var(--brand-ink);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cta-primary-btn:hover {
  transform: translateY(-2px);
}

.cta-secondary-btn {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  border-radius: var(--radius-lg);
  background: var(--ep-surface-muted);
  border: 1px solid var(--ep-card-border);
  color: var(--ep-text-primary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cta-secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.cta-guarantee-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  flex-wrap: wrap;
  font-size: 0.84rem;
  color: var(--ep-text-muted);
}

.guarantee-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ========================================================
   9. 响应式适配
   ======================================================== */
@media (max-width: 1100px) {
  .cockpit-body-layout {
    grid-template-columns: 1fr;
  }
  .sheet-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--ep-card-border);
  }
  .cockpit-ai-sidebar {
    border-left: none;
    border-top: 1px solid var(--ep-card-border);
  }
  .core-pillars-grid {
    grid-template-columns: 1fr;
  }
  .scorers-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .exams-hero-section {
    padding: 40px 0 24px;
  }
  .hero-title {
    font-size: 1.85rem;
  }
  .exam-cards-grid {
    grid-template-columns: 1fr;
  }
  .category-tabs-container {
    width: 100%;
  }
  .category-tab-btn {
    flex: 1 1 calc(50% - 10px);
    justify-content: center;
  }

  /* 「标记此题」原本 padding:4px 10px + 0.76rem，实测仅 73×29 */
  .flag-btn {
    min-height: 32px;
    min-width: 32px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .category-tab-btn {
    flex: 1 1 100%;
  }
  .card-actions-dock {
    flex-direction: column;
  }
  .secondary-view-btn {
    width: 100%;
  }

  /* 装饰性极光光斑固定 600px 宽，在 480 视口造成横向溢出；限宽到容器内 */
  .cta-aurora-bg {
    max-width: 100%;
  }
}
</style>
