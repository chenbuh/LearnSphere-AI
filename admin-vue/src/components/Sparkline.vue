<template>
  <div class="sparkline-container" :style="{ width: width, height: height }">
    <svg
      :viewBox="`0 0 ${viewWidth} ${viewHeight}`"
      preserveAspectRatio="none"
      class="sparkline-svg"
    >
      <!-- 定义渐变 -->
      <defs>
        <linearGradient
          :id="`gradient-${id}`"
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop
            offset="0%"
            :stop-color="color"
            :stop-opacity="fillOpacity"
          />
          <stop
            offset="100%"
            :stop-color="color"
            :stop-opacity="0"
          />
        </linearGradient>
      </defs>

      <!-- 填充区域 -->
      <path
        v-if="showArea"
        :d="areaPath"
        :fill="`url(#gradient-${id})`"
        class="sparkline-area"
      />

      <!-- 折线 -->
      <path
        :d="linePath"
        :fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        class="sparkline-line"
      />

      <!-- 数据点 (可选) -->
      <circle
        v-for="(point, index) in points"
        :key="index"
        :cx="point.x"
        :cy="point.y"
        :r="dotSize"
        :fill="dotColor || color"
        class="sparkline-dot"
        v-show="showDots"
      />

      <!-- 基准线 (可选) -->
      <line
        v-if="showBaseline"
        :x1="0"
        :y1="baselineY"
        :x2="viewWidth"
        :y2="baselineY"
        :stroke="baselineColor"
        :stroke-width="1"
        :stroke-dasharray="baselineDash"
        class="sparkline-baseline"
      />
    </svg>

    <!-- 统计信息叠加 -->
    <div v-if="showStats" class="sparkline-stats">
      <div class="stat-value">{{ statValue }}</div>
      <div class="stat-change" :class="changeClass">
        {{ statChange }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '40px'
  },
  color: {
    type: String,
    default: '#10b981'
  },
  strokeWidth: {
    type: Number,
    default: 1.5
  },
  showArea: {
    type: Boolean,
    default: true
  },
  showDots: {
    type: Boolean,
    default: false
  },
  dotSize: {
    type: Number,
    default: 2
  },
  fillOpacity: {
    type: Number,
    default: 0.3
  },
  showBaseline: {
    type: Boolean,
    default: false
  },
  baselineValue: {
    type: Number,
    default: 0
  },
  baselineColor: {
    type: String,
    default: 'rgba(255,255,255,0.2)'
  },
  baselineDash: {
    type: String,
    default: '4,4'
  },
  showStats: {
    type: Boolean,
    default: false
  },
  smooth: {
    type: Boolean,
    default: true
  }
})

const id = ref(Math.random().toString(36).substr(2, 9))
const viewWidth = ref(100)
const viewHeight = ref(40)

// 计算数据范围
const dataRange = computed(() => {
  if (!props.data || props.data.length === 0) {
    return { min: 0, max: 100 }
  }
  const values = props.data.filter(v => v != null && !isNaN(v))
  if (values.length === 0) {
    return { min: 0, max: 100 }
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.1
  return {
    min: Math.max(0, min - padding),
    max: max + padding
  }
})

// 将数据值转换为坐标
const points = computed(() => {
  if (!props.data || props.data.length === 0) return []

  const { min, max } = dataRange.value
  const range = max - min || 1
  const count = props.data.length
  const stepX = viewWidth.value / (count > 1 ? count - 1 : 1)

  return props.data.map((value, index) => {
    if (value == null || isNaN(value)) {
      return null
    }
    const x = index * stepX
    const y = viewHeight.value - ((value - min) / range) * viewHeight.value
    return { x, y }
  }).filter(p => p !== null)
})

// 生成折线路径
const linePath = computed(() => {
  if (points.value.length === 0) return ''

  if (props.smooth && points.value.length > 2) {
    // 使用贝塞尔曲线平滑
    return generateSmoothPath(points.value)
  } else {
    // 直线连接
    return points.value
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')
  }
})

// 生成区域路径
const areaPath = computed(() => {
  if (points.value.length === 0) return ''

  const line = linePath.value
  const firstPoint = points.value[0]
  const lastPoint = points.value[points.value.length - 1]

  return `${line} L ${lastPoint.x} ${viewHeight.value} L ${firstPoint.x} ${viewHeight.value} Z`
})

// 基准线位置
const baselineY = computed(() => {
  const { min, max } = dataRange.value
  const range = max - min || 1
  return viewHeight.value - ((props.baselineValue - min) / range) * viewHeight.value
})

// 统计值
const statValue = computed(() => {
  if (!props.data || props.data.length === 0) return '0'
  const lastValue = props.data[props.data.length - 1]
  return Math.round(lastValue)
})

const statChange = computed(() => {
  if (!props.data || props.data.length < 2) return ''
  const first = props.data[0]
  const last = props.data[props.data.length - 1]
  const change = ((last - first) / Math.abs(first || 1)) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
})

const changeClass = computed(() => {
  const change = parseFloat(statChange.value)
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
})

// 生成平滑路径
function generateSmoothPath(points) {
  if (points.length < 3) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  }

  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]

    // 使用二次贝塞尔曲线
    const cpX = (prev.x + curr.x) / 2
    path += ` Q ${prev.x} ${prev.y}, ${cpX} ${(prev.y + curr.y) / 2}`
    path += ` T ${curr.x} ${curr.y}`
  }

  return path
}

// 监听数据变化,更新尺寸
watch(() => props.data, (newData) => {
  if (newData && newData.length > 0) {
    // 可以根据数据量动态调整视图尺寸
    // viewWidth.value = Math.max(100, newData.length * 10)
  }
}, { immediate: true })
</script>

<style scoped lang="scss">
.sparkline-container {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.sparkline-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.sparkline-line {
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: d 0.3s ease;
}

.sparkline-area {
  transition: d 0.3s ease;
}

.sparkline-dot {
  transition: all 0.2s ease;

  &:hover {
    r: 4;
  }
}

.sparkline-baseline {
  opacity: 0.5;
}

.sparkline-stats {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;

  .stat-value {
    font-size: 14px;
    font-weight: 700;
    color: white;
    line-height: 1;
  }

  .stat-change {
    font-size: 10px;
    margin-top: 2px;
    font-weight: 600;

    &.positive {
      color: #10b981;
    }

    &.negative {
      color: #ef4444;
    }

    &.neutral {
      color: #71717a;
    }
  }
}
</style>
