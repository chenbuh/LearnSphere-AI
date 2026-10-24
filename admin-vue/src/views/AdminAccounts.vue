<script setup>
import { computed, h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPagination,
  NPopconfirm,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
  useMessage
} from 'naive-ui'
import { KeyRound, Plus, RefreshCw, Search, ShieldCheck, UserCheck, Users2 } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import { getAdminInfo } from '@/utils/adminSession'

const message = useMessage()
const currentAdminId = computed(() => getAdminInfo()?.id)

const loading = ref(false)
const list = ref([])
const total = ref(0)
const activeCount = computed(() => list.value.filter(item => item.status === 1).length)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const roleOptions = ref([])

const showEditModal = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = ref({ username: '', nickname: '', password: '', role: 'content' })

const showPasswordModal = ref(false)
const passwordTarget = ref(null)
const newPassword = ref('')

const roleLabel = code =>
  roleOptions.value.find(role => role.value === code)?.label || code || '超级管理员'
const roleTagType = code =>
  ({ super_admin: 'warning', content: 'info', operator: 'success' })[code || 'super_admin'] ||
  'default'

const formatDateTime = value => {
  if (!value) return '从未登录'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('zh-CN', { hour12: false })
}

const passwordHint = '至少 8 位，需同时包含字母和数字'
const isPasswordValid = value =>
  value && value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await adminApi.getAdminAccounts({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined
    })
    if (res.code === 200) {
      list.value = res.data?.records || []
      total.value = Number(res.data?.total || 0)
    }
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  const res = await adminApi.getAdminRoles()
  if (res.code === 200) roleOptions.value = res.data || []
}

const search = () => {
  page.value = 1
  fetchList()
}

const openCreate = () => {
  editing.value = null
  form.value = { username: '', nickname: '', password: '', role: 'content' }
  showEditModal.value = true
}

const openEdit = row => {
  editing.value = row
  form.value = {
    username: row.username,
    nickname: row.nickname || '',
    password: '',
    role: row.role || 'super_admin'
  }
  showEditModal.value = true
}

