<script setup>
import { useRouter } from 'vue-router'
import RedisManagementHeader from '@/components/RedisManagementHeader.vue'
import RedisManagementOverview from '@/components/RedisManagementOverview.vue'
import RedisManagementTableCard from '@/components/RedisManagementTableCard.vue'
import RedisKeyDetailModal from '@/components/RedisKeyDetailModal.vue'
import { formatRedisTTL, formatRedisValue } from '@/utils/redisManagementConfig'
import { useRedisManagement } from '@/composables/useRedisManagement'

const router = useRouter()
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
  <div class="admin-page admin-page--content redis-manager">
    <RedisManagementHeader
      :loading="loading"
      :search-pattern="searchPattern"
      @back="router.back()"
      @refresh="fetchKeys"
      @clear="clearKeys"
    />

    <RedisManagementOverview
      :loading="loading"
      :search-pattern="searchPattern"
      @update:search-pattern="searchPattern = $event"
      @search="fetchKeys"
    >
      <template #memory-chart>
        <div ref="memoryChartRef" class="memory-chart"></div>
      </template>
    </RedisManagementOverview>

    <RedisManagementTableCard :columns="columns" :data="keys" :loading="loading" />

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
  height: 180px;
}
</style>
