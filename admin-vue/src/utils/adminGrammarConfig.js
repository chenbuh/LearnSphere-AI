import { h } from 'vue'
import { NTag } from 'naive-ui'

export const grammarTopicOptions = [
  { label: '时态（Tenses）', value: 'Tenses' },
  { label: '语态（Voice）', value: 'Voice' },
  { label: '从句（Clauses）', value: 'Clauses' },
  { label: '虚拟语气（Subjunctive）', value: 'Subjunctive' },
  { label: '非谓语（Non-finite）', value: 'Non-finite' },
  { label: '介词（Prepositions）', value: 'Prepositions' },
  { label: '冠词（Articles）', value: 'Articles' }
]

export const grammarDifficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

export const createDefaultGrammarForm = () => ({
  id: null,
  topic: 'Tenses',
  difficulty: 'medium',
  questions: '[]'
})

export const createGrammarColumns = ({ renderActions }) => [
  { title: 'ID', key: 'id', width: 60 },
  { title: '语法主题', key: 'topic', width: 200 },
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
    title: '题目数量',
    key: 'questions',
    width: 100,
    render: (row) => {
      try {
        const questions = JSON.parse(row.questions || '[]')
        return h('span', `${questions.length} 题`)
      } catch {
        return h('span', '0 题')
      }
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
    render: renderActions
  }
]
