<script setup>
import { ref, defineExpose, nextTick, computed } from 'vue'
import { NModal, NButton, NIcon, NAvatar, NSpin, NSpace } from 'naive-ui'
import { Download, Share2, Sparkles, Trophy, Palette, Code, GraduationCap, Zap } from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
import html2canvas from 'html2canvas'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const show = ref(false)
const loading = ref(false)
const posterRef = ref(null)
const currentBadge = ref(null)
const posterImage = ref('')
const selectedTheme = ref('modern')

// 海报模板库
const themes = [
    { 
        key: 'modern', 
        name: '现代暗黑', 
        icon: Zap,
        bg: '#111114', 
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        textColor: '#fff'
    },
    { 
        key: 'retro', 
        name: '复古怀旧', 
        icon: Palette,
        bg: 'linear-gradient(135deg, #f9e4b7 0%, #e8c89c 100%)', 
        primaryColor: '#8b4513',
        secondaryColor: '#d2691e',
        textColor: '#3e2723'
    },
    { 
        key: 'geek', 
        name: '极客编程', 
        icon: Code,
        bg: '#0d1117', 
        primaryColor: '#39ff14',
        secondaryColor: '#00d4ff',
        textColor: '#c9d1d9'
    },
    { 
        key: 'campus', 
        name: '校园清新', 
        icon: GraduationCap,
        bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
        primaryColor: '#1976d2',
        secondaryColor: '#42a5f5',
        textColor: '#0d47a1'
    }
]

const currentTheme = computed(() => themes.find(t => t.key === selectedTheme.value) || themes[0])

const open = (badge) => {
    currentBadge.value = badge
    show.value = true
    posterImage.value = ''
    selectedTheme.value = 'modern'
    nextTick(() => {
        generatePoster()
    })
}

const switchTheme = (themeKey) => {
    selectedTheme.value = themeKey
    posterImage.value = ''
    nextTick(() => {
        generatePoster()
    })
}

const generatePoster = async () => {
    if (!posterRef.value) return
    loading.value = true
    try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const canvas = await html2canvas(posterRef.value, {
            useCORS: true,
            scale: 2,
            backgroundColor: currentTheme.value.bg.startsWith('linear-gradient') ? null : currentTheme.value.bg
        })
        posterImage.value = canvas.toDataURL('image/png')
    } catch (e) {
        console.error('Failed to generate poster', e)
    } finally {
        loading.value = false
    }
}

const download = () => {
    const link = document.createElement('a')
    link.download = `LearnSphere-${currentTheme.value.name}-${currentBadge.value?.name}.png`
    link.href = posterImage.value
    link.click()
}

const getLevelColor = (level) => {
    if (level === 2) return selectedTheme.value === 'geek' ? '#00d4ff' : '#94a3b8'
    if (level === 3) return selectedTheme.value === 'retro' ? '#ffd700' : '#fbbf24'
    return selectedTheme.value === 'campus' ? '#1976d2' : '#b45309'
}

const getLevelName = (level) => {
    if (level === 2) return 'SILVER'
    if (level === 3) return 'GOLD'
    return 'BRONZE'
}

defineExpose({ open })
</script>

