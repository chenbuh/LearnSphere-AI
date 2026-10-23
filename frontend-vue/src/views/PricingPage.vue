<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, NModal } from 'naive-ui'
import QrcodeVue from 'qrcode.vue'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'
import { paymentApi } from '../api/payment'
import { annualSavingPercent, formatPrice, resolveVipPlans } from '../utils/vipPlans'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'
import {
  Zap,
  ShieldCheck,
  Lock,
  Globe,
  CreditCard,
  Check,
  X,
  Sparkles,
  Crown,
  Award,
  ChevronDown,
  HelpCircle,
  Users,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Headphones
} from 'lucide-vue-next'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()
const systemStore = useSystemStore()

// 计费周期切换：monthly | annual
const billingCycle = ref('monthly')

// 默认选中的套餐
const activePlan = ref('季度会员')
const showCheckoutModal = ref(false)
const selectedPlanData = ref(null)
const isPaying = ref(false)
const payType = ref('alipay')
const paymentEnabled = ref(false)
const paymentUnavailableMessage = '在线支付暂未开放，请联系管理员开通会员'
const PLAN_LEVELS = { monthly: 1, quarterly: 2, annual: 3 }
// 当前用户各套餐报价：升级时按剩余天数折算抵扣（未登录时为空，按原价展示）
const quotes = ref({})
const QUOTE_LABELS = { RENEW: '续费', UPGRADE: '升级' }
const quoteFor = (plan) => quotes.value[PLAN_LEVELS[plan?.id]] || null
const ctaText = (plan) => {
  const q = quoteFor(plan)
  if (q?.type === 'DOWNGRADE') return '会员期内不可降级'
  if (q?.type === 'UPGRADE') return `补差价升级 ¥${formatMoney(q.payable)}`
  if (q?.type === 'RENEW') return '续费此方案'
  return activePlan.value === plan.name ? '立即开通' : plan.buttonText
}
const formatMoney = (value) => formatPrice(Number(value))
const loadQuotes = async () => {
  if (!userStore.token) return
  try {
    const { data } = await paymentApi.getQuote()
    quotes.value = Object.fromEntries((data || []).map((q) => [q.vipLevel, q]))
  } catch (e) {
    quotes.value = {}
  }
}
const selectedQuote = computed(() => quoteFor(selectedPlanData.value))
const payableText = computed(() => {
  const q = selectedQuote.value
  return q ? `¥${formatMoney(q.payable)}` : selectedPlanData.value?.price
})

const PAY_METHODS = [
  { value: 'alipay', name: '支付宝', desc: '跳转支付宝收银台完成付款' },
  { value: 'wxpay', name: '微信支付', desc: '扫码支付，无需跳转' }
]

// FAQ 折叠状态
const openFaqIndex = ref(0)
const toggleFaq = (idx) => {
  openFaqIndex.value = openFaqIndex.value === idx ? -1 : idx
}

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
  if (quoteFor(plan)?.type === 'DOWNGRADE') {
    message.info('当前会员有效期内不支持购买更低档位，可续费或升级')
    return
  }
  selectedPlanData.value = plan
  showCheckoutModal.value = true
}

/* ============================================================
   自建二维码收款窗口
   ------------------------------------------------------------
   微信支付走 device=pc 向网关取 qrcode 链接，由本页自行渲染二维码，
   用户在当前页面扫码完成付款，不再跳转到支付平台页面。
   支付宝仍走 jump 自适应跳转。
   ============================================================ */
const showQrModal = ref(false)
const qrCodeUrl = ref('')
const qrOutTradeNo = ref('')
const qrAmount = ref('')
const qrPlanName = ref('')
const qrState = ref('waiting') // waiting | paid | expired
const qrSecondsLeft = ref(0)
const qrChecking = ref(false)

const QR_TTL_SECONDS = 5 * 60
// 轮询间隔 5 秒：后端全局限流为每 IP 60 次/分钟，超限封禁 10 分钟。
// 间隔过密（如 2.5 秒）会占掉一半配额，且封禁期间连订单状态都查不到，
// 用户付了款却看不到结果。5 秒 = 12 次/分钟，留足余量。
const QR_POLL_INTERVAL_MS = 5000
// 命中限流后大幅退避，避免继续消耗配额、把临时限流拖成 IP 封禁
const QR_RATE_LIMIT_BACKOFF_MS = 30000
let qrPollTimer = null
let qrTickTimer = null

const qrTimeText = computed(() => {
  const s = Math.max(0, qrSecondsLeft.value)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
})

const stopQrTimers = () => {
  if (qrPollTimer) window.clearTimeout(qrPollTimer)
  if (qrTickTimer) window.clearInterval(qrTickTimer)
  qrPollTimer = null
  qrTickTimer = null
}

const closeQrModal = () => {
  stopQrTimers()
  showQrModal.value = false
  qrState.value = 'waiting'
  qrCodeUrl.value = ''
  qrOutTradeNo.value = ''
}

const onQrPaid = () => {
  stopQrTimers()
  qrState.value = 'paid'
  message.success('支付成功，会员已开通')
  userStore.getUserInfo?.().catch(() => {})
  loadQuotes()
  const orderNo = qrOutTradeNo.value
  window.setTimeout(() => {
    closeQrModal()
    router.push({ path: '/payment/result', query: { out_trade_no: orderNo } })
  }, 1200)
}

// 轮询订单状态：网关异步通知可能延迟，这里主动查询兜底
const pollQrOrder = async () => {
  if (!showQrModal.value || qrState.value === 'paid') return
  if (qrSecondsLeft.value <= 0) {
    qrState.value = 'expired'
    stopQrTimers()
    return
  }
  try {
    // silent：轮询失败不弹全局提示，避免限流时连续弹窗
    const { data } = await paymentApi.getOrder(qrOutTradeNo.value, { silent: true })
    if (data?.status === 'PAID') {
      onQrPaid()
      return
    }
  } catch (e) {
    // 命中全局限流（HTTP 429）时退避，否则会一路把临时限流拖成 10 分钟 IP 封禁
    if (e?.response?.status === 429) {
      qrPollTimer = window.setTimeout(pollQrOrder, QR_RATE_LIMIT_BACKOFF_MS)
      return
    }
    // 其它网络抖动忽略，下个周期继续
  }
  qrPollTimer = window.setTimeout(pollQrOrder, QR_POLL_INTERVAL_MS)
}

