<script setup>
</script>

<template>
  <header class="page-header">
    <div class="title-copy">
      <span class="eyebrow">系统设置</span>
      <h1>系统配置</h1>
      <p>修改系统设置、功能开关和 AI 配额。</p>
      <div class="meta-row">
        <span class="meta-pill">当前页面</span>
        <span class="meta-pill meta-pill--accent">高权限</span>
      </div>
    </div>
    <div class="header-note">
      <strong>保存前确认</strong>
      <span>本页变更会直接影响线上功能开关、AI 配额与系统公告，请保存前再次核对。</span>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: 28px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.title-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7ee6d8;
}

.page-header h1 {
  margin: 0;
  font-size: 1.95rem;
  font-weight: 800;
  color: #f8fafc;
}

.page-header p {
  margin: 0;
  color: #94a3b8;
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
  color: #7ee6d8;
  border-color: rgba(62, 207, 188, 0.22);
  background: rgba(62, 207, 188, 0.08);
}

.header-note {
  max-width: 420px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.44);
  border: 1px solid rgba(148, 163, 184, 0.12);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-note strong {
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 700;
}

.header-note span {
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.55;
}
</style>
