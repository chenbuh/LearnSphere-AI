<script setup>
import { computed, h } from 'vue'
import { NButton, NCard, NDataTable, NPagination, NPopconfirm, NSpace } from 'naive-ui'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  vocabularyList: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['edit', 'delete', 'page-change', 'page-size-change'])

const columns = computed(() => [
  { title: 'ID', key: 'id', width: 60 },
  { title: '单词', key: 'word', width: 150 },
  { title: '音标', key: 'phonetic', width: 120 },
  { title: '翻译', key: 'translation', width: 200 },
  { title: '考试类型', key: 'examType', width: 100 },
  { title: '难度', key: 'difficulty', width: 80 },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row) =>
      h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => emit('edit', row)
            },
            { default: () => '编辑' }
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => emit('delete', row.id)
            },
            {
              trigger: () =>
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error'
                  },
                  { default: () => '删除' }
                ),
              default: () => '确定要删除吗？'
            }
          )
        ]
      })
  }
])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
</script>

<template>
  <n-card class="table-card">
    <n-data-table
      :columns="columns"
      :data="vocabularyList"
      :loading="loading"
      :bordered="false"
    />

    <div class="pagination">
      <n-pagination
        :page="page"
        :page-count="pageCount"
        :page-size="pageSize"
        show-size-picker
        @update:page="emit('page-change', $event)"
        @update:page-size="emit('page-size-change', $event)"
      />
    </div>
  </n-card>
</template>

<style scoped>
.table-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
