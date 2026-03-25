<script setup>
import { h, ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NIcon, NText, NAvatar, NDropdown, NDrawer, NDrawerContent, NButton } from 'naive-ui'
import {
  BookOpen, Home, BarChart2, MessageSquare, Settings, LogOut, User, Bell, Headphones, RotateCw, CheckSquare, Menu as MenuIcon, Trophy, FileText,
  Flame, Sparkles, SunMedium, MoonStar
} from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { useThemeStore } from '@/stores/theme'
import QuotaDisplay from '@/components/QuotaDisplay.vue'
import NotificationBell from '@/components/notifications/NotificationBell.vue'
import { useI18n } from 'vue-i18n'
import logoDarkSrc from '@/assets/logo.svg'
import logoLightSrc from '@/assets/logo-light.svg'

const userStore = useUserStore()
const themeStore = useThemeStore()
const collapsed = ref(false)
const route = useRoute()
const router = useRouter()
const isMobile = ref(false)
const showMobileMenu = ref(false)
const layoutHeaderRef = ref(null)
const layoutHeaderHeight = ref(64)
const { t } = useI18n()

let headerResizeObserver = null

const routeTitleKeyMap = {
  Dashboard: 'menu.dashboard',
  Vocabulary: 'menu.vocabulary',
  VocabularyNew: 'menu.vocabulary',
  VocabularyTest: 'menu.vocabularyTest',
  Review: 'menu.review',
  DailyTasks: 'menu.dailyTasks',
  DailyPlan: 'menu.dailyTasks',
  StudyPlanCreate: 'menu.dailyTasks',
  Grammar: 'menu.grammar',
  Listening: 'menu.listening',
  Speaking: 'menu.speaking',
  Reading: 'menu.reading',
  Writing: 'menu.writing',
  MockExam: 'menu.mockExam',
  Analysis: 'menu.analysis',
  ErrorBook: 'menu.errorBook',
  AnswerHistory: 'menu.answerHistory',
  Notifications: 'menu.notifications',
  SpeakingMock: 'menu.speaking',
  Profile: 'menu.profile',
  Settings: 'menu.settings',
  LearningHub: 'menu.learningHub'
}

// 响应式检测
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    collapsed.value = true
  } else {
    collapsed.value = false
    showMobileMenu.value = false
  }

  nextTick(() => {
    syncHeaderHeight()
  })
}

onMounted(() => {
  checkMobile()
  nextTick(() => {
    syncHeaderHeight()
    observeHeaderHeight()
  })
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  headerResizeObserver?.disconnect()
  headerResizeObserver = null
})

const resolveHeaderElement = () => layoutHeaderRef.value?.$el || layoutHeaderRef.value || null

const syncHeaderHeight = () => {
  const headerEl = resolveHeaderElement()
  if (!headerEl) {
    return
  }

  layoutHeaderHeight.value = Math.max(64, Math.ceil(headerEl.getBoundingClientRect().height))
}

const observeHeaderHeight = () => {
  const headerEl = resolveHeaderElement()
  if (!headerEl || typeof ResizeObserver === 'undefined') {
    return
  }

  headerResizeObserver?.disconnect()
  headerResizeObserver = new ResizeObserver(() => {
    syncHeaderHeight()
  })
  headerResizeObserver.observe(headerEl)
}

