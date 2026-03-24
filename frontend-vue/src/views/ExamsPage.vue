<script setup>
import { ref } from 'vue'
import { NButton, NCard } from 'naive-ui'
import { ArrowRight } from 'lucide-vue-next'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'

const activeExamCategory = ref('domestic')

const exams = {
  domestic: [
    { name: '大学英语四级', code: 'CET-4', target: '目标: 425+', icon: '🎓' },
    { name: '大学英语六级', code: 'CET-6', target: '目标: 425+', icon: '🎓' },
    { name: '考研英语', code: 'Ky', target: '目标: 60+', icon: '📚' },
    { name: '专业英语四级', code: 'TEM-4', target: '目标: 60+', icon: '🏆' }
  ],
  international: [
    { name: '雅思考试', code: 'IELTS', target: '目标: 6.5+', icon: '🌍' },
    { name: '托福考试', code: 'TOEFL', target: '目标: 90+', icon: '✈️' },
    { name: 'GRE', code: 'GRE', target: '目标: 320+', icon: '🧠' },
    { name: '多邻国', code: 'DET', target: '目标: 110+', icon: '🦜' }
  ]
}
</script>

<template>
  <div class="exams-page min-h-screen bg-dark">
    <SiteHeader />
    
    <main>
      <section class="section exams-section">
        <div class="container">
          <div class="section-header text-center">
            <h2>全方位覆盖主流考试</h2>
            <p>无论您的目标是什么，我们都有对应的专项训练库</p>
          </div>
          
          <div class="exam-tabs">
            <n-button 
              :type="activeExamCategory === 'domestic' ? 'primary' : 'default'" 
              round 
              @click="activeExamCategory = 'domestic'"
            >
              国内考试
            </n-button>
            <n-button 
              :type="activeExamCategory === 'international' ? 'primary' : 'default'" 
              round 
              @click="activeExamCategory = 'international'"
              class="ml-4"
            >
              国际考试
            </n-button>
          </div>

          <div class="exam-features-info">
              <div class="info-item">
                  <h3>🎯 真题还原</h3>
                  <p>收录近 10 年考试真题，1:1 还原真实考试界面</p>
              </div>
              <div class="info-divider"></div>
              <div class="info-item">
                  <h3>📊 考情分析</h3>
                  <p>大数据分析高频考点，预测命题趋势</p>
              </div>
              <div class="info-divider"></div>
               <div class="info-item">
                  <h3>📝 智能批改</h3>
                  <p>主观题 AI 评分，即时反馈，精准提分</p>
              </div>
          </div>

          <div class="exam-grid-wrapper mt-8">
            <div class="exam-grid">
              <div v-for="exam in exams[activeExamCategory]" :key="exam.code">
                <n-card class="exam-card" :bordered="false">
                  <div class="exam-card-content">
                    <div class="exam-icon-wrapper">
                        <span class="exam-icon">{{ exam.icon }}</span>
                    </div>
                    <h4>{{ exam.name }}</h4>
                    <span class="exam-code">{{ exam.code }}</span>
                    <div class="card-footer">
                        <span class="exam-target">{{ exam.target }}</span>
                        <n-button size="tiny" secondary circle>
                            <template #icon><n-icon :component="ArrowRight" /></template>
                        </n-button>
                    </div>
                  </div>
                </n-card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.exams-page {
  color: var(--text-color);
  background:
    radial-gradient(circle at 12% 12%, rgba(99, 102, 241, 0.1), transparent 24%),
    radial-gradient(circle at 88% 18%, rgba(59, 130, 246, 0.08), transparent 22%),
    var(--bg-color);
}

.exams-section {
  position: relative;
  overflow: hidden;
}

.section { padding: 80px 0; }
.section-header { margin-bottom: 48px; }
.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(120deg, var(--text-color), #6366f1);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.section-header p {
  color: var(--secondary-text);
  font-size: 1.125rem;
}
.exam-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
    width: 100%;
}

.exam-features-info {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--surface-muted);
    border-radius: 20px;
    padding: 26px 24px;
    margin-bottom: 48px;
    border: 1px solid var(--glass-border);
    box-shadow: 0 18px 40px var(--shadow-color);
    backdrop-filter: blur(16px);
}
.info-item {
    text-align: center;
    flex: 1;
}
.info-item h3 {
    font-size: 1.1rem;
    margin-bottom: 4px;
    color: var(--text-color);
}
.info-item p {
    font-size: 0.875rem;
    color: var(--secondary-text);
    margin: 0;
}
.info-divider {
    width: 1px;
    height: 40px;
    background: var(--card-border);
}
@media (max-width: 640px) {
    .exam-features-info { flex-direction: column; gap: 24px; }
    .info-divider { width: 100%; height: 1px; }
}

