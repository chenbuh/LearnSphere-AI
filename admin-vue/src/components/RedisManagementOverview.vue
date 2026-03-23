<script setup>
import { Activity, Cpu, Database, Info, Search } from 'lucide-vue-next'
import { NButton, NCard, NGrid, NGridItem, NIcon, NInput, NSpace, NStatistic } from 'naive-ui'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  searchPattern: {
    type: String,
    default: '*'
  }
})

const emit = defineEmits(['update:search-pattern', 'search'])
</script>

<template>
  <div class="overview-wrap">
    <n-grid :cols="4" :x-gap="24" class="overview-grid">
      <n-grid-item>
        <n-card :bordered="false" class="main-card chart-card">
          <div class="panel-header">
            <span class="eyebrow">内存趋势</span>
            <h3>Redis 内存趋势</h3>
          </div>
          <slot name="memory-chart" />
        </n-card>
      </n-grid-item>

      <n-grid-item :span="3">
        <n-grid :cols="3" :x-gap="24" class="h-full">
          <n-grid-item>
            <n-card class="main-card stat-card" :bordered="false">
              <div class="metric-head">
                <span>当前活动 Key 总数</span>
                <Database :size="18" class="text-indigo-400" />
              </div>
              <n-statistic value="842" />
              <p>用于判断当前扫描范围的键规模和缓存活跃度。</p>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="main-card stat-card" :bordered="false">
              <div class="metric-head">
                <span>缓存命中率</span>
                <Activity :size="18" class="text-emerald-400" />
              </div>
              <n-statistic value="94.2%" />
              <p>命中率稳定时，检索和写入波动通常更容易控制。</p>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="main-card stat-card" :bordered="false">
              <div class="metric-head">
                <span>QPS</span>
                <Cpu :size="18" class="text-amber-400" />
              </div>
              <n-statistic value="1,245" />
              <p>辅助判断是否需要收窄扫描模式，避免生产环境波峰检索。</p>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-grid-item>
    </n-grid>

    <n-card class="search-card">
      <n-space vertical>
        <div class="search-copy">
          <span class="eyebrow">键检索</span>
          <h3>检索 Redis Key</h3>
          <p>支持通配符匹配，建议优先按业务前缀收窄搜索范围。</p>
        </div>
        <div class="search-row">
          <n-input
            :value="searchPattern"
            placeholder="输入键名模式，如: ai:cache:* 或 metrics:*"
            style="flex: 1"
            @update:value="emit('update:search-pattern', $event)"
            @keyup.enter="emit('search')"
          >
            <template #prefix>
              <n-icon :component="Search" style="opacity: 0.4" />
            </template>
          </n-input>
          <n-button type="primary" :loading="loading" @click="emit('search')">检索</n-button>
        </div>
        <div class="tip-row">
          <n-icon :component="Info" :size="12" />
          <span>支持通配符 *，默认检索所有键。生产环境建议缩小范围进行扫描。</span>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.overview-grid {
  margin-bottom: 24px;
}

.main-card {
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.18);
}

.chart-card,
.stat-card {
  height: 100%;
}

.panel-header,
.search-copy {
  margin-bottom: 14px;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 6px;
  color: #7ee6d8;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.panel-header h3,
.search-copy h3 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.02rem;
  font-weight: 700;
}

.search-copy p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.84rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.stat-card p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.55;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.18);
}

.search-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tip-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}
</style>
