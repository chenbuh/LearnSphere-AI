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
/** 清空搜索关键词并触发搜索。模板中若写成多条语句会被 Prettier 拆行导致编译失败。 */
const clearKeyword = () => {
  emit('update:keyword', '')
  emit('search')
}
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
      @clear="clearKeyword"
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
