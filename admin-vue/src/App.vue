<script setup>
import {
  NButton,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NNotificationProvider,
  darkTheme
} from 'naive-ui'
import { Clock3, LogOut, Menu, Search, ShieldCheck, Sparkles, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'
import AppCommandPalette from '@/components/CommandPaletteLoader'
import { adminMenuGroups, adminMenuItems, getAdminRouteMeta } from '@/utils/adminNavigation'
import { adminThemeOverrides } from '@/utils/adminThemeOverrides'

const router = useRouter()
const route = useRoute()

const isSidebarMobileOpen = ref(false)
const showCommandPalette = ref(false)
const currentDate = ref(new Date())
const adminProfile = ref({
  name: 'LearnSphere Admin',
  role: '后台管理员'
})

let clockTimer = null

const activeKey = computed(() => route.path)
const isLoginPage = computed(() => route.path === '/login')
const currentRouteMeta = computed(() => getAdminRouteMeta(route.path))
const workspaceDateLabel = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(currentDate.value)
)
const workspaceTimeLabel = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(currentDate.value)
)
const profileInitials = computed(() => {
  const source = String(adminProfile.value.name || 'AD').replace(/\s+/g, '')
  return source.slice(0, 2).toUpperCase()
})

const syncDocumentLayoutState = () => {
  if (typeof document === 'undefined') return

  const isAdminSurface = !isLoginPage.value
  document.documentElement.classList.toggle('admin-html-lock', isAdminSurface)
  document.body.classList.toggle('admin-body-lock', isAdminSurface)
}

const syncAdminProfile = () => {
  try {
    const raw = localStorage.getItem('admin-info')
    if (!raw) return

    const data = JSON.parse(raw)
    adminProfile.value = {
      name:
        data?.nickname ||
        data?.name ||
        data?.username ||
        data?.account ||
        adminProfile.value.name,
      role: data?.roleName || data?.role || adminProfile.value.role
    }
  } catch (error) {
    console.error('读取管理员信息失败:', error)
  }
}

const toggleMobileSidebar = () => {
  isSidebarMobileOpen.value = !isSidebarMobileOpen.value
}

const openCommandPalette = () => {
  showCommandPalette.value = true
  isSidebarMobileOpen.value = false
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

const handleKeyDown = (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    showCommandPalette.value = !showCommandPalette.value
  }
}

