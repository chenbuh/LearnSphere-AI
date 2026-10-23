<template>
  <div class="landing-page">
    <SiteHeader />

    <main>
      <!-- 首屏 -->
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">四六级 · 考研 · 雅思 · 托福</p>
            <h1 class="hero-title">每天二十分钟，<br>把英语练扎实。</h1>
            <p class="hero-lead">
              背词、做题、听写、口语都在一个地方。系统记下你做错的地方，下一次优先安排复习，不用自己整理错题本。
            </p>
            <div class="hero-actions">
              <button class="btn btn-primary" @click="handleMainAction">
                {{ userStore.token ? '继续学习' : '免费注册' }}
                <ArrowRight :size="16" />
              </button>
              <router-link class="btn btn-text" to="/features">看看有哪些功能</router-link>
            </div>
            <p class="hero-note">注册后可免费使用基础练习，无需绑定支付方式。</p>
          </div>

          <!-- 右侧：今日计划示意 -->
          <div class="hero-preview" aria-hidden="true">
            <div class="preview-head">
              <span class="preview-title">今日计划</span>
              <span class="preview-date">周四 · 已完成 2 / 4</span>
            </div>
            <ul class="task-list">
              <li v-for="task in sampleTasks" :key="task.name" class="task-row" :class="{ done: task.done }">
                <span class="task-check">
                  <Check v-if="task.done" :size="12" />
                </span>
                <span class="task-name">{{ task.name }}</span>
                <span class="task-meta">{{ task.meta }}</span>
              </li>
            </ul>
            <div class="preview-review">
              <p class="review-label">待复习</p>
              <p class="review-word">subsequent <span>adj. 随后的</span></p>
              <p class="review-example">Subsequent studies confirmed the original findings.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能 -->
      <section class="section">
        <div class="container">
          <div class="section-head">
            <h2>练习覆盖听说读写</h2>
            <p>按考试大纲组织内容，每个模块都可以单独练，也可以交给学习计划自动安排。</p>
          </div>
          <div class="feature-list">
            <article v-for="item in features" :key="item.title" class="feature-item">
              <component :is="item.icon" :size="20" class="feature-icon" />
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- 学习方式 -->
      <section class="section section-muted">
        <div class="container">
          <div class="section-head">
            <h2>它是怎么帮你复习的</h2>
          </div>
          <ol class="steps">
            <li v-for="(step, index) in steps" :key="step.title" class="step">
              <span class="step-num">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <h3>{{ step.title }}</h3>
                <p>{{ step.desc }}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- 学员反馈 -->
      <section class="section">
        <div class="container">
          <div class="section-head">
            <h2>用过的同学怎么说</h2>
          </div>
          <div class="quotes">
            <figure v-for="quote in quotes" :key="quote.name" class="quote">
              <blockquote>{{ quote.text }}</blockquote>
              <figcaption>
                <span class="quote-name">{{ quote.name }}</span>
                <span class="quote-meta">{{ quote.meta }}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <!-- 底部行动 -->
      <section class="section cta">
        <div class="container cta-inner">
          <div>
            <h2>从今天的二十个单词开始。</h2>
            <p>先做一次水平测试，系统会根据结果生成第一周的计划。</p>
          </div>
          <button class="btn btn-primary" @click="handleMainAction">
            {{ userStore.token ? '进入学习中心' : '免费注册' }}
            <ArrowRight :size="16" />
          </button>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  ArrowRight, Check, BookOpen, Headphones, PenLine, Mic, FileText, NotebookPen
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const router = useRouter()
const userStore = useUserStore()

const handleMainAction = () => {
  if (userStore.token) {
    router.push('/app/dashboard')
  } else {
    router.push({ path: '/login', query: { mode: 'register' } })
  }
}

const sampleTasks = [
  { name: '新词 20 个', meta: 'CET-6 核心词', done: true },
  { name: '复习 35 个', meta: '按遗忘曲线', done: true },
  { name: '阅读 1 篇', meta: '约 12 分钟', done: false },
  { name: '听力精听', meta: '2 段对话', done: false }
]

const features = [
  { icon: BookOpen, title: '词汇', desc: '按考试分级的词书，例句来自真题。每个词的复习时间根据你的记忆情况调整。' },
  { icon: FileText, title: '阅读与语法', desc: '长难句可以逐句拆解，看主干和从句结构；语法练习按知识点分组。' },
  { icon: Headphones, title: '听力', desc: '支持精听和听写，可以逐句重放、调整语速，听不出来的词自动加入生词本。' },
  { icon: Mic, title: '口语', desc: '跟读和话题练习，给出发音、流利度的评分和具体需要改的地方。' },
  { icon: PenLine, title: '写作批改', desc: '提交作文后给出语法错误、用词建议和段落结构的修改意见。' },
  { icon: NotebookPen, title: '错题本与模考', desc: '做错的题自动归档，模拟考试按真实时长计时，结束后出分项报告。' }
]

const steps = [
  { title: '先测一次水平', desc: '十分钟的分级测试，确定词汇量和各项的大致水平。' },
  { title: '每天按计划练', desc: '计划把新内容和复习混在一起，每天的量可以自己调。' },
  { title: '错的地方再来一遍', desc: '错题和没记住的词会在合适的时间重新出现，直到掌握为止。' }
]

