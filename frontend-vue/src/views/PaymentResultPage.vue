<script setup>
// 易支付完成后的回跳页：轮询订单状态，到账后刷新会员信息
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NResult, NSpin } from 'naive-ui'
import { paymentApi } from '../api/payment'
import { useUserStore } from '../stores/user'

const PENDING_KEY = 'learnsphere-pending-order'
const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 40

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const outTradeNo = String(route.query.out_trade_no || sessionStorage.getItem(PENDING_KEY) || '')
const order = ref(null)
const state = ref(outTradeNo ? 'checking' : 'missing') // checking | paid | pending | missing | error
let timer = null
let polls = 0

const title = computed(
  () =>
    ({
      checking: '正在确认支付结果',
      paid: '支付成功，会员已开通',
      pending: '暂未收到支付结果',
      missing: '没有找到待确认的订单',
      error: '订单查询失败'
    })[state.value]
)

const description = computed(() => {
  if (state.value === 'paid' && order.value)
    return `${order.value.planName} · ¥${order.value.amount}，额度已按新套餐生效`
  if (state.value === 'pending') return '如果已经付款，通常几秒内到账，可以稍后点击重新查询'
  if (state.value === 'checking') return '请勿关闭页面，通常只需要几秒钟'
  return '如有疑问请联系管理员，并提供订单号'
})

const resultStatus = computed(
  () =>
    ({ paid: 'success', pending: 'warning', missing: 'info', error: 'error' })[state.value] ||
    'info'
)

const stop = () => {
  if (timer) window.clearTimeout(timer)
  timer = null
}

const check = async () => {
  try {
    // silent：本页已有「查询失败/暂未收到结果」的界面状态，无需再弹全局提示
    const { data } = await paymentApi.getOrder(outTradeNo, { silent: true })
    order.value = data
    if (data.status === 'PAID') {
      state.value = 'paid'
      sessionStorage.removeItem(PENDING_KEY)
      userStore.getUserInfo?.().catch(() => {})
      return
    }
    polls += 1
    if (polls >= MAX_POLLS) {
      state.value = 'pending'
      return
    }
    timer = window.setTimeout(check, POLL_INTERVAL_MS)
  } catch (e) {
    state.value = 'error'
  }
}

const retry = () => {
  stop()
  polls = 0
  state.value = 'checking'
  check()
}

onMounted(() => {
  if (outTradeNo) check()
})
onBeforeUnmount(stop)
</script>

<template>
  <main class="payment-result-page">
    <section class="payment-result-card" aria-live="polite">
      <n-spin :show="state === 'checking'">
        <n-result :status="resultStatus" :title="title" :description="description">
          <template #footer>
            <p v-if="outTradeNo" class="order-no">订单号：{{ outTradeNo }}</p>
            <div class="actions">
              <n-button
                v-if="state === 'pending' || state === 'error'"
                type="primary"
                @click="retry"
                >重新查询</n-button
              >
              <n-button v-if="state === 'paid'" type="primary" @click="router.push('/dashboard')"
                >开始学习</n-button
              >
              <n-button @click="router.push('/pricing')">返回会员页</n-button>
            </div>
          </template>
        </n-result>
      </n-spin>
    </section>
  </main>
</template>

<style scoped>
.payment-result-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.payment-result-card {
  width: 100%;
  max-width: 520px;
  padding: 32px 24px;
  border-radius: var(--radius-lg);
  background: var(--n-color, #fff);
}

.order-no {
  margin: 0 0 16px;
  font-size: 0.85rem;
  color: var(--secondary-text);
  word-break: break-all;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
