<script setup>
import { NConfigProvider, darkTheme, NMessageProvider } from 'naive-ui'
import { LayoutDashboard, Users, BookOpen, FileText, BarChart3, PenTool, LogOut, Bot, Settings, GraduationCap, ShieldAlert, FileClock, Bell, Search, Command, UserPlus, PlusCircle, Zap, History, Activity, MessageSquare, Database, ArrowRight, Book, Layers } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { adminApi } from '@/api/admin'
import { NModal, NInput, NResult, NTag, NSpin } from 'naive-ui'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { key: '/dashboard', label: '数据概览', icon: LayoutDashboard },
  { key: '/users', label: '用户管理', icon: Users },
  { key: '/vocabulary', label: '词汇库', icon: BookOpen },
  { key: '/records', label: '学习记录', icon: FileText },
  { key: '/content', label: '学习内容', icon: BarChart3 },
  { key: '/writing', label: '写作管理', icon: PenTool },
  { key: '/exams', label: '试卷模考', icon: GraduationCap },
  { key: '/sensitive', label: '内容审核', icon: ShieldAlert },
  { key: '/logs', label: '操作日志', icon: FileClock },
  { key: '/user-logs', label: '用户日志', icon: History },
  { key: '/notifications', label: '通知管理', icon: Bell },
  { key: '/monitor', label: '系统监控', icon: Activity },
  { key: '/redis', label: 'Redis 管理', icon: Database },
  { key: '/ai', label: 'AI 治理', icon: Bot },
  { key: '/ai-feedback', label: 'AI 反馈审计', icon: MessageSquare },
  { key: '/settings', label: '系统设置', icon: Settings }
]

const activeKey = computed(() => route.path)
const isLoginPage = computed(() => route.path === '/login')

const handleMenuClick = (key) => {
  router.push(key)
}

const handleLogout = async () => {
  try {
    await adminApi.adminLogout()
  } catch (error) {
    console.error('登出失败:', error)
  } finally {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-info')
    router.push('/login')
  }
}

// Command Palette Logic
const showCommandPalette = ref(false)
const searchQuery = ref('')
const commandListRef = ref(null)
const backendResults = ref([])
const searchLoading = ref(false)
const selectedIndex = ref(0) // Keyboard navigation index

// Quick Actions Definition
const quickActions = [
  { key: '/users?action=add', label: '快速添加用户 (New User)', icon: UserPlus, type: 'ACTION' },
  { key: '/vocabulary?action=add', label: '录入新词汇 (Add Vocabulary)', icon: PlusCircle, type: 'ACTION' },
  { key: '/ai?tab=sandbox', label: '打开 AI 沙箱 (AI Sandbox)', icon: Zap, type: 'ACTION' },
  { key: '/monitor', label: '查看系统监控 (System Monitor)', icon: Activity, type: 'ACTION' }
]

const filteredCommands = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  
  if (!query) {
      // Default view: Quick actions + Recents (configured as Nav for now)
      return [
          ...quickActions,
          ...menuItems.map(i => ({ ...i, type: 'NAV' }))
      ].slice(0, 10)
  }

  const navMatches = menuItems.filter(item => 
    item.label.toLowerCase().includes(query) || 
    item.key.toLowerCase().includes(query)
  )

  const actionMatches = quickActions.filter(item => 
    item.label.toLowerCase().includes(query)
  )

  // Combine results
  return [
    ...actionMatches.map(i => ({ ...i, type: 'ACTION' })),
    ...navMatches.map(i => ({ ...i, type: 'NAV' })),
    ...backendResults.value.map(i => ({
      key: i.path,
      label: i.title,
      subtitle: i.subtitle,
      icon: i.type === 'USER' ? Users : (i.type === 'VOCABULARY' ? Book : Layers),
      type: 'SEARCH',
      meta: i.type
    }))
  ]
})

// Reset selection when results change
watch(filteredCommands, () => {
    selectedIndex.value = 0
})

