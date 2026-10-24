import { describe, expect, it } from 'vitest'
import { annualSavingPercent, formatPrice, resolveVipPlans } from '../vipPlans'

describe('resolveVipPlans', () => {
  it('falls back to defaults when config is missing', () => {
    const plans = resolveVipPlans({})
    expect(plans.map(p => p.price)).toEqual([0, 29, 69, 199])
    expect(plans.map(p => p.aiQuota)).toEqual([15, 100, 120, 150])
    expect(plans.map(p => p.tutorQuota)).toEqual([20, 100, 150, 200])
  })

  it('uses admin configured values and ignores invalid ones', () => {
    const plans = resolveVipPlans({
      'vip.price.1': '19.9',
      'vip.price.2': '',
      'ai.limit.daily.1': '88',
      'ai.tutor.limit.daily.3': 'abc'
    })
    expect(plans[1].price).toBe(19.9)
    expect(plans[2].price).toBe(69)
    expect(plans[1].aiQuota).toBe(88)
    expect(plans[3].tutorQuota).toBe(200)
  })
})

describe('helpers', () => {
  it('formats prices and computes annual saving', () => {
    expect(formatPrice(29)).toBe('29')
    expect(formatPrice(19.9)).toBe('19.90')
    expect(annualSavingPercent(resolveVipPlans({}))).toBe(43)
  })
})
