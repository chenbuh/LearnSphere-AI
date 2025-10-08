<script setup>
import { h, ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NIcon, NText, NAvatar, NDropdown } from 'naive-ui'
import { 
  BookOpen, Home, BarChart2, MessageSquare, Settings, LogOut, User, Bell
} from 'lucide-vue-next'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const collapsed = ref(false)
const route = useRoute()

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
    label: () => h(RouterLink, { to: '/grammar' }, { default: () => '语法练习' }),
    key: 'grammar',
    icon: renderIcon(MessageSquare)
  },
  {
    label: () => h(RouterLink, { to: '/listening' }, { default: () => '听力训练' }),
    key: 'listening',
    icon: renderIcon(Bell) // Needs a headphone icon, using Bell for now or import Music
  },
  {
    label: () => h(RouterLink, { to: '/speaking' }, { default: () => '口语练习' }),
    key: 'speaking',
    icon: renderIcon(MessageSquare) // Needs Mic icon
  },
  {
    label: () => h(RouterLink, { to: '/reading' }, { default: () => '阅读理解' }),
    key: 'reading',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/writing' }, { default: () => '写作练习' }),
    key: 'writing',
    icon: renderIcon(MessageSquare) // Needs Pen tool
  },
  {
    label: () => h(RouterLink, { to: '/mock-exam' }, { default: () => '模拟考试' }),
    key: 'mock-exam',
    icon: renderIcon(BarChart2) // Needs Target icon
  },
  {
    label: () => h(RouterLink, { to: '/analysis' }, { default: () => '学习分析' }),
    key: 'analysis',
    icon: renderIcon(BarChart2) // Needs Brain icon
  },
  {
    label: () => h(RouterLink, { to: '/error-book' }, { default: () => '错题本' }),
    key: 'error-book',
    icon: renderIcon(BookOpen) // Needs Notebook icon
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
    // Handle profile navigation if selected from dropdown
  }
}

const activeKey = computed(() => {
  if (!route.name) return null
  // Convert PascalCase route name to kebab-case menu key
  return route.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
})
</script>

<template>
  <n-layout has-sider class="layout-container">
    <n-layout-sider
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

    <n-layout>
      <n-layout-header bordered class="header">
        <div class="header-left">
           <h3>{{ route.meta.title || 'LearnSphere AI' }}</h3>
        </div>
        <div class="header-right">
          <n-icon size="20" class="icon-btn"><Bell /></n-icon>
          <n-dropdown :options="userOptions" @select="handleUserSelect">
            <div class="user-profile">
              <n-avatar round size="small" :src="userStore.avatar" />
              <span class="username">{{ userStore.username }}</span>
            </div>
          </n-dropdown>
        </div>
      </n-layout-header>
      <n-layout-content content-style="padding: 24px;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.layout-container {
  height: 100vh;
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
</style>
