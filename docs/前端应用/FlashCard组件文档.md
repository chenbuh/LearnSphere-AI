# FlashCard 组件文档

## 1. 组件概述
`FlashCard.vue` 是一个用于词汇学习的抽认卡组件。它提供了一种交互式的方式来复习单词，支持正面（单词、音标、例句）和背面（释义、同义词、反义词）的翻转显示。

## 2. 核心功能
*   **翻转交互**: 点击卡片或点击“查看/返回”按钮可在正反面之间切换。
*   **发音播放**: 支持通过 Web Speech API 播放单词发声。
*   **学习标记**: 用户可以将单词标记为“认识”或“不认识”，并触发相应的事件。
*   **键盘驱动**: 支持快捷键操作：
    *   `Space`: 翻转卡片
    *   `ArrowLeft`: 上一张
    *   `ArrowRight`: 下一张
    *   `1`: 标记为不认识
    *   `2`: 标记为认识
*   **进度展示**: 顶部显示当前学习进度。

## 3. 属性 (Props)
| 属性名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `word` | `Object` | (必填) | 包含 `word`, `phonetic`, `definition`, `example`, `synonyms`, `antonyms`, `partOfSpeech` 的对象 |
| `currentIndex` | `Number` | `0` | 当前卡片的索引 |
| `totalCards` | `Number` | `1` | 总卡片数 |

## 4. 事件 (Emits)
*   `flip`: 当卡片翻转时触发。
*   `next`: 进入下一张卡片。
*   `previous`: 返回上一张卡片。
*   `known`: 当用户点击“认识”时触发，传递当前单词对象。
*   `unknown`: 当用户点击“不认识”时触发，传递当前单词对象。

## 5. 维护记录
### 2026-02-23
*   **修复**: 修正了 `lucide-vue-next` 图标引用错误。将不存在的 `HandClick` 图标更换为 `MousePointerClick`，解决了页面加载时的 `SyntaxError` 导致的路由导航挂起问题。
