<script setup>
import { NAlert, NButton, NDivider, NInput, NModal } from 'naive-ui'
import { HelpCircle, Key, ShieldAlert } from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'

const props = defineProps({
  isBindingMfa: {
    type: Boolean,
    default: false
  },
  mfaCode: {
    type: String,
    default: ''
  },
  mfaSetupData: {
    type: Object,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['bind', 'update:mfaCode', 'update:show'])
</script>

<template>
  <n-modal :show="show" preset="card" title="设置多因子认证 (MFA)" class="max-w-xl" @update:show="emit('update:show', $event)">
    <div class="mfa-setup-container space-y-6">
      <n-alert type="info" :show-icon="true" title="操作指南">
        请使用手机下载 Microsoft Authenticator 或 Google Authenticator。如果您在中国，推荐使用微软验证码 App。
      </n-alert>

      <div class="flex flex-col md:flex-row gap-8 items-center">
        <div class="qr-code-box p-4 bg-white rounded-2xl shadow-lg border-4 border-white/5">
          <qrcode-vue :value="mfaSetupData.qrCodeUrl" :size="200" level="H" />
        </div>
        <div class="flex-1 space-y-4">
          <div>
            <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">手动添加密钥</div>
            <div class="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 group">
              <Key :size="16" class="text-indigo-400" />
              <code class="text-sm font-mono text-gray-200">{{ mfaSetupData.secret }}</code>
            </div>
          </div>
          <p class="text-[11px] text-gray-500 italic">
            <HelpCircle :size="12" class="inline" />
            扫码失败？请在 App 中选择“手动输入密钥”，输入上方 16 位字符即可绑定。
          </p>
        </div>
      </div>

      <n-divider dashed>验证并开启</n-divider>

      <div class="verification-step">
        <div class="mb-4 text-xs text-gray-400">请输入 App 中显示的 6 位动态验证码：</div>
        <div class="flex gap-4">
          <n-input
            :value="mfaCode"
            placeholder="000000"
            size="large"
            autofocus
            maxlength="6"
            class="text-center font-mono text-2xl"
            @update:value="emit('update:mfaCode', $event)"
          />
          <n-button type="primary" size="large" :loading="isBindingMfa" @click="emit('bind')">
            立即开启验证
          </n-button>
        </div>
      </div>

      <div class="security-tips bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
        <div class="flex items-center gap-2 text-amber-500 text-sm font-bold mb-2">
          <ShieldAlert :size="16" /> 安全备份提示
        </div>
        <ul class="text-[11px] text-amber-500/80 space-y-1 list-disc list-inside">
          <li>请将 16 位密钥抄写在纸上并妥善保管。</li>
          <li>如果手机丢失且未备份密钥，您将无法自助解封，届时必须联系人工客服核验。</li>
          <li>本项目采用标准 TOTP 协议，即使在无网络环境下也能正常生成验证码。</li>
        </ul>
      </div>
    </div>
  </n-modal>
</template>
