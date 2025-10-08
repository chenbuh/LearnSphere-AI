<script setup>
import { ref } from 'vue'
import { 
  NLayout, NLayoutContent, 
  NButton, NGrid, NGridItem, NCard, NDivider 
} from 'naive-ui'
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
  <div class="min-h-screen bg-dark">
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
.section { padding: 80px 0; }
.section-header { margin-bottom: 48px; }
.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(120deg, #fff, #93c5fd);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.section-header p {
  color: #a1a1aa;
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
    background: rgba(255,255,255,0.03);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 48px;
    border: 1px solid rgba(255,255,255,0.05);
}
.info-item {
    text-align: center;
    flex: 1;
}
.info-item h3 {
    font-size: 1.1rem;
    margin-bottom: 4px;
    color: #fff;
}
.info-item p {
    font-size: 0.875rem;
    color: #a1a1aa;
    margin: 0;
}
.info-divider {
    width: 1px;
    height: 40px;
    background: rgba(255,255,255,0.1);
}
@media (max-width: 640px) {
    .exam-features-info { flex-direction: column; gap: 24px; }
    .info-divider { width: 100%; height: 1px; }
}

.exam-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 48px;
}
.exam-card {
  cursor: pointer;
  background: rgba(30, 30, 35, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
}
.exam-card:hover {
  transform: translateY(-5px);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(30, 30, 35, 0.8);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
}
.exam-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
}
.exam-icon-wrapper {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}
.exam-icon { font-size: 2rem; }

.exam-card h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 4px 0;
}
.exam-code { 
    color: #52525b; 
    font-size: 0.875rem; 
    font-family: monospace;
    background: rgba(255,255,255,0.05);
    padding: 2px 6px;
    border-radius: 4px;
    margin-bottom: 16px;
}
.card-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 12px;
    margin-top: 4px;
}
.exam-target { color: #818cf8; font-weight: 600; font-size: 0.875rem; }
</style>
