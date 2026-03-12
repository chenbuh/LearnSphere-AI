<script setup>
import { computed, h } from 'vue'
import { NButton, NCard, NDataTable, NPagination, NPopconfirm, NSpace, NTabPane, NTabs, NTag } from 'naive-ui'
import { Eye, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  selectedTab: {
    type: String,
    default: 'exams'
  },
  exams: {
    type: Array,
    default: () => []
  },
  records: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  examPage: {
    type: Number,
    default: 1
  },
  examPageSize: {
    type: Number,
    default: 10
  },
  totalExams: {
    type: Number,
    default: 0
  },
  recordPage: {
    type: Number,
    default: 1
  },
  recordPageSize: {
    type: Number,
    default: 10
  },
  totalRecords: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'tab-change',
  'exam-detail',
  'exam-delete',
  'exam-page-change',
  'exam-page-size-change',
  'record-page-change',
  'record-page-size-change'
])

const examColumns = computed(() => [
  { title: 'ID', key: 'id', width: 60 },
  { title: '试卷标题', key: 'title', width: 200, ellipsis: { tooltip: true } },
  {
    title: '类型',
    key: 'examType',
    width: 100,
    render: (row) => h(NTag, { type: 'primary', bordered: false }, { default: () => row.examType })
  },
  { title: '时长(分钟)', key: 'duration', width: 90 },
  { title: '题数', key: 'totalQuestions', width: 70 },
  {
    title: '难度',
    key: 'difficulty',
    width: 80,
    render: (row) => {
      const diffMap = { 2: '简单', 3: '中等', 4: '困难' }
      return h(
        NTag,
        {
          type: row.difficulty > 3 ? 'error' : 'success',
          size: 'small'
        },
        { default: () => diffMap[row.difficulty] || '未知' }
      )
    }
  },
  { title: '参与人数', key: 'participants', width: 90 },
  {
    title: '创建时间',
    key: 'createTime',
    width: 160,
    render: (row) => (row.createTime ? new Date(row.createTime).toLocaleString() : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                secondary: true,
                onClick: () => emit('exam-detail', row.id)
              },
              { icon: () => h(Eye, { size: 14 }) }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => emit('exam-delete', row.id)
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      type: 'error',
                      secondary: true
                    },
                    { icon: () => h(Trash2, { size: 14 }) }
                  ),
                default: () => '确定要删除这份试卷吗？'
              }
            )
          ]
        }
      )
  }
])

const recordColumns = computed(() => [
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户ID', key: 'userId', width: 80 },
  { title: '试卷ID', key: 'examId', width: 80 },
  {
    title: '得分',
    key: 'score',
    width: 80,
    render: (row) =>
      h(
        'span',
        {
          style: { fontWeight: 'bold', color: row.score >= 60 ? '#18a058' : '#d03050' }
        },
        row.score
      )
  },
  { title: '正确/总数', key: 'correctCount', width: 100, render: (row) => `${row.correctCount} / ${row.totalCount}` },
  { title: '用时(秒)', key: 'timeSpent', width: 90 },
  {
    title: '考试时间',
    key: 'createTime',
    width: 160,
    render: (row) => (row.createTime ? new Date(row.createTime).toLocaleString() : '-')
  }
])

const examPageCount = computed(() => Math.ceil(props.totalExams / props.examPageSize))
const recordPageCount = computed(() => Math.ceil(props.totalRecords / props.recordPageSize))
</script>

<template>
  <n-card content-style="padding: 0;">
    <n-tabs type="line" size="large" :tabs-padding="20" :value="selectedTab" @update:value="emit('tab-change', $event)">
      <n-tab-pane name="exams" tab="试卷列表">
        <div class="table-container">
          <n-data-table
            :columns="examColumns"
            :data="exams"
            :loading="loading"
            :bordered="false"
            :single-line="false"
          />
          <div class="pagination">
            <n-pagination
              :page="examPage"
              :page-count="examPageCount"
              :page-size="examPageSize"
              show-size-picker
              :page-sizes="[10, 20, 30, 50]"
              @update:page="emit('exam-page-change', $event)"
              @update:page-size="emit('exam-page-size-change', $event)"
            />
          </div>
        </div>
      </n-tab-pane>
      <n-tab-pane name="records" tab="考试记录">
        <div class="table-container">
          <n-data-table
            :columns="recordColumns"
            :data="records"
            :loading="loading"
            :bordered="false"
            :single-line="false"
          />
          <div class="pagination">
            <n-pagination
              :page="recordPage"
              :page-count="recordPageCount"
              :page-size="recordPageSize"
              show-size-picker
              :page-sizes="[10, 20, 30, 50]"
              @update:page="emit('record-page-change', $event)"
              @update:page-size="emit('record-page-size-change', $event)"
            />
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>
.table-container {
  padding: 16px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
