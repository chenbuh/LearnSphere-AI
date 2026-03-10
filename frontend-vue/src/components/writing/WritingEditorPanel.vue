<template>
  <div class="writing-container" :class="{ 'focus-mode': isFocusMode }">
    <WritingEditorToolbar
      :is-focus-mode="isFocusMode"
      :show-draft-saved="showDraftSaved"
      @restart="emit('restart')"
      @toggle-focus="emit('toggle-focus')"
    />

    <div class="writing-layout">
      <WritingTopicCard
        v-if="!isFocusMode"
        :settings="settings"
        :selected-topic="selectedTopic"
        :displayed-prompt="displayedPrompt"
        :is-prompt-typing="isPromptTyping"
        @prompt-skip="emit('prompt-skip')"
      />

      <WritingEditorCard
        class="editor-shell"
        :settings="settings"
        :essay-content="essayContent"
        :word-count="wordCount"
        :time-left="timeLeft"
        :time-left-display="timeLeftDisplay"
        :is-loading="isLoading"
        @update:essay-content="emit('update:essay-content', $event)"
        @submit="emit('submit')"
      />
    </div>
  </div>
</template>

<script setup>
import WritingEditorCard from '@/components/writing/WritingEditorCard.vue'
import WritingEditorToolbar from '@/components/writing/WritingEditorToolbar.vue'
import WritingTopicCard from '@/components/writing/WritingTopicCard.vue'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  selectedTopic: {
    type: Object,
    default: null
  },
  displayedPrompt: {
    type: String,
    default: ''
  },
  isPromptTyping: {
    type: Boolean,
    default: false
  },
  isFocusMode: {
    type: Boolean,
    default: false
  },
  showDraftSaved: {
    type: Boolean,
    default: false
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
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['restart', 'toggle-focus', 'prompt-skip', 'update:essay-content', 'submit'])
</script>

<style scoped>
.writing-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: calc(100vh - 140px);
}

.writing-container.focus-mode .writing-layout {
  height: calc(100vh - 100px);
}

.writing-container.focus-mode .editor-shell {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>