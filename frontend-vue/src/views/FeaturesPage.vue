<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  NLayout, NLayoutContent, 
  NGrid, NGridItem, NCard, NIcon, NButton
} from 'naive-ui'
import { 
  Brain, Target, BarChart2, Check, Search, Zap, 
  AlertCircle, CheckCircle2, Play, Activity, TrendingUp
} from 'lucide-vue-next'
import SiteHeader from '../components/SiteHeader.vue'
import SiteFooter from '../components/SiteFooter.vue'

// ... (existing constants)

const aiStep = ref(0)
const simStep = ref(0)
const isSimulating = ref(false)

const chartStep = ref(0)
const isCharting = ref(false)
let timer = null

const startPathSimulation = () => {
    // ... (existing logic)
    if (isSimulating.value) return
    isSimulating.value = true
    simStep.value = 0
    const steps = [
        { time: 500, step: 1 }, 
        { time: 1500, step: 2 }, 
        { time: 2500, step: 3 }, 
        { time: 3500, step: 4 }, 
        { time: 4500, step: 5 }, 
        { time: 5500, step: 6 } 
    ]
    let totalTime = 0
    steps.forEach(({ time, step }) => {
        setTimeout(() => { simStep.value = step }, time)
        totalTime = Math.max(totalTime, time)
    })
    setTimeout(() => { isSimulating.value = false }, totalTime + 500)
}

const startChartSimulation = () => {
    if (isCharting.value) return
    isCharting.value = true
    chartStep.value = 0
    
    // Animation sequence
    const steps = [
        { time: 500, step: 1 }, // Show first bar
        { time: 1000, step: 2 }, // Show second bar
        { time: 1500, step: 3 }, // Show third bar
        { time: 2000, step: 4 }, // Show line chart
        { time: 2500, step: 5 }, // Update stats
    ]
    let totalTime = 0
    steps.forEach(({ time, step }) => {
        setTimeout(() => { chartStep.value = step }, time)
        totalTime = Math.max(totalTime, time)
    })
    setTimeout(() => { isCharting.value = false }, totalTime + 500)
}