const renderIcon = (icon) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed(() => [
  {
    label: () => h(RouterLink, { to: '/app/dashboard' }, { default: () => t('menu.dashboard') }),
    key: 'dashboard',
    icon: renderIcon(Home)
  },
  {
    label: () => h(RouterLink, { to: '/vocabulary' }, { default: () => t('menu.vocabulary') }),
    key: 'vocabulary',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/vocabulary-test' }, { default: () => t('menu.vocabularyTest') }),
    key: 'vocabulary-test',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/review' }, { default: () => t('menu.review') }),
    key: 'review',
    icon: renderIcon(RotateCw)
  },
  {
    label: () => h(RouterLink, { to: '/daily-tasks' }, { default: () => t('menu.dailyTasks') }),
    key: 'daily-tasks',
    icon: renderIcon(CheckSquare)
  },
  {
    label: () => h(RouterLink, { to: '/grammar' }, { default: () => t('menu.grammar') }),
    key: 'grammar',
    icon: renderIcon(MessageSquare)
  },
  {
    label: () => h(RouterLink, { to: '/listening' }, { default: () => t('menu.listening') }),
    key: 'listening',
    icon: renderIcon(Headphones)
  },
  {
    label: () => h(RouterLink, { to: '/speaking' }, { default: () => t('menu.speaking') }),
    key: 'speaking',
    icon: renderIcon(MessageSquare)
  },
  {
    label: () => h(RouterLink, { to: '/reading' }, { default: () => t('menu.reading') }),
    key: 'reading',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/writing' }, { default: () => t('menu.writing') }),
    key: 'writing',
    icon: renderIcon(MessageSquare)
  },
  {
    label: () => h(RouterLink, { to: '/mock-exam' }, { default: () => t('menu.mockExam') }),
    key: 'mock-exam',
    icon: renderIcon(BarChart2)
  },
  {
    label: () => h(RouterLink, { to: '/learning-hub' }, { default: () => t('menu.learningHub') }),
    key: 'learning-hub',
    icon: renderIcon(Sparkles)
  },
  {
    label: () => h(RouterLink, { to: '/analysis' }, { default: () => t('menu.analysis') }),
    key: 'analysis',
    icon: renderIcon(BarChart2)
  },
  {
    label: () => h(RouterLink, { to: '/error-book' }, { default: () => t('menu.errorBook') }),
    key: 'error-book',
    icon: renderIcon(BookOpen)
  },
  {
    label: () => h(RouterLink, { to: '/answer-history' }, { default: () => t('menu.answerHistory') }),
    key: 'answer-history',
    icon: renderIcon(FileText)
  },
  {
    label: () => h(RouterLink, { to: '/notifications' }, { default: () => t('menu.notifications') }),
    key: 'notifications',
    icon: renderIcon(Bell)
  },
  {
    label: () => h(RouterLink, { to: '/profile' }, { default: () => t('menu.profile') }),
    key: 'profile',
    icon: renderIcon(User)
  },
  {
    label: () => h(RouterLink, { to: '/settings' }, { default: () => t('menu.settings') }),
    key: 'settings',
    icon: renderIcon(Settings)
  }
])

const userOptions = computed(() => [
  { label: t('menu.profile'), key: 'profile', icon: renderIcon(User) },
  { label: t('menu.logout'), key: 'logout', icon: renderIcon(LogOut) }
])

const currentRouteTitle = computed(() => {
  const routeName = route.name ? String(route.name) : ''
  const titleKey = routeTitleKeyMap[routeName]
  if (titleKey) {
    return t(titleKey)
  }
  const fallbackTitle = route.meta?.title
  if (typeof fallbackTitle === 'string' && fallbackTitle.trim()) {
    return fallbackTitle
  }
  return 'LearnSphere AI'
})

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

const logoSrc = computed(() => (themeStore.isLight ? logoLightSrc : logoDarkSrc))

const layoutCssVars = computed(() => ({
  '--layout-header-height': `${layoutHeaderHeight.value}px`
}))

const mobileDrawerWidth = computed(() => (
  isMobile.value ? 'min(86vw, 296px)' : 280
))

const contentStyle = computed(() => (
  isMobile.value
    ? 'padding: 12px max(12px, env(safe-area-inset-right)) calc(20px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));'
    : 'padding: 24px 24px 32px;'
))

const setTheme = (mode) => {
  themeStore.setTheme(mode)
}
</script>

