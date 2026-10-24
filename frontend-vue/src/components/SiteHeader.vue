<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NLayoutHeader, NButton, NSpace, NIcon, NDrawer, NDrawerContent, NMenu } from 'naive-ui'
import { Menu as MenuIcon } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '@/stores/theme'
import logoDarkSrc from '@/assets/logo.svg'
import logoLightSrc from '@/assets/logo-light.svg'

const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const showMobileMenu = ref(false)
const headerLogoSrc = computed(() => (themeStore.isDark ? logoDarkSrc : logoLightSrc))

const menuOptions = [
  { label: '首页', key: 'home', path: '/' },
  { label: '功能', key: 'features', path: '/features' },
  { label: '考试', key: 'exams', path: '/exams' },
  { label: '排行榜', key: 'leaderboard', path: '/leaderboard' },
  { label: '价格', key: 'pricing', path: '/pricing' }
]

const handleMenuClick = (key, item) => {
  router.push(item.path)
  showMobileMenu.value = false
}

const navigateToAuth = (mode = 'login') => {
  const query = mode === 'register' ? { mode: 'register' } : undefined
  router.push({ path: '/login', query })
  showMobileMenu.value = false
}

const navigateToDashboard = () => {
  router.push('/app/dashboard')
  showMobileMenu.value = false
}

const handleLogout = () => {
  userStore.logout()
  showMobileMenu.value = false
}
</script>

<template>
  <n-layout-header bordered class="nav-header">
    <div class="container navbar">
      <div class="logo" @click="router.push('/')">
        <img :src="headerLogoSrc" alt="LearnSphere Logo" class="logo-img" />
        <span class="logo-text">LearnSphere</span>
      </div>

      <!-- Desktop Nav -->
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/features">功能</router-link>
        <router-link to="/exams">考试</router-link>
        <router-link to="/leaderboard">排行榜</router-link>
        <router-link to="/pricing">价格</router-link>
      </div>

      <div class="nav-actions">
        <div class="desktop-only">
          <template v-if="!userStore.token">
            <n-button quaternary type="primary" @click="navigateToAuth()">登录</n-button>
            <n-button type="primary" @click="navigateToAuth('register')">注册</n-button>
          </template>
          <template v-else>
            <n-space>
              <n-button type="primary" @click="navigateToDashboard">进入学习</n-button>
              <n-button quaternary @click="handleLogout">退出</n-button>
            </n-space>
          </template>
        </div>

        <!-- Mobile Menu Toggle -->
        <n-button class="mobile-menu-btn" quaternary circle @click="showMobileMenu = true">
          <template #icon><n-icon :component="MenuIcon" /></template>
        </n-button>
      </div>
    </div>

    <!-- Mobile Menu Drawer -->
    <n-drawer v-model:show="showMobileMenu" :width="280" placement="right">
      <n-drawer-content title="导航菜单" closable>
        <div class="mobile-menu-content">
          <n-menu :options="menuOptions" @update:value="handleMenuClick" />
          <div class="mobile-menu-footer">
            <template v-if="!userStore.token">
              <n-button block type="primary" ghost @click="navigateToAuth()" class="mb-4"
                >登录</n-button
              >
              <n-button block type="primary" @click="navigateToAuth('register')">立即注册</n-button>
            </template>
            <template v-else>
              <n-button block secondary type="primary" @click="navigateToDashboard" class="mb-4"
                >进入后台</n-button
              >
              <n-button block secondary type="error" @click="handleLogout">退出登录</n-button>
            </template>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </n-layout-header>
</template>

<style scoped>
.nav-header {
  height: 60px;
  display: flex;
  align-items: center;
  background: var(--header-bg);
  border-bottom: 1px solid var(--card-border);
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}
.nav-links a {
  padding: 6px 12px;
  text-decoration: none;
  color: var(--secondary-text);
  font-size: 14px;
  border-radius: var(--radius-sm);
  transition: color 0.15s;
}
.nav-links a:hover {
  color: var(--text-color);
}
.nav-links a.router-link-exact-active {
  color: var(--text-color);
  font-weight: 600;
}
.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-img {
  width: 28px;
  height: 28px;
}
.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-color);
}
.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mobile-menu-btn {
  display: none;
}
.mobile-menu-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.mobile-menu-footer {
  margin-top: auto;
  padding: 20px 0;
}
.mb-4 {
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .nav-links,
  .desktop-only {
    display: none;
  }
  .mobile-menu-btn {
    display: inline-flex;
  }
}
</style>