const openQrModal = (payload) => {
  qrCodeUrl.value = payload.qrcode
  qrOutTradeNo.value = payload.outTradeNo
  qrAmount.value = formatMoney(payload.amount)
  qrPlanName.value = selectedPlanData.value?.name || ''
  qrState.value = 'waiting'
  qrSecondsLeft.value = QR_TTL_SECONDS
  showQrModal.value = true
  stopQrTimers()
  qrTickTimer = window.setInterval(() => {
    if (qrSecondsLeft.value > 0) qrSecondsLeft.value -= 1
    if (qrSecondsLeft.value <= 0 && qrState.value === 'waiting') {
      qrState.value = 'expired'
      if (qrPollTimer) window.clearTimeout(qrPollTimer)
      qrPollTimer = null
    }
  }, 1000)
  qrPollTimer = window.setTimeout(pollQrOrder, QR_POLL_INTERVAL_MS)
}

// 用户手动点「我已完成支付」时立即查一次
const checkQrNow = async () => {
  if (qrChecking.value || !qrOutTradeNo.value) return
  qrChecking.value = true
  try {
    const { data } = await paymentApi.getOrder(qrOutTradeNo.value)
    if (data?.status === 'PAID') {
      onQrPaid()
    } else {
      message.info('尚未收到支付结果，请完成扫码后再试')
    }
  } catch (e) {
    message.warning('查询失败，请稍后重试')
  } finally {
    qrChecking.value = false
  }
}

/**
 * 选择设备类型：
 * - 微信内浏览器必须用 wechat（JSAPI），否则二维码在微信里无法长按识别且易被风控
 * - 其余微信支付场景统一用 pc —— 取回 qrcode 由本页渲染二维码，不跳转平台页面
 * - 支付宝用 jump 自适应跳转
 */
const resolveDevice = (type) => {
  if (type !== 'wxpay') return 'jump'
  const ua = navigator.userAgent || ''
  if (/MicroMessenger/i.test(ua)) return 'wechat'
  return 'pc'
}

const handlePayment = async () => {
  if (!paymentEnabled.value) {
    message.warning(paymentUnavailableMessage)
    return
  }
  isPaying.value = true
  try {
    const { data: paymentToken } = await paymentApi.getPaymentToken()
    const device = resolveDevice(payType.value)
    const { data } = await paymentApi.checkout({
      paymentToken,
      vipLevel: PLAN_LEVELS[selectedPlanData.value.id],
      payType: payType.value,
      device
    })
    // 记下订单号，支付完成后结果页据此查询（部分网关回跳不带参数）
    sessionStorage.setItem('learnsphere-pending-order', data.outTradeNo)

    // 拿到二维码链接 → 自建收款窗口；否则退回跳转模式
    if (data.qrcode) {
      showCheckoutModal.value = false
      isPaying.value = false
      openQrModal(data)
      return
    }
    window.location.href = data.payUrl
  } catch (e) {
    // 错误提示由请求拦截器统一弹出
    isPaying.value = false
  }
}

onBeforeUnmount(stopQrTimers)

// 基础套餐定义（价格和额度由 resolveVipPlans 按后台配置填入）
const buildBasePlans = (q) => [
  {
    id: 'free',
    name: '基础版',
    tagline: '永久免费 · 轻松尝鲜',
    price: '免费',
    period: '永久',
    dailyQuota: `每日 ${q[0].aiQuota} 点能量 · 助教 ${q[0].tutorQuota} 次`,
    icon: Sparkles,
    badge: null,
    popular: false,
    color: '#94a3b8',
    gradient: '#64748b',
    features: [
      '基础词汇与发音练习',
      '支持所有 AI 核心功能轻量试用',
      `共享 ${q[0].aiQuota} 点/日 通用能量`,
      '基础学习进度统计看板',
      '社区问答互助支持'
    ],
    buttonText: '当前基础方案'
  },
  {
    id: 'monthly',
    name: '月度会员',
    tagline: '单月攻坚 · 灵活首选',
    price: `¥${formatPrice(q[1].price)}`,
    period: '/月',
    dailyQuota: `每日 ${q[1].aiQuota} 点能量 · 助教 ${q[1].tutorQuota} 次`,
    icon: Zap,
    badge: '单月灵活',
    popular: false,
    color: '#3b82f6',
    gradient: '#3b82f6',
    features: [
      '包含基础版所有权益',
      `AI 能量大幅扩容 (${q[1].aiQuota}点/日)`,
      '解锁高阶 AI 口语对话评测',
      '全真模拟考试系统 (不限套数)',
      '智能错题本与弱项溯源分析',
      '无广告纯净学习环境'
    ],
    buttonText: '选择此方案'
  },
  {
    id: 'quarterly',
    name: '季度会员',
    tagline: '备考黄金期 · 90天提分',
    price: `¥${formatPrice(q[2].price)}`,
    period: '/季',
    dailyQuota: `每日 ${q[2].aiQuota} 点能量 · 助教 ${q[2].tutorQuota} 次`,
    icon: Crown,
    badge: '🔥 超值精选',
    popular: true,
    color: 'var(--tone-emerald)',
    gradient: '#2b7a60',
    features: [
      '包含月度会员所有功能',
      `最高性价比能量配比 (${q[2].aiQuota}点/日)`,
      'AI 导师主观题深度逐句精批',
      '专属季度学情复盘诊断报告',
      '优先专家客服通道 (10分钟响应)',
      '多端学习数据毫秒级同步'
    ],
    buttonText: '立即订阅'
  },
  {
    id: 'annual',
    name: '年度会员',
    tagline: '全年无忧 · 长期主义',
    price: `¥${formatPrice(q[3].price)}`,
    period: '/年',
    dailyQuota: `每日 ${q[3].aiQuota} 点能量 · 助教 ${q[3].tutorQuota} 次`,
    icon: Award,
    badge: '💎 最佳性价比',
    popular: false,
    color: '#f59e0b',
    gradient: '#f59e0b',
    features: [
      '解锁全站顶级旗舰 VIP 身份',
      `海量 ${q[3].aiQuota} 点/日 充沛能量值`,
      'AI 备考导师私人订制学情模型',
      '全科目长难句语法树穿透解析',
      '新功能专属内测优先体验权',
      '个人主页与排行榜 VIP 尊贵金标'
    ],
    buttonText: '选择此方案'
  }
]