<template>
    <n-modal v-model:show="show" preset="card" style="width: 500px; background: transparent; border: none;" :bordered="false" class="poster-modal">
        <div class="modal-content-wrap">
            <n-spin :show="loading">
                <!-- Theme Selector -->
                <div class="theme-selector mb-4">
                    <p class="text-xs text-zinc-400 mb-2 font-bold uppercase">选择海报风格</p>
                    <n-space :size="12">
                        <div 
                            v-for="theme in themes" 
                            :key="theme.key" 
                            class="theme-btn" 
                            :class="{ active: selectedTheme === theme.key }"
                            @click="switchTheme(theme.key)"
                        >
                            <n-icon :component="theme.icon" :size="20" />
                            <span class="theme-name">{{ theme.name }}</span>
                        </div>
                    </n-space>
                </div>

                <div v-if="posterImage" class="poster-preview-wrap">
                    <img :src="posterImage" class="poster-preview" />
                    <div class="actions flex justify-center gap-4 mt-6">
                        <n-button quaternary @click="switchTheme(selectedTheme)">
                            <template #icon><Share2 :size="18" /></template>
                            重新生成
                        </n-button>
                        <n-button type="primary" round @click="download">
                            <template #icon><Download :size="18" /></template>
                            保存到相册
                        </n-button>
                    </div>
                </div>
                
                <!-- Poster Template -->
                <div 
                    v-else 
                    ref="posterRef" 
                    class="poster-template" 
                    :class="`theme-${selectedTheme}`"
                    :style="{ 
                        background: currentTheme.bg, 
                        color: currentTheme.textColor 
                    }"
                >
                    <!-- Header -->
                    <div class="poster-header" :style="{ borderLeftColor: currentTheme.primaryColor }">
                        <div class="brand">LearnSphere AI</div>
                        <div class="motto">{{ selectedTheme === 'retro' ? 'Classic Wisdom' : selectedTheme === 'geek' ? '> Code_Excellence' : selectedTheme === 'campus' ? 'Together We Learn' : 'AI Excellence' }}</div>
                    </div>

                    <!-- Body -->
                    <div class="poster-body">
                        <div class="badge-hero">
                             <div class="level-indicator" :style="{ color: getLevelColor(currentBadge?.level) }">
                                 {{ getLevelName(currentBadge?.level) }} TIER
                             </div>
                             <div class="badge-icon-outer" :style="{ borderColor: getLevelColor(currentBadge?.level) + (selectedTheme === 'retro' ? '88' : '44') }">
                                <div class="badge-icon-inner" :style="{ background: getLevelColor(currentBadge?.level) + '22', color: getLevelColor(currentBadge?.level) }">
                                    <Sparkles v-if="currentBadge?.conditionType === 'AI_DEEP_ANALYZE'" :size="64" />
                                    <Trophy v-else :size="64" />
                                </div>
                             </div>
                        </div>

                        <div class="badge-text">
                            <h1 class="achievement-name">{{ currentBadge?.name }}</h1>
                            <p class="achievement-desc">{{ currentBadge?.description }}</p>
                        </div>

                        <div class="user-info" :style="{ background: selectedTheme === 'retro' ? 'rgba(139,69,19,0.1)' : selectedTheme === 'geek' ? 'rgba(57,255,20,0.05)' : 'rgba(255,255,255,0.03)' }">
                            <n-avatar round :size="48" :src="userStore.userInfo?.avatar" />
                            <div class="user-meta">
                                <div class="username">{{ userStore.userInfo?.username }}</div>
                                <div class="completion-date">于 {{ new Date().toLocaleDateString() }} 达成</div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="poster-footer" :style="{ borderTopColor: selectedTheme === 'retro' ? 'rgba(139,69,19,0.2)' : 'rgba(255,255,255,0.05)' }">
                        <div class="qr-wrap">
                            <qrcode-vue 
                                :value="'https://learnsphere.ai/profile/' + userStore.userInfo?.id" 
                                :size="60" 
                                :background="selectedTheme === 'modern' || selectedTheme === 'geek' ? '#ffffff' : selectedTheme === 'retro' ? '#f9e4b7' : '#e3f2fd'" 
                                :foreground="selectedTheme === 'modern' ? '#111114' : selectedTheme === 'retro' ? '#3e2723' : selectedTheme === 'geek' ? '#0d1117' : '#0d47a1'" 
                            />
                        </div>
                        <div class="footer-text">
                            <p>扫描二维码</p>
                            <p>{{ selectedTheme === 'geek' ? 'Join the_Matrix' : selectedTheme === 'retro' ? '传统工艺 现代智慧' : '加入 AI 智慧进阶之行' }}</p>
                        </div>
                    </div>
                    
                    <!-- Decorative Elements -->
                    <div 
                        v-if="selectedTheme === 'modern'" 
                        class="decorative-blob" 
                        :style="{ background: currentTheme.primaryColor }"
                    ></div>
                    <div 
                        v-if="selectedTheme === 'geek'" 
                        class="geek-grid"
                    ></div>
                    <div 
                        v-if="selectedTheme === 'retro'" 
                        class="retro-pattern"
                    ></div>
                </div>
            </n-spin>
        </div>
    </n-modal>
</template>

