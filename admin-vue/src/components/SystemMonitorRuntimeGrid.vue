<script setup>
import { computed } from 'vue'

const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
})

const startTimeLabel = computed(() =>
  props.info.startTime ? new Date(props.info.startTime).toLocaleString() : '-'
)

const platformLabel = computed(() => {
  const { osName, osArch } = props.info
  if (!osName) return '-'
  return osArch ? `${osName} (${osArch})` : osName
})
</script>

<template>
  <section class="ls-panel monitor-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">运行环境</h2>
    </header>
    <div class="ls-panel__body monitor-body">
      <dl class="kv">
        <div class="kv__row"><dt>Java 版本</dt><dd>{{ info.javaVersion || '-' }}</dd></div>
        <div class="kv__row"><dt>虚拟机</dt><dd :title="info.jvmName">{{ info.jvmName || '-' }}</dd></div>
        <div class="kv__row"><dt>主机平台</dt><dd :title="platformLabel">{{ platformLabel }}</dd></div>
        <div class="kv__row"><dt>启动时间</dt><dd>{{ startTimeLabel }}</dd></div>
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
}

.kv {
  margin: 0;
  display: grid;
}

.kv__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 36px;
  font-size: 13px;
}

.kv__row + .kv__row {
  border-top: 1px solid var(--line);
}

.kv__row dt {
  flex-shrink: 0;
  color: var(--ink-3);
}

.kv__row dd {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--ink);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