// 套餐价格与每日额度跟随后台配置
const planQuotas = computed(() => resolveVipPlans(systemStore.configs))
const plans = computed(() => buildBasePlans(planQuotas.value))
const quotaOf = (level) => planQuotas.value[level].aiQuota
const tutorOf = (level) => planQuotas.value[level].tutorQuota
const annualSaving = computed(() => annualSavingPercent(planQuotas.value))

// 全维权益对比矩阵数据
const comparisonMatrix = computed(() => [
  {
    category: 'AI 核心引擎与对话',
    rows: [
      { name: '每日可用 AI 能量点数', free: `${quotaOf(0)} 点/日`, monthly: `${quotaOf(1)} 点/日`, quarterly: `${quotaOf(2)} 点/日`, annual: `${quotaOf(3)} 点/日` },
      { name: '1V1 AI 导师深度追问答疑', free: `${tutorOf(0)} 次/日`, monthly: `${tutorOf(1)} 次/日`, quarterly: `${tutorOf(2)} 次/日 + 语法诊断`, annual: `${tutorOf(3)} 次/日 + 私人定制` },
      { name: '主观题 AI 秒级多维批改', free: '基础评分', monthly: '支持逐句语法纠偏', quarterly: '支持母语地道表达替换', annual: '行文逻辑链重塑 + 逐词精修' },
      { name: 'AI 口语真实场景对话评测', free: '不可用', monthly: '支持日常对话', quarterly: '支持考试题型连麦', annual: '高仿真真人机考对答' }
    ]
  },
  {
    category: '全真题库与备考系统',
    rows: [
      { name: '历年全套真题模考库', free: '仅公开体验卷', monthly: '全量 28+ 套收录', quarterly: '全真模考 + 考情图谱', annual: '独家考题预测与名师精练' },
      { name: '大纲标准时钟机考环境', free: '简易计时', monthly: '1:1 全仿真机考', quarterly: '1:1 全仿真机考', annual: '1:1 全仿真机考' },
      { name: '智能错题本与弱项穿透', free: '仅本地记录', monthly: '艾宾浩斯抗遗忘追踪', quarterly: '弱项图谱 + 靶向变式', annual: '考前 14 天盲点靶向消除' }
    ]
  },
  {
    category: '数据分析与尊享服务',
    rows: [
      { name: '学情战力多维雷达图', free: '基础概览', monthly: '周度趋势图', quarterly: '专属季度学情诊断报告', annual: '私人定制年终升维报告' },
      { name: '多端学习数据同步', free: '单设备', monthly: '手机/平板/电脑同步', quarterly: '手机/平板/电脑秒级同步', annual: '多设备全量无缝离线同步' },
      { name: '专属技术支持通道', free: '社区工单', monthly: '标准工单 (24h响应)', quarterly: '优先专家通道 (10m响应)', annual: '一对一教务微信专属管家' },
      { name: '身份标识与排行榜特权', free: '普通学者', monthly: '标准 VIP 徽章', quarterly: '专属【巅峰星芒】头像框', annual: '全站荣耀金色王冠尊享标' }
    ]
  }
])

// 常见问题解答
const faqs = [
  {
    q: '什么是 AI 能量值？每天什么时候重置？',
    a: 'AI 能量值是用于调用 LearnSphere 大模型核心能力（包括长难句智能剖析、AI 导师 1V1 深度对话、主观题逐句批改等）的专属计量单位。每日系统将于凌晨 00:00 自动重置补满，当天未消耗的能量不会累计到次日。'
  },
  {
    q: '如果我从中途升级到更高级别的套餐，费用如何计算？',
    a: '支持按天折算补差价升级。系统会按当前套餐价格计算剩余有效天数的价值，直接从更高档位的价格中抵扣，只需补齐差价；升级后新套餐从支付成功时起重新计时。续费同档位则在原到期时间上顺延。'
  },
  {
    q: '支持多台设备同时登录与学习吗？',
    a: '完全支持！一个 LearnSphere 账号可在电脑网页端、iPad 平板端与手机端同时登录使用。您的做题进度、错题本归因与学情战力数据会在云端毫秒级实时双向同步。'
  },
  {
    q: '订阅后可以开具发票吗？如何报销？',
    a: '可以开具正规增值税电子普通发票。购买成功后，您可以在「个人中心 ➔ 账单与设置」中自助申请开具发票，发票内容可选“现代教育培训费”或“软件技术服务费”，开具后将实时发送到您的邮箱。'
  },
  {
    q: '学校班级或企业团队采购有专属优惠吗？',
    a: '我们为高校教研室、备考班级和出国语言培训机构提供集体授权方案。10 人以上团体采购享有阶梯折扣，并附赠独立的班级学情管理后台与教师端批量排卷系统，欢迎点击页面下方联系我们。'
  }
]

onMounted(() => {
  systemStore.fetchSystemConfig({ background: true })
  paymentApi.getStatus()
    .then(({ data }) => { paymentEnabled.value = Boolean(data?.enabled) })
    .catch(() => { paymentEnabled.value = false })
  loadQuotes()
})
</script>

