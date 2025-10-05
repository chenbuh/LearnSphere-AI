module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    globals: {
        // 浏览器全局变量
        'Storage': 'readonly',
        'WeaknessAnalyzer': 'readonly',
        'RecommendationEngine': 'readonly',
        'AdaptiveLearningPath': 'readonly',
        'PerformanceTracker': 'readonly',
        'AIRecommendationManager': 'readonly',
        'EnglishExamApp': 'readonly',
        'app': 'writable',
        'demo': 'writable'
    },
    rules: {
        // 基础规则
        'no-console': 'off', // 允许console.log用于调试
        'no-unused-vars': ['warn', { 
            'argsIgnorePattern': '^_',
            'varsIgnorePattern': '^_' 
        }],
        'no-undef': 'error',
        'no-redeclare': 'error',
        
        // 代码风格
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        
        // 最佳实践
        'eqeqeq': ['error', 'always'],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-var': 'error',
        'prefer-const': 'warn',
        'prefer-arrow-callback': 'warn',
        
        // ES6+特性
        'arrow-spacing': 'error',
        'template-curly-spacing': 'error',
        'object-shorthand': 'warn',
        
        // 异步处理
        'no-async-promise-executor': 'error',
        'require-await': 'warn'
    },
    overrides: [
        {
            files: ['server.js'],
            env: {
                node: true,
                browser: false
            },
            rules: {
                'no-console': 'off'
            }
        },
        {
            files: ['src/js/**/*.js'],
            env: {
                browser: true,
                node: false
            }
        },
        {
            files: ['test-ai-demo.html'],
            rules: {
                'no-undef': 'off' // HTML文件中的内联脚本
            }
        }
    ]
};
