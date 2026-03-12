<script setup>
import { NAlert, NButton, NForm, NFormItem, NInput, NInputGroup, NModal, NSelect, NSpace, NTag } from 'naive-ui'
import { Sparkles } from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  examTypeOptions: {
    type: Array,
    default: () => []
  },
  checkingQuality: {
    type: Boolean,
    default: false
  },
  qualityCheckResult: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'update:show',
  'update:form-data',
  'ai-fill',
  'ai-check',
  'apply-suggestion',
  'submit'
])

const updateField = (key, value) => {
  emit('update:form-data', {
    ...props.formData,
    [key]: value
  })
}

const getIssueSeverityType = (severity) => {
  const typeMap = {
    high: 'error',
    medium: 'warning',
    low: 'info'
  }
  return typeMap[severity] || 'default'
}

const getIssueTypeLabel = (type) => {
  const labelMap = {
    spelling: '拼写',
    sensitive: '敏感词',
    format: '格式',
    grammar: '语法'
  }
  return labelMap[type] || type
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="isEdit ? '编辑词汇' : '添加词汇'"
    style="width: 600px"
    @update:show="emit('update:show', $event)"
  >
    <n-form :model="formData" label-placement="top">
      <n-form-item label="单词" path="word">
        <n-input-group>
          <n-input
            :value="formData.word"
            placeholder="输入单词"
            @update:value="updateField('word', $event)"
          />
          <n-button type="primary" ghost @click="emit('ai-fill')">
            AI 补全
          </n-button>
        </n-input-group>
      </n-form-item>

      <n-form-item label="音标" path="phonetic">
        <n-input
          :value="formData.phonetic"
          placeholder="输入音标"
          @update:value="updateField('phonetic', $event)"
        />
      </n-form-item>

      <n-form-item label="中文翻译" path="translation">
        <n-input
          :value="formData.translation"
          placeholder="输入中文翻译"
          type="textarea"
          @update:value="updateField('translation', $event)"
        />
      </n-form-item>

      <n-form-item label="英文释义" path="definition">
        <n-input
          :value="formData.definition"
          placeholder="输入英文释义"
          type="textarea"
          @update:value="updateField('definition', $event)"
        />
      </n-form-item>

      <n-form-item label="例句" path="example">
        <n-input
          :value="formData.example"
          placeholder="输入例句"
          type="textarea"
          @update:value="updateField('example', $event)"
        />
      </n-form-item>

      <n-form-item label="例句翻译" path="exampleTranslation">
        <n-input
          :value="formData.exampleTranslation"
          placeholder="输入例句翻译"
          type="textarea"
          @update:value="updateField('exampleTranslation', $event)"
        />
      </n-form-item>

      <n-form-item>
        <n-space vertical style="width: 100%">
          <n-button secondary type="info" :loading="checkingQuality" @click="emit('ai-check')">
            <template #icon>
              <Sparkles :size="16" />
            </template>
            AI 质检
          </n-button>

          <n-alert
            v-if="qualityCheckResult"
            :type="qualityCheckResult.passed ? 'success' : 'warning'"
            :title="`质量评分: ${qualityCheckResult.score}/100`"
          >
            <div v-if="qualityCheckResult.issues && qualityCheckResult.issues.length > 0">
              <div
                v-for="(issue, index) in qualityCheckResult.issues"
                :key="index"
                class="issue-item"
              >
                <n-tag :type="getIssueSeverityType(issue.severity)" size="small">
                  {{ getIssueTypeLabel(issue.type) }}
                </n-tag>
                {{ issue.message }}
                <n-button
                  v-if="issue.suggestion && issue.originalText"
                  text
                  type="primary"
                  size="tiny"
                  @click="emit('apply-suggestion', issue)"
                >
                  应用建议
                </n-button>
              </div>
            </div>
            <div v-else>
              ✅ 内容质量良好，未发现问题！
            </div>
          </n-alert>
        </n-space>
      </n-form-item>

      <n-form-item label="考试类型" path="examType">
        <n-select
          :value="formData.examType"
          :options="examTypeOptions.filter((item) => item.value !== null)"
          @update:value="updateField('examType', $event)"
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="emit('submit')">确定</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.issue-item {
  margin-bottom: 8px;
}
</style>
