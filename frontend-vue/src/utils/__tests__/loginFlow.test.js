import { describe, expect, it, vi } from 'vitest'
import { runLoginFlow } from '../loginFlow'

const baseParams = overrides => ({
  probeIsAdmin: vi.fn().mockResolvedValue(false),
  username: 'learner',
  loginAsLearner: vi.fn().mockResolvedValue(undefined),
  tryAdminLogin: vi.fn().mockResolvedValue(false),
  onError: vi.fn(),
  ...overrides
})

describe('前台登录编排', () => {
  it('普通账号走学习账号登录，不尝试管理员登录', async () => {
    const params = baseParams()
    const result = await runLoginFlow(params)

    expect(result).toBe('learner')
    expect(params.tryAdminLogin).not.toHaveBeenCalled()
    expect(params.onError).not.toHaveBeenCalled()
  })

  it('探测为管理员时直接走管理员登录，不调用学习账号登录', async () => {
    const params = baseParams({
      probeIsAdmin: vi.fn().mockResolvedValue(true),
      username: 'chen',
      tryAdminLogin: vi.fn().mockResolvedValue(true)
    })

    const result = await runLoginFlow(params)

    expect(result).toBe('admin')
    // 关键：不能先发一次注定失败的学习账号登录，否则会累加 login_fail_count
    expect(params.loginAsLearner).not.toHaveBeenCalled()
    expect(params.onError).not.toHaveBeenCalled()
  })

  /**
   * 这条是防退化用例。
   *
   * 后端为避免账号枚举，把「用户不存在」和「密码错误」统一成了
   * 「用户名或密码错误」。旧代码只在 error.message === '用户不存在' 时
   * 才去尝试管理员登录，于是管理员在前台永远登不进去。
   */
  it('不依赖错误文案：管理员登录失败也要给出提示而不是静默失败', async () => {
    const params = baseParams({
      probeIsAdmin: vi.fn().mockResolvedValue(true),
      username: 'chen',
      tryAdminLogin: vi.fn().mockResolvedValue(false)
    })

    const result = await runLoginFlow(params)

    expect(result).toBe('failed')
    expect(params.onError).toHaveBeenCalledTimes(1)
    // 密码错时不应再回头试学习账号登录
    expect(params.loginAsLearner).not.toHaveBeenCalled()
  })

  it('学习账号登录失败时回调错误并返回 failed', async () => {
    const error = new Error('用户名或密码错误')
    const params = baseParams({
      loginAsLearner: vi.fn().mockRejectedValue(error)
    })

    const result = await runLoginFlow(params)

    expect(result).toBe('failed')
    expect(params.onError).toHaveBeenCalledWith(error)
  })

  it('探测接口异常时按普通账号处理，不影响正常登录', async () => {
    const params = baseParams({
      probeIsAdmin: vi.fn().mockRejectedValue(new Error('network')),
      username: 'learner'
    })

    const result = await runLoginFlow(params)

    expect(result).toBe('learner')
    expect(params.loginAsLearner).toHaveBeenCalledTimes(1)
  })
})
