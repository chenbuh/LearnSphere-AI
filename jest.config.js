module.exports = {
    // 测试环境
    testEnvironment: 'jsdom',
    
    // 根目录
    rootDir: '.',
    
    // 测试文件匹配模式
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/src/**/__tests__/**/*.js',
        '<rootDir>/src/**/*.test.js'
    ],
    
    // 覆盖率收集
    collectCoverage: true,
    collectCoverageFrom: [
        'src/js/**/*.js',
        '!src/js/**/*.test.js',
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    
    // 模块路径映射
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@ai/(.*)$': '<rootDir>/src/js/ai-recommendation/$1',
        '^@utils/(.*)$': '<rootDir>/src/js/utils/$1'
    },
    
    // 设置文件
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // 全局变量
    globals: {
        'Storage': {},
        'WeaknessAnalyzer': {},
        'RecommendationEngine': {},
        'AdaptiveLearningPath': {},
        'PerformanceTracker': {},
        'AIRecommendationManager': {}
    },
    
    // 转换配置
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    
    // 忽略转换的模块
    transformIgnorePatterns: [
        'node_modules/(?!(es6-module-name)/)'
    ],
    
    // 测试超时
    testTimeout: 10000,
    
    // 详细输出
    verbose: true
};
