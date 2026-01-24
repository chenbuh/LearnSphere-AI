<script setup>
import { NModal, NCard, NScrollbar } from 'naive-ui'

defineProps({
  show: Boolean,
  title: String,
  type: {
    type: String,
    default: 'admin'
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
        <template v-if="type === 'admin'">
          <h3>1. 管理员责任</h3>
          <p>作为 LearnSphere AI 的管理人员，您负有维护系统安全、审核学习内容及响应用户投诉的职责。严禁泄露用户个人信息或滥用管理权限。</p>
          
          <h3>2. 数据保密要求</h3>
          <p>管理后台涉及平台核心业务数据。管理员必须对所有后台数据严格保密，不得私自导出、传播或用于非工作目的。</p>
          
          <h3>3. 配置操作规范</h3>
          <p>在修改系统全局配置（如 AI 治理参数、全局限额等）前，需经过内部审批流程。任何违规操作导致系统故障的，将依法追究相关人员责任。</p>
          
          <h3>4. 权限与回收</h3>
          <p>管理权限实行最小化原则。岗位调整或离职时，管理员有义务配合进行账号注销及权限交接工作。</p>
        </template>
        
        <template v-else-if="type === 'privacy'">
          <h3>1. 数据访问权限</h3>
          <p>管理员可以访问必要的用户数据以提供技术支持及进行合规审查。但在非必要情况下，严禁检索特定用户的隐私信息。</p>
          
          <h3>2. 操作日志留痕</h3>
          <p>为了系统安全，管理员在后台的所有写操作将被记录。操作日志不可篡改，并将作为审计的重要依据。</p>
          
          <h3>3. 安全合规准则</h3>
          <p>请确保在受信任的网络环境和设备下访问管理后台。由于密码泄露导致的后台安全事故，由相关责任账号所有人承担。</p>
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

:deep(.n-card-header__main) {
  color: #fff !important;
  font-weight: 700;
}
</style>
