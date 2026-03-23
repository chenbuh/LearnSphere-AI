<script setup>
defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div class="runtime-grid">
    <div class="info-pill">
      <div class="label">运行版本</div>
      <div class="meta">Java 环境</div>
      <div class="value value-indigo">{{ info.javaVersion }}</div>
    </div>
    <div class="info-pill">
      <div class="label">JVM 信息</div>
      <div class="meta">虚拟机</div>
      <div class="value value-default truncate" :title="info.jvmName">{{ info.jvmName }}</div>
    </div>
    <div class="info-pill">
      <div class="label">主机平台</div>
      <div class="meta">系统 / 架构</div>
      <div class="value value-default">{{ info.osName }} ({{ info.osArch }})</div>
    </div>
    <div class="info-pill">
      <div class="label">启动时间</div>
      <div class="meta">服务启动</div>
      <div class="value value-amber">
        {{ info.startTime ? new Date(info.startTime).toLocaleString() : '-' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.runtime-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 16px;
}

@media (min-width: 768px) {
  .runtime-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .runtime-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.info-pill {
  padding: 16px 20px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(12, 18, 28, 0.84);
}

.label {
  margin-bottom: 4px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e2e8f0;
}

.meta {
  margin-bottom: 10px;
  font-size: 0.72rem;
  color: #7c8799;
}

.value {
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.value-default {
  color: rgb(212, 212, 216);
}

.value-indigo {
  color: rgb(165, 180, 252);
}

.value-amber {
  color: rgb(252, 211, 77);
}
</style>
