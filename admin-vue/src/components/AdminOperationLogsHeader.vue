<script setup>
import { NButton, NIcon, NInput } from 'naive-ui'
import { RefreshCw, Search } from 'lucide-vue-next'

defineProps({
  keyword: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:keyword', 'search', 'refresh'])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary :loading="loading" @click="emit('refresh')">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
  </Teleport>

  <div class="ls-filter">
    <n-input
      :value="keyword"
      placeholder="搜索用户名 / 动作 / 模块，回车确认"
      clearable
      style="width: 320px"
      @update:value="emit('update:keyword', $event)"
      @keyup.enter="emit('search')"
      @clear="emit('update:keyword', ''); emit('search')"
    >
      <template #prefix>
        <n-icon :component="Search" />
      </template>
    </n-input>
    <n-button @click="emit('search')">搜索</n-button>
  </div>
</template>
