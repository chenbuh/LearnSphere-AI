import * as Vue from 'vue-real'

/**
 * Vue 3 Shim
 * 解决部分旧版第三方库依赖 Vue 2 默认导出及 Vue.extend 等方法的问题
 */
const shim = {
    ...Vue,
    // 模拟 Vue 2 的 extend 方法，Vue 3 中直接返回组件定义即可
    extend: (options) => options,
    // 模拟 Vue 2 的版本号
    version: Vue.version || '3.0.0',
    // 模拟 Vue 2 的配置对象
    config: {
        globalProperties: {},
        optionMergeStrategies: {},
        warnHandler: null,
        errorHandler: null
    },
    // 模拟 Vue 2 的 util 库（部分旧插件可能用到）
    util: {
        warn: () => { },
        defineReactive: () => { }
    }
}

export default shim

// 重新导出 Vue 3 的所有命名导出，确保按需引入正常工作
export * from 'vue-real'
