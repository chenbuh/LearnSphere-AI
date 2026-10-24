<template>
  <div class="demo-container">
    <!-- 页面标题 -->
    <div class="demo-header">
      <h1>🎉 分享功能演示</h1>
      <p>点击下方按钮体验分享功能</p>
    </div>

    <!-- 演示卡片 -->
    <n-grid cols="1 600:2 900:3" x-gap="24" y-gap="24">
      <!-- 场景 1：学习完成分享 -->
      <n-grid-item>
        <n-card title="📚 学习完成分享" :bordered="false" class="demo-card">
          <template #header-extra>
            <n-tag type="success" size="small">推荐</n-tag>
          </template>
          <div class="card-content">
            <p class="scenario-desc"><strong>场景：</strong>完成阅读练习后分享成绩</p>
            <div class="mock-result">
              <n-icon :component="Trophy" size="48" color="#eab308" />
              <div class="score">正确率：95%</div>
            </div>
            <n-button type="primary" block @click="showShare1 = true" class="demo-btn">
              <template #icon>
                <Share2 :size="16" />
              </template>
              分享学习成果
            </n-button>
          </div>
        </n-card>
      </n-grid-item>

      <!-- 场景 2：个人成就分享 -->
      <n-grid-item>
        <n-card title="🏆 个人成就分享" :bordered="false" class="demo-card">
          <div class="card-content">
            <p class="scenario-desc"><strong>场景：</strong>分享学习时长或勋章</p>
            <div class="mock-achievement">
              <div class="achievement-item">
                <span class="label">本月学习</span>
                <span class="value">120 小时</span>
              </div>
              <div class="achievement-item">
                <span class="label">连续打卡</span>
                <span class="value">30 天</span>
              </div>
            </div>
            <n-button type="primary" block @click="showShare2 = true" class="demo-btn">
              <template #icon>
                <Share2 :size="16" />
              </template>
              分享我的成就
            </n-button>
          </div>
        </n-card>
      </n-grid-item>

      <!-- 场景 3：快速分享 -->
      <n-grid-item>
        <n-card title="⚡ 快速分享" :bordered="false" class="demo-card">
          <div class="card-content">
            <p class="scenario-desc"><strong>场景：</strong>使用默认配置快速分享</p>
            <div class="mock-quick">
              <Zap :size="64" color="#10b981" />
              <p>分享当前页面到社交平台</p>
            </div>
            <n-button type="primary" block @click="showShare3 = true" class="demo-btn">
              <template #icon>
                <Share2 :size="16" />
              </template>
              一键分享
            </n-button>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 技术说明 -->
    <n-card title="💡 技术说明" :bordered="false" class="info-card">
      <n-space vertical :size="16">
        <div class="info-item">
          <h3>
            <MessageCircle :size="20" color="#12B7F5" />
            QQ 分享
          </h3>
          <p>直接跳转到 QQ 网页分享接口，支持自定义标题、描述和图片</p>
          <pre class="code-block">{{ qqCode }}</pre>
        </div>

        <n-divider />

        <div class="info-item">
          <h3>
            <QrCode :size="20" color="#09BB07" />
            微信分享
          </h3>
          <p>生成二维码让用户扫码，PC 端最佳实践方案</p>
          <pre class="code-block">{{ wechatCode }}</pre>
        </div>

        <n-divider />

        <div class="info-item">
          <h3>
            <LinkIcon :size="20" color="#1e6b52" />
            复制链接
          </h3>
          <p>一键复制到剪贴板，兼容现代浏览器和旧版浏览器</p>
          <pre class="code-block">{{ copyCode }}</pre>
        </div>
      </n-space>
    </n-card>

    <!-- 分享弹窗 -->
    <ShareModal
      v-model:show="showShare1"
      title="我在 LearnSphere AI 完成了阅读练习！"
      description="刚刚阅读了《The Future of AI》，答对率 95%，快来一起学习吧！"
    />

    <ShareModal
      v-model:show="showShare2"
      title="我的学习成就"
      description="本月累计学习 120 小时，连续打卡 30 天，你也能做到！"
    />

    <ShareModal v-model:show="showShare3" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NCard, NGrid, NGridItem, NButton, NTag, NSpace, NDivider, NIcon } from 'naive-ui'
import ShareModal from '@/components/ShareModal.vue'
import { Trophy, Share2, Zap, MessageCircle, QrCode, Link as LinkIcon } from 'lucide-vue-next'

const showShare1 = ref(false)
const showShare2 = ref(false)
const showShare3 = ref(false)

// 代码示例
const qqCode = `const qqShareUrl = \`https://connect.qq.com/widget/shareqq/index.html?url=\${url}&title=\${title}\`
window.open(qqShareUrl, '_blank')`

const wechatCode = `<qrcode-vue 
  :value="shareUrl" 
  :size="220" 
  level="H"
/>`

const copyCode = `await navigator.clipboard.writeText(url)
message.success('链接已复制')`
</script>

<style scoped>
.code-block {
  margin: 0;
  padding: 12px;
  max-height: 400px;
  overflow: auto;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  background: var(--surface-muted);
  border-radius: var(--radius-md);
}

.demo-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 48px;
}

.demo-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: none;
  color: inherit;
}

.demo-header p {
  font-size: 1.1rem;
  color: var(--n-text-color-2);
}

.demo-card {
  border-radius: var(--radius-lg);
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
  transition: all 0.3s ease;
  height: 100%;
}

.demo-card:hover {
  transform: translateY(-4px);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.scenario-desc {
  color: var(--n-text-color-2);
  font-size: 0.9rem;
  margin: 0;
}

.mock-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  background: var(--card-bg);
  border-radius: var(--radius-md);
}

.score {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--n-text-color);
}

.mock-achievement {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: var(--radius-md);
}

.achievement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.achievement-item .label {
  color: var(--n-text-color-2);
  font-size: 0.9rem;
}

.achievement-item .value {
  color: var(--n-text-color);
  font-size: 1.25rem;
  font-weight: 700;
}

.mock-quick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
  text-align: center;
}

.mock-quick p {
  margin: 0;
  color: var(--n-text-color-2);
  font-size: 0.9rem;
}

.demo-btn {
  margin-top: auto;
  height: 44px;
  font-weight: 600;
}

.info-card {
  margin-top: 48px;
  border-radius: var(--radius-lg);
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
}

.info-item h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: var(--n-text-color);
}

.info-item p {
  margin: 0 0 12px 0;
  color: var(--n-text-color-2);
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 640px) {
  .demo-header h1 {
    font-size: 1.8rem;
  }

  .demo-header p {
    font-size: 1rem;
  }

  .score {
    font-size: 1.2rem;
  }

  .achievement-item .value {
    font-size: 1.1rem;
  }
}
</style>
