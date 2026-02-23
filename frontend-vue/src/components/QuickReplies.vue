<template>
  <div class="quick-replies">
    <!-- 快捷回复标题 -->
    <div class="quick-replies-header" @click="toggleExpanded">
      <div class="header-left">
        <n-icon :component="Sparkles" size="14" color="#8b5cf6" />
        <span>快捷回复</span>
      </div>
      <n-icon
        :component="ChevronDown"
        size="14"
        class="toggle-icon"
        :class="{ expanded: isExpanded }"
      />
    </div>

    <!-- 快捷回复列表 -->
    <transition name="expand">
      <div v-show="isExpanded" class="quick-replies-list">
        <div
          v-for="(reply, index) in filteredReplies"
          :key="index"
          :class="['quick-reply-btn', reply.category]"
          @click="selectReply(reply)"
        >
          <div class="reply-icon">
            <n-icon :component="getReplyIcon(reply.category)" size="16" />
          </div>
          <div class="reply-content">
            <div class="reply-text">{{ reply.text }}</div>
            <div v-if="reply.description" class="reply-description">
              {{ reply.description }}
            </div>
          </div>
        </div>

        <!-- 自定义快捷回复 -->
        <div v-if="showCustomInput" class="custom-reply-input">
          <n-input
            v-model:value="customReply"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="输入自定义快捷回复..."
            @keydown.enter.prevent="submitCustomReply"
          />
          <div class="input-actions">
            <n-button size="tiny" @click="showCustomInput = false">
              取消
            </n-button>
            <n-button size="tiny" type="primary" @click="submitCustomReply">
              添加
            </n-button>
          </div>
        </div>

        <!-- 添加自定义按钮 -->
        <div
          v-if="!showCustomInput && allowCustom"
          class="add-custom-btn"
          @click="showCustomInput = true"
        >
          <n-icon :component="Plus" size="14" />
          <span>添加快捷回复</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NIcon, NButton, NInput } from 'naive-ui'
import { Sparkles, ChevronDown, RotateCcw, Lightbulb, BookOpen, HelpCircle, Plus } from 'lucide-vue-next'

const props = defineProps({
  // 上下文信息
  context: {
    type: Object,
    default: null
  },
  // 是否允许自定义快捷回复
  allowCustom: {
    type: Boolean,
    default: true
  },
  // 最大显示数量
  maxDisplay: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits(['select'])

const isExpanded = ref(false)
const showCustomInput = ref(false)
const customReply = ref('')

// 默认快捷回复模板
const defaultReplies = [
  {
    text: '再解释一遍',
    description: '用更简单的方式解释',
    category: 'explain',
    icon: RotateCcw
  },
  {
    text: '举个例子',
    description: '给出具体例句',
    category: 'example',
    icon: Lightbulb
  },
  {
    text: '为什么错了？',
    description: '解释错误原因',
    category: 'explain',
    icon: HelpCircle
  },
  {
    text: '更多练习',
    description: '推荐类似题目',
    category: 'practice',
    icon: BookOpen
  },
  {
    text: '记忆技巧',
    description: '如何记住这个知识点',
    category: 'memory',
    icon: Lightbulb
  },
  {
    text: '相关知识点',
    description: '扩展相关知识',
    category: 'expand',
    icon: BookOpen
  },
  {
    text: '总结一下',
    description: '总结重点内容',
    category: 'summary',
    icon: RotateCcw
  },
  {
    text: '换个方式说',
    description: '用不同的表达方式',
    category: 'explain',
    icon: RotateCcw
  }
]

// 根据上下文动态生成的快捷回复
const contextReplies = computed(() => {
  if (!props.context) return []

  const replies = []

  // 根据模块类型生成特定快捷回复
  if (props.context.module === 'grammar') {
    replies.push(
      {
        text: '这个语法的用法',
        description: '详细解释语法用法',
        category: 'explain',
        icon: Lightbulb
      },
      {
        text: '语法规则',
        description: '总结语法规则',
        category: 'summary',
        icon: BookOpen
      }
    )
  }

  if (props.context.module === 'vocabulary') {
    replies.push(
      {
        text: '这个词的用法',
        description: '单词用法和搭配',
        category: 'explain',
        icon: Lightbulb
      },
      {
        text: '同义词反义词',
        description: '相关词汇',
        category: 'expand',
        icon: BookOpen
      }
    )
  }

  if (props.context.module === 'reading') {
    replies.push(
      {
        text: '文章主旨',
        description: '概括文章大意',
        category: 'summary',
        icon: RotateCcw
      },
      {
        text: '长难句分析',
        description: '分析复杂句子',
        category: 'explain',
        icon: Lightbulb
      }
    )
  }

  if (props.context.module === 'listening') {
    replies.push(
      {
        text: '再听一遍',
        description: '重新播放音频',
        category: 'practice',
        icon: RotateCcw
      },
      {
        text: '原文对照',
        description: '显示听力原文',
        category: 'explain',
        icon: BookOpen
      }
    )
  }

  return replies
})

// 合并所有快捷回复
const allReplies = computed(() => {
  return [...contextReplies.value, ...defaultReplies]
})

// 过滤并限制显示数量
const filteredReplies = computed(() => {
  return allReplies.value.slice(0, props.maxDisplay)
})

// 切换展开/折叠
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

// 获取快捷回复图标
function getReplyIcon(category) {
  const iconMap = {
    explain: RotateCcw,
    example: Lightbulb,
    practice: BookOpen,
    memory: Lightbulb,
    expand: BookOpen,
    summary: RotateCcw
  }
  return iconMap[category] || HelpCircle
}

// 选择快捷回复
function selectReply(reply) {
  emit('select', reply.text)
}

// 提交自定义快捷回复
function submitCustomReply() {
  if (customReply.value.trim()) {
    emit('select', customReply.value.trim())
    customReply.value = ''
    showCustomInput.value = false
  }
}
</script>

<style scoped>
.quick-replies {
  background: rgba(17, 24, 39, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.quick-replies-header {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.quick-replies-header:hover {
  background: rgba(255, 255, 255, 0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #a1a1aa;
  font-weight: 500;
}

.toggle-icon {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #71717a;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.quick-replies-list {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;      /* 限制最大高度 */
  overflow-y: auto;       /* 开启垂直滚动 */
  overscroll-behavior: contain;
}

/* 快捷回复列表滚动条 */
.quick-replies-list::-webkit-scrollbar {
  width: 4px;
}

.quick-replies-list::-webkit-scrollbar-track {
  background: transparent;
}

.quick-replies-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.quick-replies-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quick-reply-btn {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-reply-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateX(4px);
}

.reply-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: rgba(139, 92, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-text {
  color: #d4d4d8;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.reply-description {
  color: #71717a;
  font-size: 11px;
}

/* 不同类型的快捷回复样式 */
.quick-reply-btn.explain .reply-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.quick-reply-btn.example .reply-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.quick-reply-btn.practice .reply-icon {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.quick-reply-btn.memory .reply-icon {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.quick-reply-btn.expand .reply-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

/* 自定义快捷回复输入 */
.custom-reply-input {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-top: 6px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* 添加自定义按钮 */
.add-custom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #71717a;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 6px;
}

.add-custom-btn:hover {
  border-color: rgba(139, 92, 246, 0.5);
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .quick-reply-btn {
    padding: 8px 10px;
  }

  .reply-text {
    font-size: 12px;
  }

  .reply-description {
    font-size: 10px;
  }
}
</style>
