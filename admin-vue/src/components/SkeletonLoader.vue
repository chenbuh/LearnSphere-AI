<template>
  <div class="skeleton-wrapper">
    <!-- 表格骨架屏 -->
    <div v-if="type === 'table'" class="table-skeleton">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-actions">
          <div class="skeleton-button" v-for="i in 3" :key="i"></div>
        </div>
      </div>
      <div class="skeleton-table">
        <div class="skeleton-thead">
          <div class="skeleton-th" v-for="i in columns" :key="i"></div>
        </div>
        <div class="skeleton-tbody">
          <div class="skeleton-tr" v-for="i in rows" :key="i">
            <div class="skeleton-td" v-for="j in columns" :key="j">
              <div class="skeleton-text" :style="{ width: getRandomWidth() }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡片骨架屏 -->
    <div v-else-if="type === 'card'" class="card-skeleton">
      <n-grid :cols="gridCols" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="i in count" :key="i">
          <div class="skeleton-card">
            <div class="skeleton-card-header">
              <div class="skeleton-avatar"></div>
              <div class="skeleton-card-title">
                <div class="skeleton-text width-70"></div>
                <div class="skeleton-text width-40"></div>
              </div>
            </div>
            <div class="skeleton-card-body">
              <div class="skeleton-text" v-for="j in 3" :key="j" :style="{ width: getRandomWidth() }"></div>
            </div>
            <div class="skeleton-card-footer">
              <div class="skeleton-button width-50"></div>
            </div>
          </div>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 统计卡片骨架屏 -->
    <div v-else-if="type === 'stat'" class="stat-skeleton">
      <n-grid :cols="4" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="i in 4" :key="i">
          <div class="skeleton-stat-card">
            <div class="skeleton-stat-icon"></div>
            <div class="skeleton-stat-content">
              <div class="skeleton-text width-60 mb-2"></div>
              <div class="skeleton-text width-30"></div>
            </div>
          </div>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 图表骨架屏 -->
    <div v-else-if="type === 'chart'" class="chart-skeleton">
      <n-grid :cols="2" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="i in 2" :key="i">
          <div class="skeleton-chart">
            <div class="skeleton-chart-header">
              <div class="skeleton-text width-40"></div>
            </div>
            <div class="skeleton-chart-body">
              <div class="skeleton-chart-bars">
                <div class="skeleton-bar" v-for="j in 8" :key="j" :style="{ height: getRandomHeight() }"></div>
              </div>
            </div>
          </div>
        </n-grid-item>
      </n-grid>
    </div>

    <!-- 列表骨架屏 -->
    <div v-else-if="type === 'list'" class="list-skeleton">
      <div class="skeleton-list">
        <div class="skeleton-list-item" v-for="i in count" :key="i">
          <div class="skeleton-list-icon"></div>
          <div class="skeleton-list-content">
            <div class="skeleton-text width-60 mb-1"></div>
            <div class="skeleton-text width-40"></div>
          </div>
          <div class="skeleton-list-action">
            <div class="skeleton-button-small"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表单骨架屏 -->
    <div v-else-if="type === 'form'" class="form-skeleton">
      <div class="skeleton-form">
        <div class="skeleton-form-group" v-for="i in 5" :key="i">
          <div class="skeleton-label mb-2"></div>
          <div class="skeleton-input"></div>
        </div>
        <div class="skeleton-form-actions">
          <div class="skeleton-button width-30 mr-2"></div>
          <div class="skeleton-button width-20"></div>
        </div>
      </div>
    </div>

    <!-- 默认脉冲骨架屏 -->
    <div v-else class="default-skeleton">
      <div class="skeleton-pulse" v-for="i in 3" :key="i">
        <div class="skeleton-text" :style="{ width: getRandomWidth() }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NGrid, NGridItem } from 'naive-ui'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['table', 'card', 'stat', 'chart', 'list', 'form', 'default'].includes(value)
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

// 生成随机宽度
const getRandomWidth = () => {
  const widths = ['40%', '60%', '70%', '80%', '90%', '100%']
  return widths[Math.floor(Math.random() * widths.length)]
}

// 生成随机高度
const getRandomHeight = () => {
  const heights = ['30%', '45%', '60%', '75%', '85%', '95%']
  return heights[Math.floor(Math.random() * heights.length)]
}
</script>

<style scoped lang="scss">
.skeleton-wrapper {
  width: 100%;
}

/* 基础动画 */
@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