<template>
  <n-layout has-sider class="layout-container" :style="layoutCssVars">
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
        <img :src="logoSrc" alt="LearnSphere Logo" class="logo-side-img" />
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
    <n-drawer v-model:show="showMobileMenu" :width="mobileDrawerWidth" placement="left" class="mobile-drawer">
      <n-drawer-content body-content-style="padding: 0;" class="mobile-drawer-content">
        <div class="logo mobile-logo">
          <img :src="logoSrc" alt="LearnSphere Logo" class="logo-side-img" />
          <span class="logo-text">LearnSphere</span>
        </div>
        <n-menu
          class="mobile-drawer-menu"
          :options="menuOptions"
          :value="activeKey"
          @update:value="handleMenuUpdate"
        />
      </n-drawer-content>
    </n-drawer>

    <n-layout>
      <n-layout-header ref="layoutHeaderRef" bordered class="header">
        <div class="header-left">
           <!-- 移动端汉堡按钮 -->
           <n-button v-if="isMobile" secondary class="mobile-menu-toggle" @click="showMobileMenu = true">
             <n-icon size="22"><MenuIcon /></n-icon>
           </n-button>
           <h3>{{ currentRouteTitle }}</h3>
        </div>
        <div class="header-right">
          <div v-if="isMobile" class="mobile-header-meta">
            <QuotaDisplay />
          </div>
          <QuotaDisplay v-else class="desktop-header-quota" />
          <div class="theme-switch" :aria-label="t('theme.switch')">
            <button
              type="button"
              class="theme-switch__option"
              :class="{ 'is-active': themeStore.isLight }"
              :title="t('theme.toggleToLight')"
              @click="setTheme('light')"
            >
              <SunMedium :size="15" />
              <span v-if="!isMobile">{{ t('theme.light') }}</span>
            </button>
            <button
              type="button"
              class="theme-switch__option"
              :class="{ 'is-active': themeStore.isDark }"
              :title="t('theme.toggleToDark')"
              @click="setTheme('dark')"
            >
              <MoonStar :size="15" />
              <span v-if="!isMobile">{{ t('theme.dark') }}</span>
            </button>
          </div>
          <NotificationBell :is-mobile="isMobile" />
          <n-dropdown :options="userOptions" @select="handleUserSelect">
            <div class="user-profile">
              <n-avatar round size="small" :src="userStore.avatar">
                <n-icon :component="User" />
              </n-avatar>
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
      <n-layout-content
        embedded
        :native-scrollbar="true"
        :content-style="contentStyle"
        class="main-content"
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  overflow: hidden; /* 核心：锁定视口，防止出现 body 滚动条 */
}

.layout-container > :deep(.n-layout) {
  min-height: 0;
}

.layout-container :deep(.n-layout-sider),
.layout-container :deep(.n-layout-sider-scroll-container) {
  background: var(--sidebar-bg) !important;
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
  border-bottom: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
}

:global(html[data-theme='light'] .logo) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(244, 247, 251, 0.9));
  box-shadow: inset 0 -1px 0 rgba(203, 213, 225, 0.72);
}

.mobile-logo {
  background-color: var(--n-color);
}

.mobile-drawer-menu {
  padding: 10px 8px 14px;
}

.mobile-header-meta {
  display: flex;
  align-items: center;
  min-width: 0;
}

.layout-container :deep(.n-drawer-content),
.layout-container :deep(.n-drawer-body-content-wrapper) {
  background: var(--card-bg);
  color: var(--text-color);
}

.layout-container :deep(.n-drawer-body-content-wrapper) {
  display: flex;
  flex-direction: column;
}

.logo-side-img {
  width: 28px;
  height: 28px;
}

.header {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-width: 0;
  padding: 0 24px;
  background: var(--header-bg);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--card-border);
  box-shadow: 0 10px 24px -18px var(--shadow-color);
}

@media (max-width: 768px) {
  .header {
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
  }
}

.main-content {
  min-height: 0;
  height: calc(100vh - var(--layout-header-height, 64px));
  height: calc(100dvh - var(--layout-header-height, 64px));
  /* 移除这里的 overflow，由 n-layout-content 的内部容器处理 */
}

