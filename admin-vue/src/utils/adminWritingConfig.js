import { h } from 'vue'
import { NTag } from 'naive-ui'
import { ADMIN_WRITING_EXAM_TYPE_OPTIONS, getExamTypeLabel } from '@/utils/examTypeMeta'

export const writingExamTypeOptions = ADMIN_WRITING_EXAM_TYPE_OPTIONS

export const writingModeOptions = [
  { label: 'Task 1', value: 'task1' },
  { label: 'Task 2', value: 'task2' },
  { label: '议论文', value: 'argumentative' },
  { label: '说明文', value: 'expository' }
]

export const writingDifficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

export const createDefaultWritingForm = () => ({
  id: null,
  examType: 'ielts',
  mode: 'task1',
  title: '',
  prompt: '',
  minWords: 250,
  tips: '[]',
  difficulty: 'medium'
})

const writingDifficultyMeta = {
  easy: { text: '简单', type: 'success' },
  medium: { text: '中等', type: 'warning' },
  hard: { text: '困难', type: 'error' }
}

const writingModeLabels = Object.fromEntries(writingModeOptions.map((opt) => [opt.value, opt.label]))

export const createWritingColumns = ({ renderActions }) => [
  { title: 'ID', key: 'id', width: 72 },
  { title: '标题', key: 'title', minWidth: 280, ellipsis: { tooltip: true } },
  {
    title: '考试类型',
    key: 'examType',
    width: 110,
    render: (row) =>
      h(NTag, { size: 'small', bordered: false }, { default: () => getExamTypeLabel(row.examType, row.examType || '未知类型') })
  },
  { title: '模式', key: 'mode', width: 110, render: (row) => writingModeLabels[row.mode] || row.mode || '-' },
  { title: '最小词数', key: 'minWords', width: 100, align: 'right' },
  {
    title: '难度',
    key: 'difficulty',
    width: 90,
    render: (row) => {
      const meta = writingDifficultyMeta[row.difficulty] || { text: row.difficulty || '-', type: 'default' }
      return h(NTag, { size: 'small', bordered: false, type: meta.type }, { default: () => meta.text })
    }
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 180,
    render: (row) => (row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: renderActions
  }
]
