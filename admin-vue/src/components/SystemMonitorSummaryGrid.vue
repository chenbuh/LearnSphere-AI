<script setup>
import { computed } from 'vue'
import { Clock, Cpu, Layers, Zap } from 'lucide-vue-next'

const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  },
  uptimeLabel: {
    type: String,
    default: '-'
  }
})

// Show the two most significant units (e.g. "2天 3小时", "5小时 12分") instead of days only.
const uptimeDisplay = computed(() => {
  const ms = Number(props.info.uptime)
  if (!ms) return props.uptimeLabel
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}天 ${hours % 24}小时`
  if (hours > 0) return `${hours}小时 ${minutes % 60}分`
  return `${minutes}分`
})

const loadDisplay = computed(() => {
  const load = Number(props.info.systemLoad)
  return Number.isFinite(load) && load >= 0 ? load.toFixed(2) : 'N/A'
})
</script>

<template>
  <section class="ls-stats" aria-label="运行摘要">
    <div class="ls-stat">
      <span class="ls-stat__label"><Cpu :size="14" />CPU 核心数</span>
      <strong class="ls-stat__value">{{ info.processors ?? '-' }}<small>核</small></strong>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><Zap :size="14" />系统负载</span>
      <strong class="ls-stat__value">{{ loadDisplay }}</strong>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><Layers :size="14" />活跃线程</span>
      <strong class="ls-stat__value">{{ info.threadCount ?? '-' }}</strong>
      <span v-if="info.daemonThreadCount != null" class="ls-stat__hint"
        >守护 {{ info.daemonThreadCount }}</span
      >
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><Clock :size="14" />运行时长</span>
      <strong class="ls-stat__value">{{ uptimeDisplay }}</strong>
    </div>
  </section>
</template>

<style scoped>
/* Cells stretch to the tallest one; keep label/value pinned to the top so every cell shares one baseline. */
</style>