.main-content :deep(.n-layout-scroll-container) {
  min-height: 0;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
  flex: 0 1 auto;
}

.desktop-header-quota {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  row-gap: 8px;
  gap: 10px;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
}

.desktop-header-quota :deep(.quota-badge) {
  flex-shrink: 0;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--card-border);
  box-shadow: 0 12px 22px -18px var(--shadow-color);
  cursor: pointer;
  color: var(--secondary-text);
  flex-shrink: 0;
  transition:
    background-color 0.24s ease,
    color 0.24s ease,
    border-color 0.24s ease,
    transform 0.24s ease;
}

.icon-btn:hover {
  color: var(--text-color);
  transform: translateY(-1px);
}

.theme-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--card-border);
  box-shadow: 0 14px 24px -18px var(--shadow-color);
  flex-shrink: 0;
}

.theme-switch__option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--secondary-text);
  cursor: pointer;
  transition:
    background-color 0.24s ease,
    color 0.24s ease,
    transform 0.24s ease;
}

.theme-switch__option:hover {
  color: var(--text-color);
}

.theme-switch__option.is-active {
  background: var(--surface-raised);
  color: var(--text-color);
  box-shadow: 0 12px 22px -18px var(--shadow-color);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  flex-shrink: 0;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.2s;
}

.user-profile:hover {
  background: var(--card-border);
  transform: translateY(-1px);
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
  min-width: 0;
  flex: 1 1 auto;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
  line-height: 1;
  color: var(--text-color);
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(html[data-theme='light'] .logo-text),
:global(html[data-theme='light'] .header-left h3) {
  color: #182132;
}

:global(html[data-theme='light'] .mobile-logo) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 251, 0.96));
  box-shadow: inset 0 -1px 0 rgba(203, 213, 225, 0.72);
}

:global(html[data-theme='light'] .header) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 249, 252, 0.95));
  border-bottom-color: rgba(203, 213, 225, 0.88);
  box-shadow: 0 16px 30px -24px rgba(15, 23, 42, 0.18);
}

:global(html[data-theme='light'] .icon-btn) {
  color: #475569;
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(203, 213, 225, 0.88);
}

:global(html[data-theme='light'] .icon-btn:hover) {
  background: rgba(239, 246, 255, 0.96);
  border-color: rgba(148, 163, 184, 0.52);
}

:global(html[data-theme='light'] .theme-switch) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(241, 245, 249, 0.92));
  border-color: rgba(203, 213, 225, 0.9);
  box-shadow: 0 12px 24px -18px rgba(15, 23, 42, 0.14);
}

:global(html[data-theme='light'] .theme-switch__option) {
  color: #64748b;
}

:global(html[data-theme='light'] .theme-switch__option:hover),
:global(html[data-theme='light'] .theme-switch__option.is-active) {
  color: #182132;
}

:global(html[data-theme='light'] .theme-switch__option.is-active) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.98));
  box-shadow:
    inset 0 0 0 1px rgba(226, 232, 240, 0.92),
    0 10px 20px -16px rgba(15, 23, 42, 0.22);
}

:global(html[data-theme='light'] .user-profile) {
  background: rgba(255, 255, 255, 0.74);
  border-color: rgba(226, 232, 240, 0.88);
}

:global(html[data-theme='light'] .user-profile:hover) {
  background: rgba(238, 242, 255, 0.8);
  border-color: rgba(165, 180, 252, 0.34);
}

:global(html[data-theme='light'] .mobile-menu-toggle) {
  background: rgba(255, 255, 255, 0.94) !important;
  border-color: rgba(203, 213, 225, 0.88) !important;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .mobile-menu-toggle:hover) {
  background: rgba(238, 242, 255, 0.98) !important;
  border-color: rgba(99, 102, 241, 0.26) !important;
}