watch(
  () => route.path,
  () => {
    isSidebarMobileOpen.value = false
    syncAdminProfile()
    syncDocumentLayoutState()
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  syncAdminProfile()
  syncDocumentLayoutState()
  clockTimer = window.setInterval(() => {
    currentDate.value = new Date()
  }, 60000)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('admin-html-lock')
    document.body.classList.remove('admin-body-lock')
  }
  if (clockTimer) {
    window.clearInterval(clockTimer)
    clockTimer = null
  }
})
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="adminThemeOverrides">
    <n-notification-provider>
      <n-dialog-provider>
        <n-message-provider>
          <div v-if="isLoginPage" class="login-layout">
            <router-view />
          </div>

          <div v-else class="admin-shell">
            <div class="admin-layout">
              <aside class="admin-sidebar" :class="{ 'is-open': isSidebarMobileOpen }">
                <div class="admin-sidebar__mobile-head">
                  <span class="workspace-toolbar__tag">菜单</span>
                  <n-button quaternary circle @click="toggleMobileSidebar">
                    <template #icon>
                      <X :size="18" />
                    </template>
                  </n-button>
                </div>

                <div class="admin-sidebar__brand">
                  <div class="admin-sidebar__brand-mark">
                    <img src="@/assets/logo.svg" alt="LearnSphere logo" />
                  </div>
                  <div class="admin-sidebar__brand-copy">
                    <strong>LearnSphere</strong>
                    <span>管理后台</span>
                  </div>
                </div>

                <button class="admin-sidebar__search" type="button" @click="openCommandPalette">
                  <Search :size="16" />
                  <span>搜索页面、指令和动作</span>
                  <kbd>Ctrl K</kbd>
                </button>

                <nav class="admin-sidebar__nav">
                  <section
                    v-for="group in adminMenuGroups"
                    :key="group.id"
                    class="admin-sidebar__group"
                  >
                    <p class="admin-sidebar__group-label">{{ group.title }}</p>
                    <div class="admin-nav-list">
                      <button
                        v-for="item in group.items"
                        :key="item.key"
                        type="button"
                        class="admin-nav-item"
                        :class="{ 'is-active': activeKey === item.key }"
                        @click="handleMenuClick(item.key)"
                      >
                        <component :is="item.icon" :size="18" />
                        <div class="admin-nav-item__body">
                          <span class="admin-nav-item__label">{{ item.label }}</span>
                          <span class="admin-nav-item__summary">{{ item.summary }}</span>
                        </div>
                        <span v-if="item.badge" class="admin-nav-item__badge">
                          {{ item.badge }}
                        </span>
                      </button>
                    </div>
                  </section>
                </nav>

                <div class="admin-sidebar__footer">
                  <div class="admin-profile-card">
                    <div class="admin-profile-avatar">{{ profileInitials }}</div>
                    <div class="admin-profile-copy">
                      <strong>{{ adminProfile.name }}</strong>
                      <span>{{ adminProfile.role }}</span>
                    </div>
                  </div>

                  <button class="admin-logout" type="button" @click="handleLogout">
                    <LogOut :size="16" />
                    退出登录
                  </button>
                </div>
              </aside>

              <div class="admin-main">
                <header class="mobile-header">
                  <n-button quaternary circle @click="toggleMobileSidebar">
                    <template #icon>
                      <Menu :size="20" />
                    </template>
                  </n-button>

                  <div class="mobile-header__title">
                    <strong>{{ currentRouteMeta.label }}</strong>
                    <span>{{ currentRouteMeta.group }}</span>
                  </div>

                  <n-button quaternary circle @click="openCommandPalette">
                    <template #icon>
                      <Search :size="18" />
                    </template>
                  </n-button>
                </header>

                <header class="workspace-toolbar">
                  <div class="workspace-toolbar__heading">
                    <div class="workspace-toolbar__eyebrow">
                      {{ currentRouteMeta.group }}
                    </div>
                    <div class="workspace-toolbar__title-row">
                      <h1>{{ currentRouteMeta.label }}</h1>
                      <span v-if="currentRouteMeta.badge" class="workspace-toolbar__tag">
                        {{ currentRouteMeta.badge }}
                      </span>
                    </div>
                    <p class="workspace-toolbar__summary">
                      {{ currentRouteMeta.summary }}
                    </p>
                  </div>

                  <div class="workspace-toolbar__actions">
                    <button class="workspace-command" type="button" @click="openCommandPalette">
                      <span class="workspace-command__copy">
                        <Search :size="16" />
                        搜索页面、接口和后台动作
                      </span>
                      <kbd>Ctrl K</kbd>
                    </button>

                    <div class="workspace-pill-row">
                      <span class="workspace-pill">
                        <Clock3 :size="15" />
                        {{ workspaceDateLabel }} · {{ workspaceTimeLabel }}
                      </span>
                      <span class="workspace-pill">
                        <ShieldCheck :size="15" />
                        管理员会话已启用
                      </span>
                      <span class="workspace-pill">
                        <Sparkles :size="15" />
                        {{ adminProfile.role }}
                      </span>
                    </div>
                  </div>
                </header>

                <div
                  v-if="isSidebarMobileOpen"
                  class="sidebar-overlay"
                  @click="toggleMobileSidebar"
                ></div>

                <main class="workspace-content">
                  <router-view v-slot="{ Component }">
                    <transition name="page-fade" mode="out-in">
                      <component :is="Component" />
                    </transition>
                  </router-view>
                </main>
              </div>
            </div>
          </div>

          <AppCommandPalette
            v-if="showCommandPalette"
            v-model:show="showCommandPalette"
            :menu-items="adminMenuItems"
            :search-api="adminApi.search"
          />
        </n-message-provider>
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>
