import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// 用可控的 mock 替换真实请求，避免测试依赖网络
const getPublicConfigs = vi.fn()
vi.mock('@/api/common', () => ({
  commonApi: {
    getPublicConfigs: (...args) => getPublicConfigs(...args)
  }
}))

const { useSystemStore } = await import('../system')

describe('system store 失败退避', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getPublicConfigs.mockReset()
  })

  // 每个用例前清空模块级退避状态，避免用例之间互相污染
  const freshStore = () => {
    const store = useSystemStore()
    store.__resetFetchStateForTest()
    return store
  }

  it('请求成功后正常写入配置', async () => {
    getPublicConfigs.mockResolvedValue({
      code: 200,
      data: { 'sys.site_name': 'LearnSphere', 'sys.maintenance_mode': 'false' }
    })

    const store = freshStore()
    await store.fetchSystemConfig()

    expect(store.configs['sys.site_name']).toBe('LearnSphere')
    expect(store.lastFetchedAt).toBeGreaterThan(0)
    expect(store.isConfigStale).toBe(false)
  })

  it('业务码非 200 时进入退避，不会每次调用都重发请求', async () => {
    // 模拟被限流：HTTP 200 但业务码 429
    getPublicConfigs.mockResolvedValue({ code: 429, message: '访问过于频繁', data: null })

    const store = freshStore()

    await store.fetchSystemConfig()
    expect(getPublicConfigs).toHaveBeenCalledTimes(1)

    // 连续 5 次调用（模拟路由守卫反复触发），退避窗口内不应再打后端
    for (let i = 0; i < 5; i++) {
      await store.fetchSystemConfig()
    }
    expect(getPublicConfigs).toHaveBeenCalledTimes(1)
  })

  it('网络异常时同样进入退避', async () => {
    getPublicConfigs.mockRejectedValue(new Error('Network Error'))

    const store = freshStore()

    await expect(store.fetchSystemConfig()).rejects.toThrow('Network Error')
    expect(getPublicConfigs).toHaveBeenCalledTimes(1)

    // 异常后继续调用不应重发
    for (let i = 0; i < 3; i++) {
      await store.fetchSystemConfig().catch(() => {})
    }
    expect(getPublicConfigs).toHaveBeenCalledTimes(1)
  })

  it('force=true 可以突破退避（用户主动刷新）', async () => {
    getPublicConfigs.mockResolvedValueOnce({ code: 500, message: '服务异常', data: null })

    const store = freshStore()
    await store.fetchSystemConfig()
    expect(getPublicConfigs).toHaveBeenCalledTimes(1)

    // 非强制调用被退避拦截
    await store.fetchSystemConfig()
    expect(getPublicConfigs).toHaveBeenCalledTimes(1)

    // 强制刷新应当真正发请求
    getPublicConfigs.mockResolvedValueOnce({ code: 200, data: { 'sys.site_name': 'OK' } })
    await store.fetchSystemConfig({ force: true })
    expect(getPublicConfigs).toHaveBeenCalledTimes(2)
    expect(store.configs['sys.site_name']).toBe('OK')
  })

  it('成功一次后清除退避标记', async () => {
    getPublicConfigs.mockResolvedValueOnce({ code: 429, message: '限流', data: null })

    const store = freshStore()
    await store.fetchSystemConfig()
    expect(getPublicConfigs).toHaveBeenCalledTimes(1)

    // 强制成功后，退避标记应被清除，后续普通调用可以再次发请求
    getPublicConfigs.mockResolvedValueOnce({ code: 200, data: { 'sys.site_name': 'Recovered' } })
    await store.fetchSystemConfig({ force: true })
    expect(getPublicConfigs).toHaveBeenCalledTimes(2)

    // 让缓存过期，验证普通调用能重新发请求（说明退避已清除）
    store.lastFetchedAt = 0
    getPublicConfigs.mockResolvedValueOnce({ code: 200, data: { 'sys.site_name': 'Again' } })
    await store.fetchSystemConfig()
    expect(getPublicConfigs).toHaveBeenCalledTimes(3)
  })
})
