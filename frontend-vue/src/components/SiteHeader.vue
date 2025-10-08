<script setup>
import { useRouter } from 'vue-router'
import { 
  NLayoutHeader, NButton, NGradientText, NSpace
} from 'naive-ui'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToDashboard = () => {
  router.push('/dashboard')
}

const handleLogout = () => {
  userStore.logout()
}
</script>

<template>
  <n-layout-header bordered class="nav-header">
    <div class="container navbar">
      <div class="logo" @click="router.push('/')">
        <img src="@/assets/logo.svg" alt="LearnSphere Logo" class="logo-img" />
        <n-gradient-text type="primary" :size="24" weight="bold">
          LearnSphere AI
        </n-gradient-text>
      </div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/features">功能</router-link>
        <router-link to="/exams">考试</router-link>
        <router-link to="/pricing">价格</router-link>
      </div>
      <div class="nav-actions">
        <template v-if="!userStore.token">
          <n-button quaternary type="primary" @click="navigateToLogin">登录</n-button>
          <n-button type="primary" strong secondary @click="navigateToLogin">立即注册</n-button>
        </template>
        <template v-else>
          <n-space>
             <n-button secondary type="error" @click="handleLogout">退出登录</n-button>
          </n-space>
        </template>
      </div>
    </div>
  </n-layout-header>
</template>

<style scoped>
.nav-header {
  height: 64px;
  display: flex;
  align-items: center;
  background: transparent;
  backdrop-filter: blur(20px);
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
}
.nav-links a {
  margin: 0 16px;
  text-decoration: none;
  color: #a1a1aa;
  transition: color 0.3s;
  font-weight: 500;
}
.nav-links a:hover, .nav-links a.router-link-active {
  color: #fff;
}
.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-img {
  width: 32px;
  height: 32px;
}
@media (max-width: 768px) {
  .nav-links { display: none; }
}
</style>