const quotes = [
  { text: '最有用的是复习提醒。以前背过就忘，现在每天打开就知道该复习哪些词。', name: '李同学', meta: '考研英语一' },
  { text: '写作批改会指出具体哪句话有问题，改几次之后能感觉到自己常犯的错误少了。', name: 'Sarah', meta: '雅思备考' },
  { text: '听力精听可以一句一句重放，适合我这种基础一般的，比直接刷整套题有效。', name: '王同学', meta: 'CET-6' }
]
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
}

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background-color 0.15s, color 0.15s;
}
.btn-primary {
  background: var(--brand);
  color: var(--brand-ink);
}
.btn-primary:hover {
  background: var(--brand-hover);
}
.btn-primary:focus-visible,
.btn-text:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}
.btn-text {
  background: transparent;
  color: var(--text-color);
  padding: 0 8px;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: var(--card-border);
}
.btn-text:hover {
  text-decoration-color: currentColor;
}

/* 首屏 */
.hero {
  padding: 88px 0 72px;
  border-bottom: 1px solid var(--card-border);
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 64px;
  align-items: center;
}
.eyebrow {
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--secondary-text);
  letter-spacing: 0.04em;
}
.hero-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(36px, 5vw, 56px);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-color);
}
.hero-lead {
  margin: 24px 0 0;
  max-width: 34em;
  font-size: 17px;
  line-height: 1.75;
  color: var(--secondary-text);
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 36px;
  flex-wrap: wrap;
}
.hero-note {
  margin: 16px 0 0;
  font-size: 13px;
  color: var(--secondary-text);
}

/* 首屏右侧示意卡 */
.hero-preview {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--card-border);
}
.preview-title {
  font-weight: 600;
  font-size: 15px;
}
.preview-date {
  font-size: 13px;
  color: var(--secondary-text);
}
.task-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}
.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  font-size: 14px;
}
.task-check {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--card-border);
  border-radius: var(--radius-sm);
}
.task-row.done .task-check {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--brand-ink);
}
.task-row.done .task-name {
  color: var(--secondary-text);
  text-decoration: line-through;
}
.task-name {
  flex: 1;
}
.task-meta {
  font-size: 13px;
  color: var(--secondary-text);
}
.preview-review {
  margin-top: 8px;
  padding: 16px;
  background: var(--surface-muted);
  border-radius: var(--radius-md);
}
.review-label {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--secondary-text);
}
.review-word {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 600;
}
.review-word span {
  margin-left: 8px;
  font-family: var(--app-font-family, inherit);
  font-size: 14px;
  font-weight: 400;
  color: var(--secondary-text);
}
.review-example {
  margin: 8px 0 0;
  font-size: 14px;
  font-style: italic;
  color: var(--secondary-text);
}

/* 通用区块 */
.section {
  padding: 80px 0;
}
.section-muted {
  background: var(--surface-muted);
  border-top: 1px solid var(--card-border);
  border-bottom: 1px solid var(--card-border);
}
.section-head {
  max-width: 640px;
  margin-bottom: 40px;
}
.section-head h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 30px;
  font-weight: 700;
  line-height: 1.3;
}
.section-head p {
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--secondary-text);
}

/* 功能列表 */
.feature-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--card-border);
}
.feature-item {
  padding: 28px 28px 32px 0;
  border-bottom: 1px solid var(--card-border);
}
.feature-item:not(:nth-child(3n + 1)) {
  padding-left: 28px;
  border-left: 1px solid var(--card-border);
}
.feature-icon {
  color: var(--brand);
}
.feature-item h3 {
  margin: 14px 0 8px;
  font-size: 17px;
  font-weight: 600;
}
.feature-item p {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--secondary-text);
}

/* 步骤 */
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 40px;
}
.step {
  display: flex;
  gap: 16px;
}
.step-num {
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--brand);
  padding-top: 2px;
}
.step h3 {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
}
.step p {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--secondary-text);
}

/* 反馈 */
.quotes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}
.quote {
  margin: 0;
  padding: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}
.quote blockquote {
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
}
.quote figcaption {
  display: flex;
  gap: 8px;
  font-size: 13px;
}
.quote-name {
  font-weight: 600;
}
.quote-meta {
  color: var(--secondary-text);
}

/* CTA */
.cta {
  border-top: 1px solid var(--card-border);
}
.cta-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}
.cta h2 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 700;
}
.cta p {
  margin: 10px 0 0;
  color: var(--secondary-text);
}

@media (max-width: 960px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .feature-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .feature-item,
  .feature-item:not(:nth-child(3n + 1)) {
    padding: 24px 24px 28px 0;
    border-left: none;
  }
  .feature-item:nth-child(2n) {
    padding-left: 24px;
    border-left: 1px solid var(--card-border);
  }
  .steps,
  .quotes {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 640px) {
  .hero {
    padding: 48px 0 40px;
  }
  .section {
    padding: 56px 0;
  }
  .feature-list {
    grid-template-columns: 1fr;
  }
  .feature-item,
  .feature-item:nth-child(2n) {
    padding: 20px 0;
    border-left: none;
  }
  .section-head h2 {
    font-size: 24px;
  }
}
</style>
