<template>
  <div :class="['skeleton-wrapper', { loading: loading, 'no-animation': !animation }]">
    <!-- 加载中：显示骨架屏 -->
    <template v-if="loading">
      <!-- 学习卡片骨架屏 -->
      <div v-if="type === 'learning-card'" class="skeleton-learning-card">
        <div class="skeleton-card-header">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-header-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-subtitle"></div>
          </div>
        </div>
        <div class="skeleton-card-content">
          <div class="skeleton-text-line"></div>
          <div class="skeleton-text-line short"></div>
          <div class="skeleton-text-line"></div>
        </div>
        <div class="skeleton-card-footer">
          <div class="skeleton-button"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>

      <!-- 列表骨架屏 -->
      <div v-else-if="type === 'list'" class="skeleton-list">
        <div v-for="i in rows" :key="i" class="skeleton-list-item">
          <div class="skeleton-avatar small"></div>
          <div class="skeleton-list-content">
            <div class="skeleton-text-line"></div>
            <div class="skeleton-text-line short"></div>
          </div>
        </div>
      </div>

      <!-- 卡片网格骨架屏 -->
      <div v-else-if="type === 'card-grid'" class="skeleton-card-grid">
        <div v-for="i in rows" :key="i" class="skeleton-grid-card">
          <div class="skeleton-card-image"></div>
          <div class="skeleton-card-title"></div>
          <div class="skeleton-card-text"></div>
        </div>
      </div>

      <!-- 闪卡骨架屏 -->
      <div v-else-if="type === 'flashcard'" class="skeleton-flashcard">
        <div class="skeleton-flashcard-content">
          <div class="skeleton-word-large"></div>
          <div class="skeleton-word-phonetic"></div>
          <div class="skeleton-divider"></div>
          <div class="skeleton-word-definition"></div>
        </div>
      </div>

      <!-- 音频播放器骨架屏 -->
      <div v-else-if="type === 'audio-player'" class="skeleton-audio-player">
        <div class="skeleton-waveform"></div>
        <div class="skeleton-progress"></div>
        <div class="skeleton-controls">
          <div class="skeleton-control-btn"></div>
          <div class="skeleton-control-btn large"></div>
          <div class="skeleton-control-btn"></div>
        </div>
      </div>

      <!-- 成就徽章骨架屏 -->
      <div v-else-if="type === 'achievement'" class="skeleton-achievement">
        <div class="skeleton-badge-icon"></div>
        <div class="skeleton-badge-content">
          <div class="skeleton-badge-title"></div>
          <div class="skeleton-badge-desc"></div>
        </div>
      </div>

      <!-- 默认骨架屏 -->
      <div v-else class="skeleton-default">
        <div v-for="i in rows" :key="i" class="skeleton-default-item">
          <div class="skeleton-text-line"></div>
          <div v-if="i < rows" class="skeleton-text-line"></div>
          <div v-if="i === 1" class="skeleton-text-line short"></div>
        </div>
      </div>
    </template>

    <!-- 加载完成：显示实际内容 -->
    <transition name="skeleton-fade">
      <div v-if="!loading" class="skeleton-content">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default',
      'learning-card',
      'list',
      'card-grid',
      'flashcard',
      'audio-player',
      'achievement'
    ].includes(value)
  },
  rows: {
    type: Number,
    default: 3
  },
  animation: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.skeleton-wrapper {
  position: relative;
  min-height: 100px;
}

/* 基础骨架元素样式 */
.skeleton-text-line,
.skeleton-title,
.skeleton-subtitle,
.skeleton-button,
.skeleton-word-large,
.skeleton-word-phonetic,
.skeleton-word-definition,
.skeleton-card-title,
.skeleton-card-text,
.skeleton-badge-title,
.skeleton-badge-desc {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  border-radius: 4px;
}

