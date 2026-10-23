<script setup>
import { NButton, NInput } from 'naive-ui'
import { Search } from 'lucide-vue-next'

defineProps({
  selectedTab: {
    type: String,
    default: 'exams'
  },
  keyword: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:keyword', 'search'])
</script>

<template>
  <div v-if="selectedTab === 'exams'" class="ls-filter">
    <n-input
      :value="keyword"
      placeholder="搜索试卷标题，回车确认"
      clearable
      style="width: 320px"
      @update:value="emit('update:keyword', $event)"
      @keyup.enter="emit('search')"
      @clear="emit('update:keyword', ''); emit('search')"
    >
      <template #prefix>
        <Search :size="15" />
      </template>
    </n-input>
    <n-button @click="emit('search')">搜索</n-button>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .ls-filter :deep(.n-input) {
    width: 100% !important;
  }
}
</style>
