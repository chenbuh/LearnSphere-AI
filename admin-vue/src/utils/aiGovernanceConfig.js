export const defaultAiGovernanceHealth = {
  commonErrors: [],
  highFailureActions: [],
  p95: 0,
  p99: 0,
  circuitBreakerStatus: 'CLOSED',
  lastFailoverTime: null,
  activeModel: 'qwen-plus'
}

export const aiGovernanceTabDefs = [
  { name: 'monitor', tab: '全景监控', componentKey: 'monitor' },
  { name: 'stability', tab: '稳定性与工程', componentKey: 'stability' },
  { name: 'prompts', tab: '提示词工程', componentKey: 'prompts' },
  { name: 'loop', tab: '反馈闭环与自进化', componentKey: 'loop' },
  { name: 'sandbox', tab: 'Prompt 沙箱', componentKey: 'sandbox' },
  { name: 'logs', tab: '运行日志', componentKey: 'logs' },
  { name: 'abtest', tab: 'A/B 实验室', componentKey: 'abtest' }
]

export function getAIGovernanceTabBindings(tabName, { latestAiHealth, monitorTabRef, onHealthUpdated }) {
  if (tabName === 'monitor') {
    return {
      componentRef: monitorTabRef,
      componentProps: {},
      componentEvents: {
        'health-updated': onHealthUpdated
      }
    }
  }

  if (tabName === 'stability') {
    return {
      componentRef: null,
      componentProps: {
        aiHealth: latestAiHealth
      },
      componentEvents: {}
    }
  }

  return {
    componentRef: null,
    componentProps: {},
    componentEvents: {}
  }
}
