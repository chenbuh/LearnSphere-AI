import { defineStore } from 'pinia'
import { commonApi } from '@/api/common'
import logger from '@/utils/logger'

const CACHE_TTL_MS = 60 * 1000

/**
 * 失败退避窗口。
 *
 * 背景：路由守卫每次导航都会调 refreshSystemConfigInBackground()，是否真正
 * 发请求取决于 isConfigStale。而 isConfigStale 用的是 lastFetchedAt，只有
 * 请求「成功」才会更新它。一旦请求持续失败（例如被限流返回 429、断网、
 * 维护中），lastFetchedAt 永远是 0，isConfigStale 永远为 true，于是每次
 * 导航都真的发一次请求 —— 形成请求风暴。
 *
 * 线上实测：管理员在后台反复切换页面时，/api/common/config 一分钟被打了
 * 1214 次，直接把自己的 IP 顶进反爬黑名单，整个后台变成 429。
 *
 * 修复：记录失败时间，失败后进入退避窗口，窗口内不再发起新请求。
 */
const FAILURE_BACKOFF_MS = 60 * 1000
let pendingFetchPromise = null
let lastFailureAt = 0

export const useSystemStore = defineStore('system', {
  state: () => ({
    configs: {},
    isMaintenanceMode: false,
    maintenanceMessage: '',
    lastFetchedAt: 0
  }),
  getters: {
    hasConfig: state => Object.keys(state.configs || {}).length > 0,
    isConfigStale: state => !state.lastFetchedAt || Date.now() - state.lastFetchedAt >= CACHE_TTL_MS
  },
  actions: {
    async fetchSystemConfig(options = {}) {
      const normalizedOptions = typeof options === 'boolean' ? { force: options } : options

      const { force = false, background = false } = normalizedOptions

      // 失败退避：非强制请求在退避窗口内直接返回本地配置，不再打后端。
      // force=true 用于用户主动刷新（如维护页重试），不受退避限制。
      if (!force && lastFailureAt && Date.now() - lastFailureAt < FAILURE_BACKOFF_MS) {
        return this.configs
      }

      if (!force && this.hasConfig && !this.isConfigStale) {
        return this.configs
      }

      if (pendingFetchPromise) {
        if (background) {
          return this.configs
        }
        return pendingFetchPromise
      }

      const requestPromise = (async () => {
        const res = await commonApi.getPublicConfigs()
        if (res.code === 200 && res.data) {
          this.configs = res.data
          const mode = res.data['sys.maintenance_mode']
          this.isMaintenanceMode = String(mode) === 'true'
          this.maintenanceMessage = res.data['sys.maintenance_message'] || ''
          this.lastFetchedAt = Date.now()
          // 成功一次就清掉退避标记，恢复正常刷新节奏
          lastFailureAt = 0
        } else {
          // HTTP 200 但业务码非 200（限流、维护中等）同样要进入退避，
          // 否则 lastFetchedAt 不更新 → isConfigStale 恒为 true → 每次导航都重发
          lastFailureAt = Date.now()
        }
        return this.configs
      })()

      // 网络层异常（断网、429、超时）也要进入退避，避免异常路径漏掉
      requestPromise.catch(() => {
        lastFailureAt = Date.now()
      })

      pendingFetchPromise = requestPromise.finally(() => {
        pendingFetchPromise = null
      })

      if (background) {
        pendingFetchPromise.catch(error => {
          logger.warn('Failed to refresh system config in background', error)
        })
        return this.configs
      }

      try {
        return await pendingFetchPromise
      } catch (e) {
        logger.error('Failed to fetch system config', e)
        throw e
      }
    },
    refreshSystemConfigInBackground(force = false) {
      return this.fetchSystemConfig({ force, background: true })
    },

    /**
     * 仅供测试使用：清空模块级退避状态。
     *
     * lastFailureAt / pendingFetchPromise 是模块级变量，多个用例共享同一模块
     * 实例时会互相污染（前一个用例失败后，后面的用例都被退避挡住）。
     */
    __resetFetchStateForTest() {
      lastFailureAt = 0
      pendingFetchPromise = null
    }
  },
  persist: true
})
