<script setup>
import { NGrid, NGridItem, NCard, NProgress, NList, NListItem, NAvatar, NTabs, NTabPane } from 'naive-ui'
import { TrendingUp, Clock, Target, Calendar } from 'lucide-vue-next'

const learningData = {
  dailyTime: [45, 60, 30, 90, 45, 60, 50],
  accuracy: 85,
  wordsMastered: 1240,
  streak: 15
}
</script>

<template>
  <div class="statistics-container">
    <h2 class="text-2xl font-bold mb-6">学习统计</h2>
    
    <n-grid x-gap="16" y-gap="16" cols="1 800:2 1200:4" class="mb-6">
      <n-grid-item>
         <n-card class="stat-card bg-gradient-1">
            <div class="flex items-center gap-4">
               <div class="p-3 bg-white/10 rounded-xl">
                  <Clock class="text-white" :size="24" />
               </div>
               <div>
                  <div class="text-white/70 text-sm">总学习时长</div>
                  <div class="text-2xl font-bold text-white">42.5h</div>
               </div>
            </div>
         </n-card>
      </n-grid-item>
       <n-grid-item>
         <n-card class="stat-card bg-gradient-2">
            <div class="flex items-center gap-4">
               <div class="p-3 bg-white/10 rounded-xl">
                  <Target class="text-white" :size="24" />
               </div>
               <div>
                  <div class="text-white/70 text-sm">正确率</div>
                  <div class="text-2xl font-bold text-white">85%</div>
               </div>
            </div>
         </n-card>
      </n-grid-item>
       <n-grid-item>
         <n-card class="stat-card bg-gradient-3">
            <div class="flex items-center gap-4">
               <div class="p-3 bg-white/10 rounded-xl">
                  <TrendingUp class="text-white" :size="24" />
               </div>
               <div>
                  <div class="text-white/70 text-sm">掌握单词</div>
                  <div class="text-2xl font-bold text-white">1,240</div>
               </div>
            </div>
         </n-card>
      </n-grid-item>
       <n-grid-item>
         <n-card class="stat-card bg-gradient-4">
            <div class="flex items-center gap-4">
               <div class="p-3 bg-white/10 rounded-xl">
                  <Calendar class="text-white" :size="24" />
               </div>
               <div>
                  <div class="text-white/70 text-sm">连续打卡</div>
                  <div class="text-2xl font-bold text-white">15 天</div>
               </div>
            </div>
         </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid x-gap="24" y-gap="24" cols="1 900:3">
       <n-grid-item span="2">
          <n-card title="活动分析" class="h-full">
             <div class="h-64 flex items-end justify-between px-4 gap-2">
                <div v-for="(h, i) in learningData.dailyTime" :key="i" 
                     class="bg-primary/50 hover:bg-primary transition-colors rounded-t w-full"
                     :style="{ height: h + '%' }"
                     :title="h + ' 分钟'">
                </div>
             </div>
             <div class="flex justify-between mt-2 text-gray-400 text-sm">
                <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span>
             </div>
          </n-card>
       </n-grid-item>
       
       <n-grid-item>
          <n-card title="薄弱点分析" class="h-full">
             <div class="space-y-6">
                <div>
                  <div class="flex justify-between mb-2">
                     <span>语法 - 虚拟语气</span>
                     <span class="text-red-400">较差</span>
                  </div>
                  <n-progress type="line" :percentage="45" color="#ef4444" :height="8" />
                </div>
                <div>
                  <div class="flex justify-between mb-2">
                     <span>听力 - 新闻英语</span>
                     <span class="text-yellow-400">一般</span>
                  </div>
                  <n-progress type="line" :percentage="65" color="#f59e0b" :height="8" />
                </div>
                <div>
                  <div class="flex justify-between mb-2">
                     <span>阅读 - 科技类</span>
                     <span class="text-green-400">优秀</span>
                  </div>
                  <n-progress type="line" :percentage="85" color="#10b981" :height="8" />
                </div>
             </div>
          </n-card>
       </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.stats-container { padding: 20px; }
.stat-card { border: none; overflow: hidden; }
.bg-gradient-1 { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
.bg-gradient-2 { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }
.bg-gradient-3 { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.bg-gradient-4 { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

.bg-primary\/50 { background-color: rgba(99, 102, 241, 0.5); }
.bg-primary { background-color: #6366f1; }
</style>
