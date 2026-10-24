// 会员套餐价格与每日额度：优先读取后台系统配置（/api/common/config），读不到时用默认值
export const VIP_PLAN_DEFAULTS = [
  { level: 0, name: '基础版', price: 0, aiQuota: 15, tutorQuota: 20 },
  { level: 1, name: '月度会员', price: 29, aiQuota: 100, tutorQuota: 100 },
  { level: 2, name: '季度会员', price: 69, aiQuota: 120, tutorQuota: 150 },
  { level: 3, name: '年度会员', price: 199, aiQuota: 150, tutorQuota: 200 }
]

const readNumber = (configs, key, fallback) => {
  const raw = configs?.[key]
  if (raw === '' || raw == null) return fallback
  const value = Number(raw)
  return Number.isFinite(value) && value >= 0 ? value : fallback
}

export const formatPrice = price => (Number.isInteger(price) ? String(price) : price.toFixed(2))

export const resolveVipPlans = (configs = {}) =>
  VIP_PLAN_DEFAULTS.map(plan => ({
    ...plan,
    price: plan.level ? readNumber(configs, `vip.price.${plan.level}`, plan.price) : 0,
    aiQuota: readNumber(configs, `ai.limit.daily.${plan.level}`, plan.aiQuota),
    tutorQuota: readNumber(configs, `ai.tutor.limit.daily.${plan.level}`, plan.tutorQuota)
  }))

// 年付相比按月连续付 12 个月节省的比例（整数百分比）
export const annualSavingPercent = plans => {
  const monthly = plans[1]?.price
  const annual = plans[3]?.price
  if (!monthly || !annual) return 0
  return Math.max(0, Math.round((1 - annual / (monthly * 12)) * 100))
}