<template>
  <div class="pricing-page min-h-screen">
    <SiteHeader />

    <main class="pricing-main">
      <!-- 1. Hero 展厅看板与周期切换 -->
      <section class="pricing-hero-section">
        <div class="pricing-container">
          <div class="hero-center-deck text-center">
            <div class="hero-kicker-pill">
              <Sparkles class="w-4 h-4 text-emerald-400" />
              <span>TRANSPARENT & FLEXIBLE · 灵活透明的会员计划</span>
            </div>

            <h1 class="hero-title">
              简单透明的
              <span class="gradient-text">价格方案</span>
            </h1>

            <p class="hero-subtitle">
              无论您是备考四六级、全国考研还是雅思托福，按需选择最适合的学习计划，随时可以升级或取消。
            </p>

            <!-- 计费周期切换开关 -->
            <div class="billing-switcher-wrapper">
              <button
                class="billing-switch-btn"
                :class="{ active: billingCycle === 'monthly' }"
                @click="billingCycle = 'monthly'"
              >
                <span>按月付费</span>
              </button>

              <button
                class="billing-switch-btn"
                :class="{ active: billingCycle === 'annual' }"
                @click="billingCycle = 'annual'"
              >
                <span>按年付费</span>
                <span v-if="annualSaving > 0" class="save-discount-badge">比月付省 {{ annualSaving }}%</span>
              </button>
            </div>
          </div>

          <!-- 2. 四大价格套餐卡片矩阵 -->
          <div class="pricing-cards-grid">
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="pricing-tier-card"
              :class="{
                'popular-tier': plan.popular || activePlan === plan.name,
                'is-selected': activePlan === plan.name
              }"
              :style="{ '--plan-color': plan.color }"
              @click="activePlan = plan.name"
            >
              <!-- 顶部高光角标 -->
              <div v-if="plan.badge" class="tier-top-badge">
                {{ plan.badge }}
              </div>

              <div class="tier-card-body">
                <div class="tier-icon-title-row">
                  <div class="tier-icon-box" :style="{ background: plan.gradient }">
                    <component :is="plan.icon" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 class="tier-plan-name">{{ plan.name }}</h3>
                    <p class="tier-tagline">{{ plan.tagline }}</p>
                  </div>
                </div>

                <!-- 价格展示 -->
                <div class="tier-price-box">
                  <span class="currency-symbol" v-if="plan.price !== '免费'">¥</span>
                  <span class="price-amount">{{ plan.price.replace('¥', '') }}</span>
                  <span class="price-period" v-if="plan.period">{{ plan.period }}</span>
                </div>
                <div v-if="quoteFor(plan)?.type === 'UPGRADE'" class="upgrade-credit-note">
                  剩余 {{ quoteFor(plan).remainingDays }} 天抵扣 ¥{{ formatMoney(quoteFor(plan).credit) }}，升级仅需 ¥{{ formatMoney(quoteFor(plan).payable) }}
                </div>

                <!-- 每日能量值胶囊 -->
                <div class="quota-pill-deck">
                  <Zap class="w-3.5 h-3.5 text-amber-400" />
                  <span>{{ plan.dailyQuota }}</span>
                </div>

                <div class="tier-divider"></div>

                <!-- 核心权益列表 -->
                <ul class="features-checklist">
                  <li v-for="(feat, fIdx) in plan.features" :key="fIdx" class="feature-line-item">
                    <Check class="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{{ feat }}</span>
                  </li>
                </ul>

                <!-- 订阅操作按钮 -->
                <div class="tier-action-dock">
                  <button
                    class="tier-cta-btn"
                    :class="{
                      'primary-cta': activePlan === plan.name || plan.popular,
                      'secondary-cta': activePlan !== plan.name && !plan.popular
                    }"
                    @click.stop="openCheckout(plan)"
                  >
                    <span>{{ ctaText(plan) }}</span>
                    <ArrowRight class="w-4 h-4 btn-arrow" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 全维功能权益横向对比矩阵 (Feature Comparison Matrix) -->
      <section class="comparison-matrix-section">
        <div class="pricing-container">
          <div class="section-center-head">
            <span class="micro-kicker">FEATURE MATRIX</span>
            <h2 class="section-heading">会员权益全维对比</h2>
            <p class="section-subtext">透明罗列各项学习能力支持，帮您挑选最契合当前冲刺阶段的方案</p>
          </div>

          <div class="matrix-table-card">
            <div class="matrix-responsive-container">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th class="th-feature-name">功能与权益模块</th>
                    <th class="th-tier">基础版 (免费)</th>
                    <th class="th-tier">月度会员</th>
                    <th class="th-tier highlight-th">季度会员 (推荐)</th>
                    <th class="th-tier">年度会员</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(group, gIdx) in comparisonMatrix" :key="gIdx">
                    <tr class="group-header-row">
                      <td colspan="5">
                        <div class="group-title-label">
                          <CheckCircle2 class="w-4 h-4 text-indigo-400 mr-2" />
                          {{ group.category }}
                        </div>
                      </td>
                    </tr>
                    <tr v-for="(row, rIdx) in group.rows" :key="rIdx" class="matrix-data-row">
                      <td class="td-feature-title">{{ row.name }}</td>
                      <td class="td-tier-val">{{ row.free }}</td>
                      <td class="td-tier-val">{{ row.monthly }}</td>
                      <td class="td-tier-val highlight-td">{{ row.quarterly }}</td>
                      <td class="td-tier-val font-semibold text-amber-400">{{ row.annual }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. 四大官方信赖与支付安全保障 (Trust & Guarantees) -->
      <section class="trust-guarantees-section">
        <div class="pricing-container">
          <div class="guarantees-grid">
            <div class="guarantee-card">
              <div class="guarantee-icon-box">
                <RotateCcw class="w-6 h-6 text-emerald-400" />
              </div>
              <h4>7 天无忧全额退款</h4>
              <p>开通 7 天内如因任何原因对功能不满意，支持无障碍全额退还款项。</p>
            </div>

            <div class="guarantee-card">
              <div class="guarantee-icon-box">
                <Lock class="w-6 h-6 text-indigo-400" />
              </div>
              <h4>银行级 SSL 安全加密</h4>
              <p>采用端到端 256 位金融级加密传输，严格保障您的个人账号与支付安全。</p>
            </div>

            <div class="guarantee-card">
              <div class="guarantee-icon-box">
                <Zap class="w-6 h-6 text-amber-400" />
              </div>
              <h4>权益秒级即时生效</h4>
              <p>支付完成后系统后台毫秒级发放 AI 能量与 VIP 特权，全平台无需刷新即刻生效。</p>
            </div>

            <div class="guarantee-card">
              <div class="guarantee-icon-box">
                <ShieldCheck class="w-6 h-6 text-blue-400" />
              </div>
              <h4>随时升级或取消</h4>
              <p>无任何强制自动扣费绑定，支持按天折算差价自由补齐升级更高阶方案。</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. 高频常见问题解答 (Interactive FAQ Accordion) -->
      <section class="pricing-faq-section">
        <div class="pricing-container">
          <div class="section-center-head">
            <span class="micro-kicker">QUESTIONS & ANSWERS</span>
            <h2 class="section-heading">常见问题与解答</h2>
            <p class="section-subtext">还有关于会员订阅的疑问？这里汇总了学员最常关心的核心问题</p>
          </div>

          <div class="faq-accordion-container">
            <div
              v-for="(faq, fIdx) in faqs"
              :key="fIdx"
              class="faq-card-item"
              :class="{ open: openFaqIndex === fIdx }"
              @click="toggleFaq(fIdx)"
            >
              <div class="faq-question-bar">
                <div class="faq-q-text">
                  <HelpCircle class="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{{ faq.q }}</span>
                </div>
                <ChevronDown class="w-5 h-5 faq-arrow" />
              </div>
              <div class="faq-answer-body" v-show="openFaqIndex === fIdx">
                <p>{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. 高校与机构团队定制方案 (Enterprise / Campus Plan) -->
      <section class="campus-enterprise-section">
        <div class="pricing-container">
          <div class="campus-banner-card">
            <div class="campus-content">
              <div class="campus-badge">
                <Users class="w-4 h-4 text-indigo-400" />
                <span>CAMPUS & ENTERPRISE</span>
              </div>
              <h3 class="campus-title">需要为整个班级或教研团队统一采购？</h3>
              <p class="campus-desc">
                我们为各大高校英语教学部、国际高中备考班和教育培训机构提供团队专属折扣、集中教务管理后台与多维度学情统计大屏。
              </p>
              <button class="campus-contact-btn" @click="message.info('请通过邮件或教务微信联系团队客服：support@learnsphere.ai')">
                <Headphones class="w-4 h-4" />
                <span>咨询专属团体采购方案</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />

    <!-- 7. 安全收银台 Modal (保持原有逻辑与设计系统一致) -->
    <n-modal
      v-model:show="showCheckoutModal"
      preset="card"
      style="width: 520px; border-radius: 24px;"
      :bordered="false"
      class="checkout-modal-bg"
    >
      <template #header>
        <div class="checkout-header">
          <ShieldCheck class="w-6 h-6 text-indigo-400" />
          <span>安全收银台</span>
        </div>
      </template>

      <div class="checkout-body" v-if="selectedPlanData">
        <div class="selected-plan-summary">
          <div class="selected-plan-label">您选择的方案</div>
          <div class="selected-plan-row">
            <span class="selected-plan-name">{{ selectedPlanData.name }}</span>
            <span class="selected-plan-price">
              {{ selectedPlanData.price }}
              <span class="selected-plan-period">{{ selectedPlanData.period }}</span>
            </span>
          </div>
          <div v-if="selectedQuote?.type === 'UPGRADE'" class="upgrade-breakdown">
            <div><span>套餐原价</span><span>¥{{ formatMoney(selectedQuote.originalPrice) }}</span></div>
            <div><span>当前会员剩余 {{ selectedQuote.remainingDays }} 天折算抵扣</span><span>-¥{{ formatMoney(selectedQuote.credit) }}</span></div>
            <div class="upgrade-breakdown__total"><span>应付金额</span><span>¥{{ formatMoney(selectedQuote.payable) }}</span></div>
            <p class="upgrade-breakdown__hint">升级后新套餐从支付成功时起重新计时，原会员剩余时长已折算进抵扣。</p>
          </div>
          <p v-else-if="selectedQuote?.type === 'RENEW'" class="upgrade-breakdown__hint">续费时长将在当前到期时间基础上顺延。</p>
        </div>

        <div class="payment-methods">
          <button
            v-for="method in PAY_METHODS"
            :key="method.value"
            type="button"
            class="method-item"
            :class="{ active: paymentEnabled && payType === method.value, disabled: !paymentEnabled }"
            :disabled="!paymentEnabled"
            :aria-pressed="payType === method.value"
            @click="payType = method.value"
          >
            <div class="method-icon method-icon-primary"><CreditCard :size="20" /></div>
            <div class="method-copy">
              <div class="method-name">{{ method.name }}</div>
              <div class="method-desc">{{ paymentEnabled ? method.desc : '在线支付暂未开放，请联系管理员开通' }}</div>
            </div>
            <div v-if="paymentEnabled && payType === method.value" class="checked-circle"><Check :size="14" /></div>
          </button>
          <div class="method-item disabled">
            <div class="method-icon method-icon-secondary"><Globe :size="20" /></div>
            <div class="method-copy">
              <div class="method-name">International Credit Card</div>
              <div class="method-desc">国际信用卡 (暂未开放)</div>
            </div>
          </div>
        </div>

        <div class="security-guarantee">
          <div class="guarantee-micro-item"><Lock :size="12" /> 高级加密连接</div>
          <div class="guarantee-micro-item"><ShieldCheck :size="12" /> 防欺诈监控</div>
          <div class="guarantee-micro-item"><Zap :size="12" /> 毫秒级到账</div>
        </div>

        <button
          class="checkout-final-btn"
          :disabled="isPaying || !paymentEnabled"
          @click="handlePayment"
        >
          <span>{{ !paymentEnabled ? '在线支付暂未开放' : isPaying ? '正在跳转收银台...' : `${QUOTE_LABELS[selectedQuote?.type] || '立即'}支付 (${payableText})` }}</span>
        </button>
      </div>
    </n-modal>

    <!-- 自建二维码收款窗口：微信支付在本页扫码，不跳转支付平台页面 -->
    <n-modal
      v-model:show="showQrModal"
      preset="card"
      style="width: 430px; border-radius: 24px;"
      :bordered="false"
      :mask-closable="false"
      class="qr-modal-bg"
      @after-leave="stopQrTimers"
    >
      <template #header>
        <div class="checkout-header">
          <ShieldCheck class="w-6 h-6 text-indigo-400" />
          <span>微信扫码支付</span>
        </div>
      </template>

      <div class="qr-body">
        <div class="qr-plan-line">
          <span class="qr-plan-name">{{ qrPlanName }}</span>
          <span class="qr-amount">¥{{ qrAmount }}</span>
        </div>

        <div v-if="qrState === 'paid'" class="qr-paid-panel">
          <CheckCircle2 :size="56" />
          <p>支付成功，正在开通会员…</p>
        </div>

        <template v-else>
          <div class="qr-frame" :class="{ 'qr-frame--dim': qrState === 'expired' }">
            <qrcode-vue v-if="qrCodeUrl" :value="qrCodeUrl" :size="216" level="M" />
            <div v-if="qrState === 'expired'" class="qr-expired-mask">
              <p>二维码已过期</p>
              <button type="button" class="qr-refresh-btn" @click="handlePayment">重新获取</button>
            </div>
          </div>

          <p class="qr-tip">请使用 <strong>微信</strong> 扫描上方二维码完成付款</p>
          <p v-if="qrState === 'waiting'" class="qr-countdown">
            二维码有效期 <span>{{ qrTimeText }}</span>
          </p>

          <div class="qr-actions">
            <button type="button" class="qr-check-btn" :disabled="qrChecking" @click="checkQrNow">
              {{ qrChecking ? '查询中…' : '我已完成支付' }}
            </button>
            <button type="button" class="qr-cancel-btn" @click="closeQrModal">取消</button>
          </div>
        </template>

        <p class="qr-order-no">订单号：{{ qrOutTradeNo }}</p>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
/* ========================================================
   1. 统一设计系统 CSS 变量与基础画布
   ======================================================== */
.pricing-page {
  --pp-bg: #060813;
  --pp-card-bg: rgba(15, 23, 42, 0.72);
  --pp-card-border: rgba(255, 255, 255, 0.08);
  --pp-text-primary: #f8fafc;
  --pp-text-secondary: #94a3b8;
  /* 原 #64748b 在深底上仅 3.8~4.2:1，提亮一档到 7.0+ */
  --pp-text-muted: #94a3b8;
  --pp-surface-muted: rgba(255, 255, 255, 0.04);
  --pp-accent: #1e6b52;
  --pp-accent-glow: rgba(30, 107, 82, 0.25);
  --pp-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.6);

  min-height: 100vh;
  background-color: var(--pp-bg);
  color: var(--pp-text-primary);
  background-image: transparent;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 浅色白金极光主题适配 (WCAG AA 高对比度) */
html[data-theme='light'] .pricing-page {
  --pp-bg: #f8fafc;
  --pp-card-bg: rgba(255, 255, 255, 0.94);
  --pp-card-border: rgba(203, 213, 225, 0.85);
  --pp-text-primary: #0f172a;
  --pp-text-secondary: #475569;
  /* 原 #64748b 在 #f1f5f9 上只有 4.34:1，压深一档到 5.4+ */
  --pp-text-muted: #52606f;
  --pp-surface-muted: rgba(241, 245, 249, 0.85);
  --pp-accent: #1e6b52;
  --pp-accent-glow: rgba(30, 107, 82, 0.15);
  --pp-shadow: 0 16px 36px -10px rgba(148, 163, 184, 0.22);

  background-color: var(--pp-bg);
}

.pricing-container {
  max-width: 1380px;
  width: 100%;
  margin: 0 auto;
  padding: 0 clamp(16px, 3.5vw, 40px);
}

.pricing-main {
  position: relative;
  z-index: 1;
}

/* ========================================================
   2. Hero 展厅看板与周期切换
   ======================================================== */
.pricing-hero-section {
  padding: 64px 0 36px;
}

.hero-center-deck {
  max-width: 820px;
  margin: 0 auto 48px;
}

.hero-kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 18px;
  background: var(--pp-surface-muted);
  border: 1px solid var(--pp-card-border);
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--pp-text-secondary);
  margin-bottom: 20px;
}

