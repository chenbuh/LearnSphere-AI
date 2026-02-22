<template>
  <div class="learning-heatmap">
    <div class="heatmap-grid">
      <!-- 年份标签 -->
      <div class="heatmap-year-labels">
        <div class="year-label"></div>
        <div
          v-for="month in months"
          :key="month"
          class="month-label"
        >
          {{ month }}
        </div>
      </div>

      <!-- 热力图主体 -->
      <div class="heatmap-body">
        <div class="weekday-labels">
          <div
            v-for="day in weekdays"
            :key="day"
            class="weekday-label"
          >
            {{ day }}
          </div>
        </div>

        <div class="heatmap-cells">
          <div
            v-for="(cell, index) in heatmapCells"
            :key="index"
            :class="['heatmap-cell', `level-${cell.level}`]"
            :title="getTooltip(cell)"
          >
            <span v-if="cell.count > 0" class="cell-count">{{ cell.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="heatmap-legend">
      <span class="legend-label">学习频率</span>
      <div class="legend-colors">
        <div class="legend-cell level-0"></div>
        <div class="legend-cell level-1"></div>
        <div class="legend-cell level-2"></div>
        <div class="legend-cell level-3"></div>
        <div class="legend-cell level-4"></div>
      </div>
      <span class="legend-text">少 → 多</span>
    </div>

    <!-- 统计信息 -->
    <div class="heatmap-stats">
      <div class="stat-item">
        <span class="stat-value">{{ totalStudyDays }}</span>
        <span class="stat-label">总学习天数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ longestStreak }}</span>
        <span class="stat-label">最长连续</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ currentStreak }}</span>
        <span class="stat-label">当前连续</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  }
})

const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

// 生成热力图单元格数据
const heatmapCells = computed(() => {
  const cells = []
  const weeks = 53
  const daysPerWeek = 7

  for (let week = 0; week < weeks; week++) {
    for (let day = 0; day < daysPerWeek; day++) {
      // 模拟数据
      const count = props.data.data?.[week]?.[day] || Math.floor(Math.random() * 5)
      const level = Math.min(count, 4)

      cells.push({
        week,
        day,
        count,
        level,
        date: getDateForCell(week, day)
      })
    }
  }

  return cells
})

// 获取单元格对应的日期
function getDateForCell(week, day) {
  const date = new Date(props.year, 0, 1 + week * 7 + day)
  return date
}

// 获取提示文本
function getTooltip(cell) {
  if (cell.count === 0) return '无学习记录'
  const date = cell.date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  return `${date}：学习 ${cell.count} 次`
}

// 统计数据
const totalStudyDays = computed(() => {
  return heatmapCells.value.filter(c => c.count > 0).length
})

const longestStreak = ref(15) // 最长连续天数
const currentStreak = ref(5) // 当前连续天数
</script>

<style scoped>
.learning-heatmap {
  width: 100%;
}

.heatmap-grid {
  display: flex;
  gap: 8px;
}

.heatmap-year-labels {
  flex-shrink: 0;
}

.year-label {
  height: 30px;
}

.month-label {
  height: 15px;
  font-size: 11px;
  color: #71717a;
}

.heatmap-body {
  flex: 1;
}

.weekday-labels {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-right: 8px;
}

.weekday-label {
  height: 13px;
  font-size: 10px;
  color: #71717a;
  display: flex;
  align-items: center;
}

.heatmap-cells {
  display: grid;
  grid-template-rows: repeat(7, 13px);
  grid-template-columns: repeat(53, 13px);
  gap: 3px;
}

.heatmap-cell {
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.heatmap-cell:hover {
  transform: scale(1.2);
  z-index: 1;
}

.heatmap-cell.level-0 {
  background: rgba(255, 255, 255, 0.05);
}

.heatmap-cell.level-1 {
  background: rgba(16, 185, 129, 0.3);
}

.heatmap-cell.level-2 {
  background: rgba(16, 185, 129, 0.6);
}

.heatmap-cell.level-3 {
  background: rgba(16, 185, 129, 0.9);
}

.heatmap-cell.level-4 {
  background: #10b981;
}

.cell-count {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8px;
  font-weight: 600;
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.2s;
}

.heatmap-cell:hover .cell-count {
  opacity: 1;
}

/* 图例 */
.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.legend-colors {
  display: flex;
  gap: 3px;
}

.legend-cell {
  width: 13px;
  height: 13px;
  border-radius: 2px;
}

.legend-cell.level-0 { background: rgba(255, 255, 255, 0.05); }
.legend-cell.level-1 { background: rgba(16, 185, 129, 0.3); }
.legend-cell.level-2 { background: rgba(16, 185, 129, 0.6); }
.legend-cell.level-3 { background: rgba(16, 185, 129, 0.9); }
.legend-cell.level-4 { background: #10b981; }

/* 统计 */
.heatmap-stats {
  display: flex;
  gap: 32px;
  margin-top: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
}

/* 移动端 */
@media (max-width: 768px) {
  .heatmap-cells {
    grid-template-columns: repeat(53, 10px);
    grid-template-rows: repeat(7, 10px);
  }

  .heatmap-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
