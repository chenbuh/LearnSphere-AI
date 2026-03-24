<template>
  <div class="setup-container">
    <section class="setup-shell">
      <div class="setup-stage">
        <div class="setup-stage-intro">
          <p class="setup-kicker">题目准备</p>
          <h2 class="setup-title">先确定写作语境，再开始正式写作</h2>
          <p class="setup-caption">先选择写作题型和练习方式，再生成本次题目。</p>
        </div>

        <div class="setup-sections">
          <WritingSetupOptionSection
            title="考试类型"
            :icon="GraduationCap"
            icon-color="#fb923c"
            :items="examTypes"
            :model-value="settings.examType"
            grid-class="exam-grid"
            show-text-icon
            @select="emit('update-setting', 'examType', $event)"
          />

          <WritingSetupOptionSection
            title="写作题型"
            :icon="PenTool"
            icon-color="#f97316"
            :items="writingModes"
            :model-value="settings.mode"
            grid-class="mode-grid"
            @select="emit('update-setting', 'mode', $event)"
          />

          <WritingSetupOptionSection
            title="写作难度"
            :icon="Gauge"
            icon-color="#ea580c"
            :items="difficulties"
            :model-value="settings.difficulty"
            grid-class="difficulty-grid"
            show-text-icon
            @select="emit('update-setting', 'difficulty', $event)"
          />
        </div>
      </div>

      <aside class="setup-sidebar">
        <WritingSetupSidePanel
          :settings="settings"
          :selected-mode-label="selectedModeLabel"
          :selected-difficulty-label="selectedDifficultyLabel"
          :difficulties="difficulties"
          :time-limits="timeLimits"
          @update-setting="(key, value) => emit('update-setting', key, value)"
          @generate="emit('generate')"
        />
      </aside>
    </section>

    <WritingHistoryPanel
      :items="items"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @select="emit('select', $event)"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    />
  </div>
</template>

<script setup>
import { Gauge, GraduationCap, PenTool } from 'lucide-vue-next'
import WritingHistoryPanel from '@/components/writing/WritingHistoryPanel.vue'
import WritingSetupOptionSection from '@/components/writing/WritingSetupOptionSection.vue'
import WritingSetupSidePanel from '@/components/writing/WritingSetupSidePanel.vue'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  examTypes: {
    type: Array,
    default: () => []
  },
  writingModes: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  selectedModeLabel: {
    type: String,
    default: ''
  },
  selectedDifficultyLabel: {
    type: String,
    default: ''
  },
  timeLimits: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update-setting', 'generate', 'select', 'update:page', 'update:pageSize'])
</script>

<style scoped>
.setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.setup-shell,
.setup-stage-intro,
.setup-sections,
.setup-sidebar {
  min-width: 0;
}

.setup-stage {
  min-width: 0;
  padding: 26px 28px;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.24)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.06), transparent 42%);
}

.setup-stage-intro {
  margin-bottom: 22px;
}

.setup-kicker {
  margin: 0 0 10px;
  color: #fb923c;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.setup-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.65rem;
  line-height: 1.18;
  overflow-wrap: anywhere;
}

.setup-caption {
  max-width: 46rem;
  margin: 12px 0 0;
  color: var(--secondary-text);
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.setup-sections {
  display: grid;
  gap: 0;
}

.setup-sidebar {
  min-width: 0;
  position: sticky;
  top: 92px;
}

.exam-grid,
.mode-grid,
.difficulty-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mode-grid {
  grid-template-columns: 1fr;
}

:global(html[data-theme='light'] .setup-stage) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 42%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .setup-stage-intro) {
  padding-right: 20px;
}

:global(html[data-theme='light'] .setup-title) {
  color: #0f172a;
}

:global(html[data-theme='light'] .setup-caption) {
  color: #64748b;
}

@media (max-width: 900px) {
  :global(html[data-theme='light'] .setup-stage-intro) {
    padding-right: 0;
  }

  .setup-shell {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .setup-stage {
    padding: 14px 12px;
    border-radius: 18px;
  }

  .setup-stage-intro {
    display: grid;
    gap: 6px;
    margin-bottom: 10px;
  }

  .setup-kicker {
    margin-bottom: 0;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
  }

  .setup-title {
    font-size: 1.04rem;
    line-height: 1.22;
  }

  .setup-caption {
    margin-top: 0;
    font-size: 0.8rem;
    line-height: 1.48;
  }

  .exam-grid,
  .mode-grid,
  .difficulty-grid {
    grid-template-columns: 1fr;
  }

  .setup-sidebar {
    position: static;
    top: auto;
  }
}

@media (max-width: 480px) {
  .setup-shell {
    gap: 12px;
  }

  .setup-stage {
    padding: 12px 10px;
    border-radius: 16px;
  }

  .setup-stage-intro {
    margin-bottom: 8px;
  }

  .setup-kicker {
    font-size: 0.64rem;
  }

  .setup-title {
    font-size: 0.96rem;
  }

  .setup-caption {
    font-size: 0.76rem;
    line-height: 1.44;
  }
}

@media (max-width: 360px) {
  .setup-stage {
    padding: 10px 9px;
  }

  .setup-title {
    font-size: 0.9rem;
  }

  .setup-caption {
    font-size: 0.72rem;
    line-height: 1.42;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .setup-shell {
    gap: 12px;
  }

  .setup-stage {
    padding-top: 12px;
    padding-bottom: 12px;
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>