// Debounced Search Call
let searchTimeout = null
watch(searchQuery, (newVal) => {
  const query = newVal.trim()
  if (query.length < 2) {
    backendResults.value = []
    return
  }

  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
      searchLoading.value = true
      try {
        const res = await adminApi.search(query)
        if (res.data) {
          backendResults.value = res.data
        }
      } catch (error) {
        console.error('Search Error:', error)
      } finally {
        searchLoading.value = false
      }
  }, 300)
})

const executeCommand = (item) => {
  if (!item) return
  const key = item.key
  
  if (key.includes('?')) {
    const [path, queryStr] = key.split('?')
    const query = Object.fromEntries(new URLSearchParams(queryStr))
    router.push({ path, query })
  } else {
    router.push(key)
  }
  
  showCommandPalette.value = false
  searchQuery.value = ''
}

const handleKeyDown = (e) => {
  // Toggle: Ctrl+K or Cmd+K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    showCommandPalette.value = !showCommandPalette.value
    if (showCommandPalette.value) {
        nextTick(() => document.querySelector('.command-input')?.focus())
    }
  }

  if (!showCommandPalette.value) return

  const max = filteredCommands.value.length
  
  switch(e.key) {
      case 'ArrowDown':
          e.preventDefault()
          selectedIndex.value = (selectedIndex.value + 1) % max
          scrollToSelected()
          break
      case 'ArrowUp':
          e.preventDefault()
          selectedIndex.value = (selectedIndex.value - 1 + max) % max
          scrollToSelected()
          break
      case 'Enter':
          e.preventDefault()
          if (max > 0) {
              executeCommand(filteredCommands.value[selectedIndex.value])
          }
          break
      case 'Escape':
          e.preventDefault()
          showCommandPalette.value = false
          break
  }
}

