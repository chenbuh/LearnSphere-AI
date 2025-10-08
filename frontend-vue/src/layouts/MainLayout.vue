<script setup>
import { h, ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NIcon, NText, NAvatar, NDropdown, NDrawer, NDrawerContent, NButton } from 'naive-ui'
import { 
  BookOpen, Home, BarChart2, MessageSquare, Settings, LogOut, User, Bell, RotateCw, CheckSquare, Menu as MenuIcon, Trophy
} from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import QuotaDisplay from '@/components/QuotaDisplay.vue'

const userStore = useUserStore()
const collapsed = ref(false)
const route = useRoute()
const router = useRouter()
const isMobile = ref(false)
const showMobileMenu = ref(false)

// 响应式检测
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    collapsed.value = true
  } else {
    collapsed.value = false
    showMobileMenu.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const renderIcon = (icon) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  {
    label: () => h(RouterLink, { to: '/dashboard' }, { default: () => '仪表盘' }),
    key: 'dashboard',
    icon: renderIcon(Home)
  },
  {
    label: () => h(RouterLink, { to: '/vocabulary' }, { default: () => '词汇学习' }),
    key: 'vocabulary',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/vocabulary-test' }, { default: () => '词汇测试' }),
    key: 'vocabulary-test',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/review' }, { default: () => '智能复习' }),
    key: 'review',
    icon: renderIcon(RotateCw)
  },
  {
    label: () => h(RouterLink, { to: '/daily-tasks' }, { default: () => '每日任务' }),
    key: 'daily-tasks',
    icon: renderIcon(CheckSquare)
  },
  {
    label: () => h(RouterLink, { to: '/grammar' }, { default: () => '语法练习' }),
    key: 'grammar',
    icon: renderIcon(MessageSquare)
  },
  {
    label: () => h(RouterLink, { to: '/listening' }, { default: () => '听力训练' }),
    key: 'listening',
    icon: renderIcon(Bell)
  },
  {
    label: () => h(RouterLink, { to: '/speaking' }, { default: () => '口语练习' }),
    key: 'speaking',
    icon: renderIcon(MessageSquare)
  },
  {
    label: () => h(RouterLink, { to: '/reading' }, { default: () => '阅读理解' }),
    key: 'reading',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/writing' }, { default: () => '写作练习' }),
    key: 'writing',
    icon: renderIcon(MessageSquare)
  },
  {
    label: () => h(RouterLink, { to: '/mock-exam' }, { default: () => '模拟考试' }),
    key: 'mock-exam',
    icon: renderIcon(BarChart2)
  },
  {
    label: () => h(RouterLink, { to: '/analysis' }, { default: () => '学习分析' }),
    key: 'analysis',
    icon: renderIcon(BarChart2)
  },
  {
    label: () => h(RouterLink, { to: '/error-book' }, { default: () => '错题本' }),
    key: 'error-book',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/profile' }, { default: () => '个人中心' }),
    key: 'profile',
    icon: renderIcon(User)
  },
  {
    label: () => h(RouterLink, { to: '/settings' }, { default: () => '设置' }),
    key: 'settings',
    icon: renderIcon(Settings)
  }
]

const userOptions = [
  { label: '个人资料', key: 'profile', icon: renderIcon(User) },
  { label: '退出登录', key: 'logout', icon: renderIcon(LogOut) }
]

const handleUserSelect = (key) => {
  if (key === 'logout') {
    userStore.logout()
  } else if (key === 'profile') {
    router.push('/profile')
  }
}

const handleMenuUpdate = (key, item) => {
  if (isMobile.value) {
    showMobileMenu.value = false
  }
}

const activeKey = computed(() => {
  if (!route.name) return null
  return route.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
})
</script>

<template>
  <n-layout has-sider class="layout-container">
    <!-- PC端侧边栏 -->
    <n-layout-sider
      v-if="!isMobile"
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
      bordered
    >
      <div class="logo">
        <img src="@/assets/logo.svg" alt="LearnSphere Logo" class="logo-side-img" />
        <span v-if="!collapsed" class="logo-text">LearnSphere</span>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
      />
    </n-layout-sider>

    <!-- 移动端抽屉菜单 -->
    <n-drawer v-model:show="showMobileMenu" :width="240" placement="left">
      <n-drawer-content body-content-style="padding: 0;">
        <div class="logo mobile-logo">
          <img src="@/assets/logo.svg" alt="LearnSphere Logo" class="logo-side-img" />
          <span class="logo-text">LearnSphere</span>
        </div>
        <n-menu
          :options="menuOptions"
          :value="activeKey"
          @update:value="handleMenuUpdate"
        />
      </n-drawer-content>
    </n-drawer>

    <n-layout>
      <n-layout-header bordered class="header">
        <div class="header-left">
           <!-- 移动端汉堡按钮 -->
           <n-button v-if="isMobile" secondary class="mobile-menu-toggle" @click="showMobileMenu = true">
             <n-icon size="22"><MenuIcon /></n-icon>
           </n-button>
           <h3>{{ route.meta.title || 'LearnSphere AI' }}</h3>
        </div>
        <div class="header-right">
          <QuotaDisplay v-if="!isMobile" />
          <n-icon size="20" class="icon-btn"><Bell /></n-icon>
          <n-dropdown :options="userOptions" @select="handleUserSelect">
            <div class="user-profile">
              <n-avatar round size="small" :src="userStore.avatar" />
              <div v-if="!isMobile" class="user-meta" style="display: flex; flex-direction: column; line-height: 1.2; margin-left: 8px;">
                <span class="username" :style="{ color: userStore.isVip() ? '#f59e0b' : 'inherit', fontWeight: 'bold' }">
                  {{ userStore.username }}
                </span>
                <span v-if="userStore.isVip()" style="font-size: 10px; color: #f59e0b;">PRO MEMBER</span>
              </div>
            </div>
          </n-dropdown>
        </div>
      </n-layout-header>
      <n-layout-content content-style="padding: 24px;" class="main-content">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: bold;
  font-size: 1.2rem;
  color: #6366f1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.mobile-logo {
  background-color: var(--n-color);
}

.logo-side-img {
  width: 28px;
  height: 28px;
}

.header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .main-content {
    /* 移动端内容区域内边距减小 */
    padding: 16px !important;
  }
}

.main-content {
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-btn {
  cursor: pointer;
  color: #a1a1aa;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.06);
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.mobile-menu-toggle {
  margin-right: 8px;
  padding: 6px 10px;
  background: rgba(99, 102, 241, 0.15) !important;
  border: 1px solid rgba(99, 102, 241, 0.3) !important;
  transition: all 0.3s;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-toggle:hover {
  background: rgba(99, 102, 241, 0.25) !important;
  border-color: rgba(99, 102, 241, 0.5) !important;
  transform: scale(1.05);
}

.mobile-menu-toggle .n-icon {
  color: #818cf8 !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  line-height: 1;
}

</style>

