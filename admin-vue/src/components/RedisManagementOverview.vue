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
          <slot name="memory-chart" />
        </n-card>
      </n-grid-item>

      <n-grid-item :span="3">
        <n-grid :cols="3" :x-gap="24" class="h-full">
          <n-grid-item>
            <n-card class="main-card stat-card" :bordered="false">
              <div class="stat-center">
                <n-statistic label="当前活动 Key 总数" value="842" style="text-align: center;">
                  <template #prefix>
                    <Database :size="20" class="text-indigo-400 mr-2" />
                  </template>
                </n-statistic>
              </div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="main-card stat-card" :bordered="false">
              <div class="stat-center">
                <n-statistic label="缓存命中率 (Hit Rate)" value="94.2%" style="text-align: center;">
                  <template #prefix>
                    <Activity :size="20" class="text-emerald-400 mr-2" />
                  </template>
                </n-statistic>
              </div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="main-card stat-card" :bordered="false">
              <div class="stat-center">
                <n-statistic label="QPS (Queries Per Second)" value="1,245" style="text-align: center;">
                  <template #prefix>
                    <Cpu :size="20" class="text-amber-400 mr-2" />
                  </template>
                </n-statistic>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-grid-item>
    </n-grid>

    <n-card class="search-card">
      <n-space vertical>
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
          <span>支持通配符 * (星号)，默认检索所有键。出于性能考虑，生产环境建议缩小范围进行扫描。</span>
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
  border-radius: 12px;
  background: rgba(24, 24, 28, 0.5);
  border-color: #333;
}

.chart-card,
.stat-card {
  height: 100%;
}

.stat-center {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.search-card {
  margin-bottom: 24px;
  border-radius: 12px;
  background: rgba(24, 24, 28, 0.5);
  border-color: #333;
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
  color: #71717a;
}
</style>