<style scoped>
.modal-content-wrap { overflow: hidden; border-radius: 24px; }
.poster-preview { width: 100%; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

/* Theme Selector */
.theme-selector { background: rgba(24,24,27,0.6); padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
.theme-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}
.theme-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); transform: translateY(-1px); }
.theme-btn.active { background: #6366f1; border-color: #6366f1; }
.theme-name { font-size: 0.85rem; font-weight: 700; color: #fff; }

/* Base Poster */
.poster-template {
    width: 400px;
    height: 600px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
}

/* Header */
.poster-header { border-left: 3px solid; padding-left: 15px; margin-bottom: 10px; }
.brand { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; }
.motto { font-size: 0.7rem; opacity: 0.7; text-transform: uppercase; font-weight: 700; margin-top: 2px; }

/* Badge Hero */
.badge-hero { display: flex; flex-direction: column; align-items: center; margin: 40px 0; }
.level-indicator { font-weight: 900; font-size: 0.65rem; letter-spacing: 0.2em; margin-bottom: 15px; }
.badge-icon-outer { padding: 15px; border: 1px solid; border-radius: 40px; }
.badge-icon-inner { width: 120px; height: 120px; border-radius: 30px; display: flex; align-items: center; justify-content: center; }

/* Text */
.badge-text { text-align: center; }
.achievement-name { font-size: 1.8rem; font-weight: 900; margin-bottom: 8px; }
.achievement-desc { font-size: 0.9rem; opacity: 0.7; }

/* User Info */
.user-info { display: flex; align-items: center; gap: 12px; margin-top: 30px; padding: 12px; border-radius: 20px; }
.user-meta .username { font-weight: 800; font-size: 1rem; }
.user-meta .completion-date { font-size: 0.7rem; opacity: 0.6; }

/* Footer */
.poster-footer { display: flex; align-items: center; gap: 16px; border-top: 1px solid; padding-top: 20px; }
.qr-wrap { padding: 5px; border-radius: 8px; line-height: 0; }
.footer-text p { margin: 0; font-size: 0.7rem; opacity: 0.7; font-weight: 600; }
.footer-text p:first-child { opacity: 1; font-size: 0.8rem; margin-bottom: 2px; }

/* Modern Theme */
.theme-modern .achievement-name { 
    background: linear-gradient(to right, #fff, #a1a1aa); 
    -webkit-background-clip: text; 
    -webkit-text-fill-color: transparent; 
}
.decorative-blob { 
    position: absolute; 
    width: 300px; 
    height: 300px; 
    filter: blur(100px); 
    opacity: 0.1; 
    top: 100px; 
    left: -100px; 
    z-index: 0; 
}

/* Retro Theme */
.theme-retro {
    font-family: 'Georgia', serif;
    box-shadow: inset 0 0 100px rgba(139,69,19,0.1);
}
.theme-retro .brand { font-family: 'Georgia', serif; letter-spacing: 0.05em; }
.theme-retro .achievement-name { 
    font-family: 'Georgia', serif;
    text-shadow: 2px 2px 4px rgba(139,69,19,0.2);
}
.theme-retro .qr-wrap { background: #f9e4b7; box-shadow: 0 4px 12px rgba(139,69,19,0.15); }
.retro-pattern {
    position: absolute;
    inset: 0;
    background-image: 
        repeating-linear-gradient(45deg, rgba(139,69,19,0.03) 0px, rgba(139,69,19,0.03) 2px, transparent 2px, transparent 10px),
        repeating-linear-gradient(-45deg, rgba(210,105,30,0.02) 0px, rgba(210,105,30,0.02) 2px, transparent 2px, transparent 10px);
    z-index: 0;
    pointer-events: none;
}

/* Geek Theme */
.theme-geek {
    font-family: 'Monaco', 'Courier New', monospace;
    border: 1px solid #39ff1422;
}
.theme-geek .brand { font-family: 'Monaco', monospace; text-shadow: 0 0 10px rgba(57,255,20,0.3); }
.theme-geek .achievement-name { 
    font-family: 'Monaco', monospace;
    color: #39ff14;
    text-shadow: 0 0 20px rgba(57,255,20,0.5);
}
.theme-geek .qr-wrap { background: #ffffff; border: 1px solid #39ff14; }
.geek-grid {
    position: absolute;
    inset: 0;
    background-image: 
        linear-gradient(rgba(57,255,20,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(57,255,20,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    z-index: 0;
    pointer-events: none;
}

/* Campus Theme */
.theme-campus {
    font-family: 'Arial', sans-serif;
    box-shadow: 0 10px 40px rgba(25,118,210,0.1);
}
.theme-campus .brand { color: #1976d2; }
.theme-campus .achievement-name { 
    color: #1976d2;
    text-shadow: 0 2px 8px rgba(25,118,210,0.2);
}
.theme-campus .qr-wrap { background: #e3f2fd; border: 2px solid #1976d2; }
</style>
