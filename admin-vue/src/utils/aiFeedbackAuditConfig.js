import { h } from 'vue'
import { NButton, NIcon, NSpace, NTag } from 'naive-ui'
import { Edit, Eye, ThumbsDown, ThumbsUp, User } from 'lucide-vue-next'

export const feedbackStatusOptions = [
  { label: '待处理', value: 0 },
  { label: '已处理', value: 1 },
  { label: '已忽略', value: 2 }
]

export const feedbackRatingOptions = [
  { label: '全部评分', value: null },
  { label: '正向 (👍)', value: 1 },
  { label: '负向 (👎)', value: -1 }
]

const feedbackStatusMap = {
  0: { label: '待处理', type: 'warning' },
  1: { label: '已处理', type: 'success' },
  2: { label: '已忽略', type: 'default' }
}

export const createAuditForm = (row = null) => ({
  status: row?.status === 0 ? 1 : (row?.status ?? 1),
  correctedContent: row?.corrected_content || row?.original_content || '',
  adminNotes: row?.admin_notes || ''
})

export const createAIFeedbackColumns = ({ onOpenAudit }) => [
  {
    title: '用户',
    key: 'username',
    width: 120,
    render: (row) =>
      h(NSpace, { align: 'center', size: 4 }, {
        default: () => [
          h(NIcon, { component: User, size: 14, class: 'text-zinc-500' }),
          h('span', { class: 'font-medium' }, row.username || 'System')
        ]
      })
  },
  {
    title: '内容类型',
    key: 'action_type',
    width: 150,
    render: (row) =>
      h(
        NTag,
        { type: 'info', bordered: false, size: 'small' },
        { default: () => row.action_type }
      )
  },
  {
    title: '评分',
    key: 'rating',
    width: 80,
    align: 'center',
    render: (row) =>
      h(
        'div',
        { class: row.rating === 1 ? 'text-emerald-500' : 'text-rose-500' },
        [h(NIcon, { component: row.rating === 1 ? ThumbsUp : ThumbsDown, size: 20 })]
      )
  },
  {
    title: '反馈说明',
    key: 'feedback_text',
    ellipsis: { tooltip: true },
    render: (row) => row.feedback_text || h('span', { class: 'text-zinc-500 italic' }, '无说明')
  },
  {
    title: '时间',
    key: 'create_time',
    width: 180,
    render: (row) => new Date(row.create_time).toLocaleString()
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => {
      const status = feedbackStatusMap[row.status]
      return h(NTag, { type: status.type, bordered: false, size: 'small' }, { default: () => status.label })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) =>
      h(NSpace, {}, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              ghost: true,
              onClick: () => onOpenAudit(row)
            },
            {
              default: () => (row.status === 0 ? '审核' : '查看'),
              icon: () => h(NIcon, { component: row.status === 0 ? Edit : Eye })
            }
          )
        ]
      })
  }
]