.skeleton-text,
.skeleton-button,
.skeleton-avatar,
.skeleton-icon,
.skeleton-bar,
.skeleton-input,
.skeleton-th {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 20%,
    rgba(255, 255, 255, 0.15) 40%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite linear;
  border-radius: 4px;
}

/* 表格骨架屏 */
.table-skeleton {
  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .skeleton-title {
    width: 200px;
    height: 28px;
    border-radius: 6px;
  }

  .skeleton-actions {
    display: flex;
    gap: 12px;
  }

  .skeleton-button {
    width: 100px;
    height: 32px;
    border-radius: 4px;
  }

  .skeleton-table {
    width: 100%;
  }

  .skeleton-thead {
    display: flex;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px 8px 0 0;
  }

  .skeleton-th {
    flex: 1;
    height: 20px;
    border-radius: 4px;
    margin: 0 8px;

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  .skeleton-tbody {
    background: rgba(20, 20, 25, 0.6);
    border-radius: 0 0 8px 8px;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .skeleton-tr {
    display: flex;
    padding: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);

    &:last-child {
      border-bottom: none;
    }
  }

  .skeleton-td {
    flex: 1;
    padding: 0 8px;

    &:first-child {
      padding-left: 0;
    }

    &:last-child {
      padding-right: 0;
    }
  }
}

/* 卡片骨架屏 */
.card-skeleton {
  .skeleton-card {
    background: rgba(20, 20, 25, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
  }

  .skeleton-card-header {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .skeleton-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .skeleton-card-title {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skeleton-card-body {
    margin-bottom: 16px;
  }

  .skeleton-card-footer {
    display: flex;
    justify-content: flex-end;
  }

  .skeleton-text {
    height: 14px;
    margin-bottom: 8px;

    &.mb-1 {
      margin-bottom: 4px;
    }

    &.mb-2 {
      margin-bottom: 8px;
    }

    &.width-20 {
      width: 20%;
    }

    &.width-30 {
      width: 30%;
    }

    &.width-40 {
      width: 40%;
    }

    &.width-50 {
      width: 50%;
    }

    &.width-60 {
      width: 60%;
    }

    &.width-70 {
      width: 70%;
    }

    &.width-80 {
      width: 80%;
    }

    &.width-90 {
      width: 90%;
    }

    &.width-100 {
      width: 100%;
    }
  }

  .skeleton-button {
    height: 32px;
  }

  .skeleton-button-small {
    width: 80px;
    height: 28px;
    border-radius: 4px;
  }
}

/* 统计卡片骨架屏 */
.stat-skeleton {
  .skeleton-stat-card {
    background: rgba(20, 20, 25, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .skeleton-stat-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .skeleton-stat-content {
    flex: 1;
  }
}

/* 图表骨架屏 */
.chart-skeleton {
  .skeleton-chart {
    background: rgba(20, 20, 25, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
    min-height: 320px;
  }

  .skeleton-chart-header {
    margin-bottom: 24px;
  }

  .skeleton-chart-body {
    height: 200px;
  }

  .skeleton-chart-bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 100%;
    gap: 8px;
  }

  .skeleton-bar {
    flex: 1;
    border-radius: 4px 4px 0 0;
  }
}

/* 列表骨架屏 */
.list-skeleton {
  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-list-item {
    background: rgba(20, 20, 25, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .skeleton-list-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .skeleton-list-content {
    flex: 1;
  }

  .skeleton-list-action {
    flex-shrink: 0;
  }
}

/* 表单骨架屏 */
.form-skeleton {
  .skeleton-form {
    background: rgba(20, 20, 25, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 24px;
    max-width: 600px;
  }

  .skeleton-form-group {
    margin-bottom: 24px;
  }

  .skeleton-label {
    width: 100px;
    height: 16px;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .skeleton-input {
    width: 100%;
    height: 40px;
    border-radius: 4px;
  }

  .skeleton-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .mr-2 {
    margin-right: 8px;
  }
}

/* 默认脉冲骨架屏 */
.default-skeleton {
  padding: 20px;

  .skeleton-pulse {
    margin-bottom: 12px;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .skeleton-thead {
    flex-wrap: wrap;
  }

  .skeleton-th {
    min-width: 120px;
  }

  .card-skeleton {
    :deep(.n-grid) {
      grid-template-columns: 1fr !important;
    }
  }

  .stat-skeleton {
    :deep(.n-grid) {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }

  .chart-skeleton {
    :deep(.n-grid) {
      grid-template-columns: 1fr !important;
    }
  }
}
</style>
