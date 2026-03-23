<template>
  <section class="editor-card">
    <div class="editor-head">
      <div>
        <p class="editor-kicker">正文草稿</p>
        <h3 class="editor-title">开始组织你的论点、例证与结论</h3>
      </div>
      <p class="editor-caption">先完成正文写作，检查无误后再提交本次练习。</p>
    </div>

    <div class="editor-canvas">
      <n-input
        :value="essayContent"
        type="textarea"
        placeholder="在这里开始你的创作..."
        :autosize="{ minRows: 22, maxRows: 34 }"
        class="essay-editor-wrapper"
        @update:value="emit('update:essay-content', $event)"
      />
    </div>

    <div class="editor-footer">
      <span class="footer-label">写作进度</span>
      <p class="footer-text">写完后再统一检查时间、字数和完成度。</p>
    </div>
  </section>
</template>

<script setup>
import { NInput } from 'naive-ui'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  essayContent: {
    type: String,
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  },
  timeLeft: {
    type: Number,
    default: 0
  },
  timeLeftDisplay: {
    type: String,
    default: '00:00'
  }
})

const emit = defineEmits(['update:essay-content'])
</script>

<style scoped>
.editor-card {
  display: grid;
  gap: 18px;
  min-height: 620px;
}

.editor-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
}

.editor-kicker {
  margin: 0 0 8px;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.editor-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.06rem;
  line-height: 1.45;
}

.editor-caption {
  max-width: 22rem;
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.86rem;
  line-height: 1.6;
  text-align: right;
}

.editor-canvas {
  min-height: 520px;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.22)),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018), transparent 15%);
  overflow: hidden;
}

.essay-editor-wrapper {
  height: 100%;
  margin: 0;
}

:deep(.w-e-text-container) {
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  line-height: 1.8;
}

:deep(.n-input) {
  height: 100%;
  background: transparent !important;
}

:deep(.n-input-wrapper) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.n-input__textarea) {
  height: 100%;
}

:deep(.n-input__textarea-el) {
  min-height: 520px !important;
  padding: 26px 28px 32px !important;
  height: 100% !important;
  background: transparent !important;
  color: var(--text-color);
  font-family: 'Georgia', serif;
  font-size: 1.08rem;
  line-height: 1.9;
}

.editor-footer {
  display: grid;
  gap: 6px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-top: 16px;
}

.footer-label {
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.footer-text {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
}

:global(html[data-theme='light'] .editor-canvas) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.97)),
    linear-gradient(90deg, rgba(15, 23, 42, 0.02), transparent 15%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

:global(html[data-theme='light'] .editor-footer) {
  border-top-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .n-input__textarea-el) {
  color: #182132;
}

:global(html[data-theme='light'] .n-input__textarea-el::placeholder) {
  color: #94a3b8;
}

@media (max-width: 900px) {
  .editor-card {
    min-height: 0;
    gap: 14px;
  }

  .editor-head,
  .editor-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .editor-title {
    font-size: 0.98rem;
  }

  .editor-caption {
    max-width: none;
    text-align: left;
    font-size: 0.82rem;
  }

  .editor-canvas {
    min-height: 0;
    border-radius: 20px;
  }

  :deep(.n-input__textarea-el) {
    min-height: 340px !important;
    padding: 18px 16px 22px !important;
    font-size: 1rem;
    line-height: 1.75;
  }
}
</style>

