<template>
  <div class="rich-text-editor-container" :class="{ 'focus-mode': isFocus }">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="editor-content"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onFocus="isFocus = true"
      @onBlur="isFocus = false"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

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

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const isFocus = ref(false)

// 内容 HTML
const valueHtml = ref(props.modelValue)

// 模拟考试/练习通常不需要图片上传等复杂功能，简化工具栏
const toolbarConfig = {
  excludeKeys: [
    'headerSelect',
    'italic',
    'group-image',
    'group-video',
    'insertTable',
    'codeBlock',
    'todo',
    'fullScreen'
  ]
}

const editorConfig = { 
  placeholder: props.placeholder,
  autoFocus: true
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const handleChange = (editor) => {
  const text = editor.getText().trim()
  emit('update:modelValue', valueHtml.value)
  emit('change', { html: valueHtml.value, text })
}

// 监听外部 modelValue 变化（如恢复草稿）
watch(() => props.modelValue, (newVal) => {
  if (newVal !== valueHtml.value) {
    valueHtml.value = newVal
  }
})

const mode = 'simple' // 'default' 或 'simple'
</script>

<style scoped>
.rich-text-editor-container {
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  transition: all 0.3s ease;
}

.rich-text-editor-container.focus-mode {
  border-color: var(--primary-color);
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
}

.editor-toolbar {
  border-bottom: 1px solid var(--card-border);
  background: var(--accent-fill) !important;
}

:deep(.w-e-toolbar) {
  background: transparent !important;
  color: var(--text-color) !important;
}

:deep(.w-e-toolbar button) {
  color: var(--text-color) !important;
}

:deep(.w-e-toolbar button:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

.editor-content {
  height: 400px !important;
  overflow-y: hidden;
  background: transparent !important;
}

:deep(.w-e-text-container) {
  background: transparent !important;
  color: var(--text-color) !important;
}

:deep(.w-e-text-placeholder) {
  color: var(--secondary-text) !important;
  font-style: italic;
}

/* 适配暗色模式内容 */
:deep(.w-e-scroll) {
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) transparent;
}
</style>
