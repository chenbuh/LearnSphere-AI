<script setup>
import { computed } from 'vue'
import { NProgress } from 'naive-ui'

const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
})

const levelColor = (value, warnAt, dangerAt) => {
  if (value > dangerAt) return 'var(--danger)'
  if (value > warnAt) return 'var(--warn)'
  return 'var(--ok)'
}

const heapUsage = computed(() => Number(props.info.heapUsage) || 0)
const diskUsage = computed(() => Number(props.info.diskUsage) || 0)
const heapColor = computed(() => levelColor(heapUsage.value, 60, 80))
const diskColor = computed(() => levelColor(diskUsage.value, 70, 85))

const fmt = (value, unit) => (value === undefined || value === null || value === '' ? '-' : `${value} ${unit}`)
</script>

<template>
  <section class="ls-panel monitor-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">JVM 内存</h2>
    </header>
    <div class="ls-panel__body monitor-body">
      <div class="usage">
        <div class="usage__row">
          <span class="usage__label">堆内存使用率</span>
          <strong class="usage__value" :style="{ color: heapColor }">{{ heapUsage }}%</strong>
        </div>
        <n-progress
          type="line"
          :percentage="heapUsage"
          :color="heapColor"
          rail-color="var(--paper-sunken)"
          :height="8"
          :border-radius="4"
          :show-indicator="false"
        />
      </div>
      <dl class="kv">
        <div class="kv__row"><dt>堆已用</dt><dd>{{ fmt(info.heapUsed, 'MB') }}</dd></div>
        <div class="kv__row"><dt>堆上限</dt><dd>{{ fmt(info.heapMax, 'MB') }}</dd></div>
        <div class="kv__row"><dt>非堆已用</dt><dd>{{ fmt(info.nonHeapUsed, 'MB') }}</dd></div>
        <div v-if="info.heapCommitted != null" class="kv__row"><dt>堆已提交</dt><dd>{{ fmt(info.heapCommitted, 'MB') }}</dd></div>
        <div v-if="info.nonHeapCommitted != null" class="kv__row"><dt>非堆已提交</dt><dd>{{ fmt(info.nonHeapCommitted, 'MB') }}</dd></div>
      </dl>
    </div>
  </section>

  <section class="ls-panel monitor-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">磁盘 <span class="ls-panel__count">根分区</span></h2>
    </header>
    <div class="ls-panel__body monitor-body">
      <div class="usage">
        <div class="usage__row">
          <span class="usage__label">磁盘使用率</span>
          <strong class="usage__value" :style="{ color: diskColor }">{{ diskUsage }}%</strong>
        </div>
        <n-progress
          type="line"
          :percentage="diskUsage"
          :color="diskColor"
          rail-color="var(--paper-sunken)"
          :height="8"
          :border-radius="4"
          :show-indicator="false"
        />
      </div>
      <dl class="kv">
        <div class="kv__row"><dt>已用空间</dt><dd>{{ fmt(info.diskUsed, 'GB') }}</dd></div>
        <div class="kv__row"><dt>可用空间</dt><dd>{{ fmt(info.diskFree, 'GB') }}</dd></div>
        <div class="kv__row"><dt>总空间</dt><dd>{{ fmt(info.diskTotal, 'GB') }}</dd></div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.monitor-panel {
  display: flex;
  flex-direction: column;
}

.monitor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.usage {
  display: grid;
  gap: 8px;
}

.usage__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.usage__label {
  color: var(--ink-3);
  font-size: 12px;
}

.usage__value {
  font-size: 24px;
  font-weight: 650;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.kv {
  margin: 0;
  display: grid;
}

.kv__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  border-top: 1px solid var(--line);
  font-size: 13px;
}

.kv__row dt {
  color: var(--ink-3);
}

.kv__row dd {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
