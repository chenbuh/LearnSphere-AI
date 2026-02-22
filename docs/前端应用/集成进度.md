# 分享功能批量集成脚本

## ✅ 已完成集成的模块

1. ✅ **ReadingView.vue** - 阅读理解
2. ✅ **ListeningView.vue** - 听力训练

## 🔄 待集成模块

以下是需要手动集成的模块列表和具体步骤：

### 3. WritingView.vue - 写作练习

**步骤：**
1. 在 `<script setup>` 的导入部分添加：
```javascript
import { Share2 } from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
```

2. 在状态定义部分添加：
```javascript
// 分享功能
const showShare = ref(false)
const shareContent = computed(() => ({
  title: `我在 LearnSphere AI 完成了写作练习！`,
  description: `刚刚完成了「${currentTopic.value?.topic || '写作练习'}」，AI 评分：${aiScore.value} 分！快来一起学习吧！`,
  url: window.location.href
}))
```

3. 在结果页面的按钮部分添加：
```vue
<template #footer>
  <n-space justify="center" vertical :size="16">
    <n-space justify="center">
      <!-- 原有按钮 -->
    </n-space>
    
    <!-- 分享按钮 -->
    <n-button secondary @click="showShare = true">
      <template #icon>
        <n-icon :component="Share2" />
      </template>
      分享学习成果
    </n-button>
  </n-space>
</template>

<!-- 分享弹窗 -->
<ShareModal
  v-model:show="showShare"
  :title="shareContent.title"
  :description="shareContent.description"
  :url="shareContent.url"
/>
```

---

### 4. SpeakingView.vue - 口语练习

**步骤：**
1. 导入组件
2. 添加分享状态：
```javascript
const showShare = ref(false)
const shareContent = computed(() => ({
  title: `我在 LearnSphere AI 完成了口语练习！`,
  description: `刚刚完成了口语练习「${topic.value?.topic || '口语话题'}」，AI 评分：${aiScore.value} 分！快来一起学习吧！`,
  url: window.location.href
}))
```
3. 在结果页面添加分享按钮和弹窗

---

### 5. GrammarView.vue - 语法练习

**步骤：**
1. 导入组件
2. 添加分享状态：
```javascript
const showShare = ref(false)
const shareContent = computed(() => ({
  title: `我在 LearnSphere AI 完成了语法练习！`,
  description: `刚刚完成了语法练习，答对率 ${(correctCount.value / totalCount.value * 100).toFixed(0)}%！快来一起学习吧！`,
  url: window.location.href
}))
```
3. 在结果页面添加分享按钮和弹窗

---

### 6. MockExamView.vue - 模拟考试

**步骤：**
1. 导入组件
2. 添加分享状态：
```javascript
const showShare = ref(false)
const shareContent = computed(() => ({
  title: `我在 LearnSphere AI 完成了模拟考试！`,
  description: `刚刚完成了${examType.value}模拟考试，总分：${totalScore.value} 分！快来一起学习吧！`,
  url: window.location.href
}))
```
3. 在结果页面添加分享按钮和弹窗

---

### 7. VocabularyTestView.vue - 词汇测试

**步骤：**
1. 导入组件
2. 添加分享状态：
```javascript
const showShare = ref(false)
const shareContent = computed(() => ({
  title: `我在 LearnSphere AI 完成了词汇测试！`,
  description: `刚刚完成了词汇测试，答对 ${correctCount.value}/${totalCount.value} 个单词！快来一起学习吧！`,
  url: window.location.href
}))
```
3. 在结果页面添加分享按钮和弹窗

---

## 🎯 模板代码

### 完整的分享按钮模板（复制使用）

```vue
<!-- 在结果页面的 n-result 组件的 #footer 插槽中 -->
<template #footer>
  <n-space justify="center" vertical :size="16">
    <!-- 主要操作按钮 -->
    <n-space justify="center">
      <n-button @click="restart">重新开始</n-button>
      <n-button type="primary" @click="viewDetails">查看详情</n-button>
    </n-space>
    
    <!-- 分享按钮 -->
    <n-button 
      secondary 
      @click="showShare = true"
      class="share-btn"
    >
      <template #icon>
        <n-icon :component="Share2" />
      </template>
      分享学习成果
    </n-button>
  </n-space>
</template>

<!-- 分享弹窗（放在结果页面的最后） -->
<ShareModal
  v-model:show="showShare"
  :title="shareContent.title"
  :description="shareContent.description"
  :url="shareContent.url"
/>
```

---

## ⚠️ 注意事项

1. **确保导入正确**：检查 `ShareModal` 的路径是否为 `@/components/ShareModal.vue`
2. **检查图标**：确保 `Share2` 图标已从 `lucide-vue-next` 导入
3. **动态内容**：根据每个模块的实际变量名调整 `shareContent` 中的数据
4. **放置位置**：分享弹窗应放在结果容器内的最后位置

---

## 🎉 集成完成后的效果

用户完成任何学习模块后，都可以：
1. 点击"分享学习成果"按钮
2. 选择分享到 QQ、微信（扫码）或复制链接
3. 分享内容包含真实的学习数据（分数、题数等）

---

需要我为您逐个完成剩余模块的集成吗？还是您想自己按照模板来做？
