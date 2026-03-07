const fs = require('fs');
const path = require('path');

const parentPath = path.join('admin-vue', 'src', 'views', 'AIGovernance.vue');
let parent = fs.readFileSync(parentPath, 'utf8');

const scriptStart = parent.indexOf("const aiConfig = ref({");
const scriptEnd = parent.indexOf("const animateEntering = async () => {");
if (scriptStart === -1 || scriptEnd === -1 || scriptEnd <= scriptStart) {
  throw new Error('stability script block not found');
}
const scriptChunk = parent.slice(scriptStart, scriptEnd).trim();

const tabMatch = parent.match(/<n-tab-pane name="stability" tab="稳定性与工程">([\s\S]*?)<\/n-tab-pane>/);
if (!tabMatch) {
  throw new Error('stability tab block not found');
}
let tabInner = tabMatch[1].trim();

tabInner = tabInner.replace(/aiHealth\./g, 'healthData.');

const component = [
  '<script setup>',
  "import { computed, h, onMounted, ref, watch } from 'vue'",
  'import {',
  '  NButton,',
  '  NCard,',
  '  NDataTable,',
  '  NEmpty,',
  '  NGrid,',
  '  NGridItem,',
  '  NInput,',
  '  NSelect,',
  '  NSpace,',
  '  NTag,',
  '  useMessage',
  "} from 'naive-ui'",
  "import { Activity } from 'lucide-vue-next'",
  "import { adminApi } from '@/api/admin'",
  '',
  'const props = defineProps({',
  '  aiHealth: {',
  '    type: Object,',
  '    default: () => ({',
  '      commonErrors: [],',
  '      highFailureActions: [],',
  "      p95: 0,",
  "      p99: 0,",
  "      circuitBreakerStatus: 'CLOSED',",
  '      lastFailoverTime: null,',
  "      activeModel: 'qwen-plus'",
  '    })',
  '  }',
  '})',
  '',
  'const message = useMessage()',
  'const healthData = ref(props.aiHealth)',
  '',
  'watch(',
  '  () => props.aiHealth,',
  '  (value) => {',
  '    healthData.value = value || healthData.value',
  '  },',
  '  { deep: true }',
  ')',
  '',
  'const fetchAIHealth = async () => {',
  '  try {',
  '    const res = await adminApi.getAIHealth()',
  '    healthData.value = res.data',
  '  } catch (error) {',
  "    message.error('获取 AI 健康状态失败')",
  '  }',
  '}',
  '',
  scriptChunk,
  '',
  'onMounted(() => {',
  '  fetchAIHealth()',
  '  fetchAIModelCatalog()',
  '  fetchAIConfig()',
  '})',
  '</script>',
  '',
  '<template>',
  tabInner,
  '</template>',
  '',
  '<style scoped>',
  '.main-card {',
  '  backdrop-filter: blur(12px);',
  '  background: rgba(20, 20, 25, 0.7) !important;',
  '  border: 1px solid rgba(255, 255, 255, 0.08) !important;',
  '  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);',
  '  transition: all 0.3s ease;',
  '}',
  '',
  '.main-card:hover {',
  '  box-shadow: 0 8px 32px -1px rgba(0, 0, 0, 0.3);',
  '  border-color: rgba(255, 255, 255, 0.12) !important;',
  '}',
  '',
  '.error-item {',
  '  margin-bottom: 16px;',
  '  padding-bottom: 8px;',
  '}',
  '',
  '.error-msg {',
  '  word-break: break-all;',
  '  display: -webkit-box;',
  '  -webkit-line-clamp: 2;',
  '  -webkit-box-orient: vertical;',
  '  overflow: hidden;',
  '}',
  '',
  '.shadow-\\[0_0_30px_rgba\\(16\\,185\\,129\\,0\\.3\\)\\] {',
  '  animation: pulse-green 2s infinite;',
  '}',
  '',
  '.shadow-\\[0_0_30px_rgba\\(244\\,63\\,94\\,0\\.3\\)\\] {',
  '  animation: pulse-red 2s infinite;',
  '}',
  '',
  '@keyframes pulse-green {',
  '  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }',
  '  70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }',
  '  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }',
  '}',
  '',
  '@keyframes pulse-red {',
  '  0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }',
  '  70% { box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); }',
  '  100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }',
  '}',
  '</style>',
  ''
].join('\n');

fs.writeFileSync(path.join('admin-vue', 'src', 'components', 'AIGovernanceStabilityTab.vue'), component, 'utf8');

parent = parent.replace(
  "const AIGovernanceSandboxTab = defineAsyncComponent(() => import('@/components/AIGovernanceSandboxTab.vue'))\n",
  "const AIGovernanceSandboxTab = defineAsyncComponent(() => import('@/components/AIGovernanceSandboxTab.vue'))\nconst AIGovernanceStabilityTab = defineAsyncComponent(() => import('@/components/AIGovernanceStabilityTab.vue'))\n"
);

parent = parent.replace(scriptChunk + '\n\n', '');
parent = parent.replace(/\s*} else if \(value === 'stability'\) \{\r?\n\s*fetchAIModelCatalog\(\)\r?\n\s*fetchAIConfig\(\)\r?\n\s*}/, '\n  }');
parent = parent.replace(/<n-tab-pane name="stability" tab="稳定性与工程">([\s\S]*?)<\/n-tab-pane>/, `<n-tab-pane name="stability" tab="稳定性与工程">\n        <AIGovernanceStabilityTab v-if="activeTab === 'stability'" :ai-health="aiHealth" />\n      </n-tab-pane>`);

fs.writeFileSync(parentPath, parent, 'utf8');
