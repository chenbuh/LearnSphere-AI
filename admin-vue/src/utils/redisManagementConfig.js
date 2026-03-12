import { h } from 'vue'
import { NButton, NIcon, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { Database } from 'lucide-vue-next'

export const formatRedisValue = (val) => {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'object') return JSON.stringify(val, null, 2)
  return String(val)
}

export const formatRedisTTL = (ttl) => {
  if (ttl === -1) return '永久有效'
  if (ttl === -2) return '已过期/不存在'

  const m = Math.floor(ttl / 60)
  const s = ttl % 60
  const h = Math.floor(m / 60)
  const mm = m % 60

  if (h > 0) return `${h}h ${mm}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export const createRedisColumns = ({ onDetail, onDelete }) => [
  {
    title: '键名 (Key)',
    key: 'key',
    sorter: 'default',
    render(row) {
      return h(NSpace, { align: 'center', size: 'small' }, {
        default: () => [
          h(NIcon, { component: Database, style: 'color: #6366f1; opacity: 0.8' }),
          h('span', { style: 'font-family: monospace; color: #d4d4d8' }, row.key)
        ]
      })
    }
  },
  {
    title: '数据类型',
    key: 'type',
    width: 120,
    render(row) {
      const typeMap = {
        STRING: 'success',
        LIST: 'info',
        SET: 'warning',
        ZSET: 'error',
        HASH: 'primary'
      }
      return h(NTag, { size: 'small', type: typeMap[row.type] || 'default' }, { default: () => row.type })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(
            NButton,
            {
              size: 'tiny',
              secondary: true,
              onClick: () => onDetail(row.key)
            },
            { default: () => '详情' }
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => onDelete(row.key)
            },
            {
              trigger: () =>
                h(
                  NButton,
                  {
                    size: 'tiny',
                    secondary: true,
                    type: 'error'
                  },
                  { default: () => '删除' }
                ),
              default: () => '确定要删除此键吗？'
            }
          )
        ]
      })
    }
  }
]
