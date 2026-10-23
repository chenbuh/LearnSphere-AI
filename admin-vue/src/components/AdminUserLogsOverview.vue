<script setup>
import { Activity, Globe, Smartphone, Users } from 'lucide-vue-next'

defineProps({
  stats: {
    type: Object,
    default: () => ({})
  },
  uniqueIps: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  mobileRate: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <section class="ls-stats" aria-label="用户日志摘要">
    <div class="ls-stat">
      <span class="ls-stat__label"><Activity :size="14" />总日志数</span>
      <strong class="ls-stat__value">{{ stats.totalLogs || 0 }}</strong>
      <span class="ls-stat__hint">全部记录</span>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><Globe :size="14" />独立 IP</span>
      <strong class="ls-stat__value">{{ uniqueIps }}</strong>
      <span class="ls-stat__hint">本页统计</span>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><Users :size="14" />活跃用户</span>
      <strong class="ls-stat__value">{{ activeUsers }}</strong>
      <span class="ls-stat__hint">本页统计</span>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><Smartphone :size="14" />移动端占比</span>
      <strong class="ls-stat__value">{{ mobileRate }}<small>%</small></strong>
      <span class="ls-stat__hint">本页统计</span>
    </div>
  </section>
</template>
