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
  { name: 'monitor', tab: '运行监控', componentKey: 'monitor' },
  { name: 'stability', tab: '稳定性', componentKey: 'stability' },
  { name: 'prompts', tab: '提示词管理', componentKey: 'prompts' },
  { name: 'loop', tab: '反馈处理', componentKey: 'loop' },
  { name: 'sandbox', tab: '提示词调试', componentKey: 'sandbox' },
  { name: 'logs', tab: '运行日志', componentKey: 'logs' },
  { name: 'abtest', tab: 'A/B 实验', componentKey: 'abtest' }
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
