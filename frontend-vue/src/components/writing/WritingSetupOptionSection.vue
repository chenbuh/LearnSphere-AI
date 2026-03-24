<template>
  <div class="setting-section">
    <h3><n-icon :component="icon" :color="iconColor" /> {{ title }}</h3>
    <div class="grid-options" :class="gridClass">
      <button
        v-for="item in items"
        :key="item.value"
        type="button"
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
          <div class="option-copy">
            <div class="option-label">{{ item.label }}</div>
            <div v-if="item.desc" class="option-desc">{{ item.desc }}</div>
          </div>
          <span class="option-state">{{ modelValue === item.value ? '已选' : '选择' }}</span>
        </template>
      </button>
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
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.setting-section:first-child {
  padding-top: 0;
  border-top: 0;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  margin-bottom: 14px;
  color: var(--text-color);
}

.grid-options {
  display: grid;
  gap: 12px;
}

.option-card {
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  padding: 16px 18px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 14px;
  text-align: left;
  color: inherit;
  background: rgba(15, 23, 42, 0.22);
}

.option-card--text .option-icon {
  display: inline-flex;
  width: 30px;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  line-height: 1;
}

.option-card--text {
  min-height: 62px;
  justify-content: center;
  gap: 12px;
}

.option-card--compact {
  min-height: 84px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.option-card:hover {
  background: rgba(15, 23, 42, 0.34);
  border-color: rgba(251, 146, 60, 0.2);
  transform: translateY(-1px);
}

.option-card.active {
  background:
    linear-gradient(180deg, rgba(251, 146, 60, 0.14), rgba(249, 115, 22, 0.06)),
    rgba(15, 23, 42, 0.24);
  border-color: rgba(251, 146, 60, 0.45);
  color: var(--text-color);
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-card--compact .option-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 1.1rem;
}

.option-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.option-label {
  font-weight: 600;
  font-size: 0.96rem;
  color: var(--text-color);
}

.option-desc {
  font-size: 0.76rem;
  color: var(--secondary-text);
  margin-top: 6px;
  line-height: 1.55;
  opacity: 0.88;
}

.option-state {
  color: var(--secondary-text);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.option-card.active .option-state {
  color: #fdba74;
}

:global(html[data-theme='light'] .setting-section) {
  border-top-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .option-card) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

:global(html[data-theme='light'] .option-card:hover) {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(251, 146, 60, 0.24);
}

:global(html[data-theme='light'] .option-card.active) {
  background:
    linear-gradient(180deg, rgba(255, 237, 213, 0.84), rgba(255, 247, 237, 0.76)),
    rgba(255, 255, 255, 0.94);
}

:global(html[data-theme='light'] .option-card--compact .option-icon) {
  background: rgba(255, 247, 237, 0.84);
}

:global(html[data-theme='light'] .option-label) {
  color: #0f172a;
}

:global(html[data-theme='light'] .option-desc),
:global(html[data-theme='light'] .option-state) {
  color: #64748b;
}

@media (max-width: 900px) {
  .setting-section {
    padding-top: 14px;
    margin-bottom: 0;
  }

  .setting-section h3 {
    font-size: 0.88rem;
    margin-bottom: 8px;
  }

  .grid-options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: stretch;
  }

  .grid-options.mode-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .option-card {
    display: flex;
    min-height: 38px;
    width: auto;
    min-width: 88px;
    max-width: 100%;
    padding: 6px 10px;
    border-radius: 999px;
    gap: 4px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex: 0 0 auto;
  }

  .grid-options.mode-grid .option-card,
  .grid-options.mode-grid .option-card--compact {
    width: 100%;
    min-width: 0;
    min-height: 56px;
    padding: 8px 10px;
    border-radius: 16px;
    gap: 8px;
    justify-content: flex-start;
    flex: initial;
  }

  .grid-options.mode-grid .option-card--compact {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .option-card--text {
    min-height: 38px;
    min-width: 96px;
    padding: 6px 12px;
  }

  .option-icon {
    font-size: 0.88rem;
    margin-bottom: 0;
    flex-shrink: 0;
    width: auto;
    height: auto;
    background: transparent;
  }

  .grid-options.mode-grid .option-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    font-size: 0.86rem;
  }

  .option-label {
    font-size: 0.76rem;
    line-height: 1.15;
  }

  .grid-options.mode-grid .option-label {
    line-height: 1.2;
  }

  .option-desc {
    display: none;
  }

  .option-state {
    display: none;
  }
}

@media (max-width: 520px) {
  .setting-section {
    padding-top: 12px;
  }

  .option-card {
    min-height: 36px;
    min-width: 82px;
    padding: 6px 9px;
  }

  .option-card--text {
    min-height: 36px;
    min-width: 92px;
  }

  .option-label {
    font-size: 0.72rem;
  }

  .grid-options.mode-grid .option-card,
  .grid-options.mode-grid .option-card--compact {
    min-height: 52px;
    padding: 8px 9px;
  }
}

@media (max-width: 360px) {
  .setting-section {
    padding-top: 10px;
  }

  .grid-options {
    display: grid;
    grid-template-columns: 1fr;
  }

  .option-card,
  .option-card--text {
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
  }

  .option-card--text {
    padding: 8px 12px;
  }
}
</style>

