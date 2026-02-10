<script setup>
import { NConfigProvider, darkTheme, NMessageProvider } from 'naive-ui'
import { LayoutDashboard, Users, BookOpen, FileText, BarChart3, PenTool, LogOut, Bot, Settings, GraduationCap, ShieldAlert, FileClock, Bell, Search, Command, UserPlus, PlusCircle, Zap, History, Activity, MessageSquare, Database } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { adminApi } from '@/api/admin'
import { NModal, NInput, NResult } from 'naive-ui'

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

// Command Palette
const showCommandPalette = ref(false)
const searchQuery = ref('')
const commandListRef = ref(null)
const backendResults = ref([])
const searchLoading = ref(false)

// Quick Actions Definition
const quickActions = [
  { key: '/users?action=add', label: '快速添加用户', icon: UserPlus },
  { key: '/vocabulary?action=add', label: '录入新词汇', icon: PlusCircle },
  { key: '/ai?tab=sandbox', label: '打开 AI 沙箱', icon: Zap }
]

const filteredCommands = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  
  const navMatches = menuItems.filter(item => 
    item.label.toLowerCase().includes(query) || 
    item.key.toLowerCase().includes(query)
  )

  const actionMatches = quickActions.filter(item => 
    item.label.toLowerCase().includes(query)
  )

  // 合并本地导航与后端搜索结果
  return [
    ...navMatches.map(i => ({ ...i, type: 'NAV' })),
    ...actionMatches.map(i => ({ ...i, type: 'ACTION' })),
    ...backendResults.value.map(i => ({
      key: i.path,
      label: i.title,
      subtitle: i.subtitle,
      icon: i.type === 'USER' ? Users : (i.type === 'VOCABULARY' ? BookOpen : FileText),
      type: 'SEARCH'
    }))
  ]
})

// 监听搜索输入并调用后端
watch(searchQuery, async (newVal) => {
  const query = newVal.trim()
  if (query.length < 2) {
    backendResults.value = []
    return
  }

  searchLoading.value = true
  try {
    const res = await axios.get('/api/admin/search', {
      params: { q: query },
      headers: { 'Authorization': localStorage.getItem('admin-token') }
    })
    if (res.data.code === 200) {
      backendResults.value = res.data.data
    }
  } catch (error) {
    console.error('Command Palette Search Error:', error)
  } finally {
    searchLoading.value = false
  }
})

const executeCommand = (key) => {
  // 处理带参数的路由跳转
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
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    showCommandPalette.value = !showCommandPalette.value
  }
  if (e.key === 'Escape') {
    showCommandPalette.value = false
  }
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
              <component :is="item.icon" class="menu-icon" />
              <span>{{ item.label }}</span>
            </div>

            <!-- 退出登录 -->
            <div class="menu-divider"></div>
            <div class="menu-item logout" @click="handleLogout">
              <LogOut class="menu-icon" />
              <span>退出登录</span>
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
        style="width: 600px; margin-top: 15vh"
        transform-origin="center"
      >
        <div class="command-palette">
          <div class="command-input-container">
            <Search class="search-icon" :size="20" />
            <input
              v-model="searchQuery"
              class="command-input"
              placeholder="搜索功能、用户、单词或输入命令 (/logs, /ai)..."
              autofocus
              @keydown.enter="filteredCommands.length > 0 && executeCommand(filteredCommands[0].key)"
            />
            <div v-if="searchLoading" class="command-loader">
              <n-spin size="small" />
            </div>
            <div class="command-k">Esc</div>
          </div>
          
          <div class="command-list" ref="commandListRef">
            <div 
              v-for="(item, index) in filteredCommands" 
              :key="index"
              class="command-item"
              @click="executeCommand(item.key)"
            >
              <div class="command-item-icon" :class="item.type">
                <component :is="item.icon" :size="18" />
              </div>
              <div class="command-info">
                <span class="command-item-label">{{ item.label }}</span>
                <span v-if="item.subtitle" class="command-item-subtitle">{{ item.subtitle }}</span>
              </div>
              <n-tag v-if="item.type === 'NAV'" size="tiny" ghost>页面</n-tag>
              <n-tag v-if="item.type === 'ACTION'" size="tiny" type="primary" ghost>操作</n-tag>
              <n-tag v-if="item.type === 'SEARCH'" size="tiny" type="info" ghost>数据</n-tag>
              <span class="command-item-path">{{ item.key }}</span>
            </div>
            <div v-if="filteredCommands.length === 0" class="command-empty">
              <Search :size="48" class="opacity-10 mb-2" />
              <p>未找到相关功能</p>
            </div>
          </div>

          <div class="command-footer">
            <div class="footer-tip">
              <span><Command :size="12" /> Enter</span> 执行操作
            </div>
            <div class="footer-tip">
              <span>↑↓</span> 快速选择
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
  background: rgba(20, 20, 25, 0.8);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.logo {
  padding: 0 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
  font-size: 0.875rem;
  color: #71717a;
}

.menu {
  padding: 0 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 6px;
  border-radius: 12px;
  cursor: pointer;
  color: #a1a1aa;
  transition: all 0.2s;
  font-weight: 500;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e4e4e7;
}

.menu-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.menu-item.logout {
  color: #f87171;
}

.menu-item.logout:hover {
  background: rgba(248, 113, 113, 0.1);
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 16px 8px;
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
  .sidebar {
    width: 200px;
  }
  
  .main-content {
    margin-left: 200px;
    padding: 20px;
    padding: 20px;
  }
}

/* Command Palette Styles */
.command-palette {
  background: rgba(24, 24, 28, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.command-input-container {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
}

.command-k {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #71717a;
}

.command-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.command-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 12px;
}

.command-item:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateX(4px);
}

.command-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1a1aa;
}

.command-item:hover .command-item-icon {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.command-item-label {
  font-weight: 500;
  color: #e4e4e7;
}

.command-item-path {
  margin-left: auto;
  font-size: 0.8rem;
  color: #71717a;
}

.command-item-icon.NAV { color: #6366f1; }
.command-item-icon.ACTION { color: #10b981; }
.command-item-icon.SEARCH { color: #3b82f6; }

.command-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.command-item-subtitle {
  font-size: 0.75rem;
  color: #71717a;
}

.command-loader {
  margin-right: 12px;
}

.command-empty {
  padding: 40px;
  text-align: center;
  color: #71717a;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.command-footer {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  gap: 20px;
}

.footer-tip {
  font-size: 0.75rem;
  color: #52525b;
  display: flex;
  align-items: center;
  gap: 4px;
}

.footer-tip span {
  color: #71717a;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