:global(html[data-theme='light'] .mobile-menu-toggle .n-icon) {
  color: #475569 !important;
}

:global(html[data-theme='light'] .mobile-drawer .n-drawer-content),
:global(html[data-theme='light'] .mobile-drawer .n-drawer-body-content-wrapper) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
}

:global(html[data-theme='light'] .mobile-drawer-menu .n-menu-item-content) {
  border-radius: 14px;
}

:global(html[data-theme='light'] .mobile-drawer-menu .n-menu-item-content:hover) {
  background: rgba(239, 246, 255, 0.86);
}

@media (max-width: 1440px) {
  .header {
    padding: 0 18px;
  }

  .header-right {
    gap: 10px;
  }

  .theme-switch__option {
    min-width: 36px;
    padding: 0 10px;
    justify-content: center;
  }

  .theme-switch__option span {
    display: none;
  }
}

@media (max-width: 1180px) {
  .header {
    height: auto;
    min-height: 64px;
    padding: 10px 18px;
  }

  .header-right {
    flex-wrap: wrap;
    row-gap: 8px;
  }

  .desktop-header-quota {
    flex: 1 0 100%;
    justify-content: flex-start;
  }

  .header-right {
    gap: 10px;
  }

  .icon-btn {
    display: none;
  }
}

@media (max-width: 768px) {
  .layout-container {
    height: 100dvh;
  }

  .header {
    height: auto;
    min-height: 64px;
    padding: 10px 12px;
    gap: 10px;
  }

  .header-left {
    flex: 1;
    min-width: 0;
  }

  .header-left h3 {
    font-size: 15px;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-right {
    gap: 10px;
    max-width: none;
    min-width: 0;
    margin-left: auto;
  }

  .theme-switch {
    flex-shrink: 0;
    min-width: 82px;
    padding: 3px;
  }

  .theme-switch__option {
    min-width: 36px;
    min-height: 32px;
    justify-content: center;
    padding: 0 10px;
  }

  .user-profile {
    padding: 2px 4px;
  }

  .main-content {
    height: calc(100dvh - 64px);
  }
}

@media (max-width: 480px) {
  .logo {
    height: 56px;
  }

  .logo-text {
    font-size: 1rem;
  }

  .header {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(10px, env(safe-area-inset-right));
    gap: 8px;
  }

  .header-right {
    max-width: none;
    gap: 8px;
  }

  .mobile-drawer-menu {
    padding: 8px max(8px, env(safe-area-inset-left)) calc(12px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-right));
  }

  .mobile-header-meta {
    flex: 1 1 auto;
    justify-content: flex-end;
    overflow: hidden;
  }

  .theme-switch {
    min-width: 76px;
  }

  .theme-switch__option {
    min-width: 34px;
    padding: 0 8px;
  }

  .mobile-menu-toggle {
    margin-right: 4px;
    min-width: 36px;
    width: 36px;
    height: 36px;
    padding: 0;
  }
}

@media (max-width: 360px) {
  .header {
    padding-top: 7px;
    padding-bottom: 7px;
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
    gap: 6px;
    flex-wrap: wrap;
  }

  .header-left,
  .header-right {
    width: 100%;
  }

  .header-left h3 {
    font-size: 14px;
    line-height: 1.25;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .header-right {
    gap: 6px;
    justify-content: space-between;
  }

  .theme-switch {
    min-width: 72px;
  }

  .theme-switch__option {
    min-width: 32px;
    min-height: 30px;
    padding: 0 6px;
  }

  .mobile-menu-toggle {
    margin-right: 2px;
    min-width: 34px;
    width: 34px;
    height: 34px;
  }

  .mobile-header-meta {
    min-width: 0;
    flex: 1 1 auto;
  }

  .mobile-header-meta :deep(.quota-badge) {
    min-width: 0;
    max-width: 100%;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .header {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .mobile-drawer-menu {
    padding-bottom: calc(10px + env(safe-area-inset-bottom));
  }
}

</style>

