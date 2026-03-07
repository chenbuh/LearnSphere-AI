<script setup>
import { useAttrs } from 'vue'
import { NDatePicker } from 'naive-ui'

defineOptions({
  inheritAttrs: false
})

defineProps({
  value: {
    default: null
  }
})

const emit = defineEmits(['update:value'])
const attrs = useAttrs()

const handleUpdate = (nextValue) => {
  emit('update:value', nextValue)
}
</script>

<template>
  <n-date-picker
    v-bind="attrs"
    :value="value"
    @update:value="handleUpdate"
  />
</template>
