<template>
  <div class="skeleton-wrapper">
    <!-- 加载中: 显示骨架屏 -->
    <div v-if="loading" class="skeleton-content">
      <skeleton-loader
        :type="type"
        :rows="rows"
        :columns="columns"
        :count="count"
        :grid-cols="gridCols"
      />
    </div>

    <!-- 加载完成: 显示实际内容 -->
    <transition v-else name="skeleton-fade">
      <div class="actual-content">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
import SkeletonLoader from './SkeletonLoader.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'default'
  },
  rows: {
    type: Number,
    default: 5
  },
  columns: {
    type: Number,
    default: 6
  },
  count: {
    type: Number,
    default: 4
  },
  gridCols: {
    type: Number,
    default: 4
  }
})
</script>

<style scoped lang="scss">
.skeleton-wrapper {
  width: 100%;
  min-height: 200px;
}

.skeleton-content {
  width: 100%;
}

.actual-content {
  width: 100%;
}

/* 淡入淡出动画 */
.skeleton-fade-enter-active,
.skeleton-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.skeleton-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.skeleton-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