.exam-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 48px;
}
.exam-card {
  cursor: pointer;
  background: var(--surface-raised);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 18px 40px var(--shadow-color);
  backdrop-filter: blur(16px);
}
.exam-card:hover {
  transform: translateY(-5px);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(30, 30, 35, 0.8);
  box-shadow: 0 18px 42px -12px rgba(0,0,0,0.45);
}
.exam-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 18px 16px 14px;
}
.exam-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--accent-fill);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    border: 1px solid var(--glass-border);
}
.exam-icon { font-size: 2rem; }

.exam-card h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: var(--text-color);
}
.exam-code { 
    color: var(--secondary-text); 
    font-size: 0.875rem; 
    font-family: monospace;
    background: var(--surface-muted);
    padding: 2px 6px;
    border-radius: 4px;
    margin-bottom: 16px;
    border: 1px solid var(--card-border);
}
.card-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--card-border);
    padding-top: 12px;
    margin-top: 4px;
}
.exam-target { color: #818cf8; font-weight: 600; font-size: 0.875rem; }

:global(html[data-theme='light'] .exams-page) {
  background:
    radial-gradient(circle at 12% 12%, rgba(99, 102, 241, 0.12), transparent 24%),
    radial-gradient(circle at 88% 18%, rgba(59, 130, 246, 0.08), transparent 22%),
    linear-gradient(180deg, #f9fbff 0%, #f4f7fb 50%, #eef3ff 100%);
}

:global(html[data-theme='light'] .section-header h2) {
  background: linear-gradient(120deg, #0f172a, #4f46e5);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

:global(html[data-theme='light'] .exam-features-info) {
  background: linear-gradient(180deg, rgba(255,255,255,0.86), rgba(248,250,252,0.94));
  border-color: rgba(203, 213, 225, 0.72);
  box-shadow: 0 18px 40px rgba(148, 163, 184, 0.14);
}

:global(html[data-theme='light'] .info-item h3) {
  color: #0f172a;
}

:global(html[data-theme='light'] .info-item p),
:global(html[data-theme='light'] .section-header p),
:global(html[data-theme='light'] .exam-code) {
  color: #64748b;
}

:global(html[data-theme='light'] .info-divider) {
  background: rgba(203, 213, 225, 0.72);
}

:global(html[data-theme='light'] .card-footer) {
  border-color: rgba(203, 213, 225, 0.72);
}

:global(html[data-theme='light'] .exam-card) {
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.96));
  border-color: rgba(203, 213, 225, 0.72);
  box-shadow: 0 20px 44px rgba(148, 163, 184, 0.14);
}

:global(html[data-theme='light'] .exam-card:hover) {
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98));
  border-color: rgba(99, 102, 241, 0.28);
  box-shadow: 0 24px 48px rgba(129, 140, 248, 0.14);
}

:global(html[data-theme='light'] .exam-card h4) {
  color: #0f172a;
}

:global(html[data-theme='light'] .exam-icon-wrapper) {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(129, 140, 248, 0.18);
}

:global(html[data-theme='light'] .exam-code) {
  background: rgba(241, 245, 249, 0.82);
  border-color: rgba(203, 213, 225, 0.72);
}

:global(html[data-theme='light'] .exam-target) {
  color: #6366f1;
}

@media (max-width: 768px) {
  .section {
    padding: 52px 0;
  }

  .section-header {
    margin-bottom: 32px;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .section-header p {
    font-size: 1rem;
  }

  .exam-tabs {
    margin-bottom: 28px;
  }

  .exam-tabs :deep(.n-button) {
    min-height: 44px;
  }

  .exam-features-info {
    padding: 20px 18px;
    margin-bottom: 28px;
  }

  .exam-grid {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .section {
    padding: 40px 0 calc(24px + env(safe-area-inset-bottom));
  }

  .section-header h2 {
    font-size: 1.7rem;
  }

  .section-header p {
    font-size: 0.94rem;
    line-height: 1.6;
  }

  .exam-tabs {
    justify-content: stretch;
    gap: 10px;
    margin-bottom: 22px;
  }

  .exam-tabs :deep(.n-button) {
    flex: 1 1 0;
    margin-left: 0 !important;
  }

  .exam-grid {
    grid-template-columns: 1fr;
  }

  .exam-card-content {
    align-items: flex-start;
    padding: 16px 14px 14px;
  }

  .exam-icon-wrapper {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
  }

  .card-footer {
    gap: 10px;
  }

  .exam-target {
    line-height: 1.5;
  }
}

@media (max-width: 360px) {
  .section-header h2 {
    font-size: 1.5rem;
  }

  .exam-card h4 {
    font-size: 1rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .section {
    padding-top: 36px;
    padding-bottom: calc(18px + env(safe-area-inset-bottom));
  }

  .exam-features-info {
    margin-bottom: 22px;
  }
}
</style>
