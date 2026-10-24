<script setup>
import { computed, h } from 'vue'
import {
  NButton,
  NDataTable,
  NPagination,
  NPopconfirm,
  NSpace,
  NTabPane,
  NTabs,
  NTag
} from 'naive-ui'
import { BarChart3, CheckCircle2, ClipboardList, FileText } from 'lucide-vue-next'
import { getExamTypeLabel } from '@/utils/examTypeMeta'

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
  'exam-edit',
  'exam-delete',
  'exam-page-change',
  'exam-page-size-change',
  'record-page-change',
  'record-page-size-change'
])

const difficultyMap = { 1: '入门', 2: '简单', 3: '中等', 4: '困难', 5: '挑战' }

const examColumns = computed(() => [
  { title: 'ID', key: 'id', width: 70 },
  { title: '试卷标题', key: 'title', minWidth: 240, ellipsis: { tooltip: true } },
  {
    title: '类型',
    key: 'examType',
    width: 120,
    render: row =>
      h(
        NTag,
        { size: 'small', bordered: false },
        { default: () => getExamTypeLabel(row.examType, row.examType || '未知类型') }
      )
  },
  { title: '时长(分钟)', key: 'duration', width: 110, align: 'right' },
  { title: '题数', key: 'totalQuestions', width: 80, align: 'right' },
  {
    title: '难度',
    key: 'difficulty',
    width: 90,
    render: row =>
      h(
        NTag,
        { type: row.difficulty > 3 ? 'error' : 'success', size: 'small', bordered: false },
        { default: () => difficultyMap[row.difficulty] || '未知' }
      )
  },
  { title: '参与人数', key: 'participants', width: 100, align: 'right' },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: row => (row.createTime ? new Date(row.createTime).toLocaleString() : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 170,
    fixed: 'right',
    render: row =>
      h(
        NSpace,
        { size: 4, wrap: false },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'primary',
                onClick: () => emit('exam-detail', row.id)
              },
              { default: () => '查看' }
            ),
            h(
              NButton,
              { size: 'small', quaternary: true, onClick: () => emit('exam-edit', row.id) },
              { default: () => '编辑' }
            ),
            h(
              NPopconfirm,
              { onPositiveClick: () => emit('exam-delete', row.id) },
              {
                trigger: () =>
                  h(
                    NButton,
                    { size: 'small', quaternary: true, type: 'error' },
                    { default: () => '删除' }
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
  { title: 'ID', key: 'id', width: 70 },
  { title: '用户ID', key: 'userId', width: 100 },
  { title: '试卷ID', key: 'examId', width: 100 },
  {
    title: '得分',
    key: 'score',
    width: 90,
    align: 'right',
    render: row =>
      h(
        'span',
        { class: ['record-score', Number(row.score) >= 60 ? 'is-pass' : 'is-fail'] },
        row.score
      )
  },
  {
    title: '正确/总数',
    key: 'correctCount',
    width: 110,
    align: 'right',
    render: row => `${row.correctCount} / ${row.totalCount}`
  },
  { title: '用时(秒)', key: 'timeSpent', width: 100, align: 'right' },
  {
    title: '考试时间',
    key: 'createTime',
    minWidth: 180,
    render: row => (row.createTime ? new Date(row.createTime).toLocaleString() : '-')
  }
])

const examPageCount = computed(() => Math.ceil(props.totalExams / props.examPageSize))
const recordPageCount = computed(() => Math.ceil(props.totalRecords / props.recordPageSize))

const examAverageDifficulty = computed(() => {
  if (!props.exams.length) return '-'
  const total = props.exams.reduce((sum, exam) => sum + Number(exam.difficulty || 0), 0)
  const average = total / props.exams.length
  const nearest = Math.round(average)
  return difficultyMap[nearest] || average.toFixed(1)
})

const rangeText = (page, pageSize, total) => {
  if (!total) return '0 - 0'
  const start = (page - 1) * pageSize + 1
  return `${start} - ${Math.min(page * pageSize, total)}`
}

const isExams = computed(() => props.selectedTab === 'exams')

const passRecordCount = computed(
  () => props.records.filter(record => Number(record.score) >= 60).length
)
</script>

<template>
  <section class="ls-stats" aria-label="考试摘要">
    <div class="ls-stat">
      <span class="ls-stat__label"><FileText :size="14" />试卷总数</span>
      <strong class="ls-stat__value">{{ totalExams }}</strong>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><ClipboardList :size="14" />记录总数</span>
      <strong class="ls-stat__value">{{ totalRecords }}</strong>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><BarChart3 :size="14" />本页平均难度</span>
      <strong class="ls-stat__value">{{ examAverageDifficulty }}</strong>
    </div>
    <div class="ls-stat ls-stat--ok">
      <span class="ls-stat__label"><CheckCircle2 :size="14" />本页及格记录</span>
      <strong class="ls-stat__value"
        >{{ passRecordCount }}<small>/ {{ records.length }}</small></strong
      >
    </div>
  </section>

  <section class="ls-panel exam-panel">
    <div class="exam-panel__tabs">
      <n-tabs
        type="line"
        size="small"
        :value="selectedTab"
        @update:value="emit('tab-change', $event)"
      >
        <n-tab-pane name="exams">
          <template #tab>
            <span class="tab-item"><FileText :size="15" /><span>试卷列表</span></span>
          </template>
        </n-tab-pane>
        <n-tab-pane name="records">
          <template #tab>
            <span class="tab-item"><ClipboardList :size="15" /><span>考试记录</span></span>
          </template>
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Filter row for the active tab (provided by the page). -->
    <slot name="filter" />

    <template v-if="isExams">
      <n-data-table
        :columns="examColumns"
        :data="exams"
        :loading="loading"
        :bordered="false"
        :scroll-x="1100"
      />
      <div class="ls-panel__foot exam-panel__foot">
        <span class="exam-panel__range"
          >第 {{ rangeText(examPage, examPageSize, totalExams) }} 条，共 {{ totalExams }} 条</span
        >
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
    </template>

    <template v-else>
      <n-data-table
        :columns="recordColumns"
        :data="records"
        :loading="loading"
        :bordered="false"
        :scroll-x="820"
      />
      <div class="ls-panel__foot exam-panel__foot">
        <span class="exam-panel__range"
          >第 {{ rangeText(recordPage, recordPageSize, totalRecords) }} 条，共
          {{ totalRecords }} 条</span
        >
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
    </template>
  </section>
</template>

<style scoped>
.exam-panel__tabs {
  padding: 4px 20px 0;
  border-bottom: 1px solid var(--line);
}

.exam-panel__tabs :deep(.n-tabs-nav) {
  margin-bottom: -1px;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 500;
}

.exam-panel__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.exam-panel__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.exam-panel :deep(.n-data-table-td[data-col-key='title']) {
  color: var(--ink);
  font-weight: 500;
}

.exam-panel :deep(.n-data-table-td) {
  font-variant-numeric: tabular-nums;
}

.exam-panel :deep(.record-score) {
  font-weight: 600;
}

.exam-panel :deep(.record-score.is-pass) {
  color: var(--ok);
}

.exam-panel :deep(.record-score.is-fail) {
  color: var(--danger);
}
</style>
