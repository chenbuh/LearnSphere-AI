<script setup>
import { Lock } from 'lucide-vue-next'
import { NButton, NIcon } from 'naive-ui'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    required: true
  },
  generating: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['regenerate'])
</script>

<template>
  <div class="page-header">
    <div class="header-content">
      <div>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <n-button
        type="primary"
        secondary
        round
        :loading="generating"
        class="secure-btn"
        @click="emit('regenerate')"
      >
        <template #icon>
          <n-icon><Lock /></n-icon>
        </template>
        {{ buttonText }}
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-header h1 {
  margin-bottom: 8px;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #71717a;
  font-size: 1.1rem;
}
</style>
