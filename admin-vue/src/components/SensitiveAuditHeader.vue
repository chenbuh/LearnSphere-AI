<script setup>
import { ShieldAlert } from 'lucide-vue-next'
</script>

<template>
  <header class="page-header">
    <div class="header-left">
      <div class="header-icon">
        <ShieldAlert :size="28" />
      </div>
      <div class="header-copy">
        <span class="eyebrow">内容审计</span>
        <h1>敏感内容审计</h1>
        <p>查看系统识别到的敏感内容记录，并处理拦截、复核和处置结果。</p>
        <div class="meta-row">
          <span class="meta-pill">风险记录</span>
          <span class="meta-pill meta-pill--accent">待复核内容</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(248, 113, 113);
  border-radius: 16px;
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(248, 113, 113, 0.18);
  box-shadow: 0 18px 36px rgba(28, 8, 8, 0.18);
}

.header-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #fda4af;
}

.page-header h1 {
  margin: 0;
  font-size: 1.82rem;
  font-weight: 800;
  color: #f8fafc;
}

.page-header p {
  margin: 0;
  max-width: 50ch;
  color: #94a3b8;
  line-height: 1.55;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 600;
}

.meta-pill--accent {
  color: #fda4af;
  border-color: rgba(248, 113, 113, 0.2);
  background: rgba(248, 113, 113, 0.08);
}
</style>
