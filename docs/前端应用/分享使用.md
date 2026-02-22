# 🎉 分享功能使用指南

## 📦 组件概述

`ShareModal.vue` 是一个现代化的分享组件，支持：
- **QQ 分享**：一键跳转到 QQ 网页分享接口
- **微信分享**：弹出二维码让用户扫码分享
- **复制链接**：快速复制当前页面链接

## 🚀 快速使用

### 1. 基本使用

```vue
<template>
  <div>
    <!-- 分享按钮 -->
    <n-button @click="showShare = true">
      <template #icon>
        <lucide-icon name="Share2" :size="16" />
      </template>
      分享学习成果
    </n-button>

    <!-- 分享弹窗 -->
    <ShareModal
      v-model:show="showShare"
      :title="shareTitle"
      :description="shareDescription"
      :url="shareUrl"
      :image="shareImage"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ShareModal from '@/components/ShareModal.vue'

const showShare = ref(false)

// 自定义分享内容
const shareTitle = '我的学习成果'
const shareDescription = '今天完成了 50 道题目，正确率 95%！'
const shareUrl = window.location.href
const shareImage = 'https://example.com/my-achievement.png'
</script>
```

### 2. 快捷使用（使用默认值）

```vue
<template>
  <!-- 组件会自动使用当前页面的标题和 URL -->
  <ShareModal v-model:show="showShare" />
</template>
```

## 📋 Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `show` | `Boolean` | `false` | 是否显示弹窗（v-model） |
| `title` | `String` | `document.title` | 分享标题 |
| `description` | `String` | 默认文案 | 分享描述 |
| `url` | `String` | `window.location.href` | 分享链接 |
| `image` | `String` | `/logo.png` | 分享图片（用于 QQ） |

## 🎨 实际场景示例

### 场景 1：学习页面完成后分享

```vue
<template>
  <div class="learning-page">
    <!-- 学习内容 -->
    <div class="content">
      ...
    </div>

    <!-- 提交按钮 -->
    <n-button type="primary" @click="handleSubmit">
      提交答案
    </n-button>

    <!-- 成绩弹窗 -->
    <n-modal v-model:show="showResult">
      <n-card>
        <h2>🎉 恭喜完成！</h2>
        <p>您的成绩：{{ score }} 分</p>
        
        <!-- 分享按钮 -->
        <n-button @click="showShare = true">
          分享学习成果
        </n-button>
      </n-card>
    </n-modal>

    <!-- 分享弹窗 -->
    <ShareModal
      v-model:show="showShare"
      :title="`我获得了 ${score} 分！`"
      :description="`刚刚完成了雅思阅读练习，快来一起学习吧！`"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ShareModal from '@/components/ShareModal.vue'

const showResult = ref(false)
const showShare = ref(false)
const score = ref(0)

const handleSubmit = () => {
  // 提交逻辑...
  score.value = 95
  showResult.value = true
}
</script>
```

### 场景 2：个人成就分享

```vue
<template>
  <div class="profile">
    <div class="achievement-card">
      <h3>🏆 本月学习时长</h3>
      <p>120 小时</p>
      <n-button @click="shareAchievement">分享成就</n-button>
    </div>

    <ShareModal
      v-model:show="showShare"
      title="我的学习成就"
      description="本月累计学习 120 小时，你也能做到！"
      url="https://learnsphere.ai/profile/123"
    />
  </div>
</template>
```

### 场景 3：在页面右上角添加固定分享按钮

```vue
<template>
  <div class="page">
    <!-- 页面内容 -->
    
    <!-- 浮动分享按钮 -->
    <n-float-button @click="showShare = true" style="bottom: 80px">
      <template #icon>
        <lucide-icon name="Share2" />
      </template>
    </n-float-button>

    <ShareModal v-model:show="showShare" />
  </div>
</template>
```

## 🎯 技术细节

### QQ 分享 URL 构造

```javascript
const qqShareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareDesc)}&pics=${encodeURIComponent(shareImage)}`
```

### 微信分享

使用 `qrcode.vue` 生成二维码，用户扫码后可在手机端分享到朋友圈或好友。

### 复制链接兜底方案

优先使用现代 `navigator.clipboard` API，失败时降级为 `document.execCommand('copy')`。

## 💡 提示

1. **自定义分享图片**：建议准备一张 1200x630 的分享封面图，以获得最佳展示效果
2. **动态内容**：可以根据用户的学习数据动态生成分享标题和描述
3. **美化二维码**：二维码已自动添加了白色背景和阴影，确保扫码成功率
4. **SEO 优化**：如果需要更美观的分享卡片，建议在页面 `<head>` 中添加 Open Graph 标签

## 📱 浏览器兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ 国产浏览器（QQ、360、搜狗等）

---

有任何问题欢迎反馈！🚀