.hero-title {
  font-size: clamp(2.4rem, 4.2vw, 3.6rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: var(--pp-text-primary);
  margin-bottom: 16px;
}

.gradient-text {
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
  color: var(--pp-text-secondary);
  max-width: 700px;
  margin: 0 auto 36px;
}

/* 计费周期开关 */
.billing-switcher-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: var(--pp-surface-muted);
  border: 1px solid var(--pp-card-border);
  border-radius: var(--radius-lg);
}

.billing-switch-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid transparent;
  color: var(--pp-text-secondary);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.billing-switch-btn.active {
  background: var(--pp-card-bg);
  color: var(--pp-text-primary);
  border-color: var(--pp-accent);
}

.save-discount-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  /* 实心绿底：深色主题下 --text-color 是浅色，只有 2.03:1 */
  background: #10b981;
  color: #04321f;
}

/* ========================================================
   3. 定价卡片矩阵
   ======================================================== */
.pricing-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  align-items: stretch;
}

.pricing-tier-card {
  position: relative;
  background: var(--pp-card-bg);
  border: 1px solid var(--pp-card-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease;
  cursor: pointer;
}

.pricing-tier-card:hover {
  transform: translateY(-6px);
  border-color: var(--plan-color);
}

.pricing-tier-card.popular-tier {
  border-color: rgba(43, 122, 96, 0.5);
  transform: scale(1.02);
  z-index: 2;
}

/* 浅色主题下 0.5 透明绿边几乎看不见，提高到 0.85 才够 3:1 的非文本对比 */
html[data-theme='light'] .pricing-tier-card.popular-tier {
  border-color: rgba(30, 107, 82, 0.85);
}

.tier-top-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  padding: 4px 14px;
  border-radius: 9999px;
  background: var(--brand);
  /* 深色主题 --brand 是浅绿 #5fa88b，白字只有 2.8:1；用品牌前景色随主题切换 */
  color: var(--brand-ink);
  font-size: 0.75rem;
  font-weight: 800;
}

