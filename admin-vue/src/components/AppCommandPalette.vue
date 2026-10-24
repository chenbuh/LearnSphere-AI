<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NModal, NSpin, NTag } from 'naive-ui'
import {
  Activity,
  ArrowRight,
  Book,
  Layers,
  PlusCircle,
  Search,
  UserPlus,
  Users,
  Zap
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  menuItems: {
    type: Array,
    default: () => []
  },
  searchApi: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:show'])

const router = useRouter()
const searchQuery = ref('')
const commandListRef = ref(null)
const commandInputRef = ref(null)
const backendResults = ref([])
const searchLoading = ref(false)
const selectedIndex = ref(0)

const quickActions = [
  { key: '/users?action=add', label: '新建用户', icon: UserPlus, type: 'ACTION' },
  { key: '/vocabulary?action=add', label: '录入词汇', icon: PlusCircle, type: 'ACTION' },
  { key: '/ai?tab=sandbox', label: '打开 AI 沙箱', icon: Zap, type: 'ACTION' },
  { key: '/monitor', label: '查看系统监控', icon: Activity, type: 'ACTION' }
]

const getSearchMetaLabel = type => {
  const metaMap = {
    USER: '用户',
    VOCABULARY: '词汇',
    CONTENT: '内容'
  }
  return metaMap[type] || type
}

const filteredCommands = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  if (!query) {
    return [...quickActions, ...props.menuItems.map(item => ({ ...item, type: 'NAV' }))].slice(
      0,
      10
    )
  }

  const navMatches = props.menuItems.filter(
    item => item.label.toLowerCase().includes(query) || item.key.toLowerCase().includes(query)
  )

  const actionMatches = quickActions.filter(item => item.label.toLowerCase().includes(query))

  return [
    ...actionMatches.map(item => ({ ...item, type: 'ACTION' })),
    ...navMatches.map(item => ({ ...item, type: 'NAV' })),
    ...backendResults.value.map(item => ({
      key: item.path,
      label: item.title,
      subtitle: item.subtitle,
      icon: item.type === 'USER' ? Users : item.type === 'VOCABULARY' ? Book : Layers,
      type: 'SEARCH',
      meta: item.type,
      metaLabel: getSearchMetaLabel(item.type)
    }))
  ]
})

watch(filteredCommands, () => {
  selectedIndex.value = 0
})

let searchTimeout = null

watch(searchQuery, newValue => {
  const query = newValue.trim()

  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }

  if (query.length < 2 || !props.searchApi) {
    backendResults.value = []
    searchLoading.value = false
    return
  }

  searchTimeout = setTimeout(async () => {
    searchLoading.value = true
    try {
      const response = await props.searchApi(query)
      backendResults.value = response?.data ?? []
    } catch (error) {
      console.error('Search Error:', error)
      backendResults.value = []
    } finally {
      searchLoading.value = false
    }
  }, 300)
})

const resetPaletteState = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
  searchQuery.value = ''
  backendResults.value = []
  searchLoading.value = false
  selectedIndex.value = 0
}

const closePalette = () => {
  emit('update:show', false)
  resetPaletteState()
}

const executeCommand = item => {
  if (!item) {
    return
  }

  if (item.key.includes('?')) {
    const [path, queryString] = item.key.split('?')
    const query = Object.fromEntries(new URLSearchParams(queryString))
    router.push({ path, query })
  } else {
    router.push(item.key)
  }

  closePalette()
}

