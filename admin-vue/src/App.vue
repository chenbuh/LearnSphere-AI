<script setup>
import { NButton, NConfigProvider, NDialogProvider, darkTheme, NMessageProvider, NNotificationProvider } from 'naive-ui'
import { LayoutDashboard, Users, BookOpen, FileText, BarChart3, PenTool, LogOut, Bot, Settings, GraduationCap, ShieldAlert, FileClock, Bell, History, Activity, MessageSquare, Database, Menu, X } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { adminApi } from '@/api/admin'
import AppCommandPalette from '@/components/CommandPaletteLoader'

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
  { key: '/ai-tutor', label: 'AI 助教管理', icon: MessageSquare },
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
const isSidebarMobileOpen = ref(false)

const toggleMobileSidebar = () => {
    isSidebarMobileOpen.value = !isSidebarMobileOpen.value
}

const handleMenuClick = (key) => {
  router.push(key)
  isSidebarMobileOpen.value = false
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

const showCommandPalette = ref(false)
const handleKeyDown = (e) => {
  // Toggle: Ctrl+K or Cmd+K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    showCommandPalette.value = !showCommandPalette.value
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
    <n-notification-provider>
      <n-dialog-provider>
        <n-message-provider>
      <!-- 登录页面：全屏显示 -->
      <div v-if="isLoginPage" class="login-layout">
        <router-view />
      </div>

      <!-- 主界面：带侧边栏 -->
      <div v-else class="admin-layout">
        <!-- 侧边栏 -->
        <aside class="sidebar" :class="{ 'mobile-open': isSidebarMobileOpen }">
          <div class="flex items-center justify-between px-4 mb-4 desktop-hidden">
            <span class="font-bold">Menu</span>
            <n-button quaternary circle @click="toggleMobileSidebar">
                <template #icon><X :size="20" /></template>
            </n-button>
          </div>
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

        <!-- Mobile Header -->
        <header class="mobile-header desktop-hidden">
           <n-button quaternary circle @click="toggleMobileSidebar">
              <template #icon><Menu :size="24" /></template>
           </n-button>
           <span class="font-bold">LearnSphere Admin</span>
           <div class="w-10"></div> <!-- Spacer -->
        </header>

        <!-- Sidebar Overlay (for mobile) -->
        <div
          v-if="isSidebarMobileOpen"
          class="sidebar-overlay"
          :class="{ show: isSidebarMobileOpen }"
          @click="toggleMobileSidebar"
        ></div>

        <!-- 主内容区 -->
        <main class="main-content" :class="{ 'mobile-offset': !isLoginPage }">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
          
          <!-- Background Glow Elements (Premium feel) -->
          <div class="glow-bg top-left"></div>
          <div class="glow-bg bottom-right"></div>
        </main>
      </div>

      <AppCommandPalette
        v-if="showCommandPalette"
        v-model:show="showCommandPalette"
        :menu-items="menuItems"
        :search-api="adminApi.search"
      />
        </n-message-provider>
      </n-dialog-provider>
    </n-notification-provider>
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
  width: 220px;
  background: rgba(20, 20, 25, 0.95);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px 0;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
}

.logo {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 16px;
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
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 2px;
  border-radius: 8px;
  cursor: pointer;
  color: #a1a1aa;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
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
  width: 18px;
  height: 18px;
}

.main-content {
  flex: 1;
  min-width: 0;          /* 防止 flex 子元素超出父级 */
  margin-left: 220px;
  padding: 24px 28px;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;    /* 内容不超出容器横向 */
  background: #0f0f14;
}


@media (min-width: 1025px) {
  .lg\:hidden {
    display: none !important;
  }
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Background Glow */
.glow-bg {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  filter: blur(140px);
  z-index: -1;
  opacity: 0.15;
  pointer-events: none;
}

.glow-bg.top-left {
  top: -100px;
  left: -100px;
  background: radial-gradient(circle, #6366f1 0%, transparent 70%);
}

.glow-bg.bottom-right {
  bottom: -100px;
  right: -100px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
}

/* Fix for Naive UI Message Stacking in Flex Layouts */
:deep(.n-message-container) {
  z-index: 9999 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 12px !important;
  pointer-events: none !important;
  margin-top: 12px;
}

:deep(.n-message) {
  pointer-events: auto !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

/* Mobile Responsiveness */
.mobile-header {
  height: 60px;
  background: rgba(20, 20, 25, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 90;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 95;
}

@media (max-width: 1024px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 20px 0 50px rgba(0, 0, 0, 0.5);
    /* 添加触摸反馈 */
    -webkit-overflow-scrolling: touch;
    /* 优化性能 */
    will-change: transform;
    /* 硬件加速 */
    transform: translateX(-100%) translateZ(0);
  }

  .sidebar.mobile-open {
    transform: translateX(0) translateZ(0);
  }

  .main-content {
    margin-left: 0 !important;
    padding-top: 84px !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .desktop-hidden {
    display: flex !important;
  }

  /* 优化遮罩层 */
  .sidebar-overlay {
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .sidebar-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }

  /* 优化移动端菜单项 */
  .menu-item {
    /* 增加触摸区域 */
    min-height: 48px;
    /* 添加触摸反馈 */
    -webkit-tap-highlight-color: rgba(99, 102, 241, 0.2);
    transition: all 0.2s ease;
  }

  .menu-item:active {
    background: rgba(99, 102, 241, 0.15);
    transform: scale(0.98);
  }

  /* 优化移动端头部 */
  .mobile-header {
    /* 添加触摸反馈 */
    -webkit-tap-highlight-color: transparent;
    /* 防止点击高亮 */
    user-select: none;
  }
}

@media (min-width: 1025px) {
  .desktop-hidden {
    display: none !important;
  }

  .main-content {
    margin-left: 220px;
  }
}

/* 侧边栏滚动条样式 - 确保始终可见 */
.sidebar {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}

/* WebKit 浏览器滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px !important;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05) !important;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 3px !important;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}
</style>
