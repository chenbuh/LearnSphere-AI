export const EXAM_TYPE_LABELS = {
  primary: '小学',
  middle: '中考',
  high: '高考',
  cet4: 'CET-4',
  cet6: 'CET-6',
  tem4: 'TEM-4',
  tem8: 'TEM-8',
  ielts: 'IELTS',
  toefl: 'TOEFL',
  gre: 'GRE',
  postgraduate: '考研',
  general: '通用'
}

export const ADMIN_VOCABULARY_EXAM_TYPE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '小学', value: 'primary' },
  { label: '中考', value: 'middle' },
  { label: '高考', value: 'high' },
  { label: 'CET-4', value: 'cet4' },
  { label: 'CET-6', value: 'cet6' },
  { label: 'TEM-4', value: 'tem4' },
  { label: 'TEM-8', value: 'tem8' },
  { label: 'IELTS', value: 'ielts' },
  { label: 'TOEFL', value: 'toefl' },
  { label: 'GRE', value: 'gre' },
  { label: '考研', value: 'postgraduate' }
]

export const ADMIN_WRITING_EXAM_TYPE_OPTIONS = [
  { label: '小学', value: 'primary' },
  { label: '中考', value: 'middle' },
  { label: '高考', value: 'high' },
  { label: 'CET-4', value: 'cet4' },
  { label: 'CET-6', value: 'cet6' },
  { label: 'IELTS', value: 'ielts' },
  { label: 'TOEFL', value: 'toefl' }
]

export function getExamTypeLabel(value, fallback = '未知类型') {
  if (!value) {
    return fallback
  }

  return EXAM_TYPE_LABELS[value] || fallback
}
