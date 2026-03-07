import {
  BookOpen,
  Clock,
  Drama,
  FileText,
  Link,
  MapPin,
  RotateCcw,
  Stamp,
  Target,
  Zap
} from 'lucide-vue-next'

export const grammarTopics = [
  { id: 1, title: '时态语态', desc: '现在时、过去时、被动语态等', count: 42, icon: Clock, color: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)' },
  { id: 2, title: '从句结构', desc: '定语从句、状语从句、名词性从句', count: 36, icon: Link, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)' },
  { id: 3, title: '介词用法', desc: '时间、地点、方位介词', count: 32, icon: MapPin, color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
  { id: 4, title: '冠词用法', desc: '定冠词、不定冠词、零冠词', count: 24, icon: FileText, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
  { id: 5, title: '情态动词', desc: 'can, must, should 等用法', count: 28, icon: Drama, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
  { id: 6, title: '条件句', desc: '真实条件句、虚拟条件句', count: 30, icon: Stamp, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)' },
  { id: 7, title: '倒装句', desc: '完全倒装、部分倒装', count: 18, icon: RotateCcw, color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.1)' },
  { id: 8, title: '非谓语', desc: '不定式、动名词、分词', count: 45, icon: Zap, color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)' }
]

export const practiceModes = [
  { id: 'quick', title: '快速练习', desc: '10道题快速测试', icon: Zap, color: '#f97316' },
  { id: 'comprehensive', title: '综合练习', desc: '20道题全面检测', icon: BookOpen, color: '#22c55e' },
  { id: 'exam', title: '考试模拟', desc: '限时模拟考试', icon: Target, color: '#ef4444' }
]

export const difficulties = [
  { id: 'easy', title: '基础', desc: '适合初学者', stars: 1, color: '#4ade80' },
  { id: 'medium', title: '中级', desc: '有一定挑战', stars: 2, color: '#facc15' },
  { id: 'hard', title: '高级', desc: '挑战高难度', stars: 3, color: '#f87171' }
]
