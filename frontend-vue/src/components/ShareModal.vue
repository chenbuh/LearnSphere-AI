<template>
  <n-modal
    v-model:show="isVisible"
    preset="card"
    :title="$t('share.title')"
    :bordered="false"
    size="medium"
    :segmented="true"
    class="share-modal"
    style="max-width: 480px"
  >
    <div class="share-container">
      <!-- 分享描述 -->
      <div class="share-description">
        <p>{{ description || $t('share.defaultDesc') }}</p>
      </div>

      <!-- 分享选项 -->
      <div class="share-options">
        <!-- QQ 分享 -->
        <div class="share-item qq-share" @click="shareToQQ">
          <div class="share-icon qq-icon">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M511.09 63.58C228.14 63.58 0 264.61 0 511.56c0 144.25 70.33 272.77 179.17 358.28-11.96 38.44-37.95 118.4-43.14 134.23 0 0-3.18 12.74 6.37 17.15s17.93-1.59 17.93-1.59c20.36-3.18 150.39-98.58 174.76-115.22 56.88 15.56 117.62 23.54 180.76 23.54 282.95 0 511.09-201.03 511.09-448.39S794.04 63.58 511.09 63.58z" fill="#12B7F5"/>
            </svg>
          </div>
          <span class="share-label">{{ $t('share.qq') }}</span>
        </div>

        <!-- 微信分享 -->
        <div class="share-item wechat-share" @click="showWeChatQR = true">
          <div class="share-icon wechat-icon">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274871 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230971-0.470721 28.752768-1.225921-6.025525-20.36584-9.521177-41.723264-9.521177-63.94698C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.090758c-23.107277 0-46.402556-15.309684-46.402556-38.156018 0-22.941502 23.295279-38.061874 46.402556-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.090758 283.016307 362.090758zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262567l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803227 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295279 0 38.558178 15.286148 38.558178 30.477129C637.361405 552.897456 622.098506 567.994292 598.803227 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z" fill="#09BB07"/>
            </svg>
          </div>
          <span class="share-label">{{ $t('share.wechat') }}</span>
        </div>

        <!-- 复制链接 -->
        <div class="share-item copy-link" @click="copyLink">
          <div class="share-icon copy-icon">
            <Link :size="32" />
          </div>
          <span class="share-label">{{ $t('share.copyLink') }}</span>
        </div>
      </div>

      <!-- 微信二维码弹窗 -->
      <n-modal
        v-model:show="showWeChatQR"
        preset="card"
        :title="$t('share.wechatScan')"
        :bordered="false"
        size="small"
        :segmented="true"
        class="qr-modal"
        style="max-width: 360px"
      >
        <div class="qr-container">
          <div class="qr-code-wrapper">
            <qrcode-vue 
              :value="shareUrl" 
              :size="220" 
              level="H"
              render-as="svg"
              class="qr-code"
            />
          </div>
          <p class="qr-hint">{{ $t('share.scanHint') }}</p>
          <div class="share-url">
            <n-input 
              :value="shareUrl" 
              readonly 
              size="small"
            >
              <template #suffix>
                <n-button 
                  text 
                  @click="copyLink"
                  :focusable="false"
                >
                  <template #icon>
                    <Copy :size="16" />
                  </template>
                </n-button>
              </template>
            </n-input>
          </div>
        </div>
      </n-modal>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NModal, NButton, NInput, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import QrcodeVue from 'qrcode.vue'
import { Link, Copy } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:show'])

const message = useMessage()
const { t } = useI18n()

const isVisible = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const showWeChatQR = ref(false)

// 生成分享 URL（默认当前页面）
const shareUrl = computed(() => {
  return props.url || window.location.href
})

// 分享标题
const shareTitle = computed(() => {
  return props.title || document.title || 'LearnSphere AI'
})

// 分享描述
const shareDesc = computed(() => {
  return props.description || t('share.defaultDesc')
})

// 分享图片
const shareImage = computed(() => {
  return props.image || `${window.location.origin}/logo.png`
})

// QQ 分享
const shareToQQ = () => {
  const qqShareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(shareTitle.value)}&summary=${encodeURIComponent(shareDesc.value)}&pics=${encodeURIComponent(shareImage.value)}`
  
  window.open(qqShareUrl, '_blank', 'width=600,height=400')
  message.success(t('share.qqSuccess'))
}

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    message.success(t('share.copySuccess'))
  } catch (err) {
    // 兜底方案
    const textarea = document.createElement('textarea')
    textarea.value = shareUrl.value
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    message.success(t('share.copySuccess'))
  }
}
</script>

<style scoped>
.share-container {
  padding: 1rem 0;
}

.share-description {
  margin-bottom: 2rem;
  text-align: center;
}

.share-description p {
  color: var(--n-text-color);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05));
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.share-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.share-item:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.share-item:hover::before {
  opacity: 1;
}

.share-item:active {
  transform: translateY(-2px);
}

.share-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.share-item:hover .share-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.qq-icon svg,
.wechat-icon svg {
  width: 32px;
  height: 32px;
}

.copy-icon {
  color: #6366f1;
}

.share-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--n-text-color);
  position: relative;
  z-index: 1;
}

/* 二维码弹窗样式 */
.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
}

.qr-code-wrapper {
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.qr-code {
  display: block;
}

.qr-hint {
  color: var(--n-text-color-2);
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.share-url {
  width: 100%;
}

/* 响应式 */
@media (max-width: 640px) {
  .share-options {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .share-item {
    padding: 1rem 0.5rem;
  }

  .share-icon {
    width: 40px;
    height: 40px;
  }

  .qq-icon svg,
  .wechat-icon svg {
    width: 24px;
    height: 24px;
  }

  .share-label {
    font-size: 0.75rem;
  }
}

/* 深色模式适配 */
:deep(.n-card) {
  backdrop-filter: blur(10px);
}

.qr-code-wrapper {
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
}
</style>
