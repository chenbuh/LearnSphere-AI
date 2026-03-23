<script setup>
import { NButton, NDivider, NIcon, NInput, NProgress, NTag } from 'naive-ui'
import { Activity, CheckCircle, Lock, QrCode, Shield } from 'lucide-vue-next'

const props = defineProps({
  isScanning: {
    type: Boolean,
    default: false
  },
  passwordForm: {
    type: Object,
    required: true
  },
  riskStatus: {
    type: Object,
    required: true
  },
  securityLogs: {
    type: Array,
    default: () => []
  },
  securityScore: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['openMfaSetup', 'runSecurityScan', 'updatePassword'])
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
    <div class="space-y-6">
      <h3 class="flex items-center gap-2 text-lg font-bold">
        <Lock :size="20" class="text-indigo-400" /> 修改密码
      </h3>
      <div class="form-group">
        <label class="block mb-2 text-gray-400">当前密码</label>
        <n-input v-model:value="passwordForm.current" type="password" show-password-on="click" placeholder="请输入当前密码">
          <template #prefix><Lock :size="16" /></template>
        </n-input>
      </div>
      <n-divider />
      <div class="form-group">
        <label class="block mb-2 text-gray-400">新密码</label>
        <n-input v-model:value="passwordForm.new" type="password" show-password-on="click" placeholder="请输入新密码（至少6位）">
          <template #prefix><Shield :size="16" /></template>
        </n-input>
      </div>
      <div class="form-group">
        <label class="block mb-2 text-gray-400">确认新密码</label>
        <n-input v-model:value="passwordForm.confirm" type="password" show-password-on="click" placeholder="请再次确认新密码">
          <template #prefix><Shield :size="16" /></template>
        </n-input>
      </div>
      <n-button type="warning" size="large" @click="emit('updatePassword')">修改密码</n-button>
    </div>

    <div class="space-y-8">
      <div class="mfa-card p-6 rounded-2xl border border-white/10 transition-all duration-300 hover:border-indigo-500/30" :class="riskStatus.mfaEnabled ? 'bg-emerald-500/5' : 'bg-white/5'">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-2">
            <n-icon :size="22" :component="QrCode" :class="riskStatus.mfaEnabled ? 'text-emerald-400' : 'text-indigo-400'" />
            <span class="font-bold text-gray-100 text-base">多因子认证 (MFA)</span>
          </div>
          <n-tag :type="riskStatus.mfaEnabled ? 'success' : 'default'" size="small" round ghost>
            {{ riskStatus.mfaEnabled ? '已开启' : '未开启' }}
          </n-tag>
        </div>
        <p class="text-xs text-gray-400 mb-6 leading-relaxed">
          开启 MFA 后，当您的账户因违规被系统锁定时，可通过 6 位动态验证码自助解除限制，确保学习进度不中断。
        </p>
        <n-button v-if="!riskStatus.mfaEnabled" type="primary" block dashed class="h-11 font-bold" @click="emit('openMfaSetup')">
          立即绑定身份验证器
        </n-button>
        <div v-else class="flex items-center gap-3 text-emerald-400 text-xs bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
          <n-icon :component="CheckCircle" :size="16" />
          <span class="font-medium">您的账户已受高级风控保护</span>
        </div>
      </div>

      <div class="security-score-card p-8 rounded-2xl bg-white/5 border border-white/10 text-center relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
        <div v-if="isScanning" class="scan-overlay">
          <div class="scan-line"></div>
        </div>
        <h3 class="m-0 mb-4 text-sm font-bold text-gray-400 uppercase tracking-widest">安全评分</h3>
        <n-progress
          type="circle"
          :percentage="securityScore"
          :color="securityScore >= 90 ? '#10b981' : securityScore >= 70 ? '#f59e0b' : '#ef4444'"
          :stroke-width="8"
        >
          <div class="text-center">
            <span class="text-3xl font-black text-white">{{ securityScore }}</span>
            <div class="text-[10px] text-gray-500">安全</div>
          </div>
        </n-progress>
        <p class="mt-4 text-xs text-gray-400">
          {{ securityScore >= 90 ? '账号受良好保护，请继续保持' : '建议定期修改密码并开启两步验证' }}
        </p>
        <n-button secondary round size="small" class="mt-2" :loading="isScanning" @click="emit('runSecurityScan')">
          立即深度云扫描
        </n-button>
      </div>

      <div class="login-activity mt-4">
        <h4 class="text-sm font-bold text-gray-300 mb-5 flex items-center gap-2">
          <n-icon :size="18" :component="Activity" class="text-indigo-400" /> 最近安全审计
        </h4>
        <div class="space-y-3">
          <div v-for="log in securityLogs" :key="log.id" class="activity-log-item p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-200 font-medium">{{ log.event }}</div>
              <div class="text-[10px] text-gray-500">{{ log.time }} · IP: {{ log.ip }}</div>
            </div>
            <n-tag :type="log.status === 'success' ? 'success' : 'warning'" size="tiny" round ghost>
              {{ log.status === 'success' ? '安全' : '异常' }}
            </n-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mfa-card,
.security-score-card,
.activity-log-item {
  backdrop-filter: blur(10px);
}

.activity-log-item {
  transition: all 0.3s ease;
}

.activity-log-item:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
}

.scan-overlay {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.scan-line {
  position: absolute;
  inset-inline: 0;
  height: 96px;
  background: linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.18), transparent);
  filter: blur(6px);
  animation: security-scan 1.8s linear infinite;
}

@keyframes security-scan {
  from {
    transform: translateY(-120px);
  }

  to {
    transform: translateY(320px);
  }
}

:global(html[data-theme='light'] .form-group label),
:global(html[data-theme='light'] .text-gray-400),
:global(html[data-theme='light'] .text-gray-500),
:global(html[data-theme='light'] .text-gray-300) {
  color: #64748b !important;
}

:global(html[data-theme='light'] .text-gray-100),
:global(html[data-theme='light'] .text-gray-200),
:global(html[data-theme='light'] .security-score-card .text-white) {
  color: #18243d !important;
}

:global(html[data-theme='light'] .mfa-card),
:global(html[data-theme='light'] .security-score-card),
:global(html[data-theme='light'] .activity-log-item) {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(148, 163, 184, 0.2) !important;
  box-shadow: 0 22px 50px -38px rgba(15, 23, 42, 0.25);
}

:global(html[data-theme='light'] .mfa-card.bg-emerald-500\/5) {
  background: linear-gradient(180deg, rgba(236, 253, 245, 0.96), rgba(255, 255, 255, 0.92));
  border-color: rgba(16, 185, 129, 0.24) !important;
}

:global(html[data-theme='light'] .mfa-card.bg-white\/5) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
}

:global(html[data-theme='light'] .activity-log-item:hover) {
  background: rgba(238, 242, 255, 0.92);
  border-color: rgba(99, 102, 241, 0.18);
}

:global(html[data-theme='light'] .scan-line) {
  background: linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.12), transparent);
}

:global(html[data-theme='light'] .n-input) {
  background: #ffffff !important;
  border-color: rgba(148, 163, 184, 0.24) !important;
  color: #18243d !important;
}
</style>