.tier-card-body {
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tier-icon-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.tier-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tier-plan-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--pp-text-primary);
  margin-bottom: 2px;
}

.tier-tagline {
  font-size: 0.78rem;
  color: var(--pp-text-muted);
  margin: 0;
}

.tier-price-box {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 12px;
}

.currency-symbol {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--pp-text-primary);
}

.price-amount {
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1;
  color: var(--pp-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.upgrade-credit-note {
  margin: -4px 0 12px;
  font-size: 0.78rem;
  color: var(--tone-emerald);
}

.upgrade-breakdown {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--pp-card-border);
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--pp-text-secondary);
}

.upgrade-breakdown > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.upgrade-breakdown__total {
  font-weight: 700;
  color: var(--pp-text-primary);
}

.upgrade-breakdown__hint {
  margin: 4px 0 0;
  font-size: 0.76rem;
  color: var(--pp-text-muted);
}

.price-period {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--pp-text-muted);
}

.quota-pill-deck {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--tone-amber);
  margin-bottom: 20px;
}

.tier-divider {
  height: 1px;
  background: var(--pp-card-border);
  margin-bottom: 20px;
}

.features-checklist {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
}

.feature-line-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--pp-text-secondary);
}

.tier-action-dock {
  margin-top: auto;
}

.tier-cta-btn {
  width: 100%;
  min-height: 44px;
  border-radius: var(--radius-md);
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.primary-cta {
  background: var(--brand);
  border: 1px solid var(--pp-accent);
  color: var(--brand-ink);
}

.primary-cta:hover {
  transform: translateY(-2px);
}

.secondary-cta {
  background: var(--pp-surface-muted);
  border: 1px solid var(--pp-card-border);
  color: var(--pp-text-primary);
}

.secondary-cta:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-arrow {
  transition: transform 0.2s ease;
}

.tier-cta-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* ========================================================
   4. 功能对比矩阵 (Comparison Matrix)
   ======================================================== */
.comparison-matrix-section {
  padding: 60px 0;
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
  color: var(--pp-text-primary);
  margin-bottom: 12px;
}

.section-subtext {
  font-size: 1rem;
  color: var(--pp-text-secondary);
  line-height: 1.6;
}

.matrix-table-card {
  background: var(--pp-card-bg);
  border: 1px solid var(--pp-card-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.matrix-responsive-container {
  width: 100%;
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.matrix-table th {
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--pp-card-border);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--pp-text-primary);
}

.th-feature-name {
  width: 32%;
}

.th-tier {
  width: 17%;
  text-align: center;
}

.highlight-th {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.08);
}

.group-header-row td {
  padding: 16px 24px;
  background: var(--pp-surface-muted);
  border-top: 1px solid var(--pp-card-border);
  border-bottom: 1px solid var(--pp-card-border);
}

.group-title-label {
  display: flex;
  align-items: center;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--pp-text-primary);
}

