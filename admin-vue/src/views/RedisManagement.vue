<script setup>
import RedisManagementHeader from '@/components/RedisManagementHeader.vue'
import RedisManagementOverview from '@/components/RedisManagementOverview.vue'
import RedisManagementTableCard from '@/components/RedisManagementTableCard.vue'
import RedisKeyDetailModal from '@/components/RedisKeyDetailModal.vue'
import { formatRedisTTL, formatRedisValue } from '@/utils/redisManagementConfig'
import { useRedisManagement } from '@/composables/useRedisManagement'

const {
  clearKeys,
  columns,
  deleteKey,
  detailLoading,
  fetchKeys,
  keyDetail,
  keys,
  loading,
  memoryChartRef,
  searchPattern,
  showDetail
} = useRedisManagement()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <RedisManagementHeader
      :loading="loading"
      :search-pattern="searchPattern"
      @refresh="fetchKeys"
      @clear="clearKeys"
    />

    <RedisManagementOverview>
      <template #memory-chart>
        <div ref="memoryChartRef" class="memory-chart"></div>
      </template>
    </RedisManagementOverview>

    <RedisManagementTableCard
      :columns="columns"
      :data="keys"
      :loading="loading"
      :search-pattern="searchPattern"
      @update:search-pattern="searchPattern = $event"
      @search="fetchKeys"
    />

    <RedisKeyDetailModal
      :show="showDetail"
      :detail-loading="detailLoading"
      :key-detail="keyDetail"
      :format-ttl="formatRedisTTL"
      :format-value="formatRedisValue"
      @update:show="showDetail = $event"
      @delete="deleteKey"
    />
  </div>
</template>

<style scoped>
.memory-chart {
  height: 200px;
}
</style>
