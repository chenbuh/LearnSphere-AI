<template>
  <div class="setting-section">
    <h3><n-icon :component="icon" :color="iconColor" /> {{ title }}</h3>
    <div class="grid-options" :class="gridClass">
      <div
        v-for="item in items"
        :key="item.value"
        class="option-card"
        :class="{ active: modelValue === item.value, 'option-card--text': showTextIcon, 'option-card--compact': !showTextIcon }"
        @click="emit('select', item.value)"
      >
        <template v-if="showTextIcon">
          <span class="option-icon">{{ item.icon }}</span>
          <span class="option-label">{{ item.label }}</span>
        </template>
        <template v-else>
          <div class="option-icon">
            <n-icon v-if="item.icon" :component="item.icon" />
          </div>
          <div class="option-label">{{ item.label }}</div>
          <div v-if="item.desc" class="option-desc">{{ item.desc }}</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NIcon } from 'naive-ui'

defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: [Object, Function],
    required: true
  },
  iconColor: {
    type: String,
    default: '#6366f1'
  },
  items: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: String,
    default: ''
  },
  gridClass: {
    type: String,
    default: ''
  },
  showTextIcon: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])
</script>

<style scoped>
.setting-section {
  margin-bottom: 32px;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: var(--text-color);
}

.grid-options {
  display: grid;
  gap: 16px;
}

.option-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.option-card--text .option-icon {
  font-weight: 800;
  line-height: 1;
}

.option-card:hover {
  background: var(--accent-fill);
  transform: translateY(-2px);
}

.option-card.active {
  background: rgba(249, 115, 22, 0.1);
  border-color: #f97316;
  color: var(--text-color);
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
}

.option-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.option-desc {
  font-size: 0.7rem;
  color: var(--secondary-text);
  margin-top: 4px;
  opacity: 0.8;
}

@media (max-width: 900px) {
  .setting-section {
    margin-bottom: 12px;
  }

  .setting-section h3 {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }

  .grid-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .option-card {
    min-height: 42px;
    width: auto;
    min-width: 92px;
    max-width: 100%;
    padding: 7px 12px;
    border-radius: 999px;
    gap: 5px;
    flex-direction: row;
    justify-content: center;
    flex: 0 0 auto;
  }

  .option-card--text {
    min-height: 40px;
    min-width: 108px;
    padding: 7px 14px;
  }

  .option-icon {
    font-size: 0.88rem;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .option-label {
    font-size: 0.78rem;
    line-height: 1.1;
  }

  .option-desc {
    display: none;
  }
}

@media (max-width: 520px) {
  .option-card {
    min-height: 40px;
    min-width: 86px;
    padding: 6px 10px;
  }

  .option-card--text {
    min-height: 38px;
    min-width: 100px;
  }

  .option-label {
    font-size: 0.72rem;
  }
}
</style>
