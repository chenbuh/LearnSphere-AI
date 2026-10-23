<script setup>
import { Activity, CheckCircle2, ShieldAlert, Users, Layers3 } from 'lucide-vue-next'

defineProps({
  total: {
    type: Number,
    default: 0
  },
  currentCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  operatorCount: {
    type: Number,
    default: 0
  },
  moduleCount: {
    type: Number,
    default: 0
  },
  keyword: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <section class="ls-stats" aria-label="日志摘要">
    <div class="ls-stat">
      <span class="ls-stat__label"><Activity :size="14" />总记录数</span>
      <strong class="ls-stat__value">{{ total }}</strong>
      <span class="ls-stat__hint">{{ keyword ? `关键词“${keyword}”` : '全部日志' }}</span>
    </div>
    <div class="ls-stat ls-stat--ok">
      <span class="ls-stat__label"><CheckCircle2 :size="14" />本页成功</span>
      <strong class="ls-stat__value">{{ successCount }}<small>/ {{ currentCount }}</small></strong>
    </div>
    <div class="ls-stat" :class="{ 'ls-stat--danger': failureCount > 0 }">
      <span class="ls-stat__label"><ShieldAlert :size="14" />本页失败</span>
      <strong class="ls-stat__value">{{ failureCount }}</strong>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><Users :size="14" />本页操作人</span>
      <strong class="ls-stat__value">{{ operatorCount }}</strong>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><Layers3 :size="14" />本页模块</span>
      <strong class="ls-stat__value">{{ moduleCount }}</strong>
    </div>
  </section>
</template>
