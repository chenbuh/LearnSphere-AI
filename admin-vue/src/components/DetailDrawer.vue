<template>
  <n-drawer
    v-model:show="isShowDrawer"
    :width="drawerWidth"
    :placement="'right'"
    :to="false"
    :on-after-leave="handleClose"
    class="detail-drawer"
  >
    <n-drawer-content :body-style="drawerBodyStyle" :native-scrollbar="false">
      <template #header>
        <div class="drawer-header">
          <div class="header-left">
            <n-icon :component="getIcon()" :size="20" class="header-icon" />
            <span class="header-title">{{ title }}</span>
            <n-tag v-if="subtitle" type="info" size="small" round>{{ subtitle }}</n-tag>
          </div>
          <div class="header-right">
            <n-button
              v-if="showRefresh"
              text
              circle
              size="small"
              @click="handleRefresh"
              class="header-btn"
            >
              <template #icon>
                <n-icon :component="RefreshCw" />
              </template>
            </n-button>
            <n-button
              v-if="showEdit"
              type="primary"
              size="small"
              @click="handleEdit"
              class="header-btn"
            >
              <template #icon>
                <n-icon :component="Edit" />
              </template>
              编辑
            </n-button>
          </div>
        </div>
      </template>

      <!-- 自定义内容插槽 -->
      <slot name="content" :data="drawerData" :loading="loading">
        <!-- 默认内容结构 -->
        <n-spin :show="loading">
          <div class="drawer-content">
            <!-- 快速概览卡片 -->
            <n-card v-if="quickInfo" class="quick-info-card" :bordered="false">
              <div class="quick-info-grid">
                <div v-for="(item, key) in quickInfo" :key="key" class="quick-info-item">
                  <span class="info-label">{{ item.label }}</span>
                  <span class="info-value" :class="item.valueClass">
                    {{ item.value }}
                  </span>
                </div>
              </div>
            </n-card>

            <!-- 详细信息 -->
            <n-card v-if="detailSections && detailSections.length > 0" class="detail-card" :bordered="false">
              <n-collapse>
                <n-collapse-item
                  v-for="(section, index) in detailSections"
                  :key="index"
                  :title="section.title"
                  :name="index"
                >
                  <template #header-extra>
                    <n-icon :component="ChevronRight" />
                  </template>
                  <div class="section-content">
                    <div v-for="(item, key) in section.items" :key="key" class="detail-item">
                      <span class="item-label">{{ item.label }}:</span>
                      <span class="item-value">
                        <component
                          v-if="item.render"
                          :is="item.render"
                          :value="item.value"
                          :data="drawerData"
                        />
                        <n-tag v-else-if="item.tag" :type="item.tagType || 'default'" size="small">
                          {{ item.value }}
                        </n-tag>
                        <span v-else>{{ item.value || '-' }}</span>
                      </span>
                    </div>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </n-card>

            <!-- 时间线/日志 -->
            <n-card v-if="timeline && timeline.length > 0" class="timeline-card" :bordered="false">
              <template #header>
                <div class="card-header">
                  <n-icon :component="Clock" />
                  <span>操作记录</span>
                </div>
              </template>
              <n-timeline>
                <n-timeline-item
                  v-for="(item, index) in timeline"
                  :key="index"
                  :type="item.type || 'default'"
                  :title="item.title"
                  :time="item.time"
                >
                  <template #icon>
                    <n-icon :component="getTimelineIcon(item.type)" />
                  </template>
                  {{ item.content }}
                </n-timeline-item>
              </n-timeline>
            </n-card>
          </div>
        </n-spin>
      </template>

      <!-- 底部操作按钮 -->
      <template #footer v-if="showFooter">
        <div class="drawer-footer">
          <n-space>
            <n-button @click="handleClose">关闭</n-button>
            <n-button v-if="showEdit" type="primary" @click="handleEdit">编辑</n-button>
            <n-button v-if="showDelete" type="error" @click="handleDelete">删除</n-button>
          </n-space>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, computed, watch, h } from 'vue'
