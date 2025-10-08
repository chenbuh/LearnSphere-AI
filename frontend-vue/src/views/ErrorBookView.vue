<script setup>
import { ref } from 'vue'
import { 
  NCard, NTag, NButton, NInput, NCollapse, NCollapseItem, 
  NEmpty, NSpace, NIcon, NPopconfirm
} from 'naive-ui'
import { 
  Trash2, RotateCw, Filter, BookOpen, AlertCircle, CheckCircle2
} from 'lucide-vue-next'

const errors = ref([
  {
    id: 1,
    type: 'Vocabulary',
    question: 'The immense _______ of the project made it difficult to manage.',
    userAnswer: 'scope',
    correctAnswer: 'magnitude',
    explanation: 'Scope refers to the extent allowed, while magnitude emphasizes huge scale or importance.',
    note: 'Mistook magnitude for huge size context.',
    date: '2023-11-15'
  },
  {
    id: 2,
    type: 'Grammar',
    question: 'By the time you arrive, I _______ the work.',
    userAnswer: 'will finish',
    correctAnswer: 'will have finished',
    explanation: 'Future Perfect Tense is required here (will have done) because of "By the time".',
    note: '',
    date: '2023-11-14'
  }
])

const removeError = (id) => {
    errors.value = errors.value.filter(e => e.id !== id)
}
</script>

<template>
  <div class="page-container">
    <div class="page-header-row">
      <div class="header-text">
        <h1>错题本 (Error Book)</h1>
        <p>温故而知新，攻克薄弱环节</p>
      </div>
      
      <div class="header-actions">
         <n-button secondary size="medium">
             <template #icon><n-icon :component="Filter" /></template>
             筛选
         </n-button>
         <n-button type="primary" size="medium">
             <template #icon><n-icon :component="RotateCw" /></template>
             复习今日错题
         </n-button>
      </div>
    </div>

    <div v-if="errors.length > 0" class="error-list">
       <n-card 
         v-for="err in errors" 
         :key="err.id" 
         class="error-card" 
         :bordered="false"
       >
          <!-- Card Header -->
          <div class="card-top">
             <n-tag :type="err.type === 'Vocabulary' ? 'success' : 'info'" size="small" :bordered="false">
                {{ err.type }}
             </n-tag>
             <span class="date-text">{{ err.date }}</span>
          </div>
          
          <!-- Question -->
          <div class="question-body">
              <h3>{{ err.question }}</h3>
          </div>
          
          <!-- Answer Comparison -->
          <div class="answer-comparison">
             <div class="answer-box user">
                <div class="label">您的回答</div>
                <div class="content">{{ err.userAnswer }}</div>
             </div>
             <div class="answer-box correct">
                <div class="label">正确答案</div>
                <div class="content">{{ err.correctAnswer }}</div>
             </div>
          </div>

          <!-- Explanation & Note -->
          <div class="explanation-section">
             <n-collapse display-directive="show">
                 <n-collapse-item title="查看解析 & 笔记" name="1">
                     <template #header-extra>
                        <span class="detail-hint">Why is this wrong?</span>
                     </template>
                     <div class="explanation-text">
                        <n-icon :component="BookOpen" size="16" color="#a1a1aa" class="mr-2" />
                        {{ err.explanation }}
                     </div>
                     
                     <div class="note-area">
                        <n-input 
                           type="textarea" 
                           placeholder="添加笔记..." 
                           v-model:value="err.note" 
                           :autosize="{ minRows: 2 }"
                           class="note-input"
                        />
                     </div>
                 </n-collapse-item>
             </n-collapse>
          </div>

          <!-- Footer Action -->
          <div class="card-footer">
             <n-popconfirm @positive-click="removeError(err.id)">
                <template #trigger>
                    <n-button size="small" type="error" ghost>
                       <template #icon><n-icon :component="Trash2" /></template>
                       移除
                    </n-button>
                </template>
                确认将此题移出错题本吗？
             </n-popconfirm>
          </div>
       </n-card>
    </div>

    <div v-else class="empty-state">
       <n-empty description="太棒了！目前没有错题。" size="large" />
    </div>
  </div>
</template>

<style scoped>
.page-container {
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
}

.page-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 32px;
}
.header-text h1 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(120deg, #f87171, #fb923c);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.header-text p { color: #a1a1aa; }
.header-actions { display: flex; gap: 12px; }

/* Error Card List */
.error-list { display: flex; flex-direction: column; gap: 20px; }

.error-card {
    background: rgba(30, 30, 35, 0.6);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: border-color 0.2s;
}
.error-card:hover {
    border-color: rgba(255, 255, 255, 0.1);
}

.card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.date-text { font-size: 0.8rem; color: #71717a; font-family: monospace; }

.question-body h3 {
    font-size: 1.1rem;
    color: #e4e4e7;
    margin-bottom: 20px;
    line-height: 1.5;
    font-weight: 600;
}

.answer-comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    background: rgba(0,0,0,0.2);
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 20px;
}
.answer-box .label { font-size: 0.75rem; margin-bottom: 6px; }
.answer-box.user .label { color: #f87171; }
.answer-box.correct .label { color: #34d399; }

.answer-box .content { font-size: 0.95rem; font-weight: 500; }
.answer-box.user .content { color: #fca5a5; text-decoration: line-through; opacity: 0.8; }
.answer-box.correct .content { color: #6ee7b7; }

.explanation-section {
    margin-bottom: 16px;
}
.detail-hint { font-size: 0.75rem; color: #52525b; margin-right: 8px; }

.explanation-text {
    display: flex;
    align-items: flex-start;
    color: #d4d4d8;
    line-height: 1.6;
    margin-bottom: 16px;
    background: rgba(255,255,255,0.03);
    padding: 12px;
    border-radius: 8px;
}
.note-input { background: transparent; }

.card-footer {
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 16px;
    display: flex;
    justify-content: flex-end;
}

.empty-state { padding: 60px 0; }
</style>
