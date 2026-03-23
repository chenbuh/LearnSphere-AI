<script setup>
import { NLayoutFooter } from 'naive-ui'
</script>

<template>
  <n-layout-footer bordered class="footer">
    <div class="container text-center">
      <p>© 2026 LearnSphere AI. All Rights Reserved.</p>
    </div>
  </n-layout-footer>
</template>

<style scoped>
.footer {
  padding: 40px 0;
  color: var(--secondary-text);
  border-top: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.02);
}

:global(html[data-theme='light'] .footer) {
  background: rgba(255, 255, 255, 0.56);
}
</style>
