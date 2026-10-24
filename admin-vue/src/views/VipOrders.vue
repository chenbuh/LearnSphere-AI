<script setup>
import { computed, h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NPagination,
  NPopconfirm,
  NSelect,
  NTag,
  useMessage
} from 'naive-ui'
import { CreditCard, RefreshCw, Search, Tag, Undo2, Users, Wallet } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import { getAdminRole } from '@/utils/adminSession'

const message = useMessage()
const isSuperAdmin = computed(() => (getAdminRole() || 'super_admin') === 'super_admin')

const statusMeta = {
  PAID: { label: '已支付', type: 'success' },
  PENDING: { label: '待支付', type: 'warning' },
  MANUAL_GRANTED: { label: '后台开通', type: 'info' },
  REFUNDED: { label: '已退款', type: 'default' },
  UNKNOWN: { label: '未知', type: 'default' }
}
const statusOptions = [
  { label: '全部状态', value: 'all' },
  ...Object.entries(statusMeta)
    .filter(([key]) => key !== 'UNKNOWN')
    .map(([value, meta]) => ({ label: meta.label, value }))
]
const levelOptions = [
  { label: '全部套餐', value: 'all' },
  { label: '月度会员', value: 1 },
  { label: '季度会员', value: 2 },
  { label: '年度会员', value: 3 }
]

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = ref({ status: 'all', vipLevel: 'all', keyword: '', range: null })
const summary = ref({})

const showPlanModal = ref(false)
const plans = ref([])
const savingPlans = ref(false)

const formatMoney = value => Number(value || 0).toFixed(2)
const formatDateTime = value => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('zh-CN', { hour12: false })
}
const toDateParam = ts => {
  if (!ts) return undefined
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const { status, vipLevel, keyword, range } = filters.value
    const res = await adminApi.getVipOrders({
      page: page.value,
      size: pageSize.value,
      status: status === 'all' ? undefined : status,
      vipLevel: vipLevel === 'all' ? undefined : vipLevel,
      keyword: keyword?.trim() || undefined,
      startDate: toDateParam(range?.[0]),
      endDate: toDateParam(range?.[1])
    })
    if (res.code === 200) {
      list.value = res.data?.records || []
      total.value = Number(res.data?.total || 0)
    }
  } finally {
    loading.value = false
  }
}

const fetchSummary = async () => {
  try {
    const res = await adminApi.getVipOrderSummary()
    if (res.code === 200) summary.value = res.data || {}
  } catch {
    // 汇总失败不影响列表
  }
}

const refreshAll = () => {
  fetchOrders()
  fetchSummary()
}

const search = () => {
  page.value = 1
  fetchOrders()
}

const handleRefund = async row => {
  const res = await adminApi.refundVipOrder(row.id)
  if (res.code === 200) {
    message.success('已标记为退款')
    refreshAll()
  }
}

const openPlanModal = async () => {
  const res = await adminApi.getVipPlans()
  if (res.code === 200) {
    plans.value = (res.data || []).map(plan => ({
      ...plan,
      price: plan.price == null ? null : Number(plan.price)
    }))
    showPlanModal.value = true
  }
}

const savePlans = async () => {
  if (plans.value.some(plan => plan.price == null || plan.price < 0)) {
    message.warning('请填写所有套餐的价格')
    return
  }
  savingPlans.value = true
  try {
    const res = await adminApi.updateVipPlans(
      plans.value.map(({ vipLevel, price }) => ({ vipLevel, price }))
    )
    if (res.code === 200) {
      message.success('套餐价格已保存，前台价格页会同步更新')
      showPlanModal.value = false
    }
  } finally {
    savingPlans.value = false
  }
}

const PAY_TYPE_LABELS = { alipay: '支付宝', wxpay: '微信支付' }

const columns = computed(() => [
  { title: '订单号', key: 'id', width: 90 },
  {
    title: '用户',
    key: 'username',
    minWidth: 160,
    render: row =>
      h('div', { class: 'order-user' }, [
        h(
          'span',
          { class: 'order-user__name' },
          row.nickname || row.username || `用户 #${row.userId}`
        ),
        row.username ? h('span', { class: 'order-user__sub' }, row.username) : null
      ])
  },
  { title: '套餐', key: 'planName', width: 110 },
  {
    title: '金额',
    key: 'amount',
    width: 110,
    align: 'right',
    render: row => h('span', { class: 'num' }, `¥${formatMoney(row.amount)}`)
  },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: row => {
      const meta = statusMeta[row.status] || statusMeta.UNKNOWN
      return h(
        NTag,
        { size: 'small', bordered: false, type: meta.type },
        { default: () => meta.label }
      )
    }
  },
  {
    title: '支付方式',
    key: 'payType',
    minWidth: 150,
    render: row =>
      row.outTradeNo
        ? h('div', { class: 'order-user' }, [
            h(
              'span',
              { class: 'order-user__name' },
              [
                PAY_TYPE_LABELS[row.payType] || '在线支付',
                row.orderType === 'UPGRADE'
                  ? ` · 升级（抵扣 ¥${formatMoney(row.creditAmount)}）`
                  : row.orderType === 'RENEW'
                    ? ' · 续费'
                    : ''
              ].join('')
            ),
            h('span', { class: 'order-user__sub' }, row.outTradeNo)
          ])
        : h('span', { class: 'order-user__sub' }, '后台开通')
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: row => formatDateTime(row.createTime)
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: row => {
      if (row.status !== 'PAID' || !isSuperAdmin.value) return h('span', { class: 'muted' }, '—')
      return h(
        NPopconfirm,
        { onPositiveClick: () => handleRefund(row) },
        {
          trigger: () =>
            h(
              NButton,
              { size: 'small', quaternary: true, type: 'error' },
              {
                default: () => '标记退款',
                icon: () => h(Undo2, { size: 14 })
              }
            ),
          default: () => '只更改订单状态，不会自动收回会员时长。确认标记退款？'
        }
      )
    }
  }
])

