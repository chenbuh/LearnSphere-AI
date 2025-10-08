<template>
  <div class="skeleton-container">
    <!-- 题目区域骨架 -->
    <div class="skeleton-question-box">
      <div class="skeleton-header">
        <n-skeleton :width="80" height="20px" style="border-radius: 4px;" />
        <n-skeleton :width="100" height="16px" style="border-radius: 4px;" />
      </div>
      
      <n-skeleton 
        :width="'90%'" 
        height="32px" 
        :sharp="false" 
        style="margin: 24px 0;"
      />
      
      <!-- 选项骨架 -->
      <div class="skeleton-options">
        <div v-for="i in 4" :key="i" class="skeleton-option">
          <n-skeleton circle :size="28" />
          <n-skeleton :width="'calc(100% - 50px)'" height="20px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NSkeleton } from 'naive-ui'
</script>

<style scoped>
.skeleton-container {
  width: 100%;
  padding: 40px;
  background: #18181b;
  border-radius: 20px;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.skeleton-options {
  display: grid;
  gap: 16px;
}

.skeleton-option {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 波浪动画 */
.skeleton-container :deep(.n-skeleton__placeholder) {
  animation: skeleton-wave 1.5s ease-in-out infinite;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
