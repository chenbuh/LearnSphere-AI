<script setup>
import { computed, h } from 'vue'
import { NButton, NCard, NDataTable, NPagination, NPopconfirm, NSpace, NTabPane, NTabs, NTag } from 'naive-ui'
import { Eye, Trash2 } from 'lucide-vue-next'
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
    width: 110,
    render: (row) => h(NTag, { type: 'primary', bordered: false }, { default: () => getExamTypeLabel(row.examType, row.examType || '未知类型') })
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

const examAverageDifficulty = computed(() => {
  if (!props.exams.length) return '-'
  const total = props.exams.reduce((sum, exam) => sum + Number(exam.difficulty || 0), 0)
  const average = total / props.exams.length
  const diffMap = { 2: '简单', 3: '中等', 4: '困难' }
  const nearest = Math.round(average)
  return diffMap[nearest] || average.toFixed(1)
})

const passRecordCount = computed(() => props.records.filter((record) => Number(record.score) >= 60).length)
</script>

<template>
  <n-card content-style="padding: 0;">
    <div class="overview-panel">
      <div class="overview-copy">
        <div class="overview-eyebrow">考试面板</div>
        <h3 class="overview-title">试卷资产与考试记录</h3>
        <p class="overview-description">
          左侧维护试卷信息，右侧切换查看作答记录。顶部摘要帮助快速判断当前数据规模与质量分布。
        </p>
      </div>
      <div class="overview-metrics">
        <div class="metric-card">
          <span>试卷总数</span>
          <strong>{{ totalExams }}</strong>
        </div>
        <div class="metric-card">
          <span>记录总数</span>
          <strong>{{ totalRecords }}</strong>
        </div>
        <div class="metric-card">
          <span>平均难度</span>
          <strong>{{ examAverageDifficulty }}</strong>
        </div>
        <div class="metric-card">
          <span>及格记录</span>
          <strong>{{ passRecordCount }}</strong>
        </div>
      </div>
    </div>

    <n-tabs type="line" size="large" :tabs-padding="20" :value="selectedTab" @update:value="emit('tab-change', $event)">
      <n-tab-pane name="exams" tab="试卷列表">
        <div class="table-container">
          <div class="table-header">
            <div>
              <div class="table-title">试卷列表</div>
              <div class="table-description">查看题型、时长、难度和参与情况，适合做内容资产管理。</div>
            </div>
          </div>
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
          <div class="table-header">
            <div>
              <div class="table-title">考试记录</div>
              <div class="table-description">聚焦用户作答结果、分数和用时，便于复盘考试质量与用户表现。</div>
            </div>
          </div>
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
.overview-panel {
  padding: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.48));
  display: grid;
  gap: 18px;
}

.overview-copy {
  display: grid;
  gap: 8px;
}

.overview-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.overview-title {
  margin: 0;
  font-size: 22px;
  color: #f8fafc;
}

.overview-description {
  margin: 0;
  line-height: 1.6;
  color: #cbd5e1;
}

.overview-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.42);
  border: 1px solid rgba(148, 163, 184, 0.1);
  display: grid;
  gap: 6px;
}

.metric-card span {
  font-size: 12px;
  color: #94a3b8;
}

.metric-card strong {
  font-size: 18px;
  color: #f8fafc;
}

.table-container {
  padding: 16px;
}

.table-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.table-title {
  font-size: 16px;
  font-weight: 700;
  color: #e4e4e7;
}

.table-description {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #a1a1aa;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .overview-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .overview-metrics {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
