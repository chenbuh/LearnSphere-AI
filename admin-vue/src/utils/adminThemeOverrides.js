// Naive UI 主题覆盖：新一代现代科技 SaaS (Indigo & Slate) 设计系统
const ink = '#0f172a'
const ink2 = '#334155'
const ink3 = '#64748b'
const line = '#e2e5ea'
const lineStrong = '#cbd5e1'
const paper = '#f8fafc'
const paperSunken = '#f1f5f9'
const surface = '#ffffff'
const accent = '#4f46e5'
const accentHover = '#4338ca'
const accentPressed = '#3730a3'

export const adminThemeOverrides = {
  common: {
    primaryColor: accent,
    primaryColorHover: accentHover,
    primaryColorPressed: accentPressed,
    primaryColorSuppl: accentHover,
    infoColor: '#0ea5e9',
    infoColorHover: '#38bdf8',
    infoColorPressed: '#0284c7',
    infoColorSuppl: '#38bdf8',
    successColor: '#10b981',
    successColorHover: '#34d399',
    successColorPressed: '#059669',
    successColorSuppl: '#34d399',
    warningColor: '#f59e0b',
    warningColorHover: '#fbbf24',
    warningColorPressed: '#d97706',
    warningColorSuppl: '#fbbf24',
    errorColor: '#ef4444',
    errorColorHover: '#f87171',
    errorColorPressed: '#dc2626',
    errorColorSuppl: '#f87171',

    textColorBase: ink,
    textColor1: ink,
    textColor2: ink2,
    textColor3: ink3,
    placeholderColor: '#94a3b8',
    iconColor: ink3,

    bodyColor: paper,
    cardColor: surface,
    modalColor: surface,
    popoverColor: surface,
    tableColor: surface,
    tableHeaderColor: '#f8fafc',
    tableColorHover: '#f8fafc',
    tableColorStriped: '#fafbfc',
    inputColor: surface,
    inputColorDisabled: paperSunken,
    actionColor: '#f8fafc',
    hoverColor: 'rgba(79, 70, 229, 0.05)',
    pressedColor: 'rgba(79, 70, 229, 0.08)',
    tagColor: paperSunken,
    codeColor: '#0f172a',

    borderColor: line,
    dividerColor: line,

    borderRadius: '8px',
    borderRadiusSmall: '6px',
    boxShadow1: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
    boxShadow2: '0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
    boxShadow3: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',

    fontFamily:
      "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', 'Cascadia Mono', Consolas, monospace",
    fontSize: '13.5px',
    fontSizeMedium: '13.5px'
  },
  Button: {
    borderRadiusMedium: '8px',
    borderRadiusSmall: '6px',
    borderRadiusLarge: '10px',
    fontWeight: '550',
    colorSecondary: '#f1f5f9',
    colorSecondaryHover: '#e2e8f0',
    colorSecondaryPressed: '#cbd5e1',
    textColorSecondary: ink2
  },
  Card: {
    borderRadius: '12px',
    borderColor: line,
    paddingMedium: '20px 22px 22px',
    titleFontSizeMedium: '15px',
    titleFontWeight: '650',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.03)'
  },
  DataTable: {
    borderColor: line,
    thColor: '#f8fafc',
    thTextColor: ink2,
    thFontWeight: '650',
    tdColor: surface,
    tdColorHover: '#f8fafc',
    borderRadius: '12px',
    fontSizeMedium: '13.5px'
  },
  Tabs: {
    tabTextColorLine: ink3,
    tabTextColorActiveLine: accent,
    tabTextColorHoverLine: accentHover,
    barColor: accent,
    tabFontWeightActive: '650'
  },
  Tag: {
    borderRadius: '6px',
    fontWeight: '550'
  },
  Input: {
    borderRadius: '8px',
    borderColor: line,
    borderHover: accent,
    borderFocus: accent,
    boxShadowFocus: '0 0 0 2px rgba(79, 70, 229, 0.15)'
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '8px',
        borderColor: line,
        borderHover: accent,
        borderActive: accent,
        boxShadowActive: '0 0 0 2px rgba(79, 70, 229, 0.15)'
      }
    }
  },
  Modal: {
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
  },
  Dialog: {
    borderRadius: '16px'
  }
}
