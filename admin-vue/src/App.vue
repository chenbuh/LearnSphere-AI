<script setup>
import {
  NButton,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NNotificationProvider,
  dateZhCN,
  zhCN
} from 'naive-ui'
import { LogOut, Menu, Search, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'
import { getAdminInfo, redirectToFrontendLogin } from '@/utils/adminSession'
import AppCommandPalette from '@/components/CommandPaletteLoader'
import { adminMenuItems, getAdminRouteMeta, getMenuGroupsForRole } from '@/utils/adminNavigation'
import { adminThemeOverrides } from '@/utils/adminThemeOverrides'

const router = useRouter()
const route = useRoute()

const isSidebarMobileOpen = ref(false)
const showCommandPalette = ref(false)
const adminProfile = ref({
  name: 'LearnSphere Admin',
  role: '后台管理员',
  roleCode: null
})

const visibleMenuGroups = computed(() => getMenuGroupsForRole(adminProfile.value.roleCode))
const visibleMenuItems = computed(() => {
  const allowed = new Set(visibleMenuGroups.value.flatMap((group) => group.items.map((item) => item.key)))
  return adminMenuItems.filter((item) => allowed.has(item.key))
})

const activeKey = computed(() => route.path)
const currentRouteMeta = computed(() => getAdminRouteMeta(route.path))
const profileInitials = computed(() => {
  const source = String(adminProfile.value.name || 'AD').replace(/\s+/g, '')
  return source.slice(0, 1).toUpperCase()
})

const syncDocumentLayoutState = () => {
  if (typeof document === 'undefined') return

  document.documentElement.classList.add('admin-html-lock')
  document.body.classList.add('admin-body-lock')
}

const syncAdminProfile = () => {
  try {
    const data = getAdminInfo()
    if (!data) return

    adminProfile.value = {
      roleCode: data?.role || null,
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
    redirectToFrontendLogin('/dashboard')
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
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('admin-html-lock')
    document.body.classList.remove('admin-body-lock')
  }
})
</script>

<template>
  <n-config-provider :theme-overrides="adminThemeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-notification-provider>
      <n-dialog-provider>
        <n-message-provider>
          <div class="admin-shell">
            <div class="admin-layout">
              <aside class="admin-sidebar" :class="{ 'is-open': isSidebarMobileOpen }">
                <div class="admin-sidebar__mobile-head">
                  <span>菜单</span>
                  <n-button quaternary circle aria-label="关闭菜单" @click="toggleMobileSidebar">
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
                  <Search :size="15" />
                  <span>搜索页面和操作</span>
                  <kbd>Ctrl K</kbd>
                </button>

                <nav class="admin-sidebar__nav">
                  <section
                    v-for="group in visibleMenuGroups"
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
                        :aria-current="activeKey === item.key ? 'page' : undefined"
                        :title="item.summary"
                        @click="handleMenuClick(item.key)"
                      >
                        <component :is="item.icon" :size="16" />
                        <span class="admin-nav-item__label">{{ item.label }}</span>
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

                  <button
                    class="admin-logout"
                    type="button"
                    aria-label="退出登录"
                    title="退出登录"
                    @click="handleLogout"
                  >
                    <LogOut :size="16" />
                  </button>
                </div>
              </aside>

              <div class="admin-main">
                <header class="mobile-header">
                  <n-button quaternary circle aria-label="打开菜单" @click="toggleMobileSidebar">
                    <template #icon>
                      <Menu :size="20" />
                    </template>
                  </n-button>

                  <div class="mobile-header__title">
                    <strong>{{ currentRouteMeta.label }}</strong>
                    <span>{{ currentRouteMeta.group }}</span>
                  </div>

                  <n-button quaternary circle aria-label="搜索" @click="openCommandPalette">
                    <template #icon>
                      <Search :size="18" />
                    </template>
                  </n-button>
                </header>

                <header class="workspace-toolbar">
                  <div class="workspace-toolbar__heading">
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

                  <!-- 页面级操作按钮通过 <Teleport to="#page-actions" defer> 放到这里 -->
                  <div id="page-actions" class="workspace-toolbar__actions"></div>
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
            :menu-items="visibleMenuItems"
            :search-api="adminApi.search"
          />
        </n-message-provider>
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>
