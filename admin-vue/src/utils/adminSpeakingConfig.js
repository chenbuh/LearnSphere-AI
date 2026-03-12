import { h } from 'vue'
import { NTag } from 'naive-ui'

export const speakingTypeOptions = [
  { label: 'IELTS Part 1', value: 'ielts_part1' },
  { label: 'IELTS Part 2', value: 'ielts_part2' },
  { label: 'IELTS Part 3', value: 'ielts_part3' },
  { label: 'TOEFL Independent', value: 'toefl_independent' },
  { label: 'Business English', value: 'business' },
  { label: 'Daily Life', value: 'daily' }
]

export const speakingDifficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

export const createDefaultSpeakingForm = () => ({
  id: null,
  type: 'ielts_part1',
  difficulty: 'medium',
  title: '',
  question: '',
  keywords: '[]',
  tips: '[]'
})

export const createSpeakingColumns = ({ renderActions }) => [
  { title: 'ID', key: 'id', width: 60 },
  { title: '话题标题', key: 'title', width: 300 },
  {
    title: '类型',
    key: 'type',
    width: 150,
    render: (row) => h(NTag, { type: 'info' }, { default: () => row.type })
  },
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
