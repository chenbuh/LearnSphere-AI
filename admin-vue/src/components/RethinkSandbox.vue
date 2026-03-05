<template>
  <n-modal
    v-model:show="show"
    preset="card"
    :title="`🧪 Rethink 沙箱 - ${feedbackItem?.actionType || '提示词优化'}`"
    style="width: 1200px"
    :bordered="false"
    class="rethink-sandbox-modal"
  >
    <n-grid :cols="2" :x-gap="24">
      <!-- 左侧:原始信息 -->
      <n-grid-item>
        <div class="panel-section">
          <div class="section-header error">
            <n-icon :component="AlertTriangle" :size="18" />
            <span>错误反馈详情</span>
          </div>

          <n-card size="small" :bordered="false" class="info-card">
            <n-descriptions :column="1" label-size="small">
              <n-descriptions-item label="Action类型">
                <n-tag type="info" size="small">{{ feedbackItem?.actionType }}</n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="反馈时间">
                {{ formatTime(feedbackItem?.createTime) }}
              </n-descriptions-item>
              <n-descriptions-item label="用户评分">
                <n-tag type="error" size="small">❌ {{ feedbackItem?.rating === -1 ? '无用' : '负面' }}</n-tag>
              </n-descriptions-item>
            </n-descriptions>
          </n-card>

          <div class="feedback-content">
            <div class="content-label">用户反馈内容:</div>
            <div class="content-text error-text">
              {{ feedbackItem?.feedbackText || feedbackItem?.feedback_text || '无具体内容' }}
            </div>
          </div>

          <div v-if="feedbackItem?.analysisResult || feedbackItem?.analysis_result" class="ai-analysis">
            <div class="content-label">
              <n-icon :component="Brain" :size="14" />
              AI 智能归因:
            </div>
            <div class="analysis-text">
              {{ formatAnalysisText(feedbackItem.analysisResult || feedbackItem.analysis_result) }}
            </div>
          </div>

          <!-- 原始提示词 (如果可获取) -->
          <n-collapse class="mt-4">
            <n-collapse-item title="📋 查看原始提示词 (参考)" name="original">
              <div class="prompt-viewer">
                <div class="prompt-label">System Prompt:</div>
                <div class="prompt-content">{{ originalPrompt || '点击"加载原始提示词"获取' }}</div>
                <n-button
                  v-if="!originalPrompt"
                  size="small"
                  type="primary"
                  ghost
                  @click="loadOriginalPrompt"
                  :loading="loadingPrompt"
                  class="mt-2"
                >
                  <template #icon><RefreshCcw :size="14" /></template>
                  加载原始提示词
                </n-button>
              </div>
            </n-collapse-item>
          </n-collapse>
        </div>
      </n-grid-item>

      <!-- 右侧:优化工作台 -->
      <n-grid-item>
        <div class="panel-section">
          <div class="section-header success">
            <n-icon :component="FlaskConical" :size="18" />
            <span>提示词缝合工作台</span>
          </div>

          <div class="workspace">
            <!-- 快速操作 -->
            <div class="quick-actions">
              <n-space>
                <n-button
                  size="small"
                  type="info"
                  ghost
                  @click="useAISuggestion"
                  :loading="loadingAISuggestion"
                >
                  <template #icon><Brain :size="14" /></template>
                  AI 生成优化建议
                </n-button>
                <n-button
                  size="small"
                  type="warning"
                  ghost
                  @click="applyCommonFix"
                >
                  <template #icon><Zap :size="14" /></template>
                  应用常见修复
                </n-button>
              </n-space>
            </div>

            <!-- 缝合编辑器 -->
            <div class="stitch-editor">
              <div class="editor-label">
                <span>缝合后的新提示词:</span>
                <n-tag size="tiny" type="success" v-if="hasChanges">已修改</n-tag>
              </div>

              <n-input
                v-model:value="stitchedPrompt"
                type="textarea"
                placeholder="在此缝合您的优化提示词...&#10;&#10;提示:&#10;1. 参考左侧的AI归因分析&#10;2. 针对用户反馈的具体问题&#10;3. 保持原有结构,只做针对性调整"
                :autosize="{ minRows: 8, maxRows: 15 }"
                :status="hasChanges ? 'warning' : 'default'"
                @input="handlePromptChange"
                class="prompt-textarea"
              />

              <!-- 变更对比 -->
              <div v-if="originalPrompt && hasChanges" class="diff-preview">
                <div class="diff-header">
                  <span>变更预览:</span>
                  <n-switch v-model:value="showDiff" size="small" />
                </div>
                <div v-if="showDiff" class="diff-content">
                  <div class="diff-line removed">
                    <span class="diff-marker">-</span>
                    <span class="diff-text">{{ getDiffRemoved() }}</span>
                  </div>
                  <div class="diff-line added">
                    <span class="diff-marker">+</span>
                    <span class="diff-text">{{ getDiffAdded() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 实时测试 -->
            <div class="test-section">
              <div class="test-header">
                <span class="test-label">实时测试效果:</span>
                <n-button
                  size="small"
                  type="primary"
                  @click="runTest"
                  :loading="testLoading"
                  :disabled="!stitchedPrompt"
                >
                  <template #icon><Play :size="14" /></template>
                  运行测试
                </n-button>
              </div>

              <div v-if="testResult" class="test-result">
                <div class="result-header">
                  <n-tag :type="testResult.success ? 'success' : 'error'" size="small">
                    {{ testResult.success ? '✓ 测试成功' : '✗ 测试失败' }}
                  </n-tag>
                  <span class="result-meta" v-if="testResult.duration">
                    耗时: {{ testResult.duration }}ms
                  </span>
                </div>
                <div class="result-content">
                  {{ testResult.content }}
                </div>
              </div>

              <n-empty
                v-else
                description="点击“运行测试”查看效果"
                size="small"
                class="test-empty"
              />
            </div>
          </div>
        </div>
      </n-grid-item>
    </n-grid>

    <!-- 底部操作栏 -->
    <template #footer>
      <div class="footer-actions">
        <div class="footer-left">
          <n-text depth="3" class="footer-tip">
            💡 提示: 优化后的提示词将保存到系统并替换原有版本
          </n-text>
        </div>
        <div class="footer-right">
          <n-space>
            <n-button @click="handleClose">取消</n-button>
            <n-button
              type="primary"
              @click="handleSaveOptimized"
              :disabled="!hasChanges || !testResult?.success"
              :loading="saving"
            >
              <template #icon><CheckCircle :size="16" /></template>
              保存优化版本
            </n-button>
          </n-space>
        </div>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  NModal, NGrid, NGridItem, NCard, NDescriptions, NDescriptionsItem,
  NTag, NButton, NSpace, NInput, NCollapse, NCollapseItem,
  NSwitch, NEmpty, NText, useMessage, NIcon
} from 'naive-ui'
import {
  AlertTriangle, Brain, FlaskConical, Zap, RefreshCcw,
  Play, CheckCircle
} from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  feedbackItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show', 'saved'])

const message = useMessage()

const originalPrompt = ref('')
const stitchedPrompt = ref('')
const testResult = ref(null)
const testLoading = ref(false)
const loadingPrompt = ref(false)
const loadingAISuggestion = ref(false)
const saving = ref(false)
const showDiff = ref(true)

const hasChanges = computed(() => {
  return stitchedPrompt.value !== originalPrompt.value && stitchedPrompt.value.length > 0
})

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

// 格式化分析文本
const formatAnalysisText = (text) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

// 加载原始提示词
const loadOriginalPrompt = async () => {
  if (!props.feedbackItem?.actionType) {
    message.warning('无法获取Action类型')
    return
  }

  loadingPrompt.value = true
  try {
    const res = await adminApi.getPromptByAction(props.feedbackItem.actionType)
    if (res.data) {
      originalPrompt.value = res.data.content || res.data
      stitchedPrompt.value = originalPrompt.value
      message.success('原始提示词加载成功')
    }
  } catch (error) {
    message.error('加载失败: ' + error.message)
  } finally {
    loadingPrompt.value = false
  }
}

// 使用AI生成优化建议
const useAISuggestion = async () => {
  loadingAISuggestion.value = true
  try {
    const res = await adminApi.generatePromptOptimization({
      actionType: props.feedbackItem?.actionType,
      feedback: props.feedbackItem?.feedbackText || props.feedbackItem?.feedback_text,
      analysis: props.feedbackItem?.analysisResult || props.feedbackItem?.analysis_result,
      originalPrompt: originalPrompt.value
    })

    if (res.data?.optimizedPrompt) {
      stitchedPrompt.value = res.data.optimizedPrompt
      message.success('AI优化建议已生成')
    }
  } catch (error) {
    message.error('生成失败: ' + error.message)
  } finally {
    loadingAISuggestion.value = false
  }
}

// 应用常见修复
const applyCommonFix = () => {
  if (!originalPrompt.value) {
    message.warning('请先加载原始提示词')
    return
  }

  const commonFixes = [
    { pattern: /请生成/g, replacement: '请仔细生成符合以下要求的' },
    { pattern: /回答问题/g, replacement: '详细分析并回答问题' },
    { pattern: /简洁/g, replacement: '详细且准确' },
    { pattern: { regex: /例子.*示例/g, test: (str) => str.length < 100 }, replacement: '，并包含3个具体例子' }
  ]

  let optimized = originalPrompt.value
  let applied = false

  commonFixes.forEach(fix => {
    if (fix.pattern.test(optimized)) {
      optimized = optimized.replace(fix.pattern, fix.replacement)
      applied = true
    }
  })

  if (applied) {
    stitchedPrompt.value = optimized
    message.success('已应用常见修复模式')
  } else {
    message.info('当前提示词无需常见修复')
  }
}

// 运行测试
const runTest = async () => {
  if (!stitchedPrompt.value) {
    message.warning('请先输入优化后的提示词')
    return
  }

  testLoading.value = true
  testResult.value = null

  try {
    const startTime = Date.now()
    const res = await adminApi.testPrompt({
      actionType: props.feedbackItem?.actionType,
      systemPrompt: stitchedPrompt.value,
      testInput: props.feedbackItem?.feedbackText || props.feedbackItem?.feedback_text || '测试输入'
    })
    const duration = Date.now() - startTime

    testResult.value = {
      success: true,
      content: res.data?.response || res.data?.result || '测试成功',
      duration
    }

    message.success('测试运行成功')
  } catch (error) {
    testResult.value = {
      success: false,
      content: error.message || '测试失败',
      duration: 0
    }
    message.error('测试失败')
  } finally {
    testLoading.value = false
  }
}

// 获取差异文本
const getDiffRemoved = () => {
  if (!originalPrompt.value) return ''
  const removed = originalPrompt.value.slice(0, 100) + '...'
  return removed.length > 100 ? removed : originalPrompt.value
}

const getDiffAdded = () => {
  if (!stitchedPrompt.value) return ''
  const added = stitchedPrompt.value.slice(0, 100) + '...'
  return added.length > 100 ? added : stitchedPrompt.value
}

// 处理提示词变化
const handlePromptChange = () => {
  // 清除之前的测试结果
  if (testResult.value) {
    testResult.value = null
  }
}

// 保存优化版本
const handleSaveOptimized = async () => {
  if (!hasChanges.value) {
    message.warning('请先优化提示词')
    return
  }

  if (!testResult.value?.success) {
    message.warning('请先运行测试并确保通过')
    return
  }

  saving.value = true
  try {
    await adminApi.updatePrompt({
      promptKey: props.feedbackItem?.actionType,
      content: stitchedPrompt.value,
      remark: `Rethink优化 - 基于用户反馈ID: ${props.feedbackItem?.id}`
    })

    message.success('提示词优化版本已保存')

    emit('saved', {
      originalPrompt: originalPrompt.value,
      optimizedPrompt: stitchedPrompt.value,
      feedbackId: props.feedbackItem?.id
    })

    handleClose()
  } catch (error) {
    message.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 关闭
const handleClose = () => {
  emit('update:show', false)
  // 重置状态
  originalPrompt.value = ''
  stitchedPrompt.value = ''
  testResult.value = null
  showDiff.value = true
}

// 监听显示状态
watch(() => props.show, (newVal) => {
  if (newVal && props.feedbackItem) {
    // 自动加载原始提示词
    loadOriginalPrompt()
  }
})
</script>

<style scoped lang="scss">
.rethink-sandbox-modal {
  :deep(.n-card__content) {
    padding: 16px;
  }
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  &.success {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
}

.info-card {
  background: rgba(39, 39, 42, 0.5);
}

.feedback-content,
.ai-analysis,
.prompt-viewer {
  background: rgba(39, 39, 42, 0.5);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.content-label,
.prompt-label,
.editor-label,
.analysis-text {
  font-size: 12px;
  color: #a1a1aa;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.editor-label {
  justify-content: space-between;
}

.content-text,
.prompt-content {
  font-size: 13px;
  color: #e4e4e7;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-text {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #ef4444;
}

.analysis-text {
  color: #a5b4fc;
  background: rgba(99, 102, 241, 0.1);
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #6366f1;
}

.workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-actions {
  background: rgba(39, 39, 42, 0.5);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stitch-editor {
  background: rgba(39, 39, 42, 0.5);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.prompt-textarea {
  :deep(.n-input__textarea-el) {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    line-height: 1.6;
  }
}

.diff-preview {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  .diff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: #a1a1aa;
  }

  .diff-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .diff-line {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;

    &.removed {
      background: rgba(239, 68, 68, 0.1);
      color: #fca5a5;
    }

    &.added {
      background: rgba(34, 197, 94, 0.1);
      color: #86efac;
    }

    .diff-marker {
      flex-shrink: 0;
      font-weight: 600;
    }

    .diff-text {
      flex: 1;
      word-break: break-all;
    }
  }
}

.test-section {
  background: rgba(39, 39, 42, 0.5);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  .test-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .test-label {
      font-size: 12px;
      font-weight: 600;
      color: #a1a1aa;
    }
  }

  .test-result {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);

    .result-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .result-meta {
        font-size: 11px;
        color: #71717a;
      }
    }

    .result-content {
      font-size: 12px;
      color: #d4d4d8;
      line-height: 1.6;
      max-height: 150px;
      overflow-y: auto;
    }
  }

  .test-empty {
    padding: 20px;
    text-align: center;
  }
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .footer-left {
    flex: 1;
  }

  .footer-tip {
    font-size: 12px;
  }

  .footer-right {
    display: flex;
    align-items: center;
  }
}

// 响应式
@media (max-width: 1200px) {
  .rethink-sandbox-modal {
    :deep(.n-card) {
      width: 95vw !important;
    }
  }
}
</style>