.matrix-data-row td {
  padding: 16px 24px;
  border-bottom: 1px solid var(--pp-card-border);
  font-size: 0.88rem;
  color: var(--pp-text-secondary);
}

.td-feature-title {
  color: var(--pp-text-primary);
  font-weight: 600;
}

.td-tier-val {
  text-align: center;
}

.highlight-td {
  background: rgba(30, 107, 82, 0.04);
  color: var(--pp-text-primary);
  font-weight: 600;
}

/* ========================================================
   5. 四大官方信赖保障 (Trust Guarantees)
   ======================================================== */
.trust-guarantees-section {
  padding: 40px 0 60px;
}

.guarantees-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.guarantee-card {
  background: var(--pp-card-bg);
  border: 1px solid var(--pp-card-border);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  text-align: center;
  transition: transform 0.25s ease;
}

.guarantee-card:hover {
  transform: translateY(-4px);
}

.guarantee-icon-box {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--pp-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.guarantee-card h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--pp-text-primary);
  margin-bottom: 8px;
}

.guarantee-card p {
  font-size: 0.84rem;
  line-height: 1.55;
  color: var(--pp-text-secondary);
  margin: 0;
}

/* ========================================================
   6. 常见问题解答 FAQ
   ======================================================== */
.pricing-faq-section {
  padding: 40px 0 60px;
}

.faq-accordion-container {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-card-item {
  background: var(--pp-card-bg);
  border: 1px solid var(--pp-card-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.faq-card-item:hover {
  border-color: rgba(30, 107, 82, 0.3);
}

.faq-card-item.open {
  border-color: var(--pp-accent);
}

.faq-question-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.faq-q-text {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--pp-text-primary);
}

.faq-arrow {
  color: var(--pp-text-muted);
  transition: transform 0.25s ease;
}

.faq-card-item.open .faq-arrow {
  transform: rotate(180deg);
  /* R1：--pp-accent 两套主题都是 #1e6b52，深色主题下图标几乎看不见 */
  color: var(--brand);
}

.faq-answer-body {
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--pp-card-border);
}

.faq-answer-body p {
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--pp-text-secondary);
  margin: 0;
}

/* ========================================================
   7. 团队与高校定制方案 Banner
   ======================================================== */
.campus-enterprise-section {
  padding: 30px 0 90px;
}

.campus-banner-card {
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.3);
  border-radius: var(--radius-lg);
  padding: 48px clamp(20px, 4vw, 56px);
  text-align: center;
}

html[data-theme='light'] .campus-banner-card {
  border-color: rgba(30, 107, 82, 0.35);
}

.campus-content {
  max-width: 780px;
  margin: 0 auto;
}

.campus-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--pp-card-border);
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--tone-emerald);
  margin-bottom: 18px;
}

.campus-title {
  font-size: clamp(1.6rem, 2.8vw, 2.2rem);
  font-weight: 800;
  color: var(--pp-text-primary);
  margin-bottom: 14px;
}

.campus-desc {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--pp-text-secondary);
  margin-bottom: 28px;
}

.campus-contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--radius-md);
  background: var(--brand);
  border: none;
  color: var(--brand-ink);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.campus-contact-btn:hover {
  transform: translateY(-2px);
}

/* ========================================================
   8. 安全收银台 Modal 样式
   ======================================================== */
.checkout-modal-bg {
  background: #0f172a !important;
  color: var(--text-color);
}

html[data-theme='light'] .checkout-modal-bg {
  background: #ffffff !important;
}

.checkout-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--pp-text-primary);
}

.checkout-body {
  padding-top: 10px;
}

.selected-plan-summary {
  background: var(--pp-surface-muted);
  border: 1px solid var(--pp-card-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 20px;
}

.selected-plan-label {
  font-size: 0.76rem;
  color: var(--pp-text-muted);
  margin-bottom: 6px;
}

.selected-plan-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.selected-plan-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--pp-text-primary);
}

.selected-plan-price {
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--tone-emerald);
}

.selected-plan-period {
  font-size: 0.85rem;
  color: var(--pp-text-muted);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.method-item {
  width: 100%;
  text-align: left;
  font: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--pp-card-border);
  background: var(--pp-surface-muted);
}

.method-item.active {
  border-color: var(--pp-accent);
  background: rgba(30, 107, 82, 0.08);
}

.method-item.disabled {
  /* R8：禁用态透明度抬到 0.75，避免 0.5 把整行文字洗到 3:1 以下 */
  opacity: 0.75;
  cursor: not-allowed;
}

/* 0.75 透明度会削弱文字，禁用行改用正文色，合成后仍 ≥4.5:1 */
.method-item.disabled .method-name,
.method-item.disabled .method-desc { color: var(--pp-text-primary); }

.method-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 实心 #6366f1 / #374151 底，白字达标（restore-list 指定例外） */
  color: #ffffff;
  flex-shrink: 0;
}

.method-icon-primary {
  background: #6366f1;
}

.method-icon-secondary {
  background: #374151;
}

.method-copy { flex: 1; }
.method-name { font-size: 0.95rem; font-weight: 700; color: var(--pp-text-primary); }
.method-desc { font-size: 0.76rem; color: var(--pp-text-muted); }

