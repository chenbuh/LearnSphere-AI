import { computed, onBeforeUnmount, ref } from 'vue'

/**
 * 邮箱验证码发送按钮状态：发送中 / 60 秒倒计时
 * @param {(email: string) => Promise<any>} sender 实际调用发送接口的函数
 */
export function useEmailCode(sender, cooldownSeconds = 60) {
  const sending = ref(false)
  const countdown = ref(0)
  let timer = null

  const stop = () => {
    if (timer) {
      window.clearInterval(timer)
      timer = null
    }
  }

  const startCountdown = (seconds = cooldownSeconds) => {
    stop()
    countdown.value = seconds
    timer = window.setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0) {
        countdown.value = 0
        stop()
      }
    }, 1000)
  }

  const canSend = computed(() => !sending.value && countdown.value === 0)
  const buttonText = computed(() => {
    if (sending.value) return '发送中...'
    return countdown.value > 0 ? `${countdown.value} 秒后重发` : '发送验证码'
  })

  /** 发送成功返回接口响应，失败抛出原错误，由调用方提示 */
  const send = async email => {
    if (!canSend.value) return null
    sending.value = true
    try {
      const res = await sender(email)
      startCountdown()
      return res
    } catch (error) {
      // 后端提示过于频繁时同样进入冷却，避免用户连点
      if (error?.code === 429) startCountdown()
      throw error
    } finally {
      sending.value = false
    }
  }

  onBeforeUnmount(stop)

  return { sending, countdown, canSend, buttonText, send, reset: () => { stop(); countdown.value = 0 } }
}
