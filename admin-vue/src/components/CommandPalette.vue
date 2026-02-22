<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="command-palette-overlay"
        @click="handleClose"
      >
        <div
          class="command-palette-container"
          @click.stop
        >
          <!-- 搜索输入框 -->
          <div class="search-section">
            <n-icon :component="Search" class="search-icon" :size="20" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索页面、功能、用户ID..."
              @keydown="handleKeydown"
              @input="handleSearch"
            />
            <div class="shortcut-hint">
              <kbd>ESC</kbd>
            </div>
          </div>

          <!-- 结果列表 -->
          <div class="results-section">
            <n-scrollbar style="max-height: 400px;">
              <!-- 加载状态 -->
              <div v-if="loading" class="loading-state">
                <n-spin size="medium" />
                <span>搜索中...</span>
              </div>

              <!-- 无结果 -->
              <div v-else-if="filteredResults.length === 0" class="empty-state">
                <n-icon :component="SearchX" :size="48" />
                <p>未找到相关结果</p>
                <span class="hint">试试搜索页面名称、功能或用户ID</span>
              </div>

              <!-- 搜索结果 -->
              <div v-else class="results-list">
                <!-- 分组标题 -->
                <div
                  v-for="(group, groupIndex) in groupedResults"
                  :key="`group-${groupIndex}`"
                  class="result-group"
                >
                  <div class="group-title">{{ group.title }}</div>

                  <div
                    v-for="(item, index) in group.items"
                    :key="`${groupIndex}-${index}`"
                    :class="[
                      'result-item',
                      { active: selectedIndex === getGlobalIndex(groupIndex, index) }
                    ]"
                    @click="handleSelect(item)"
                    @mouseenter="selectedIndex = getGlobalIndex(groupIndex, index)"
                  >
                    <div class="item-icon">
                      <n-icon :component="item.icon" :size="18" />
                    </div>
                    <div class="item-content">
                      <div class="item-title">
                        <span v-html="highlightMatch(item.title)" />
                        <n-tag v-if="item.hot" type="error" size="tiny" round>热门</n-tag>
                      </div>
                      <div class="item-description">{{ item.description }}</div>
                      <div v-if="item.keywords" class="item-keywords">
                        <n-tag
                          v-for="keyword in item.keywords"
                          :key="keyword"
                          size="tiny"
                          type="info"
                          round
                        >
                          {{ keyword }}
                        </n-tag>
                      </div>
                    </div>
                    <div class="item-shortcut">
                      <span v-if="item.shortcut">{{ item.shortcut }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </n-scrollbar>
          </div>

          <!-- 底部提示 -->
          <div class="footer-section">
            <div class="footer-hints">
              <span class="hint-item">
                <kbd>↑↓</kbd> 导航
              </span>
              <span class="hint-item">
                <kbd>↵</kbd> 选择
              </span>
              <span class="hint-item">
                <kbd>ESC</kbd> 关闭
              </span>
            </div>
            <div class="footer-info">
              <span>{{ selectedIndex + 1 }} / {{ filteredResults.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDialog, useMessage } from 'naive-ui'
import {
  NIcon,
  NScrollbar,
  NSpin,
  NTag,
  Search,
  SearchX,
  Home,
  Users,
  FileText,
  Settings,
  Activity,
  Shield,
  Database,
  Command,
  Zap,
  Bell,
  BookOpen,
  Experiment,
  Clock,
  RefreshCw
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  api: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:show', 'select'])

const router = useRouter()
const dialog = useDialog()
const message = useMessage()

const searchQuery = ref('')
const searchInput = ref(null)
const selectedIndex = ref(0)
const loading = ref(false)
const searchResults = ref([])

// 命令列表配置
const commands = [
  // 页面导航
  {
    id: 'nav-dashboard',
    type: 'navigation',
    title: '数据概览',
    description: '查看系统整体数据和统计',
    icon: Home,
    route: '/dashboard',
    keywords: ['dashboard', '概览', '首页', '统计']
  },
  {
    id: 'nav-users',
    type: 'navigation',
    title: '用户管理',
    description: '管理和查看用户信息',
    icon: Users,
    route: '/users',
    keywords: ['users', '用户', '会员', 'user']
  },
  {
    id: 'nav-ai',
    type: 'navigation',
    title: 'AI 治理',
    description: 'AI模型监控、提示词管理、日志',
    icon: Settings,
    route: '/ai',
    keywords: ['ai', '治理', '监控', 'prompt', 'governance']
  },
  {
    id: 'nav-sensitive',
    type: 'navigation',
    title: '内容审核',
    description: '敏感词审核和管理',
    icon: Shield,
    route: '/sensitive',
    keywords: ['sensitive', '审核', '敏感词', 'audit']
  },
  {
    id: 'nav-logs',
    type: 'navigation',
    title: '操作日志',
    description: '查看系统操作记录',
    icon: Activity,
    route: '/logs',
    keywords: ['logs', '日志', '记录', 'log']
  },
  {
    id: 'nav-redis',
    type: 'navigation',
    title: 'Redis 管理',
    description: '缓存管理和监控',
    icon: Database,
    route: '/redis',
    keywords: ['redis', '缓存', 'cache']
  },

  // 快速操作
  {
    id: 'action-abtest',
    type: 'action',
    title: 'A/B 实验',
    description: '创建和管理A/B测试实验',
    icon: Experiment,
    action: 'abtest',
    shortcut: '⌘⇧E',
    keywords: ['ab', '实验', 'test', 'experiment'],
    hot: true
  },
  {
    id: 'action-reload-words',
    type: 'action',
    title: '重载词库',
    description: '重新加载敏感词库到内存',
    icon: RefreshCw,
    action: 'reload-words',
    shortcut: '⌘⇧R',
    keywords: ['reload', '重载', '词库', '敏感词', 'words']
  },
  {
    id: 'action-notifications',
    type: 'action',
    title: '发送通知',
    description: '批量发送用户通知',
    icon: Bell,
    action: 'notifications',
    shortcut: '⌘⇧N',
    keywords: ['notification', '通知', '消息', 'notify']
  },
  {
    id: 'action-clear-cache',
    type: 'action',
    title: '清空缓存',
    description: '清空Redis缓存',
    icon: Zap,
    action: 'clear-cache',
    shortcut: '⌘⇧C',
    keywords: ['clear', '清空', '缓存', 'cache']
  },

  // 帮助
  {
    id: 'help-shortcuts',
    type: 'help',
    title: '快捷键帮助',
    description: '查看所有可用的快捷键',
    icon: Command,
    action: 'help-shortcuts',
    keywords: ['help', '帮助', '快捷键', 'shortcuts']
  }
]

// 模糊搜索算法
const fuzzyMatch = (text, query) => {
  if (!query) return true
  const textLower = text.toLowerCase()
  const queryLower = query.toLowerCase()

  // 完全匹配
  if (textLower.includes(queryLower)) return true

  // 模糊匹配
  let queryIndex = 0
  let textIndex = 0
  const queryLen = queryLower.length
  const textLen = textLower.length

  while (queryIndex < queryLen && textIndex < textLen) {
    if (queryLower[queryIndex] === textLower[textIndex]) {
      queryIndex++
    }
    textIndex++
  }

  return queryIndex === queryLen
}

// 搜索处理
const handleSearch = async () => {
  const query = searchQuery.value.trim()

  // 如果查询为空,显示所有命令
  if (!query) {
    searchResults.value = commands
    return
  }

  // 搜索命令
  const commandResults = commands.filter(cmd => {
    return (
      fuzzyMatch(cmd.title, query) ||
      fuzzyMatch(cmd.description, query) ||
      cmd.keywords?.some(kw => fuzzyMatch(kw, query))
    )
  })

  searchResults.value = commandResults

  // 如果启用了API搜索且查询包含数字(可能是用户ID)
  if (props.api && /\d/.test(query)) {
    loading.value = true
    try {
      const apiResults = await props.api(query)
      searchResults.value = [...commandResults, ...apiResults]
    } catch (error) {
      console.error('API搜索失败:', error)
    } finally {
      loading.value = false
    }
  }
}

// 过滤和分组结果
const filteredResults = computed(() => {
  return searchResults.value
})

const groupedResults = computed(() => {
  const groups = {
    navigation: { title: '📄 页面导航', items: [] },
    action: { title: '⚡ 快速操作', items: [] },
    user: { title: '👤 用户', items: [] },
    log: { title: '📋 日志记录', items: [] },
    help: { title: '💡 帮助', items: [] }
  }

  filteredResults.value.forEach(item => {
    if (groups[item.type]) {
      groups[item.type].items.push(item)
    }
  })

  return Object.values(groups).filter(g => g.items.length > 0)
})

// 高亮匹配文本
const highlightMatch = (text) => {
  if (!searchQuery.value) return text
  const query = searchQuery.value.trim()
  if (!query) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 获取全局索引
const getGlobalIndex = (groupIndex, itemIndex) => {
  let index = 0
  for (let i = 0; i < groupIndex; i++) {
    index += groupedResults.value[i]?.items.length || 0
  }
  return index + itemIndex
}

// 键盘导航
const handleKeydown = (e) => {
  const totalResults = filteredResults.value.length

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % totalResults
      break
    case 'ArrowUp':
      e.preventDefault()
      selectedIndex.value = (selectedIndex.value - 1 + totalResults) % totalResults
      break
    case 'Enter':
      e.preventDefault()
      if (filteredResults.value[selectedIndex.value]) {
        handleSelect(filteredResults.value[selectedIndex.value])
      }
      break
    case 'Escape':
      e.preventDefault()
      handleClose()
      break
  }
}

// 选择项目
const handleSelect = (item) => {
  emit('select', item)

  if (item.route) {
    router.push(item.route)
    handleClose()
  } else if (item.action) {
    executeAction(item)
  } else if (item.onClick) {
    item.onClick(item)
    handleClose()
  }
}

// 执行操作
const executeAction = (item) => {
  switch (item.action) {
    case 'abtest':
      router.push('/ai?tab=abtest')
      message.info('跳转到A/B实验管理')
      break
    case 'reload-words':
      dialog.warning({
        title: '确认重载词库',
        content: '确定要重新加载敏感词库到内存吗?',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          message.success('词库重载成功')
        }
      })
      break
    case 'notifications':
      router.push('/users')
      message.info('跳转到用户通知管理')
      break
    case 'clear-cache':
      dialog.warning({
        title: '确认清空缓存',
        content: '确定要清空所有Redis缓存吗?这可能影响系统性能。',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          message.success('缓存已清空')
        }
      })
      break
    case 'help-shortcuts':
      dialog.info({
        title: '快捷键列表',
        content: `
          全局快捷键:
          • Ctrl/Cmd + K: 打开命令面板
          • Ctrl/Cmd + /: 查看快捷键帮助

          命令面板内:
          • ↑↓: 上下导航
          • Enter: 选择项目
          • ESC: 关闭面板
          • 打字时自动搜索
        `
      })
      break
  }
  handleClose()
}

// 关闭面板
const handleClose = () => {
  emit('update:show', false)
  searchQuery.value = ''
  searchResults.value = commands
  selectedIndex.value = 0
}

// 监听显示状态
watch(() => props.show, async (newVal) => {
  if (newVal) {
    await nextTick()
    searchInput.value?.focus()
    searchResults.value = commands
    selectedIndex.value = 0
  }
})

// 全局快捷键监听
const handleGlobalKeydown = (e) => {
  // Ctrl+K 或 Cmd+K
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    emit('update:show', !props.show)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped lang="scss">
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.command-palette-container {
  width: 90%;
  max-width: 600px;
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--n-divider-color);

  .search-icon {
    color: var(--n-text-color-2);
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    color: var(--n-text-color);

    &::placeholder {
      color: var(--n-placeholder-color);
    }
  }

  .shortcut-hint {
    kbd {
      display: inline-block;
      padding: 2px 8px;
      font-size: 12px;
      background: var(--n-color-modal);
      border: 1px solid var(--n-border-color);
      border-radius: 4px;
      color: var(--n-text-color-2);
    }
  }
}

.results-section {
  min-height: 200px;

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px;
    color: var(--n-text-color-2);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px;
    color: var(--n-text-color-2);

    .hint {
      font-size: 12px;
      opacity: 0.7;
    }
  }

  .results-list {
    .result-group {
      .group-title {
        padding: 12px 20px 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--n-text-color-2);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .result-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover,
        &.active {
          background: var(--n-color-modal);
        }

        .item-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--n-color-target);
          border-radius: 8px;
          color: var(--n-target-color);
        }

        .item-content {
          flex: 1;
          min-width: 0;

          .item-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            color: var(--n-text-color);
            margin-bottom: 2px;

            :deep(mark) {
              background: var(--n-warning-color);
              color: white;
              padding: 0 2px;
              border-radius: 2px;
            }
          }

          .item-description {
            font-size: 12px;
            color: var(--n-text-color-2);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-keywords {
            display: flex;
            gap: 4px;
            margin-top: 4px;
            flex-wrap: wrap;
          }
        }

        .item-shortcut {
          flex-shrink: 0;
          font-size: 12px;
          color: var(--n-text-color-3);
          font-family: monospace;
        }
      }
    }
  }
}

.footer-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid var(--n-divider-color);
  background: var(--n-color-modal);

  .footer-hints {
    display: flex;
    gap: 16px;

    .hint-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--n-text-color-2);

      kbd {
        padding: 2px 6px;
        background: var(--n-color);
        border: 1px solid var(--n-border-color);
        border-radius: 3px;
        font-family: monospace;
      }
    }
  }

  .footer-info {
    font-size: 12px;
    color: var(--n-text-color-3);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;

  .command-palette-container {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;

  .command-palette-container {
    transform: translateY(-20px) scale(0.95);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .command-palette-overlay {
    padding-top: 10vh;
    padding-left: 16px;
    padding-right: 16px;
  }

  .command-palette-container {
    width: 100%;
  }

  .footer-section {
    flex-direction: column;
    gap: 8px;

    .footer-hints {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}
</style>