import {
  NDrawer,
  NDrawerContent,
  NCard,
  NButton,
  NSpace,
  NIcon,
  NTag,
  NSpin,
  NCollapse,
  NCollapseItem,
  NTimeline,
  NTimelineItem
} from 'naive-ui'
import {
  User,
  FileText,
  AlertCircle,
  Clock,
  Edit,
  Delete,
  RefreshCw,
  ChevronRight,
  Settings,
  Activity
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '详情'
  },
  subtitle: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'default', // user, log, sensitive, prompt
    validator: (value) => ['user', 'log', 'sensitive', 'prompt', 'default'].includes(value)
  },
  data: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: [String, Number],
    default: 600
  },
  showEdit: {
    type: Boolean,
    default: false
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  showRefresh: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  quickInfo: {
    type: Object,
    default: () => null
  },
  detailSections: {
    type: Array,
    default: () => []
  },
  timeline: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'edit', 'delete', 'refresh'])

const isShowDrawer = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const drawerWidth = computed(() => {
  if (typeof props.width === 'number') {
    // 响应式宽度
    return window.innerWidth < 768 ? '100%' : props.width
  }
  return props.width
})

const drawerBodyStyle = {
  padding: '16px',
  background: 'var(--n-color)',
  height: '100%'
}

const drawerData = computed(() => props.data)

const getIcon = () => {
  const iconMap = {
    user: User,
    log: Activity,
    sensitive: AlertCircle,
    prompt: FileText,
    default: Settings
  }
  return iconMap[props.type] || iconMap.default
}

const getTimelineIcon = (type) => {
  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }
  return iconMap[type] || Clock
}

const handleClose = () => {
  emit('update:show', false)
}

const handleEdit = () => {
  emit('edit', props.data)
}

const handleDelete = () => {
  emit('delete', props.data)
}

const handleRefresh = () => {
  emit('refresh', props.data)
}

// ESC键关闭
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.show) {
    handleClose()
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<script>
import { CheckCircle, XCircle, Info } from 'lucide-vue-next'

export default {
  components: {
    CheckCircle,
    XCircle,
    Info
  }
}
</script>

<style scoped lang="scss">
.detail-drawer {
  :deep(.n-drawer-body) {
    background: var(--n-color);
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;

    .header-icon {
      color: var(--n-target-color);
    }

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--n-text-color);
    }
  }

  .header-right {
    display: flex;
    gap: 8px;

    .header-btn {
      margin-left: 4px;
    }
  }
}

.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-info-card {
  .quick-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;

    .quick-info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .info-label {
        font-size: 12px;
        color: var(--n-text-color-2);
      }

      .info-value {
        font-size: 16px;
        font-weight: 600;
        color: var(--n-text-color);

        &.value-primary {
          color: var(--n-target-color);
        }

        &.value-success {
          color: var(--n-success-color);
        }

        &.value-warning {
          color: var(--n-warning-color);
        }

        &.value-error {
          color: var(--n-error-color);
        }
      }
    }
  }
}

.detail-card {
  .section-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .detail-item {
    display: flex;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--n-divider-color);

    &:last-child {
      border-bottom: none;
    }

    .item-label {
      flex-shrink: 0;
      width: 120px;
      font-weight: 500;
      color: var(--n-text-color-2);
    }

    .item-value {
      flex: 1;
      color: var(--n-text-color);
      word-break: break-all;
    }
  }
}

.timeline-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

// 响应式设计
@media (max-width: 768px) {
  .quick-info-card {
    .quick-info-grid {
      grid-template-columns: 1fr;
    }
  }

  .detail-card {
    .detail-item {
      flex-direction: column;
      gap: 4px;

      .item-label {
        width: 100%;
      }
    }
  }
}
</style>