.loading .skeleton-text-line,
.loading .skeleton-title,
.loading .skeleton-subtitle,
.loading .skeleton-button,
.loading .skeleton-word-large,
.loading .skeleton-word-phonetic,
.loading .skeleton-word-definition,
.loading .skeleton-card-title,
.loading .skeleton-card-text,
.loading .skeleton-badge-title,
.loading .skeleton-badge-desc,
.loading .skeleton-avatar,
.loading .skeleton-card-image,
.loading .skeleton-waveform,
.loading .skeleton-control-btn {
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.no-animation .skeleton-text-line,
.no-animation .skeleton-title,
.no-animation .skeleton-subtitle {
  animation: none;
}

/* 学习卡片骨架屏 */
.skeleton-learning-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
}

.skeleton-card-header {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
}

.loading .skeleton-avatar {
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-avatar.small {
  width: 32px;
  height: 32px;
}

.skeleton-header-info {
  flex: 1;
}

.skeleton-title {
  height: 20px;
  width: 60%;
  margin-bottom: 8px;
}

.skeleton-subtitle {
  height: 14px;
  width: 40%;
}

.skeleton-card-content {
  margin-bottom: 20px;
}

.skeleton-text-line {
  height: 14px;
  margin-bottom: 12px;
  width: 100%;
}

.skeleton-text-line.short {
  width: 60%;
}

.skeleton-card-footer {
  display: flex;
  gap: 12px;
}

.skeleton-button {
  height: 36px;
  flex: 1;
  border-radius: 8px;
}

/* 列表骨架屏 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-list-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.skeleton-list-content {
  flex: 1;
}

/* 卡片网格骨架屏 */
.skeleton-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.skeleton-grid-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-card-image {
  width: 100%;
  height: 160px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
}

.loading .skeleton-card-image {
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-card-title {
  height: 18px;
  width: 70%;
  margin: 16px;
  margin-bottom: 8px;
}

.skeleton-card-text {
  height: 14px;
  width: 50%;
  margin: 0 16px 16px;
}

/* 闪卡骨架屏 */
.skeleton-flashcard {
  width: 100%;
  height: 400px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-flashcard-content {
  text-align: center;
}

.skeleton-word-large {
  height: 48px;
  width: 200px;
  margin: 0 auto 16px;
  border-radius: 8px;
}

.skeleton-word-phonetic {
  height: 16px;
  width: 120px;
  margin: 0 auto 24px;
  border-radius: 4px;
}

.skeleton-divider {
  height: 1px;
  width: 80%;
  margin: 0 auto 24px;
  background: rgba(255, 255, 255, 0.1);
}

.skeleton-word-definition {
  height: 20px;
  width: 300px;
  margin: 0 auto;
  border-radius: 4px;
}

/* 音频播放器骨架屏 */
.skeleton-audio-player {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
}

.skeleton-waveform {
  height: 120px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  border-radius: 12px;
  margin-bottom: 24px;
}

.loading .skeleton-waveform {
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 24px;
}

.skeleton-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.skeleton-control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
}

.skeleton-control-btn.large {
  width: 56px;
  height: 56px;
}

/* 成就徽章骨架屏 */
.skeleton-achievement {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.skeleton-badge-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  flex-shrink: 0;
}

.loading .skeleton-badge-icon {
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-badge-content {
  flex: 1;
}

.skeleton-badge-title {
  height: 16px;
  width: 70%;
  margin-bottom: 8px;
}

.skeleton-badge-desc {
  height: 14px;
  width: 90%;
}

/* 默认骨架屏 */
.skeleton-default {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-default-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

/* 内容过渡动画 */
.skeleton-fade-enter-active {
  transition: opacity 0.3s ease;
}

.skeleton-fade-enter-from {
  opacity: 0;
}

.skeleton-fade-enter-to {
  opacity: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .skeleton-card-grid {
    grid-template-columns: 1fr;
  }

  .skeleton-flashcard {
    height: 350px;
  }

  .skeleton-word-large {
    height: 36px;
    width: 150px;
  }

  .skeleton-controls {
    gap: 16px;
  }

  .skeleton-control-btn {
    width: 36px;
    height: 36px;
  }

  .skeleton-control-btn.large {
    width: 48px;
    height: 48px;
  }
}
</style>
