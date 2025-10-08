<template>
  <div class="skeleton-container">
    <!-- 阅读文章骨架 -->
    <div class="skeleton-reading-box">
      <!-- 标题骨架 -->
      <n-skeleton 
        :width="'60%'" 
        height="32px" 
        :sharp="false"
        class="skeleton-animated"
        style="margin-bottom: 24px;"
      />
      
      <!-- 文章段落骨架 -->
      <div class="skeleton-paragraphs">
        <n-skeleton 
          v-for="i in 4" 
          :key="i" 
          :width="i === 4 ? '70%' : '100%'" 
          height="16px" 
          :sharp="false"
          class="skeleton-animated"
          style="margin-bottom: 12px;"
        />
      </div>
      
      <!-- 问题标题 -->
      <n-skeleton 
        :width="150" 
        height="24px" 
        :sharp="false"
        class="skeleton-animated"
        style="margin: 32px 0 16px;"
      />
      
      <!-- 问题选项骨架 -->
      <div class="skeleton-questions">
        <div v-for="i in 3" :key="i" class="skeleton-question">
          <n-skeleton :width="'80%'" height="20px" class="skeleton-animated" />
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
  overflow: hidden;
}

.skeleton-reading-box {
  max-width: 800px;
  margin: 0 auto;
}

.skeleton-paragraphs {
  margin-bottom: 24px;
}

.skeleton-questions {
  display: grid;
  gap: 16px;
}

.skeleton-question {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px 20px;
  border-radius: 12px;
}

/* 波浪动画 */
.skeleton-animated :deep(.n-skeleton__placeholder) {
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

/* 闪烁动画（备选） */
.skeleton-pulse :deep(.n-skeleton__placeholder) {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
