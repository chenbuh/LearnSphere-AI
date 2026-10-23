<script setup>
import { NLayoutFooter } from 'naive-ui'
</script>

<template>
  <n-layout-footer class="footer">
    <div class="container footer-inner">
      <span class="footer-brand">LearnSphere</span>
      <span>© 2026 LearnSphere · 英语备考与日常练习</span>
    </div>
  </n-layout-footer>
</template>

<style scoped>
.footer {
  padding: 28px 0;
  color: var(--secondary-text);
  font-size: 13px;
  border-top: 1px solid var(--card-border);
  background: transparent;
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.footer-brand {
  font-weight: 600;
  color: var(--text-color);
}
</style>
