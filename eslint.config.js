import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

/**
 * LearnSphere AI 前端代码检查配置
 *
 * 策略说明：
 * 项目已有 400+ 个前端文件，历史代码风格已定型。本配置的目标是
 * 「拦住真实缺陷」而非「统一所有格式」，因此：
 *   - 只启用可能引发运行时错误的规则（no-undef、no-dupe-keys、no-unreachable 等）
 *   - 不启用缩进/引号/分号等纯格式规则，格式交给 Prettier 按需处理
 *   - 对历史遗留问题以 warn 而非 error 呈现，避免一次性阻断 CI
 */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/target/**',
      'backend/**',
      '**/*.min.js',
      '**/public/models/**',
      '.a11y/**',
      '.verify/**',
      '.ig5-audit/**',
      'verification/**',
      'scripts/**',
      // 以下两个文件内含 TypeScript 语法却使用 .js 扩展名，无法被浏览器解析，
      // 且不在任何构建图中（adaptiveDifficulty 无引用；recommendationEngine
      // 仅被同样无引用的 LearningPathRecommendation.vue 引用）。
      // 属于历史遗留死代码，此处跳过检查，待后续单独清理。
      'frontend-vue/src/services/adaptiveDifficulty.js',
      'frontend-vue/src/services/recommendationEngine.js'
    ]
  },

  js.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        __APP_VERSION__: 'readonly',
        __BUILD_TIME__: 'readonly'
      }
    },
    rules: {
      // —— 真实缺陷类：保持 error ——
      'no-undef': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-duplicate-case': 'error',
      'no-unreachable': 'error',
      'no-unsafe-negation': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-unused-private-class-members': 'error',
      'require-atomic-updates': 'off',

      // —— 常见疏漏：warn，先暴露再逐步收敛 ——
      'no-unused-vars': ['warn', {
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_'
      }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      'no-control-regex': 'off',

      // —— 纯格式类：交给 Prettier / .editorconfig，ESLint 不管 ——
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/attributes-order': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/order-in-components': 'off',
      'vue/v-on-event-hyphenation': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-prop-types': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/no-mutating-props': 'warn',
      'vue/valid-v-slot': 'error',
      'vue/no-parsing-error': 'error'
    }
  },

  // 测试文件：放开 vitest 全局
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    }
  },

  // src/data 下的数据生成脚本与 UMD 风格数据文件：需 Node 全局
  // （数据文件末尾的 `if (typeof module !== 'undefined' && module.exports)`
  //   是 UMD 兼容写法，运行时安全，此处放开 module/require/process）
  {
    files: [
      'frontend-vue/src/data/**/*.js'
    ],
    languageOptions: {
      globals: { ...globals.node }
    }
  },

  // 配置文件：Node 环境
  {
    files: ['*.config.js', '*.config.mjs', 'vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node }
    }
  }
]
