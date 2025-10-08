<script setup>
import { NConfigProvider, darkTheme, NMessageProvider } from 'naive-ui'
import { LayoutDashboard, Users, BookOpen, FileText, BarChart3, PenTool, BookText, Mic, LogOut, Bot, Settings, GraduationCap } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { adminApi } from '@/api/admin'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { key: '/dashboard', label: '数据概览', icon: LayoutDashboard },
  { key: '/users', label: '用户管理', icon: Users },
  { key: '/vocabulary', label: '词汇库', icon: BookOpen },
  { key: '/records', label: '学习记录', icon: FileText },
  { key: '/content', label: '阅读听力', icon: BarChart3 },
  { key: '/writing', label: '写作管理', icon: PenTool },
  { key: '/grammar', label: '语法管理', icon: BookText },
  { key: '/speaking', label: '口语管理', icon: Mic },
  { key: '/exams', label: '试卷模考', icon: GraduationCap },
  { key: '/ai', label: 'AI 治理', icon: Bot },
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
  }
}
</style>
