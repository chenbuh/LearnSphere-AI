import { h } from 'vue'
import { NButton, NIcon, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { Trash, User } from 'lucide-vue-next'

export const defaultSensitiveAuditStats = {
  todayCount: 0,
  topWords: [],
  trendTimes: [],
  trendCounts: []
}

export const createWordPieChartOption = (statsData) => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(20, 20, 25, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textStyle: { color: '#fff' }
  },
  legend: { bottom: '0%', textStyle: { color: '#a1a1aa' } },
  series: [{
    name: '高频拦截词',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '45%'],
    itemStyle: { borderRadius: 10, borderColor: '#18181b', borderWidth: 2 },
    label: { show: false },
    data: statsData.topWords.length > 0
      ? statsData.topWords
      : [{ value: 0, name: '暂无数据', itemStyle: { color: '#71717a' } }]
  }]
})

export const createTrendChartOption = (statsData, echarts) => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(20, 20, 25, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textStyle: { color: '#fff' }
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: statsData.trendTimes,
    axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
    axisLabel: { color: '#71717a' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
    axisLabel: { color: '#a1a1aa' }
  },
  series: [{
    name: '拦截次数',
    type: 'line',
    smooth: true,
    data: statsData.trendCounts,
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(239, 68, 68, 0.5)' },
        { offset: 1, color: 'rgba(239, 68, 68, 0.01)' }
      ])
    },
    itemStyle: { color: '#ef4444' }
  }]
})

export const createSensitiveWordColumns = ({ onDeleteWord }) => [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  {
    title: '敏感词内容',
    key: 'word',
    render: (row) => h(NTag, { type: 'error' }, { default: () => row.word })
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'center',
    render(row) {
      return h(
        NPopconfirm,
        {
          onPositiveClick: () => onDeleteWord(row.id)
        },
        {
          trigger: () =>
            h(
              NButton,
              { size: 'small', type: 'error', ghost: true, circle: true },
              { default: () => h(NIcon, { component: Trash, size: 14 }) }
            ),
          default: () => '确定要删除此敏感词吗？'
        }
      )
    }
  }
]

export const createSensitiveLogColumns = ({ onDeleteLog }) => [
  { type: 'selection', width: 40 },
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  {
    title: '用户',
    key: 'username',
    width: 150,
    render: (row) =>
      h(NSpace, { align: 'center', size: 4 }, {
        default: () => [
          h(NIcon, { component: User, size: 14, class: 'text-zinc-500' }),
          h('span', { class: 'font-medium' }, row.username || `未知用户 (${row.userId})`)
        ]
      })
  },
  {
    title: '命中的敏感词',
    key: 'matchedWord',
    width: 150,
    render: (row) =>
      h(
        NTag,
        { type: 'error', bordered: false, round: true, size: 'small' },
        { default: () => row.matchedWord }
      )
  },
  {
    title: '触发动作',
    key: 'action',
    width: 180,
    render: (row) =>
      h('code', { class: 'text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded' }, row.action)
  },
  {
    title: '违规内容片段',
    key: 'content',
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-zinc-400 italic' }, row.content)
  },
  {
    title: '发生时间',
    key: 'createTime',
    width: 180,
    render: (row) => new Date(row.createTime).toLocaleString()
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    render(row) {
      return h(
        NPopconfirm,
        {
          onPositiveClick: () => onDeleteLog(row.id)
        },
        {
          trigger: () =>
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                ghost: true,
                circle: true
              },
              { default: () => h(NIcon, { component: Trash, size: 14 }) }
            ),
          default: () => '确定要删除这条审计记录吗？'
        }
      )
    }
  }
]
