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
      <div class="label">JAVA VERSION</div>
      <div class="value value-indigo">{{ info.javaVersion }}</div>
    </div>
    <div class="info-pill">
      <div class="label">JVM NAME</div>
      <div class="value value-default truncate" :title="info.jvmName">{{ info.jvmName }}</div>
    </div>
    <div class="info-pill">
      <div class="label">OS ARCH</div>
      <div class="value value-default">{{ info.osName }} ({{ info.osArch }})</div>
    </div>
    <div class="info-pill">
      <div class="label">START TIME</div>
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
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.label {
  margin-bottom: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--n-text-color-3);
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
