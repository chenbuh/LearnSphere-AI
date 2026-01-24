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

watch(() => props.modelValue, (newVal) => {
    if (newVal !== valueHtml.value) {
        valueHtml.value = newVal
    }
})

const handleInput = (value) => {
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
.rich-text-editor-simple {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    overflow: hidden;
}
</style>
