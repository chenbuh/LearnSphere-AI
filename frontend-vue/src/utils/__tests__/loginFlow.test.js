import { describe, expect, it, vi } from 'vitest'
import { runLoginFlow } from '../loginFlow'

describe('前台登录编排', () => {
  it('学习账号登录成功时直接进入学习中心，不再尝试管理员登录', async () => {
    const tryAdminLogin = vi.fn()
    const onLearnerError = vi.fn()

    const result = await runLoginFlow({
      loginAsLearner: vi.fn().mockResolvedValue(undefined),
      tryAdminLogin,
      onLearnerError
    })

    expect(result).toBe('learner')
    expect(tryAdminLogin).not.toHaveBeenCalled()
    expect(onLearnerError).not.toHaveBeenCalled()
  })

  it('学习账号失败后按管理员登录成功，返回 admin', async () => {
    const onLearnerError = vi.fn()

    const result = await runLoginFlow({
      loginAsLearner: vi.fn().mockRejectedValue(new Error('用户名或密码错误')),
      tryAdminLogin: vi.fn().mockResolvedValue(true),
      onLearnerError
    })

    expect(result).toBe('admin')
    expect(onLearnerError).not.toHaveBeenCalled()
  })

  /**
   * 这条是防退化用例。
   *
   * 后端为避免账号枚举，把「用户不存在」和「密码错误」统一成了
   * 「用户名或密码错误」。旧代码只在 error.message === '用户不存在' 时
   * 才去尝试管理员登录，于是管理员在前台永远登不进去。
   * 这里用统一的错误文案验证：无论文案是什么，都必须尝试管理员登录。
   */
  it('不依赖错误文案：即使提示是「用户名或密码错误」也要尝试管理员登录', async () => {
    const tryAdminLogin = vi.fn().mockResolvedValue(true)

    const result = await runLoginFlow({
      loginAsLearner: vi.fn().mockRejectedValue(new Error('用户名或密码错误')),
      tryAdminLogin,
      onLearnerError: vi.fn()
    })

    expect(tryAdminLogin).toHaveBeenCalledTimes(1)
    expect(result).toBe('admin')
  })

  it('两套账号都失败时回调统一错误提示并返回 failed', async () => {
    const error = new Error('用户名或密码错误')
    const onLearnerError = vi.fn()

    const result = await runLoginFlow({
      loginAsLearner: vi.fn().mockRejectedValue(error),
      tryAdminLogin: vi.fn().mockResolvedValue(false),
      onLearnerError
    })

    expect(result).toBe('failed')
    expect(onLearnerError).toHaveBeenCalledWith(error)
  })
})
