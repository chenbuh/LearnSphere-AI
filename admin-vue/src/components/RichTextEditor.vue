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
    default: '请输入内容...'
  }
})

const emit = defineEmits(['update:modelValue'])

const valueHtml = ref('')

onMounted(() => {
  valueHtml.value = props.modelValue
})

watch(
  () => props.modelValue,
  newVal => {
    if (newVal !== valueHtml.value) {
      valueHtml.value = newVal
    }
  }
)

const handleInput = value => {
  valueHtml.value = value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="rich-text-editor-simple">
    <n-input
      :value="valueHtml"
      @update:value="handleInput"
      type="textarea"
      :placeholder="placeholder"
      :rows="8"
      :autosize="{ minRows: 8, maxRows: 15 }"
    />
  </div>
</template>

<style scoped>
/* No toolbar in this simplified editor; the n-input supplies the border. */
.rich-text-editor-simple {
  border-radius: var(--r-md);
  overflow: hidden;
}

/* Long-form editing area: white page, ink text, comfortable leading.
   Mirror and placeholder get the same line-height so autosize measures correctly. */
.rich-text-editor-simple :deep(.n-input .n-input__textarea-el),
.rich-text-editor-simple :deep(.n-input .n-input__textarea-mirror),
.rich-text-editor-simple :deep(.n-input .n-input__placeholder) {
  line-height: 1.7;
}

.rich-text-editor-simple :deep(.n-input .n-input__textarea-el) {
  color: var(--ink);
}
</style>
