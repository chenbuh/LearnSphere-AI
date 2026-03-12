import { h } from 'vue'
import { NTag } from 'naive-ui'
import { BarChart3, FileText, Target, Wand2 } from 'lucide-vue-next'

export const MODULE_NAME_MAP = {
  listening: '听力材料',
  reading: '阅读文章',
  grammar: '语法练习',
  speaking: '口语话题'
}

export const aiToolOptions = [
  { label: '智能生成简介', key: 'gen-summary', icon: () => h(FileText, { size: 14 }) },
  { label: '提取关键词', key: 'extract-keywords', icon: () => h(Target, { size: 14 }) },
  { label: '难度自动评估', key: 'assess-difficulty', icon: () => h(BarChart3, { size: 14 }) },
  { label: '润色内容', key: 'polish-text', icon: () => h(Wand2, { size: 14 }) }
]

export const difficultyOptions = [
  { label: '简单', value: 'easy' },
  { label: '中等', value: 'medium' },
  { label: '困难', value: 'hard' }
]

export const listeningTypeOptions = [
  { label: '对话', value: 'Conversation' },
  { label: '讲座', value: 'Lecture' },
  { label: 'TED演讲', value: 'TED' },
  { label: '新闻', value: 'News' }
]

export const readingCategoryOptions = [
  { label: '科技', value: 'Technology' },
  { label: '科普', value: 'Science' },
  { label: '文化', value: 'Culture' },
  { label: '历史', value: 'History' },
  { label: '健康', value: 'Health' }
]

export const grammarTopicOptions = [
  { label: '时态（Tenses）', value: 'Tenses' },
  { label: '语态（Voice）', value: 'Voice' },
  { label: '从句（Clauses）', value: 'Clauses' },
  { label: '虚拟语气（Subjunctive）', value: 'Subjunctive' },
  { label: '非谓语（Non-finite）', value: 'Non-finite' },
  { label: '介词（Prepositions）', value: 'Prepositions' },
  { label: '冠词（Articles）', value: 'Articles' }
]

export const speakingTypeOptions = [
  { label: 'IELTS Part 1', value: 'ielts_part1' },
  { label: 'IELTS Part 2', value: 'ielts_part2' },
  { label: 'IELTS Part 3', value: 'ielts_part3' },
  { label: 'TOEFL Independent', value: 'toefl_independent' },
  { label: 'Business English', value: 'business' },
  { label: 'Daily Life', value: 'daily' }
]

const difficultyTagType = (difficulty) => {
  if (difficulty === 'hard') return 'error'
  if (difficulty === 'medium') return 'warning'
  return 'success'
}

const renderDifficultyTag = (value) =>
  h(NTag, { type: difficultyTagType(value) }, { default: () => value })

const renderDateTime = (value) => (value ? new Date(value).toLocaleString('zh-CN') : '-')

export const createDefaultFormData = (tab) => {
  const defaults = {
    listening: {
      id: null,
      title: '',
      script: '',
      type: 'Conversation',
      difficulty: 'medium',
      source: '',
      questions: '[]'
    },
    reading: {
      id: null,
      title: '',
      content: '',
      category: 'Technology',
      difficulty: 'medium',
      wordCount: 0,
      source: '',
      questions: '[]'
    },
    grammar: {
      id: null,
      topic: 'Tenses',
      difficulty: 'medium',
      questions: '[]'
    },
    speaking: {
      id: null,
      type: 'ielts_part1',
      difficulty: 'medium',
      title: '',
      question: '',
      keywords: '[]',
      tips: '[]'
    }
  }

  return { ...(defaults[tab] || {}) }
}

export const createContentColumns = ({ renderActions }) => ({
  listening: [
    { title: 'ID', key: 'id', width: 60 },
    { title: '标题', key: 'title', width: 250 },
    { title: '类型', key: 'type', width: 100 },
    {
      title: '难度',
      key: 'difficulty',
      width: 100,
      render: (row) => renderDifficultyTag(row.difficulty)
    },
    {
      title: '创建时间',
      key: 'createTime',
      width: 180,
      render: (row) => renderDateTime(row.createTime)
    },
    { title: '操作', key: 'actions', width: 150, render: (row) => renderActions(row, 'listening') }
  ],
  reading: [
    { title: 'ID', key: 'id', width: 60 },
    { title: '标题', key: 'title', width: 250 },
    { title: '分类', key: 'category', width: 100 },
    {
      title: '难度',
      key: 'difficulty',
      width: 100,
      render: (row) => renderDifficultyTag(row.difficulty)
    },
    { title: '词数', key: 'wordCount', width: 80 },
    {
      title: '创建时间',
      key: 'createTime',
      width: 180,
      render: (row) => renderDateTime(row.createTime)
    },
    { title: '操作', key: 'actions', width: 150, render: (row) => renderActions(row, 'reading') }
  ],
  grammar: [
    { title: 'ID', key: 'id', width: 60 },
    { title: '语法主题', key: 'topic', width: 200 },
    {
      title: '难度',
      key: 'difficulty',
      width: 100,
      render: (row) => renderDifficultyTag(row.difficulty)
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
      render: (row) => renderDateTime(row.createTime)
    },
    { title: '操作', key: 'actions', width: 120, render: (row) => renderActions(row, 'grammar') }
  ],
  speaking: [
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
      render: (row) => renderDifficultyTag(row.difficulty)
    },
    {
      title: '创建时间',
      key: 'createTime',
      width: 180,
      render: (row) => renderDateTime(row.createTime)
    },
    { title: '操作', key: 'actions', width: 120, render: (row) => renderActions(row, 'speaking') }
  ]
})
