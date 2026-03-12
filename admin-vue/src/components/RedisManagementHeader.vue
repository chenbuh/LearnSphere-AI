<script setup>
import { ArrowLeft, Database, RefreshCw, Trash2 } from 'lucide-vue-next'
import { NButton, NIcon, NPopconfirm, NSpace } from 'naive-ui'

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

const emit = defineEmits(['back', 'refresh', 'clear'])
</script>

<template>
  <div class="header-wrap">
    <n-space align="center" size="large">
      <n-button circle secondary @click="emit('back')">
        <template #icon>
          <ArrowLeft />
        </template>
      </n-button>
      <div>
        <h2 class="title">
          <n-icon :component="Database" class="title-icon" />
          Redis 缓存管理
        </h2>
        <p class="desc">运维利器：实时监控与清理 Redis 缓存键值</p>
      </div>
    </n-space>

    <n-space>
      <n-button :loading="loading" @click="emit('refresh')">
        <template #icon>
          <n-icon :component="RefreshCw" />
        </template>
        刷新
      </n-button>

      <n-popconfirm @positive-click="emit('clear')">
        <template #trigger>
          <n-button type="error" ghost>
            <template #icon>
              <n-icon :component="Trash2" />
            </template>
            按搜索条件清理
          </n-button>
        </template>
        确定要清理所有匹配 "{{ searchPattern }}" 的键吗？此操作不可逆！
      </n-popconfirm>
    </n-space>
  </div>
</template>

<style scoped>
.header-wrap {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 700;
}

.title-icon {
  color: #6366f1;
}

.desc {
  margin: 0;
  font-size: 14px;
  color: #71717a;
}
</style>