const rangeText = computed(() => {
  if (!total.value) return '暂无订单'
  const start = (page.value - 1) * pageSize.value + 1
  const end = Math.min(page.value * pageSize.value, total.value)
  return `第 ${start} - ${end} 条，共 ${total.value} 条`
})

onMounted(refreshAll)
</script>

<template>
  <div class="admin-page admin-page--wide">
    <Teleport to="#page-actions" defer>
      <n-button secondary :loading="loading" @click="refreshAll">
        <template #icon><RefreshCw :size="16" /></template>
        刷新
      </n-button>
      <n-button v-if="isSuperAdmin" type="primary" @click="openPlanModal">
        <template #icon><Tag :size="16" /></template>
        套餐价格
      </n-button>
    </Teleport>

    <section class="ls-stats" aria-label="订单汇总">
      <div class="ls-stat">
        <span class="ls-stat__label"><Wallet :size="14" />累计收入</span>
        <strong class="ls-stat__value"
          ><small>¥</small>{{ formatMoney(summary.paidRevenue) }}</strong
        >
        <span class="ls-stat__hint">本月 ¥{{ formatMoney(summary.monthRevenue) }}</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><CreditCard :size="14" />已支付订单</span>
        <strong class="ls-stat__value">{{ summary.paidCount ?? 0 }}</strong>
        <span class="ls-stat__hint">已退款 {{ summary.refundedCount ?? 0 }}</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><Tag :size="14" />后台开通</span>
        <strong class="ls-stat__value">{{ summary.manualCount ?? 0 }}</strong>
        <span class="ls-stat__hint">不计入收入</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><Users :size="14" />当前有效会员</span>
        <strong class="ls-stat__value">{{ summary.activeVipCount ?? 0 }}</strong>
        <span class="ls-stat__hint">按到期时间统计</span>
      </div>
    </section>

    <section class="ls-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">
          订单列表 <span class="ls-panel__count">共 {{ total }} 条</span>
        </h2>
      </header>

      <div class="ls-filter">
        <n-input
          v-model:value="filters.keyword"
          placeholder="用户名 / 邮箱 / 订单号，回车确认"
          clearable
          style="width: 260px"
          @keyup.enter="search"
          @clear="search"
        >
          <template #prefix><Search :size="15" /></template>
        </n-input>
        <n-select
          v-model:value="filters.status"
          :options="statusOptions"
          style="width: 130px"
          @update:value="search"
        />
        <n-select
          v-model:value="filters.vipLevel"
          :options="levelOptions"
          style="width: 130px"
          @update:value="search"
        />
        <n-date-picker
          v-model:value="filters.range"
          type="daterange"
          clearable
          style="width: 260px"
          @update:value="search"
        />
        <n-button @click="search">搜索</n-button>
      </div>

      <n-data-table
        :columns="columns"
        :data="list"
        :loading="loading"
        :bordered="false"
        :scroll-x="900"
        remote
      />

      <div class="ls-panel__foot orders-foot">
        <span class="orders-foot__range">{{ rangeText }}</span>
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :item-count="total"
          :page-sizes="[10, 20, 50]"
          show-size-picker
          @update:page="fetchOrders"
          @update:page-size="search"
        />
      </div>
    </section>

    <n-modal
      v-model:show="showPlanModal"
      preset="card"
      title="套餐价格"
      style="width: 440px"
      :mask-closable="!savingPlans"
    >
      <n-form label-placement="left" label-width="96">
        <n-form-item v-for="plan in plans" :key="plan.vipLevel" :label="plan.name">
          <n-input-number
            v-model:value="plan.price"
            :min="0"
            :max="100000"
            :precision="2"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </n-input-number>
        </n-form-item>
      </n-form>
      <p class="plan-note">前台价格页会读取这里的价格。已有订单的金额不受影响。</p>
      <template #footer>
        <div class="plan-actions">
          <n-button @click="showPlanModal = false">取消</n-button>
          <n-button type="primary" :loading="savingPlans" @click="savePlans">保存价格</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.orders-foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.orders-foot__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

:deep(.order-user) {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

:deep(.order-user__name) {
  color: var(--ink);
  font-weight: 500;
}

:deep(.order-user__sub),
:deep(.muted) {
  color: var(--ink-3);
  font-size: 12px;
}

:deep(.num) {
  font-variant-numeric: tabular-nums;
}

.plan-note {
  margin: 4px 0 0;
  color: var(--ink-3);
  font-size: 12px;
}

.plan-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
