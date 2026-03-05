<script setup>
import { ref, watch, onMounted } from 'vue'
import { NInput } from 'naive-ui'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '在这里开始你的创作...'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const valueHtml = ref('')
const isFocus = ref(false)

onMounted(() => {
  valueHtml.value = props.modelValue
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== valueHtml.value) {
      valueHtml.value = newVal
    }
  }
)

const handleInput = (value) => {
  valueHtml.value = value
  const text = (value || '').trim()
  emit('update:modelValue', value)
  emit('change', { html: value, text })
}
</script>

<template>
  <div class="rich-text-editor-container" :class="{ 'focus-mode': isFocus }">
    <n-input
      :value="valueHtml"
      @update:value="handleInput"
      @focus="isFocus = true"
      @blur="isFocus = false"
      type="textarea"
      :placeholder="placeholder"
      :rows="14"
      :autosize="{ minRows: 10, maxRows: 20 }"
    />
  </div>
</template>

<style scoped>
.rich-text-editor-container {
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--card-bg);
  transition: all 0.3s ease;
}

.rich-text-editor-container.focus-mode {
  border-color: var(--primary-color);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
}

:deep(textarea) {
  line-height: 1.8;
  font-size: 15px;
}
</style>