.checked-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  /* R4：--pp-accent 两套主题都是深绿，不能配深色主题的 --brand-ink；
     改用成对的 --brand / --brand-ink，浅深两档都 ≥4.5:1 */
  background: var(--brand);
  color: var(--brand-ink);
  display: flex;
  align-items: center;
  justify-content: center;
}

.security-guarantee {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--pp-text-muted);
  margin-bottom: 24px;
  padding: 0 4px;
}

.guarantee-micro-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.checkout-final-btn {
  width: 100%;
  min-height: 46px;
  border-radius: var(--radius-lg);
  background: var(--brand);
  border: none;
  color: var(--brand-ink);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.checkout-final-btn:hover {
  transform: translateY(-2px);
}

/* ========================================================
   9. 响应式适配
   ======================================================== */
@media (max-width: 1100px) {
  .pricing-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .guarantees-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  /* 功能矩阵：小屏改为「固定最小宽度 + 容器横向滚动」，
     不用 width:100% + table-layout:fixed，否则 4 个套餐列会被压成读不了的宽度 */
  .matrix-table-card {
    overflow: hidden;
  }
  .matrix-responsive-container {
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;
  }
  .matrix-table {
    min-width: 480px;
  }
  .matrix-table th {
    padding: 14px 12px;
    font-size: 13px;
  }
  .matrix-data-row td {
    padding: 12px;
    font-size: 13px;
  }
  .group-header-row td {
    padding: 12px;
  }
  .group-title-label {
    font-size: 14px;
  }
  .th-feature-name {
    width: 30%;
    min-width: 140px;
  }
}

@media (max-width: 640px) {
  .pricing-hero-section {
    padding: 40px 0 24px;
  }
  .pricing-cards-grid {
    grid-template-columns: 1fr;
  }
  .guarantees-grid {
    grid-template-columns: 1fr;
  }
  .billing-switcher-wrapper {
    flex-direction: column;
    width: 100%;
  }
  .billing-switch-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .comparison-matrix-section {
    padding: 32px 0;
  }
  .section-center-head {
    margin-bottom: 24px;
  }
  .matrix-table {
    min-width: 460px;
  }
  .matrix-table th {
    padding: 12px 10px;
  }
  .matrix-data-row td {
    padding: 10px;
  }
  .group-header-row td {
    padding: 10px;
  }
  .td-feature-title {
    font-size: 13px;
  }
  .td-tier-val {
    font-size: 13px;
  }
  .tier-card-body {
    padding: 22px 18px;
  }
  .price-amount {
    font-size: 2.4rem;
  }
  .guarantee-card {
    padding: 20px 16px;
  }
  .guarantee-card p {
    font-size: 13px;
  }
  .faq-card-item {
    padding: 16px 18px;
  }
  .faq-q-text {
    font-size: 15px;
  }
  .faq-answer-body p {
    font-size: 14px;
  }
  .campus-banner-card {
    padding: 32px 18px;
  }
  .campus-desc {
    font-size: 14px;
  }
}

@media (max-width: 390px) {
  .matrix-table {
    min-width: 440px;
  }
  .matrix-table th,
  .matrix-data-row td,
  .group-header-row td {
    padding: 10px 8px;
  }
  /* 「季度会员 (推荐)」表头较长，允许在既定列宽内换行，避免撑宽整表 */
  .th-tier {
    line-height: 1.35;
  }
  .hero-kicker-pill {
    font-size: 13px;
    line-height: 1.5;
    padding: 6px 14px;
  }
}

/* ========================================================
   9. 自建二维码收款窗口
   Modal 被 teleport 到 body，拿不到 .pricing-page 上的
   --pp-* 变量，因此这里用显式色值 + 亮色主题覆盖。
   ======================================================== */
.qr-modal-bg {
  background: #0f172a !important;
}

html[data-theme='light'] .qr-modal-bg {
  background: #ffffff !important;
}

.qr-body {
  padding-top: 6px;
  text-align: center;
}

.qr-plan-line {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
  margin-bottom: 18px;
}

.qr-plan-name {
  font-size: 1rem;
  font-weight: 700;
  color: #cbd5e1;
}

html[data-theme='light'] .qr-plan-name {
  color: #475569;
}

.qr-amount {
  font-size: 1.7rem;
  font-weight: 900;
  color: #34d399;
}

html[data-theme='light'] .qr-amount {
  color: #047857;
}

.qr-frame {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.28);
  line-height: 0;
}

.qr-frame--dim canvas {
  filter: blur(2px) grayscale(0.6);
  opacity: 0.5;
}

.qr-expired-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  line-height: 1.4;
}

.qr-expired-mask p {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 700;
  color: #334155;
}

.qr-refresh-btn {
  padding: 7px 18px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  background: #4f46e5;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.qr-refresh-btn:hover {
  background: #4338ca;
}

.qr-tip {
  margin: 16px 0 0;
  font-size: 0.9rem;
  color: #94a3b8;
}

html[data-theme='light'] .qr-tip {
  color: #64748b;
}

.qr-tip strong {
  color: #34d399;
}

html[data-theme='light'] .qr-tip strong {
  color: #047857;
}

.qr-countdown {
  margin: 8px 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
}

html[data-theme='light'] .qr-countdown {
  color: #94a3b8;
}

.qr-countdown span {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: #cbd5e1;
}

html[data-theme='light'] .qr-countdown span {
  color: #475569;
}

.qr-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.qr-check-btn,
.qr-cancel-btn {
  flex: 1;
  padding: 12px 16px;
  font-size: 0.92rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qr-check-btn {
  color: #ffffff;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  border: none;
}

.qr-check-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.qr-check-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.qr-cancel-btn {
  color: #cbd5e1;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.qr-cancel-btn:hover {
  background: rgba(148, 163, 184, 0.12);
}

html[data-theme='light'] .qr-cancel-btn {
  color: #475569;
  border-color: rgba(100, 116, 139, 0.35);
}

.qr-paid-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: #34d399;
}

.qr-paid-panel p {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.qr-order-no {
  margin: 18px 0 0;
  font-size: 0.72rem;
  color: #64748b;
  word-break: break-all;
}

@media (max-width: 480px) {
  .qr-frame {
    padding: 10px;
  }
  .qr-actions {
    flex-direction: column;
  }
}
</style>
