<template>
  <div class="vip-upgrade-prompt" :class="{ compact: compact }">
    <div class="prompt-content">
      <div class="icon-wrapper">
        <n-icon :size="compact ? 20 : 32" color="#f59e0b">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        </n-icon>
      </div>
      
      <div class="text-content">
        <div class="title">{{ title }}</div>
        <div class="description">{{ description }}</div>
      </div>

      <n-button 
        type="warning" 
        :size="compact ? 'small' : 'medium'"
        ghost
        @click="handleUpgrade"
      >
        {{ buttonText }}
      </n-button>
    </div>

    <div v-if="showFeatures && !compact" class="features-list">
      <div class="feature-item" v-for="feature in features" :key="feature">
        <n-icon size="14" color="#f59e0b">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </n-icon>
        <span>{{ feature }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'

const props = defineProps({
  title: {
    type: String,
    default: 'VIP 专属功能'
  },
  description: {
    type: String,
    default: '升级 VIP 会员，解锁所有 AI 增强功能'
  },
  buttonText: {
    type: String,
    default: '立即升级'
  },
  showFeatures: {
    type: Boolean,
    default: true
  },
  compact: {
    type: Boolean,
    default: false
  },
  features: {
    type: Array,
    default: () => [
      '每日 50-200 次 AI 调用额度',
      '所有 AI 生成功能无限访问',
      '智能批改和评测',
      '个性化学习计划',
      '无广告纯净体验'
    ]
  }
})

const router = useRouter()

const handleUpgrade = () => {
  router.push('/pricing')
}
</script>

<style scoped>
.vip-upgrade-prompt {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  padding: 24px;
  border: 2px solid #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
  transition: all 0.3s ease;
}

.vip-upgrade-prompt:hover {
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
  transform: translateY(-2px);
}

.vip-upgrade-prompt.compact {
  padding: 16px;
  border-radius: 12px;
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.compact .prompt-content {
  gap: 12px;
}

.icon-wrapper {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.compact .icon-wrapper {
  width: 32px;
  height: 32px;
}

.text-content {
  flex: 1;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 4px;
}

.compact .title {
  font-size: 14px;
  margin-bottom: 2px;
}

.description {
  font-size: 14px;
  color: #78350f;
}

.compact .description {
  font-size: 12px;
}

.features-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(245, 158, 11, 0.3);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #78350f;
}

.feature-item span {
  flex: 1;
}

@media (max-width: 768px) {
  .vip-upgrade-prompt {
    padding: 16px;
  }

  .prompt-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .features-list {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 16px;
  }

  .description {
    font-size: 13px;
  }
}
</style>
