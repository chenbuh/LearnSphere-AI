<script setup>
import { NModal, NCard, NScrollbar } from 'naive-ui'

defineProps({
  show: Boolean,
  title: String,
  type: {
    type: String,
    default: 'user' // 'user', 'privacy', 'admin'
  }
})

defineEmits(['update:show'])
</script>

<template>
  <n-modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    preset="card"
    style="width: 800px; max-width: 90vw; background: #1e1e24;"
    :title="title"
    :segmented="{ content: 'soft' }"
  >
    <n-scrollbar style="max-height: 60vh; padding-right: 12px;">
      <div class="agreement-content">
        <template v-if="type === 'user'">
          <h3>1. 服务协议的确认</h3>
          <p>欢迎使用 LearnSphere AI（以下简称“本平台”）。在您注册、登录及平衡本平台提供的各项服务前，请务必审慎阅读并充分理解本协议。当您勾选“我已阅读并同意用户协议”时，即表示您已与本平台达成协议，自愿接受本协议的所有内容。</p>
          
          <h3>2. 账号注册与安全</h3>
          <p>您应保证注册信息的真实性、准确性和完整性。您的账号由您个人负责保管，通过您的账号进行的所有操作均视为您本人的行为，产生的任何后果由您自行承担。</p>
          
          <h3>3. AI 辅助学习服务规范</h3>
          <p>本平台利用先进的 AI 技术为您提供英语学习辅导。您理解 AI 生成的内容仅供参考，不代表绝对的标准答案。在考试、学术等严谨场合使用时，请结合专业建议自行判断。</p>
          
          <h3>4. 用户行为准则</h3>
          <p>您不得利用本平台发布法律法规禁止、淫秽、暴力或侵犯他人知识产权的信息。不得对本平台进行逆向工程或利用系统漏洞非法获取资源。</p>
          
          <h3>5. 协议的修改</h3>
          <p>本平台有权根据业务发展及法律法规变化不时地修改本协议，修改后的协议将在本页面进行公示并生效。</p>
        </template>

        <template v-else-if="type === 'privacy'">
          <h3>1. 信息收集范围</h3>
          <p>为了提供精准的学习建议，我们会收集您的注册信息、学习进度、答题记录以及学习偏好。这些数据将仅用于优化 AI 算法及为您生成个人学习分析报告。</p>
          
          <h3>2. 信息的使用</h3>
          <p>我们承诺不会在未经您允许的情况下，将您的个人身份信息出售给第三方。学习数据可能会以匿名汇总的方式用于平台的技术改进和学术研究。</p>
          
          <h3>3. 数据的存储与保护</h3>
          <p>我们采用加密技术及严格的访问控制流程来保护您的个人信息。您的数据将存储在安全且符合法律要求的服务器上。</p>
          
          <h3>4. 隐私权的行使</h3>
          <p>您有权通过个人设置页面查看、更正或注销您的个人数据。在注销账号后，我们将停止收集您的数据并依法进行数据清除或匿名化处理。</p>
        </template>

        <template v-else-if="type === 'admin'">
          <h3>1. 管理员责任</h3>
          <p>作为 LearnSphere AI 的管理人员，您负有维护系统安全、审核学习内容及响应用户投诉的职责。严禁泄露用户个人信息或滥用管理权限。</p>
          
          <h3>2. 数据保密要求</h3>
          <p>管理后台涉及平台核心业务数据。管理员必须对所有后台数据严格保密，不得私自导出、传播或用于非工作目的。</p>
          
          <h3>3. 配置操作规范</h3>
          <p>在修改系统全局配置（如 AI 治理参数、全局限额等）前，需经过内部审批流程。任何违规操作导致系统故障的，将依法追究相关人员责任。</p>
          
          <h3>4. 权限与回收</h3>
          <p>管理权限实行最小化原则。岗位调整或离职时，管理员有义务配合进行账号注销及权限交接工作。</p>
        </template>
      </div>
    </n-scrollbar>
  </n-modal>
</template>

<style scoped>
.agreement-content {
  color: #a1a1aa;
  line-height: 1.8;
  font-size: 0.95rem;
}

.agreement-content h3 {
  color: #fff;
  margin: 24px 0 12px;
  font-size: 1.1rem;
}

.agreement-content p {
  margin-bottom: 16px;
}

/* 适配 Naive UI 暗色卡片内容区域 */
:deep(.n-card-header__main) {
  color: #fff !important;
  font-weight: 700;
}
</style>
