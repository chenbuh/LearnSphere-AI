<script setup>
import { ArrowRight } from 'lucide-vue-next'
import { NButton, NIcon, NProgress } from 'naive-ui'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  learningModules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['view-all', 'navigate'])
</script>

<template>
  <section class="learning-modules">
    <div class="section-header">
      <h2 class="section-title">学习模块</h2>
      <n-button text @click="emit('view-all')">
        查看全部
        <template #icon>
          <n-icon :component="ArrowRight" size="16" />
        </template>
      </n-button>
    </div>

    <SkeletonWrapper :loading="loading" type="card-grid" :rows="4">
      <div class="modules-grid">
        <div
          v-for="module in learningModules"
          :key="module.id"
          class="module-card"
          @click="emit('navigate', module)"
        >
          <div class="module-icon" :style="{ background: module.color }">
            <n-icon :component="module.icon" size="28" color="#ffffff" />
          </div>
          <div class="module-info">
            <h3 class="module-title">{{ module.title }}</h3>
            <p class="module-description">{{ module.description }}</p>
            <div class="module-progress">
              <n-progress
                type="line"
                :percentage="module.progress"
                :show-indicator="false"
                :height="4"
              />
              <span class="progress-text">{{ module.progress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  </section>
</template>

<style scoped>
section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #f9fafb;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.module-card {
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.module-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.module-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #f9fafb;
}

.module-description {
  margin-bottom: 16px;
  font-size: 14px;
  color: #9ca3af;
}

.module-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  min-width: 40px;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
  color: #10b981;
}
</style>
