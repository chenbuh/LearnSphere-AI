<script setup>
import { ShieldAlert } from 'lucide-vue-next'
</script>

<template>
  <header class="page-header">
    <div class="header-left">
      <div class="header-icon">
        <ShieldAlert :size="28" />
      </div>
      <div>
        <h1>敏感内容审计</h1>
        <p>监控并管理系统检测到的敏感内容尝试</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  padding: 8px;
  color: rgb(239, 68, 68);
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.2);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
}

.page-header p {
  color: #71717a;
}
</style>
