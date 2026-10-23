import { h } from 'vue'
import { NButton, NPopconfirm, NSpace, NTag } from 'naive-ui'
import { Trash2 } from 'lucide-vue-next'

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

const typeTagColorMap = {
  string: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  hash: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  list: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  set: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  zset: { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' }
}

export const createRedisColumns = ({ onDetail, onDelete }) => [
  {
    title: '键名 (Key)',
    key: 'key',
    sorter: (a, b) => a.key.localeCompare(b.key),
    ellipsis: { tooltip: true },
    render(row) {
      return h(
        'span',
        {
          class: 'code-chip redis-key-chip',
          title: row.key
        },
        row.key
      )
    }
  },
  {
    title: '数据类型',
    key: 'type',
    width: 120,
    render(row) {
      const typeKey = String(row.type || 'string').toLowerCase()
      const colorDef = typeTagColorMap[typeKey] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' }
      return h(
        'span',
        {
          style: {
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11.5px',
            fontWeight: '600',
            fontFamily: 'var(--font-mono)',
            backgroundColor: colorDef.bg,
            color: colorDef.text,
            border: `1px solid ${colorDef.border}`
          }
        },
        String(row.type || 'UNKNOWN').toUpperCase()
      )
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 130,
    render(row) {
      return h(NSpace, { size: 6, wrap: false, align: 'center' }, {
        default: () => [
          h(
            NButton,
            {
              size: 'tiny',
              secondary: true,
              type: 'info',
              style: 'font-weight: 600; border-radius: 6px;',
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
                    type: 'error',
                    style: 'font-weight: 600; border-radius: 6px;'
                  },
                  { default: () => '删除' }
                ),
              default: () => '确定要从 Redis 物理删除此键吗？'
            }
          )
        ]
      })
    }
  }
]
