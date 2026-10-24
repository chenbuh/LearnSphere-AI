<template>
  <n-modal :show="show" :mask-closable="false">
    <div class="ai-evaluating-overlay">
      <div class="brain-loader">
        <div class="core-brain">
          <Zap :size="48" class="zap-pulse" />
        </div>
        <div class="orbit ring-1"></div>
        <div class="orbit ring-2"></div>
      </div>
      <div class="loading-status">
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { NModal } from 'naive-ui'
import { Zap } from 'lucide-vue-next'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'LearnSphere AI 正在分析...'
  },
  description: {
    type: String,
    default: '正在从语法连贯性、词汇多样性、逻辑连贯度进行深度建模'
  }
})
</script>

<style scoped>
.ai-evaluating-overlay {
  background: rgba(15, 23, 42, 0.9);
  padding: 60px;
  border-radius: var(--radius-lg);
  text-align: center;
  border: 1px solid rgba(30, 107, 82, 0.2);
}

.brain-loader {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 40px;
}

.core-brain {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 107, 82, 0.1);
  border-radius: 50%;
  border: 2px solid #1e6b52;
}

.zap-pulse {
  color: #1e6b52;
  animation: zap-glow 1.5s ease-in-out infinite;
}

@keyframes zap-glow {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.orbit {
  position: absolute;
  border: 1px dashed rgba(30, 107, 82, 0.3);
  border-radius: 50%;
}

.orbit.ring-1 {
  inset: -20px;
  animation: rotate 10s linear infinite;
}

.orbit.ring-2 {
  inset: -40px;
  animation: rotate 15s linear reverse infinite;
  opacity: 0.5;
}

.loading-status h3 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  color: var(--text-color);
}

.loading-status p {
  color: var(--secondary-text);
  font-size: 0.9rem;
}
</style>
