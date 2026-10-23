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
          <button
            v-if="isMobile"
            type="button"
            class="theme-toggle-mobile"
            :title="themeStore.isLight ? t('theme.toggleToDark') : t('theme.toggleToLight')"
            :aria-label="t('theme.switch')"
            @click="setTheme(themeStore.isLight ? 'dark' : 'light')"
          >
            <MoonStar v-if="themeStore.isLight" :size="16" />
            <SunMedium v-else :size="16" />
          </button>
          <div v-else class="theme-switch" :aria-label="t('theme.switch')">
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
                <span class="username" :class="{ 'username--vip': userStore.isVip() }">
                  {{ userStore.username }}
                </span>
                <span v-if="userStore.isVip()" class="vip-badge-pill">会员</span>
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
  color: var(--text-color);
  border-bottom: 1px solid var(--card-border);
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
  border-bottom: 1px solid var(--card-border);
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
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--card-border);
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
  background: var(--surface-muted);
}

.theme-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  border: 1px solid var(--card-border);
  flex-shrink: 0;
}

.theme-switch__option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: var(--radius-sm);
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
  box-shadow: 0 0 0 1px var(--card-border);
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
  background: var(--surface-muted);
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.mobile-menu-toggle {
  margin-right: 8px;
  padding: 6px 10px;
  background: transparent !important;
  border: 1px solid var(--card-border) !important;
  border-radius: var(--radius-md);
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-toggle:hover {
  background: var(--surface-muted) !important;
}

.mobile-menu-toggle .n-icon {
  color: var(--text-color) !important;
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

.theme-toggle-mobile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  color: var(--text-color);
  cursor: pointer;
}

@media (max-width: 768px) {
  .layout-container {
    height: 100dvh;
  }

  .header {
    height: 56px;
    min-height: 56px;
    flex-wrap: nowrap;
    padding: 0 max(12px, env(safe-area-inset-right)) 0 max(12px, env(safe-area-inset-left));
    gap: 8px;
  }

  .header-left {
    flex: 1 1 auto;
    min-width: 0;
    gap: 6px;
  }

  .header-left h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-right {
    flex: 0 0 auto;
    gap: 6px;
    max-width: none;
    margin-left: 0;
  }

  .mobile-header-meta {
    display: flex;
    min-width: 0;
  }

  /* 手机端只保留内容配额，助教配额在助教页内查看 */
  .mobile-header-meta :deep(.tutor-badge) {
    display: none;
  }

  .mobile-menu-toggle {
    min-width: 34px;
    width: 34px;
    height: 34px;
    padding: 0;
  }

  .user-profile {
    padding: 0;
  }

  .main-content {
    height: calc(100dvh - 56px);
  }

  .mobile-drawer-menu {
    padding: 8px max(8px, env(safe-area-inset-left)) calc(12px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-right));
  }
}

@media (max-width: 360px) {
  .header {
    padding: 0 8px;
    gap: 4px;
  }

  .header-left h3 {
    font-size: 15px;
  }

  .mobile-header-meta {
    display: none;
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

/* 现代化科技侧边栏与菜单胶囊微动效 */
.layout-container :deep(.n-layout-sider) {
  border-right: 1px solid var(--card-border) !important;
}

.layout-container :deep(.n-menu .n-menu-item) {
  margin: 2px 8px;
}

.layout-container :deep(.n-menu .n-menu-item-content) {
  border-radius: var(--radius-md);
  padding: 0 12px !important;
}

.layout-container :deep(.n-menu .n-menu-item-content:hover) {
  background: var(--surface-muted) !important;
}

.layout-container :deep(.n-menu .n-menu-item-content.n-menu-item-content--selected) {
  background: var(--brand-soft) !important;
}

.layout-container :deep(.n-menu .n-menu-item-content.n-menu-item-content--selected .n-menu-item-content-header),
.layout-container :deep(.n-menu .n-menu-item-content.n-menu-item-content--selected a),
.layout-container :deep(.n-menu .n-menu-item-content.n-menu-item-content--selected .n-icon) {
  color: var(--brand) !important;
  font-weight: 600;
}

.username--vip {
  font-weight: 600;
}

.vip-badge-pill {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  background: rgba(180, 84, 58, 0.1);
  color: var(--accent-warm);
  border: 1px solid rgba(180, 84, 58, 0.25);
  display: inline-block;
  align-self: flex-start;
}

</style>

