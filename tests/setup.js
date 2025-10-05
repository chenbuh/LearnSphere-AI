// Jest测试环境设置文件

// 模拟浏览器API
global.indexedDB = require('fake-indexeddb');
global.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

// 模拟localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn()
};
global.localStorage = localStorageMock;

// 模拟console方法（可选，用于测试时减少输出）
// global.console = {
//     ...console,
//     log: jest.fn(),
//     debug: jest.fn(),
//     info: jest.fn(),
//     warn: jest.fn(),
//     error: jest.fn()
// };

// 模拟DOM API
global.document = {
    ...global.document,
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    getElementById: jest.fn(),
    createElement: jest.fn(() => ({
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        innerHTML: '',
        textContent: '',
        style: {},
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn(),
            toggle: jest.fn()
        }
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
};

// 模拟window对象
global.window = {
    ...global.window,
    localStorage: localStorageMock,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
};

// 设置测试超时
jest.setTimeout(10000);

// 全局测试工具函数
global.createMockLearningActivity = () => ({
    type: 'vocabulary_practice',
    module: 'vocabulary',
    contentId: 'test_word_001',
    isCorrect: true,
    timeSpent: 120,
    score: 85,
    timestamp: Date.now(),
    difficulty: 'medium'
});

global.createMockUserData = () => ({
    activities: Array.from({ length: 50 }, (_, i) => ({
        ...global.createMockLearningActivity(),
        id: i + 1,
        timestamp: Date.now() - (i * 24 * 60 * 60 * 1000) // 过去50天的数据
    }))
});

console.log('🧪 Jest测试环境已设置完成');
