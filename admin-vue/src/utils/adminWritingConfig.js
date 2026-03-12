import { h } from 'vue'
import { NTag } from 'naive-ui'

export const writingExamTypeOptions = [
  { label: 'IELTS', value: 'ielts' },
  { label: 'TOEFL', value: 'toefl' },
  { label: 'CET-4', value: 'cet4' },
  { label: 'CET-6', value: 'cet6' }
]

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

export const createWritingColumns = ({ renderActions }) => [
  { title: 'ID', key: 'id', width: 60 },
  { title: '标题', key: 'title', width: 300 },
  {
    title: '考试类型',
    key: 'examType',
    width: 100,
    render: (row) => h(NTag, { type: 'info' }, { default: () => row.examType?.toUpperCase() })
  },
  { title: '模式', key: 'mode', width: 100 },
  { title: '最小词数', key: 'minWords', width: 100 },
  {
    title: '难度',
    key: 'difficulty',
    width: 100,
    render: (row) =>
      h(
        NTag,
        {
          type: row.difficulty === 'hard' ? 'error' : row.difficulty === 'medium' ? 'warning' : 'success'
        },
        { default: () => row.difficulty }
      )
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
    render: renderActions
  }
]