const scrollToSelected = () => {
  nextTick(() => {
    const selectedElement = commandListRef.value?.children[selectedIndex.value]
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

const handleKeyDown = event => {
  if (!props.show) {
    return
  }

  const total = filteredCommands.value.length

  switch (event.key) {
    case 'ArrowDown':
      if (total === 0) {
        return
      }
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value + 1) % total
      scrollToSelected()
      break
    case 'ArrowUp':
      if (total === 0) {
        return
      }
      event.preventDefault()
      selectedIndex.value = (selectedIndex.value - 1 + total) % total
      scrollToSelected()
      break
    case 'Enter':
      event.preventDefault()
      if (total > 0) {
        executeCommand(filteredCommands.value[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      closePalette()
      break
  }
}

watch(
  () => props.show,
  async visible => {
    if (visible) {
      await nextTick()
      commandInputRef.value?.focus()
      return
    }

    resetPaletteState()
  }
)

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  if (props.show) {
    await nextTick()
    commandInputRef.value?.focus()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<template>
  <n-modal
    :show="show"
    class="command-palette-modal"
    :bordered="false"
    content-style="padding: 0;"
    style="width: 640px; margin-top: 12vh; background: transparent; box-shadow: none"
    transform-origin="center"
    :mask-closable="true"
    @update:show="value => !value && closePalette()"
  >
    <div class="command-palette">
      <div class="command-input-container">
        <Search class="search-icon" :size="20" />
        <input
          ref="commandInputRef"
          v-model="searchQuery"
          class="command-input"
          placeholder="搜索页面、用户、词汇或输入路径 (/logs、/ai)"
        />
        <div v-if="searchLoading" class="command-loader">
          <n-spin size="small" />
        </div>
        <div class="command-k">Esc</div>
      </div>

      <div ref="commandListRef" class="command-list">
        <template v-if="filteredCommands.length > 0">
          <div
            v-for="(item, index) in filteredCommands"
            :key="item.key + index"
            class="command-item"
            :class="{ selected: index === selectedIndex }"
            @click="executeCommand(item)"
            @mouseenter="selectedIndex = index"
          >
            <div class="command-item-icon" :class="item.type">
              <component :is="item.icon" :size="20" />
            </div>
            <div class="command-info">
              <div class="flex items-center gap-2">
                <span class="command-item-label">{{ item.label }}</span>
                <n-tag
                  v-if="item.meta"
                  size="tiny"
                  :type="item.meta === 'USER' ? 'success' : 'warning'"
                  bordered
                  class="ml-2 scale-90 origin-left"
                >
                  {{ item.metaLabel || item.meta }}
                </n-tag>
              </div>
              <span v-if="item.subtitle" class="command-item-subtitle">{{ item.subtitle }}</span>
            </div>

            <div class="ml-auto flex items-center gap-2">
              <n-tag v-if="item.type === 'NAV'" size="tiny" class="opacity-50" dashed>页面</n-tag>
              <n-tag
                v-if="item.type === 'ACTION'"
                size="tiny"
                type="primary"
                class="opacity-70"
                dashed
                >动作</n-tag
              >
              <ArrowRight v-if="index === selectedIndex" :size="14" class="text-indigo-400" />
            </div>
          </div>
        </template>

        <div v-else class="command-empty">
          <div class="empty-icon-bg">
            <Search :size="32" />
          </div>
          <p class="text-zinc-400 mt-4 text-sm">未找到相关结果</p>
          <p class="text-zinc-600 text-xs mt-1">尝试搜索“用户”“Redis”或“系统配置”</p>
        </div>
      </div>

      <div class="command-footer">
        <div class="footer-tip">
          <span class="key">↵</span>
          <span>确认</span>
        </div>
        <div class="footer-tip">
          <span class="key">↑</span>
          <span class="key">↓</span>
          <span>选择</span>
        </div>
        <div class="footer-tip ml-auto">
          <span class="text-zinc-500 text-xs">LearnSphere 管理后台</span>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.command-palette {
  background: var(--surface);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-pop);
  border: 1px solid var(--line);
}

.command-input-container {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--line);
  gap: 12px;
}

.search-icon {
  color: var(--ink-3);
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--ink);
  font-size: 1.05rem;
  font-family: inherit;
}

.command-input::placeholder {
  color: var(--ink-3);
}

.command-k {
  font-size: 0.75rem;
  padding: 3px 8px;
  background: var(--paper-sunken);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  color: var(--ink-3);
}

.command-list {
  max-height: 420px;
  overflow-y: auto;
  padding: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--line-strong) transparent;
}

.command-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: background-color 0.1s;
  gap: 14px;
  margin-bottom: 2px;
}

.command-item.selected {
  background: var(--accent-soft);
}

.command-item:not(.selected):hover {
  background: rgba(26, 33, 48, 0.04);
}

.command-item-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--r-md);
  background: var(--paper-sunken);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-3);
}

.command-item.selected .command-item-icon {
  background: var(--surface);
  color: var(--accent);
}

.command-item-label {
  font-weight: 500;
  color: var(--ink);
  font-size: 0.95rem;
}

.command-item.selected .command-item-label {
  color: var(--accent-ink);
}

.command-item-subtitle {
  font-size: 0.8rem;
  color: var(--ink-3);
  margin-left: 8px;
}

.command-item-icon.NAV {
  color: var(--accent);
}

.command-item-icon.ACTION {
  color: var(--ok);
}

.command-item-icon.SEARCH {
  color: var(--info);
}

.command-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.command-empty {
  padding: 56px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon-bg {
  background: var(--paper-sunken);
  padding: 20px;
  border-radius: 50%;
  color: var(--ink-3);
}

.command-footer {
  padding: 10px 18px;
  background: var(--paper-sunken);
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-tip {
  font-size: 0.75rem;
  color: var(--ink-3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-tip .key {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 1px 6px;
  border-radius: var(--r-sm);
  min-width: 20px;
  text-align: center;
  font-family: inherit;
  color: var(--ink-2);
}

@media (prefers-reduced-motion: reduce) {
  .command-item {
    transition: none;
  }
}
</style>

<style>
/* The modal mask is teleported to body, so it needs an unscoped rule. */
.n-modal-container:has(.command-palette-modal) > .n-modal-mask {
  background-color: rgba(22, 28, 41, 0.42);
}
</style>