const submitEdit = async () => {
  if (!editing.value) {
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(form.value.username)) {
      message.warning('账号只能包含字母、数字和下划线，长度 3-32 位')
      return
    }
    if (!isPasswordValid(form.value.password)) {
      message.warning(`初始密码${passwordHint}`)
      return
    }
  }
  saving.value = true
  try {
    const res = editing.value
      ? await adminApi.updateAdminAccount(editing.value.id, {
          nickname: form.value.nickname,
          role: form.value.role
        })
      : await adminApi.createAdminAccount(form.value)
    if (res.code === 200) {
      message.success(editing.value ? '已保存' : '管理员已创建')
      showEditModal.value = false
      fetchList()
    }
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (row, enabled) => {
  const res = await adminApi.updateAdminAccountStatus(row.id, enabled ? 1 : 0)
  if (res.code === 200) {
    message.success(enabled ? '已启用' : '已停用，该账号已被强制下线')
    fetchList()
  }
}

const openPassword = row => {
  passwordTarget.value = row
  newPassword.value = ''
  showPasswordModal.value = true
}

const submitPassword = async () => {
  if (!isPasswordValid(newPassword.value)) {
    message.warning(`新密码${passwordHint}`)
    return
  }
  const res = await adminApi.resetAdminAccountPassword(passwordTarget.value.id, newPassword.value)
  if (res.code === 200) {
    message.success('密码已重置')
    showPasswordModal.value = false
  }
}

const removeAccount = async row => {
  const res = await adminApi.deleteAdminAccount(row.id)
  if (res.code === 200) {
    message.success('已删除')
    fetchList()
  }
}

const columns = computed(() => [
  {
    title: '账号',
    key: 'username',
    minWidth: 180,
    render: row =>
      h('div', { class: 'acct' }, [
        h('span', { class: 'acct__name' }, [
          row.nickname || row.username,
          row.id === currentAdminId.value ? h('span', { class: 'acct__self' }, '（我）') : null
        ]),
        h('span', { class: 'acct__sub' }, row.username)
      ])
  },
  {
    title: '角色',
    key: 'role',
    width: 130,
    render: row =>
      h(
        NTag,
        { size: 'small', bordered: false, type: roleTagType(row.role) },
        { default: () => roleLabel(row.role) }
      )
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: row =>
      h(NSwitch, {
        size: 'small',
        value: row.status === 1,
        disabled: row.id === currentAdminId.value,
        'onUpdate:value': value => toggleStatus(row, value)
      })
  },
  {
    title: '最近登录',
    key: 'lastLoginTime',
    width: 180,
    render: row => formatDateTime(row.lastLoginTime)
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render: row =>
      h(
        NSpace,
        { size: 4, wrap: false },
        {
          default: () => [
            h(
              NButton,
              { size: 'small', quaternary: true, type: 'primary', onClick: () => openEdit(row) },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              { size: 'small', quaternary: true, onClick: () => openPassword(row) },
              { default: () => '重置密码' }
            ),
            row.id === currentAdminId.value
              ? null
              : h(
                  NPopconfirm,
                  { onPositiveClick: () => removeAccount(row) },
                  {
                    trigger: () =>
                      h(
                        NButton,
                        { size: 'small', quaternary: true, type: 'error' },
                        { default: () => '删除' }
                      ),
                    default: () => `确认删除管理员 ${row.username}？`
                  }
                )
          ]
        }
      )
  }
])

onMounted(() => {
  fetchRoles()
  fetchList()
})
</script>

<template>
  <div class="admin-page admin-page--wide">
    <Teleport to="#page-actions" defer>
      <n-button secondary :loading="loading" @click="fetchList">
        <template #icon><RefreshCw :size="16" /></template>
        刷新
      </n-button>
      <n-button type="primary" @click="openCreate">
        <template #icon><Plus :size="16" /></template>
        新增管理员
      </n-button>
    </Teleport>

    <section class="ls-stats" aria-label="管理员概览">
      <div class="ls-stat">
        <span class="ls-stat__label"><ShieldCheck :size="14" />管理员总数</span>
        <strong class="ls-stat__value">{{ total }}</strong>
        <span class="ls-stat__hint">全系统已登记账号</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><UserCheck :size="14" />本页启用账号</span>
        <strong class="ls-stat__value">{{ activeCount }}</strong>
        <span class="ls-stat__hint">正常允许登录访问</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><Users2 :size="14" />权限角色类型</span>
        <strong class="ls-stat__value">{{ roleOptions.length || 3 }}</strong>
        <span class="ls-stat__hint">分级分权精细化治理</span>
      </div>
    </section>

    <section class="ls-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">
          管理员列表 <span class="ls-panel__count">共 {{ total }} 个</span>
        </h2>
      </header>

      <div class="ls-filter">
        <n-input
          v-model:value="keyword"
          placeholder="账号或昵称，回车确认"
          clearable
          style="width: 260px"
          @keyup.enter="search"
          @clear="search"
        >
          <template #prefix><Search :size="15" /></template>
        </n-input>
        <n-button type="primary" @click="search">搜索</n-button>
      </div>

      <n-data-table
        :columns="columns"
        :data="list"
        :loading="loading"
        :bordered="false"
        :scroll-x="820"
        remote
      />

      <div class="ls-panel__foot">
        <n-pagination
          v-model:page="page"
          :item-count="total"
          :page-size="pageSize"
          @update:page="fetchList"
        />
      </div>
    </section>

    <section class="ls-panel role-guide">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">权限角色体系说明</h2>
      </header>
      <div class="role-cards-grid">
        <div class="role-card role-card--admin">
          <div class="role-card__header">
            <span class="role-badge role-badge--admin">超级管理员</span>
            <span class="role-perm">全权访问</span>
          </div>
          <p class="role-desc">
            掌管全部系统功能，包括管理员账号授权、系统全局配置、AI
            密钥治理、会员套餐定价与订单退款流转。
          </p>
        </div>
        <div class="role-card role-card--content">
          <div class="role-card__header">
            <span class="role-badge role-badge--content">内容运营</span>
            <span class="role-perm">题库与 AI</span>
          </div>
          <p class="role-desc">
            负责核心教研资产：词汇表维护、四大分类学习内容、写作题库、真题试卷、AI
            助教人格调优与内容合规审核。
          </p>
        </div>
        <div class="role-card role-card--operator">
          <div class="role-card__header">
            <span class="role-badge role-badge--operator">用户运营</span>
            <span class="role-perm">学员与分析</span>
          </div>
          <p class="role-desc">
            聚焦学员生命周期：用户列表与 VIP
            配额分配、站内系统通知群发、订单查看、审计日志以及全站学习成效统计。
          </p>
        </div>
      </div>
    </section>

    <n-modal
      v-model:show="showEditModal"
      preset="card"
      :title="editing ? '编辑管理员' : '新增管理员'"
      style="width: 460px"
      :mask-closable="!saving"
    >
      <n-form label-placement="left" label-width="80">
        <n-form-item label="账号" required>
          <n-input
            v-model:value="form.username"
            :disabled="!!editing"
            placeholder="字母、数字或下划线"
          />
        </n-form-item>
        <n-form-item label="昵称">
          <n-input v-model:value="form.nickname" placeholder="显示在后台右下角" />
        </n-form-item>
        <n-form-item v-if="!editing" label="初始密码" required>
          <n-input
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            :placeholder="passwordHint"
          />
        </n-form-item>
        <n-form-item label="角色" required>
          <n-select
            v-model:value="form.role"
            :options="roleOptions"
            :disabled="editing && editing.id === currentAdminId"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="submitEdit">{{
            editing ? '保存' : '创建'
          }}</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showPasswordModal" preset="card" title="重置密码" style="width: 420px">
      <p class="pwd-target">
        为 <strong>{{ passwordTarget?.username }}</strong> 设置新密码，对方会被强制下线。
      </p>
      <n-input
        v-model:value="newPassword"
        type="password"
        show-password-on="click"
        :placeholder="passwordHint"
      >
        <template #prefix><KeyRound :size="15" /></template>
      </n-input>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showPasswordModal = false">取消</n-button>
          <n-button type="primary" @click="submitPassword">重置</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
:deep(.acct) {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

:deep(.acct__name) {
  color: var(--ink);
  font-weight: 500;
}

:deep(.acct__self),
:deep(.acct__sub) {
  color: var(--ink-3);
  font-size: 12px;
  font-weight: 400;
}

.role-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 16px 20px 20px;
}

@media (max-width: 900px) {
  .role-cards-grid {
    grid-template-columns: 1fr;
  }
}

.role-card {
  padding: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

.role-card:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  transform: translateY(-2px);
}

.role-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.role-badge {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
}

.role-badge--admin {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.role-badge--content {
  background: #e0e7ff;
  color: #4338ca;
  border: 1px solid #c7d2fe;
}

.role-badge--operator {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.role-perm {
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-desc {
  margin: 0;
  color: var(--ink-2);
  font-size: 13px;
  line-height: 1.6;
}

.pwd-target {
  margin: 0 0 12px;
  color: var(--ink-2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
