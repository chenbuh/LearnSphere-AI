const EXAM_TYPE_META = Object.freeze({
  primary: Object.freeze({
    label: '小学',
    description: 'Primary School English'
  }),
  middle: Object.freeze({
    label: '中考',
    description: 'Middle School Entrance English'
  }),
  high: Object.freeze({
    label: '高考',
    description: 'National College Entrance English'
  }),
  cet4: Object.freeze({
    label: 'CET-4',
    description: 'College English Test Band 4'
  }),
  cet6: Object.freeze({
    label: 'CET-6',
    description: 'College English Test Band 6'
  }),
  ielts: Object.freeze({
    label: 'IELTS',
    description: 'International English Language Testing System'
  }),
  toefl: Object.freeze({
    label: 'TOEFL',
    description: 'Test of English as a Foreign Language'
  }),
  postgraduate: Object.freeze({
    label: '考研',
    description: 'Postgraduate Entrance English'
  }),
  gre: Object.freeze({
    label: 'GRE',
    description: 'Graduate Record Examination'
  }),
  tem4: Object.freeze({
    label: 'TEM-4',
    description: 'Test for English Majors Band 4'
  }),
  tem8: Object.freeze({
    label: 'TEM-8',
    description: 'Test for English Majors Band 8'
  })
})

const buildOptions = (values) => values.map((value) => ({
  value,
  label: EXAM_TYPE_META[value]?.label || value
}))

export const COMMON_EXAM_TYPE_VALUES = Object.freeze([
  'primary',
  'middle',
  'high',
  'cet4',
  'cet6',
  'ielts',
  'toefl'
])

export const VOCABULARY_EXAM_TYPE_VALUES = Object.freeze([
  ...COMMON_EXAM_TYPE_VALUES,
  'gre',
  'postgraduate',
  'tem4',
  'tem8'
])

export const MOCK_EXAM_TYPE_VALUES = Object.freeze([
  ...COMMON_EXAM_TYPE_VALUES,
  'gre'
])

export const STUDY_PLAN_EXAM_TYPE_VALUES = Object.freeze([
  ...COMMON_EXAM_TYPE_VALUES
])

export const PROFILE_EXAM_TYPE_VALUES = Object.freeze([
  ...COMMON_EXAM_TYPE_VALUES,
  'postgraduate',
  'gre',
  'tem4',
  'tem8'
])

export const COMMON_EXAM_TYPE_OPTIONS = Object.freeze(buildOptions(COMMON_EXAM_TYPE_VALUES))
export const VOCABULARY_EXAM_TYPE_OPTIONS = Object.freeze(buildOptions(VOCABULARY_EXAM_TYPE_VALUES))
export const MOCK_EXAM_TYPE_OPTIONS = Object.freeze(buildOptions(MOCK_EXAM_TYPE_VALUES))
export const STUDY_PLAN_EXAM_TYPE_OPTIONS = Object.freeze(buildOptions(STUDY_PLAN_EXAM_TYPE_VALUES))
export const PROFILE_EXAM_TYPE_OPTIONS = Object.freeze(buildOptions(PROFILE_EXAM_TYPE_VALUES))

export function getExamTypeMeta(value) {
  return EXAM_TYPE_META[String(value || '').trim()] || null
}

export function getExamTypeLabel(value, fallback = '') {
  const normalizedValue = String(value || '').trim()
  if (!normalizedValue) {
    return fallback
  }

  return EXAM_TYPE_META[normalizedValue]?.label || fallback || normalizedValue.toUpperCase()
}

export function getExamTypeDescription(value, fallback = '') {
  const normalizedValue = String(value || '').trim()
  if (!normalizedValue) {
    return fallback
  }

  return EXAM_TYPE_META[normalizedValue]?.description || fallback
}

export function resolvePreferredExamType(optionsOrValues, preferredValue, fallbackValue = 'cet4') {
  const values = (optionsOrValues || [])
    .map((item) => (typeof item === 'string' ? item : item?.value))
    .filter(Boolean)

  if (preferredValue && values.includes(preferredValue)) {
    return preferredValue
  }

  if (fallbackValue && values.includes(fallbackValue)) {
    return fallbackValue
  }

  return values[0] || fallbackValue || ''
}