const scrollToSelected = () => {
    nextTick(() => {
        const el = commandListRef.value?.children[selectedIndex.value]
        if (el) {
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    })
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <!-- 登录页面：全屏显示 -->
      <div v-if="isLoginPage" class="login-layout">
        <router-view />
      </div>

      <!-- 主界面：带侧边栏 -->
      <div v-else class="admin-layout">
        <!-- 侧边栏 -->
        <aside class="sidebar">
          <div class="logo">
            <div class="logo-box">
              <img src="@/assets/logo.svg" alt="LearnSphere Logo" class="admin-logo-img" />
              <h1>LearnSphere</h1>
            </div>
            <p>管理后台</p>
          </div>
          
          <nav class="menu">
            <div 
              v-for="item in menuItems" 
              :key="item.key"
              class="menu-item"
              :class="{ active: activeKey === item.key }"
              @click="handleMenuClick(item.key)"
            >
              <div class="flex items-center gap-3">
                  <component :is="item.icon" class="menu-icon" />
                  <span>{{ item.label }}</span>
              </div>
            </div>

            <!-- 退出登录 -->
            <div class="menu-divider"></div>
            <div class="menu-item logout" @click="handleLogout">
              <div class="flex items-center gap-3">
                  <LogOut class="menu-icon" />
                  <span>退出登录</span>
              </div>
            </div>
          </nav>
        </aside>

        <!-- 主内容区 -->
        <main class="main-content">
          <router-view />
        </main>
      </div>

      <!-- 全局指挥中心 (Command Palette) -->
      <n-modal
        v-model:show="showCommandPalette"
        class="command-palette-modal"
        :bordered="false"
        content-style="padding: 0;"
        style="width: 640px; margin-top: 12vh; background: transparent; box-shadow: none;"
        transform-origin="center"
        :mask-closable="true"
      >
        <div class="command-palette">
          <div class="command-input-container">
            <Search class="search-icon" :size="20" />
            <input
              v-model="searchQuery"
              class="command-input"
              placeholder="搜索功能、用户、单词或输入命令 (/logs, /ai)..."
              autofocus
            />
            <div v-if="searchLoading" class="command-loader">
              <n-spin size="small" />
            </div>
            <div class="command-k">Esc</div>
          </div>
          
          <div class="command-list" ref="commandListRef">
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
                        <n-tag v-if="item.meta" size="tiny" :type="item.meta === 'USER' ? 'success' : 'warning'" bordered class="ml-2 scale-90 origin-left">{{ item.meta }}</n-tag>
                    </div>
                    <span v-if="item.subtitle" class="command-item-subtitle">{{ item.subtitle }}</span>
                </div>
                
                <div class="ml-auto flex items-center gap-2">
                    <n-tag v-if="item.type === 'NAV'" size="tiny" class="opacity-50" dashed>Jump to</n-tag>
                    <n-tag v-if="item.type === 'ACTION'" size="tiny" type="primary" class="opacity-70" dashed>Run</n-tag>
                    <ArrowRight v-if="index === selectedIndex" :size="14" class="text-indigo-400" />
                </div>
                </div>
            </template>

            <div v-else class="command-empty">
              <div class="empty-icon-bg">
                <Search :size="32" />
              </div>
              <p class="text-zinc-400 mt-4 text-sm">未找到相关结果</p>
              <p class="text-zinc-600 text-xs mt-1">尝试搜索 "User", "Redis" 或 "Settings"</p>
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
               <span class="text-zinc-500 text-xs">LearnSphere Admin Console</span>
            </div>
          </div>
        </div>
      </n-modal>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
/* 登录布局 */
.login-layout {
  width: 100%;
  height: 100vh;
}

/* 主布局 */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0f0f14;
}

.sidebar {
  width: 260px;
  background: rgba(20, 20, 25, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 24px 0;
  position: fixed;
  height: 100vh;
  /* overflow-y: auto; */
}

.logo {
  padding: 0 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 24px;
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.admin-logo-img {
  width: 32px;
  height: 32px;
}

.logo h1 {
  font-size: 1.3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.logo p {
  font-size: 0.8rem;
  color: #71717a;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.menu {
  padding: 0 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  color: #a1a1aa;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.95rem;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e4e4e7;
  transform: translateX(2px);
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0) 100%);
  color: #818cf8;
  border-left: 2px solid #818cf8;
}

.menu-item.logout {
  color: #f87171;
}

.menu-item.logout:hover {
  background: rgba(248, 113, 113, 0.1);
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 16px 12px;
}

.menu-icon {
  width: 20px;
  height: 20px;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 32px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .sidebar { width: 80px; padding-top: 20px; }
  .logo p, .logo h1, .menu-item span { display: none; }
  .logo { padding: 0 0 20px 0; display: flex; justify-content: center; }
  .main-content { margin-left: 80px; padding: 16px; }
}

/* Command Palette Styles */
.command-palette {
  background: #18181b;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(82, 82, 91, 0.4);
}

.command-input-container {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  gap: 12px;
}

.search-icon {
  color: #71717a;
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #e4e4e7;
  font-size: 1.1rem;
  font-family: inherit;
}

.command-k {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  color: #a1a1aa;
}

.command-list {
  max-height: 420px;
  overflow-y: auto;
  padding: 8px;
  /* Scrollbar fancy styling */
  scrollbar-width: thin;
  scrollbar-color: #3f3f46 transparent;
}

.command-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s;
  gap: 14px;
  margin-bottom: 2px;
  border: 1px solid transparent;
}

.command-item.selected {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.2);
}

.command-item:not(.selected):hover {
  background: rgba(255, 255, 255, 0.03);
}

.command-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(50, 50, 55, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}

.command-item.selected .command-item-icon {
    background: rgba(99, 102, 241, 0.2);
    color: #e0e7ff;
}

.command-item-label {
  font-weight: 500;
  color: #d4d4d8;
  font-size: 0.95rem;
}

.command-item.selected .command-item-label {
    color: #fff;
}

.command-item-subtitle {
  font-size: 0.8rem;
  color: #71717a;
  margin-left: 8px;
}

.command-item-icon.NAV { color: #818cf8; }
.command-item-icon.ACTION { color: #34d399; }
.command-item-icon.SEARCH { color: #60a5fa; }

.command-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.command-empty {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon-bg {
    background: rgba(255,255,255,0.03);
    padding: 20px;
    border-radius: 50%;
    color: #52525b;
}

.command-footer {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-tip {
  font-size: 0.75rem;
  color: #71717a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-tip .key {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 20px;
  text-align: center;
  font-family: inherit;
  color: #d4d4d8;
}
</style>