onMounted(() => {
  timer = setInterval(() => {
    aiStep.value = (aiStep.value + 1) % 3
  }, 3000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="min-h-screen bg-dark">
    <SiteHeader />
    
    <main>
      <section class="section features-section">
        <div class="container">
          <div class="section-header">
            <h2>为什么选择 LearnSphere?</h2>
            <p>融合认知科学与深度学习，打造极致学习体验</p>
          </div>
          
          <div class="features-list">
              <!-- Feature 1 -->
              <div class="feature-row">
                  <div class="feature-content">
                      <div class="feature-icon-box">
                          <n-icon :component="Brain" :size="32" color="#6366f1" />
                      </div>
                      <h3>AI 智能推荐引擎</h3>
                      <p>告别题海战术。我们的 AI 引擎会实时分析您的每一次答题，动态构建您的知识图谱。系统能精确识别薄弱环节，并为您推送最能提分的专项练习，让学习效率提升 300%。</p>
                      
                      <!-- AI Feature List -->
                      <div class="ai-features-list">
                          <div class="ai-feature-item">
                              <n-icon :component="Check" color="#6366f1" size="18" />
                              <span>实时薄弱点捕获</span>
                          </div>
                          <div class="ai-feature-item">
                              <n-icon :component="Check" color="#6366f1" size="18" />
                              <span>动态难度调整</span>
                          </div>
                          <div class="ai-feature-item">
                              <n-icon :component="Check" color="#6366f1" size="18" />
                              <span>遗忘曲线追踪</span>
                          </div>
                      </div>
                  </div>
                  <div class="feature-visual">
                      <div class="visual-card gradient-1 ai-demo-card">
                        <!-- AI Demo UI -->
                        <div class="ai-dashboard">
                            <div class="ai-header">
                                <div class="status-dot"></div>
                                <span>AI Engine Active</span>
                            </div>
                            
                            <div class="ai-viewport">
                                <!-- Phase 1: Scanning -->
                                <transition name="fade-slide" mode="out-in">
                                    <div v-if="aiStep === 0" key="scanning" class="ai-phase">
                                        <div class="scan-loader">
                                            <div class="scan-circle"></div>
                                        </div>
                                        <p class="phase-text">正在分析近期学习数据...</p>
                                        <div class="data-stream">
                                            <span>Accuracy: 78%</span>
                                            <span>Time: 45min</span>
                                            <span>Vocab: 120</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Phase 2: Detection -->
                                    <div v-else-if="aiStep === 1" key="detection" class="ai-phase">
                                        <div class="detect-alert">
                                            <n-icon :component="Target" size="48" color="#f43f5e" />
                                        </div>
                                        <h4 class="detect-title">发现薄弱项</h4>
                                        <p class="detect-item">语法 · 虚拟语气</p>
                                        <p class="detect-score">掌握度: 45% (低)</p>
                                    </div>

                                    <!-- Phase 3: Recommendation -->
                                    <div v-else key="recommendation" class="ai-phase">
                                        <div class="rec-card">
                                            <div class="rec-badge">推荐练习</div>
                                            <h4>虚拟语气专项突击</h4>
                                            <div class="rec-info">
                                                <span>15 道精选题目</span>
                                                <span>预计提升 +5分</span>
                                            </div>
                                            <n-button type="primary" size="small" class="mt-2" color="#6366f1">开始练习</n-button>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                            
                            <!-- Timeline Indicator -->
                            <div class="ai-timeline">
                                <div :class="['step', { active: aiStep >= 0 }]"></div>
                                <div :class="['step', { active: aiStep >= 1 }]"></div>
                                <div :class="['step', { active: aiStep >= 2 }]"></div>
                            </div>
                        </div>
                      </div>
                  </div>
              </div>

              <!-- Feature 2 -->
              <div class="feature-row reverse">
                  <div class="feature-content">
                      <div class="feature-icon-box">
                          <n-icon :component="Target" :size="32" color="#10b981" />
                      </div>
                      <h3>自适应学习路径</h3>
                      <p>每个人的学习节奏都是独一无二的。LearnSphere 会根据您的表现动态调整题目难度和课程进度。无论您是突击备考还是长期积累，我们都能为您规划出最优的学习路径。</p>
                      
                       <n-button type="primary" size="large" class="mt-8 demo-btn" @click="startPathSimulation" :disabled="isSimulating">
                        <template #icon><n-icon :component="Play" /></template>
                        {{ isSimulating ? '路径演算中...' : '演示自适应过程' }}
                     </n-button>
                  </div>
                  <div class="feature-visual">
                      <div class="visual-card gradient-2">
                           <div class="path-visualizer">
                                <!-- Node 1: Start -->
                                <div class="path-node node-start" :class="{ active: simStep >= 1 }">
                                    <div class="node-icon"><n-icon :component="Brain" /></div>
                                    <div class="node-label">能力测评</div>
                                    <div class="node-status" v-if="simStep >= 1">完成</div>
                                </div>

                                <!-- Path 1 -->
                                <div class="path-line line-1" :class="{ active: simStep >= 2 }"></div>

                                <!-- Node 2: Analysis -->
                                <div class="path-node node-analysis" :class="{ active: simStep >= 2, warning: simStep >= 3 }">
                                    <div class="node-icon"><n-icon :component="Search" /></div>
                                    <div class="node-label">智能分析</div>
                                    <div class="node-status warning-text" v-if="simStep >= 3">
                                        <n-icon :component="AlertCircle" size="12"/> 发现薄弱项: 虚拟语气
                                    </div>
                                </div>

                                <!-- Path 2 (Branch) -->
                                <div class="path-line line-branch" :class="{ active: simStep >= 4 }"></div>

                                <!-- Node 3: Intervention -->
                                <div class="path-node node-intervention" :class="{ active: simStep >= 4 }">
                                    <div class="node-icon"><n-icon :component="Zap" /></div>
                                    <div class="node-label">专项强化</div>
                                    <div class="node-status" v-if="simStep >= 4">生成 20 道针对性练习</div>
                                </div>

                                <!-- Path 3 -->
                                <div class="path-line line-final" :class="{ active: simStep >= 5 }"></div>

                                <!-- Node 4: Mastery -->
                                <div class="path-node node-mastery" :class="{ active: simStep >= 5 }">
                                    <div class="node-icon"><n-icon :component="CheckCircle2" /></div>
                                    <div class="node-label">能力突破</div>
                                    <div class="node-status success-text" v-if="simStep >= 6">+15 分</div>
                                </div>
                            </div>
                      </div>
                  </div>
              </div>

              <!-- Feature 3 -->
              <div class="feature-row">
                  <div class="feature-content">
                      <div class="feature-icon-box">
                          <n-icon :component="BarChart2" :size="32" color="#f59e0b" />
                      </div>
                      <h3>多维数据可视化</h3>
                      <p>拒绝模糊的感觉，用数据说话。我们提供全方位的学习报表，从准确率趋势到遗忘曲线分析，清晰呈现您的每一点进步。让努力看得见，让备考更自信。</p>
                      
                       <n-button type="primary" size="large" class="mt-8 demo-btn" @click="startChartSimulation" :disabled="isCharting">
                        <template #icon><n-icon :component="Activity" /></template>
                        {{ isCharting ? '数据分析中...' : '演示数据看板' }}
                     </n-button>
                  </div>
                  <div class="feature-visual">
                      <div class="visual-card gradient-3">
                         <div class="chart-visualizer">
                             
                             <!-- Stats Grid -->
                             <div class="stats-grid">
                                 <div class="stat-item" :class="{ active: chartStep >= 5 }">
                                     <div class="stat-label">总学习时长</div>
                                     <div class="stat-val">32h <span class="trend up">+4.2%</span></div>
                                 </div>
                                 <div class="stat-item" :class="{ active: chartStep >= 5 }">
                                     <div class="stat-label">词汇量覆盖</div>
                                     <div class="stat-val">2.4k <span class="trend up">+120</span></div>
                                 </div>
                             </div>

                             <!-- Bar Chart -->
                             <div class="chart-container bar-chart-container">
                                 <div class="chart-title">周学习时长分布</div>
                                 <div class="bars-wrapper">
                                     <div class="bar-col">
                                         <div class="bar-fill" style="height: 40%" :class="{ active: chartStep >= 1 }"></div>
                                         <span class="bar-label">Mon</span>
                                     </div>
                                      <div class="bar-col">
                                         <div class="bar-fill" style="height: 65%" :class="{ active: chartStep >= 2 }"></div>
                                         <span class="bar-label">Tue</span>
                                     </div>
                                      <div class="bar-col">
                                         <div class="bar-fill" style="height: 85%" :class="{ active: chartStep >= 3 }"></div>
                                         <span class="bar-label">Wed</span>
                                     </div>
                                      <div class="bar-col">
                                         <div class="bar-fill" style="height: 50%" :class="{ active: chartStep >= 1 }"></div>
                                         <span class="bar-label">Thu</span>
                                     </div>
                                      <div class="bar-col">
                                         <div class="bar-fill" style="height: 90%" :class="{ active: chartStep >= 2 }"></div>
                                         <span class="bar-label">Fri</span>
                                     </div>
                                 </div>
                             </div>

                             <!-- Performance Line -->
                             <div class="chart-container line-chart-container" :class="{ active: chartStep >= 4 }">
                                  <div class="chart-title">
                                      <n-icon :component="TrendingUp" size="14" /> 正确率趋势
                                  </div>
                                  <div class="line-graph">
                                      <svg viewBox="0 0 200 60" class="trend-svg">
                                          <polyline points="0,50 40,40 80,45 120,20 160,25 200,5" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chart-line" />
                                      </svg>
                                  </div>
                             </div>

                         </div>
                      </div>
                  </div>
              </div>
          </div>
          
          <!-- AI Core Section (New) -->
          <div class="ai-core-section">
              <div class="ai-core-content text-center">
                  <h2 class="ai-title">Core Engine <span>Neural</span></h2>
                  <p>驱动 LearnSphere 的核心，是基于 Transform 架构的深度神经网络。它可以理解复杂的语言逻辑，像真人导师一样为您批改作文、纠正发音。</p>
                  <div class="tech-tags">
                      <span>NLP 自然语言处理</span>
                      <span>知识图谱构建</span>
                      <span>自适应推荐算法</span>
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
.section-header {
  margin-bottom: 80px;
  text-align: center;
}
.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(120deg, #fff, #c084fc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.section-header p {
  color: #a1a1aa;
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto;
}

.feature-row {
    display: flex;
    align-items: center;
    gap: 60px;
    margin-bottom: 120px;
}
.feature-row.reverse {
    flex-direction: row-reverse;
}
.feature-content {
    flex: 1;
}
.feature-icon-box {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    border: 1px solid rgba(255,255,255,0.1);
}
.feature-content h3 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 16px;
}
.feature-content p {
    font-size: 1.1rem;
    color: #a1a1aa;
    line-height: 1.7;
}

.feature-visual {
    flex: 1;
    display: flex;
    justify-content: center;
}
.visual-card {
    width: 100%;
    aspect-ratio: 16/10;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}
.visual-card::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none; /* Ensure clicks pass through */
    background: rgba(255,255,255,0.02); /* Reduce opacity */
    /* backdrop-filter: blur(10px); Remove blur, it causes issues */
    z-index: 1;
}
.gradient-1 { background: radial-gradient(circle at top right, rgba(99,102,241,0.15), transparent 70%); border: 1px solid rgba(99,102,241,0.2); }
.gradient-2 { background: radial-gradient(circle at bottom left, rgba(16,185,129,0.15), transparent 70%); border: 1px solid rgba(16,185,129,0.2); }
.gradient-3 { background: radial-gradient(circle at center, rgba(245,158,11,0.15), transparent 70%); border: 1px solid rgba(245,158,11,0.2); }

.dummy-ui {
    z-index: 2;
    background: rgba(20,20,25,0.8);
    padding: 24px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    min-width: 200px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}
.dummy-ui span { font-size: 0.9rem; color: #d4d4d8; font-weight: 500; }

/* Simple visual representations */
.bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 60px; }
.bar { width: 12px; background: #3f3f46; border-radius: 2px; }
.bar.active { background: #6366f1; }

.path-ui { flex-direction: row; gap: 4px; }
.node { width: 16px; height: 16px; border-radius: 50%; background: #3f3f46; display: flex; align-items: center; justify-content: center; }
.node.done { background: #10b981; color: #000; }
.node.active { background: #fff; border: 2px solid #6366f1; }
.line { width: 20px; height: 2px; background: #3f3f46; }
.line.done { background: #10b981; }

.pie-chart { width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(#f59e0b 0% 70%, #3f3f46 70% 100%); }

.pie-chart { width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(#f59e0b 0% 70%, #3f3f46 70% 100%); }

.ai-core-section {
    margin-top: 120px;
    background: rgba(99, 102, 241, 0.05);
    border-radius: 24px;
    padding: 60px 24px;
    border: 1px solid rgba(99, 102, 241, 0.1);
    position: relative;
    overflow: hidden;
}
/* .ai-core-section::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 60%);
    animation: rotate 20s linear infinite;
}
@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
} */

.ai-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: #fff;
}
.ai-title span {
    color: #6366f1;
}
.ai-core-content p {
    max-width: 600px;
    margin: 0 auto 32px;
    color: #a1a1aa;
    font-size: 1.1rem;
    line-height: 1.6;
}
.tech-tags {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}
.tech-tags span {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 8px 16px;
    border-radius: 99px;
    font-size: 0.9rem;
    color: #d4d4d8;
}

@media (max-width: 900px) {
    .feature-row, .feature-row.reverse { flex-direction: column; text-align: center; gap: 40px; margin-bottom: 80px; }
    .feature-icon-box { margin: 0 auto 24px; }
    .feature-content h3 { font-size: 1.75rem; }
    .feature-content p { font-size: 1rem; }
    .ai-features-list { align-items: center; }
    .visual-card { aspect-ratio: auto; min-height: 300px; }
}

@media (max-width: 640px) {
    .section { padding: 40px 0; }
    .section-header h2 { font-size: 1.75rem; }
    .ai-dashboard { padding: 12px; }
    .rec-card { width: 100%; }
    .stats-grid { flex-direction: column; gap: 8px; }
    .stats-grid .stat-item { width: 100%; }
    .ai-title { font-size: 2rem; }
    
    /* 路径可视化移动端优化 */
    .visual-card .path-visualizer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 24px 16px;
        position: static;
        height: auto;
    }
    
    .visual-card .path-visualizer .path-node {
        position: static !important;
        transform: none !important;
        margin: 0 !important;
        width: 90% !important;
        max-width: 280px !important;
        height: auto !important;
        border-radius: 16px !important;
        padding: 20px !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 8px !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
        min-height: 100px !important;
    }
    
    .visual-card .path-visualizer .node-icon {
        font-size: 32px !important;
        flex-shrink: 0;
        margin-bottom: 8px;
    }
    
    .visual-card .path-visualizer .node-label {
        position: static !important;
        top: auto !important;
        margin-top: 0 !important;
        font-size: 1.1rem !important;
        text-align: center !important;
        white-space: normal !important;
        font-weight: 600 !important;
    }
    
    .visual-card .path-visualizer .node-status {
        position: static !important;
        top: auto !important;
        margin-top: 8px !important;
        margin-left: 0 !important;
        display: block !important;
        font-size: 0.85rem !important;
        white-space: normal !important;
        text-align: center !important;
        width: auto !important;
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .visual-card .path-visualizer .path-line {
        display: none !important;
    }
    
    /* 图表可视化移动端优化 */
    .bars-wrapper {
        height: 60px;
    }
    
    .chart-title {
        font-size: 0.75rem;
    }
}

/* AI Demo Styles */
.ai-features-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
}
.ai-feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1rem;
    color: #d4d4d8;
}

.ai-dashboard {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: rgba(10, 10, 15, 0.6);
    backdrop-filter: blur(10px);
    z-index: 2;
}
.ai-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #10b981;
    margin-bottom: 20px;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.status-dot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
    animation: blink 2s infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.ai-viewport {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    /* min-height: 180px; */
}
.ai-phase {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
.phase-text { margin-top: 16px; color: #a1a1aa; font-size: 0.9rem; }

/* Scan Phase */
.scan-loader {
    width: 60px;
    height: 60px;
    border: 2px solid rgba(99, 102, 241, 0.3);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: flex;
    align-items: center;
    justify-content: center;
}
.scan-circle {
    width: 40px;
    height: 40px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 50%;
}
@keyframes spin { to { transform: rotate(360deg); } }
.data-stream {
    margin-top: 12px;
    display: flex;
    gap: 8px;
    font-size: 0.7rem;
    color: #6366f1;
    opacity: 0.7;
}

/* Detect Phase */
.detect-alert {
    animation: pulse-red 2s infinite;
}
.detect-title { color: #f43f5e; font-size: 1.1rem; margin: 12px 0 4px; font-weight: 700; }
.detect-item { color: #fff; font-size: 1rem; margin-bottom: 4px; }
.detect-score { color: #a1a1aa; font-size: 0.85rem; }
@keyframes pulse-red { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

/* Rec Phase */
.rec-card {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.3);
    padding: 16px;
    border-radius: 12px;
    width: 80%;
}
.rec-badge {
    display: inline-block;
    background: #6366f1;
    color: white;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 8px;
}
.rec-card h4 { color: white; margin-bottom: 8px; font-size: 1rem; }
.rec-info { display: flex; justify-content: space-between; font-size: 0.75rem; color: #a1a1aa; margin-bottom: 12px; }

/* Timeline */
.ai-timeline {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
}
.step {
    width: 24px;
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    transition: background 0.3s;
}
.step.active { background: #6366f1; }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.5s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-10px); }

/* Path Visualizer Styles */
.path-visualizer {
    position: relative;
    height: 100%;
    width: 100%;
    /* max-width: 500px; Remove max-width to fit card */
    z-index: 2; /* Ensure above overlay */
}

.path-node {
    position: absolute;
    width: 60px; /* Slightly smaller for features card */
    height: 60px;
    border-radius: 50%;
    background: #18181c;
    border: 2px solid #3f3f46;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}
.node-icon { font-size: 20px; color: #71717a; transition: color 0.3s;}
.node-label { 
    position: absolute; 
    top: 70px; 
    font-size: 0.8rem; 
    font-weight: 600; 
    white-space: nowrap; 
    color: #a1a1aa;
}
.node-status {
    position: absolute;
    top: -26px;
    background: #27272a;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 0.7rem;
    white-space: nowrap;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
    border: 1px solid #3f3f46;
}
.path-node.active .node-status { opacity: 1; transform: translateY(0); }
.success-text { color: #10b981; border-color: #10b981; }
.warning-text { color: #ef4444; border-color: #ef4444; }

/* Node Activation */
.path-node.active { border-color: #6366f1; background: #1e1b4b; transform: scale(1.1); }
.path-node.active .node-icon { color: #818cf8; }
.path-node.node-analysis.warning.active { border-color: #ef4444; background: #451a1a; }
.path-node.node-analysis.warning.active .node-icon { color: #f87171; }
.path-node.node-mastery.active { border-color: #10b981; background: #064e3b; }
.path-node.node-mastery.active .node-icon { color: #34d399; }

/* Positioning - Adjusted for Feature Card size */
/* Assuming card is approx 500-600px wide */
.node-start { top: 20%; left: 10%; }
.node-analysis { top: 50%; left: 35%; }
.node-intervention { top: 25%; left: 60%; } 
.node-mastery { top: 60%; left: 80%; }

/* Connecting Lines */
.path-line {
    position: absolute;
    background: #3f3f46;
    height: 2px;
    transform-origin: left center;
    z-index: 1;
    overflow: hidden;
}
.path-line::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: linear-gradient(90deg, transparent, #6366f1, transparent);
    transform: translateX(-100%);
    transition: transform 1s linear;
}
.path-line.active::after {
    transform: translateX(100%);
    animation: flow 1s infinite;
}
@keyframes flow { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

/* Specific Lines */
/* Start -> Analysis */
.line-1 {
    top: 35%; left: 18%;/* mid point of start to analysis */
    width: 25%;
    transform: rotate(25deg);
}
/* Analysis -> Intervention (Branch) */
.line-branch {
    top: 40%; left: 45%;
    width: 25%;
    transform: rotate(-30deg); 
}
/* Intervention -> Mastery */
.line-final {
    top: 45%; left: 65%;
    width: 25%;
    transform: rotate(50deg); 
}


.demo-btn {
    margin-top: 32px;
}

/* Chart Visualizer Styles */
.chart-visualizer {
    width: 100%;
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: rgba(15, 15, 20, 0.4);
    position: relative;
    z-index: 2; /* Ensure above overlay */
}

.stats-grid {
    display: flex;
    gap: 12px;
}
.stat-item {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 12px;
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.3s;
}
.stat-item.active { background: rgba(99, 102, 241, 0.1); border-color: #6366f1; }
.stat-label { font-size: 0.75rem; color: #a1a1aa; margin-bottom: 4px; }
.stat-val { font-size: 1.1rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px; }
.trend { font-size: 0.7rem; padding: 2px 4px; border-radius: 4px; }
.trend.up { background: rgba(16, 185, 129, 0.2); color: #10b981; }

.chart-container {
    background: rgba(0,0,0,0.2);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
}
.chart-title { font-size: 0.8rem; color: #d4d4d8; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }

/* Bar Chart */
.bar-chart-container { flex: 1; }
.bars-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    height: 80px;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}
.bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 12%;
}
.bar-fill {
    width: 100%;
    background: #3f3f46;
    border-radius: 4px 4px 0 0;
    transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s;
    height: 0 !important; /* Start at 0 for animation if I didn't set inline style? I set inline style. Wait. */
    /* To animate from 0, I should probably use a scaleY or just let the Vue class toggle handle it if I change height? 
       Actually, I set inline style height. To animate 'appearance', I can use transform scaleY.
    */
    transform: scaleY(0);
    transform-origin: bottom;
}
.bar-fill.active {
    transform: scaleY(1);
    background: #f59e0b;
}
.bar-label { font-size: 0.65rem; color: #71717a; }

/* Line Chart */
.line-chart-container {
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.5s;
}
.line-chart-container.active {
    opacity: 1;
    transform: translateY(0);
}
.line-graph {
    height: 60px;
    width: 100%;
    position: relative;
}
.trend-svg { width: 100%; height: 100%; overflow: visible; }
.chart-line {
    vector-effect: non-scaling-stroke;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawLine 2s forwards;
}
@keyframes drawLine { to { stroke-dashoffset: 0; } }
</style>
