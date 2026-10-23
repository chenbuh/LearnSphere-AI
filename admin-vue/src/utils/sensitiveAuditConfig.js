import { h } from 'vue'
import { NButton, NPopconfirm, NTag } from 'naive-ui'

export const defaultSensitiveAuditStats = {
  todayCount: 0,
  topWords: [],
  trendTimes: [],
  trendCounts: []
}

export const createWordPieChartOption = (statsData) => ({
  backgroundColor: 'transparent',
  color: ['#3445c4', '#2f6fb8', '#1d8a5b', '#b86a00', '#c53b3b', '#7a8396'],
  tooltip: {
    trigger: 'item',
    backgroundColor: '#ffffff',
    borderColor: '#e2e5ea',
    textStyle: { color: '#1a2130' }
  },
  legend: { bottom: '0%', textStyle: { color: '#687184' } },
  series: [{
    name: '高频拦截词',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '45%'],
    itemStyle: { borderRadius: 4, borderColor: '#ffffff', borderWidth: 2 },
    label: { show: false },
    data: statsData.topWords.length > 0
      ? statsData.topWords
      : [{ value: 0, name: '暂无数据', itemStyle: { color: '#e2e5ea' } }]
  }]
})

export const createTrendChartOption = (statsData, echarts) => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#ffffff',
    borderColor: '#e2e5ea',
    textStyle: { color: '#1a2130' }
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: statsData.trendTimes,
    axisLine: { lineStyle: { color: '#e2e5ea' } },
    axisLabel: { color: '#687184' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#e2e5ea' } },
    axisLabel: { color: '#687184' }
  },
  series: [{
    name: '拦截次数',
    type: 'line',
    smooth: true,
    data: statsData.trendCounts,
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(197, 59, 59, 0.18)' },
        { offset: 1, color: 'rgba(197, 59, 59, 0.01)' }
      ])
    },
    itemStyle: { color: '#c53b3b' }
  }]
})

export const createSensitiveWordColumns = ({ onDeleteWord }) => [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '敏感词内容',
    key: 'word',
    render: (row) => h(NTag, { type: 'error', size: 'small', bordered: false }, { default: () => row.word })
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
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
              { size: 'small', type: 'error', quaternary: true },
              { default: () => '删除' }
            ),
          default: () => '确定要删除此敏感词吗？'
        }
      )
    }
  }
]

export const createSensitiveLogColumns = ({ onDeleteLog }) => [
  { type: 'selection', width: 48 },
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '用户',
    key: 'username',
    width: 150,
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'font-medium' }, row.username || `未知用户 (${row.userId})`)
  },
  {
    title: '命中的敏感词',
    key: 'matchedWord',
    width: 150,
    render: (row) =>
      h(
        NTag,
        {
          bordered: false,
          size: 'small',
          color: { color: '#fdf3d0', textColor: '#7a5a00', borderColor: '#fdf3d0' }
        },
        { default: () => row.matchedWord }
      )
  },
  {
    title: '触发动作',
    key: 'action',
    width: 180,
    ellipsis: { tooltip: true },
    render: (row) => h('code', null, row.action)
  },
  {
    title: '违规内容片段',
    key: 'content',
    ellipsis: { tooltip: true },
    minWidth: 280,
    render: (row) => row.content
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
    width: 80,
    fixed: 'right',
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
                quaternary: true
              },
              { default: () => '删除' }
            ),
          default: () => '确定要删除这条审计记录吗？'
        }
      )
    }
  }
]
