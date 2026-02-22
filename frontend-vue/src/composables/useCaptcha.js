import { ref } from 'vue'
import { authApi } from '../api/auth'

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间(毫秒)
 */
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 验证码组合式函数
 * 提供验证码相关的状态管理和操作
 */
export function useCaptcha() {
  const captchaRequired = ref(false)
  const captchaImage = ref('')
  const captchaLoading = ref(false)
  const rateLimited = ref(false) // 是否被限流
  const rateLimitMessage = ref('') // 限流提示信息

  // 缓存检查结果 (30秒)
  let checkCache = null
  let checkCacheTime = 0
  const CACHE_DURATION = 30000 // 30秒

  /**
   * 获取验证码图片
   */
  const fetchCaptcha = async () => {
    captchaLoading.value = true
    rateLimited.value = false
    try {
      const res = await authApi.getCaptcha()
      if (res.code === 200) {
        captchaImage.value = res.data.captchaImage
        return res.data.captchaKey
      }
    } catch (e) {
      // 检查是否是限流错误
      if (e.code === 429 || (e.message && e.message.includes('频繁'))) {
        rateLimited.value = true
        rateLimitMessage.value = '验证码获取过于频繁，请稍后再试'
      }
    } finally {
      captchaLoading.value = false
    }
    return null
  }

  /**
   * 检查是否需要验证码 (内部实现)
   */
  const checkCaptchaRequiredInternal = async (username, forceRefresh = false) => {
    if (!username) {
      captchaRequired.value = false
      return
    }

    // 检查缓存
    const now = Date.now()
    if (!forceRefresh && checkCache && checkCacheTime && (now - checkCacheTime) < CACHE_DURATION) {
      captchaRequired.value = checkCache
      if (checkCache) {
        fetchCaptcha()
      }
      return
    }

    try {
      const res = await authApi.checkCaptchaRequired(username)
      if (res.code === 200) {
        const required = res.data.required
        captchaRequired.value = required

        // 更新缓存
        checkCache = required
        checkCacheTime = now

        if (required) {
          const captchaKey = await fetchCaptcha()
          return captchaKey
        }
      }
    } catch (e) {
      // 检查是否是限流错误
      if (e.code === 429 || (e.message && e.message.includes('频繁'))) {
        rateLimited.value = true
        rateLimitMessage.value = '操作过于频繁，请稍后再试'
      }
    }
    return null
  }

  // 创建防抖版本 (300ms)
  const debouncedCheck = debounce(checkCaptchaRequiredInternal, 300)

  /**
   * 检查是否需要验证码 (带防抖和缓存)
   * @param {string} username - 用户名
   * @param {boolean} forceRefresh - 是否强制刷新缓存
   */
  const checkCaptchaRequired = async (username, forceRefresh = false) => {
    return debouncedCheck(username, forceRefresh)
  }

  /**
   * 清空验证码状态 (用于登录失败后)
   */
  const resetCaptcha = () => {
    captchaImage.value = ''
    checkCache = null
    checkCacheTime = 0
    rateLimited.value = false
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    checkCache = null
    checkCacheTime = 0
  }

  return {
    captchaRequired,
    captchaImage,
    captchaLoading,
    rateLimited,
    rateLimitMessage,
    fetchCaptcha,
    checkCaptchaRequired,
    resetCaptcha,
    clearCache
  }
}
