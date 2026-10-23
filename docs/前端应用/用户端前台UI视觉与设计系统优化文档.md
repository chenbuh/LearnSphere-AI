# LearnSphere 用户前台 UI 视觉与设计系统优化文档

## 一、背景与设计理念

针对用户前台学习仪表盘（`/dashboard`）及全局页面存在的“生硬大色块紫蓝横幅”、“底色偏暗灰塑料感”、“AI 洞察空状态单薄死黑”、“数据卡片缺少图标与层次”等视觉与审美痛点，本次全面启动了面向**新一代高科技学习工作台（Next-Gen AI Learning Workspace & Glassmorphism）**的系统级视觉与交互升级。

### 核心设计原则
1. **深邃优雅的宇宙黑夜基底 (Deep Obsidian & Slate Dark)**：告别廉价的灰紫蓝底板（`#1a1d2e`）与死黑块（`#111115`），升级为更深邃通透的科技黑夜令牌（`--bg-color: #0b0f19`，卡片采用半透明纳米毛玻璃渐变）。
2. **极光微光流体欢迎横幅 (Aurora Fluid Hero Banner)**：彻底移除原先晃眼突兀的纯高饱和单色紫块，升级为多重发光径向高光混合的极光科技横幅，搭配环形呼吸灯、流光进度条和磨砂高光打卡主键。
3. **高科技 AI 智能就绪态 (Interactive AI Standing By State)**：针对 AI 深度洞察面板在冷启动无推荐时的大片死黑问题，重塑为高科技星云面板，提供智能待命说明与快速练习引导胶囊（“前往词汇背诵”、“每日任务看板”）。
4. **独立立体 KPI 指标微光卡片 (Standalone Luminous Stat Cards)**：为连续打卡、总学习时长、词汇量覆盖配置专属彩色磨砂 Icon 徽章（Flame 火焰、Clock 时钟、BookOpen 单词书），加粗 Tabular Nums 排印，Hover 提供顺滑上浮微动效。
5. **全局侧边栏与配额胶囊精致化**：侧边栏菜单项引入发光微胶囊选中间距，VIP 标识升级为金色渐变徽章（PRO MEMBER），顶栏配额能量值优化为通透磨砂胶囊与矢量微图标。

---

## 二、色彩与视觉令牌 (Design Tokens)

| Token 变量 | 对应色值 / 渐变 | 语义与视觉用途 |
| :--- | :--- | :--- |
| `--bg-color` (Dark) | `#0b0f19` | 深度科技黑夜底色，纯净、沉浸、无压迫感 |
| `--card-bg` (Dark) | `rgba(30, 41, 59, 0.72) ~ rgba(15, 23, 42, 0.78)` | 核心卡片通透微光玻璃渐变 |
| `--header-bg` (Dark) | `rgba(11, 15, 25, 0.82)` | 顶栏高透毛玻璃模糊（blur 20px） |
| `--secondary-text` | `#94a3b8` (Slate 400) | 次级说明文案，清晰易读 |
| `--welcome-banner` | 复合径向极光渐变 (`#3730a3` ~ `#4f46e5` ~ `#7c3aed`) | 宇宙极光科技感欢迎横幅 |
| `--vip-gold` | `linear-gradient(120deg, #f59e0b, #fbbf24)` | VIP 专属尊贵金色字色与徽标 |

---

## 三、本次重点页面与组件优化细节

### 1. 学习仪表盘主视图 (`DashboardView.vue`)
- **公告栏 (`.announcement-bar`)**：优化为极细磨砂发光胶囊，金黄色脉冲呼吸图标，文字柔和清晰。
- **欢迎横幅 (`.welcome-banner`)**：
  - 彻底重构背景为多重发光径向高光混合流体极光渐变；
  - 等级环增加外圈呼吸光晕（Glowing Ring）；
  - 经验进度条优化为高光渐变（`#818cf8` ~ `#c084fc`）；
  - “立即打卡签到”按钮采用高质感磨砂胶囊按键，Hover 上浮微发光，打卡完成呈现健康翠绿微光。
- **三大核心指标卡片 (`.dashboard-stat-card`)**：
  - 连续打卡：配置专属 Amber/Orange 火焰磨砂徽标（`Flame`）；
  - 学习时长：配置专属 Cyan/Blue 时钟磨砂徽标（`Clock`）；
  - 词汇覆盖：配置专属 Purple 词汇磨砂徽标（`BookOpen`）；
  - 数值字体升级为加粗现代 Tabular Nums，右侧配置圆润微光 Pill 状态 Tag；
  - 卡片顶部增加 1px 纳米高光微线，Hover 向上位移 `-3px`。
- **图表容器 (`.chart-card`)**：
  - 边框与阴影同系通透化；
  - 7天 / 30天 切换器升级为精致磨砂按钮组。

### 2. AI 深度洞察面板 (`DashboardAiInsightPanel.vue`)
- **背景面板**：升级为星云微光渐变，彻底解决原先写死 `#111115` 导致的大黑块割裂感；
- **AI 状态徽标**：闪电图标置于带发光微光光圈的玻璃胶囊内，扫描文字带有微光脉冲呼吸灯；
- **空状态重塑 (Empty State)**：
  - 消除缩在右侧的一句暗淡文字；
  - 设计“神经推理引擎分析就绪 (AI Engine Standing By)”科技待命卡片，配备专属 `Sparkles` 微图标；
  - 增加“前往词汇背诵”与“每日任务看板”两个轻量级操作胶囊，引导学员快速展开练习。

### 3. 主布局与全局框架 (`MainLayout.vue` & `QuotaDisplay.vue`)
- **侧边栏菜单**：菜单项升级为 Linear / Raycast 质感的悬浮发光胶囊，激活态带紫蓝渐变与光晕，Hover 平滑位移；
- **Logo 区域**：Logo 图标增加微妙的光晕阴影与悬停微旋转动效；
- **用户档案与 VIP 标识**：用户名支持 VIP 金色渐变，新增专属 `PRO MEMBER` 金色发光胶囊 Tag；
- **能量配额胶囊 (`QuotaDisplay.vue`)**：优化为现代磨砂药丸（Pill Capsule），Hover 浮起，图标升级为精致矢量微图标。

### 4. 侧边栏辅助面板 (`DashboardSidebarPanel.vue`)
- 排行榜与最近活动卡片背景统一为新一代高质感磨砂玻璃；
- 列表项 Hover 增加顺滑平移高亮（`translateX(3px)`）。

---

### 5. 词汇学习中心主页面 (`VocabularyView.vue` 及词汇模块子组件)
- **阶段头部 (`PracticeStageHeader.vue`)**：
  - 大标题排印升级为白光与通透金珀极光渐变（`#ffffff` ~ `#fbbf24` ~ `#f59e0b`），去除原有刺眼脏橙感，增加 3D 立体文字投影；
  - 顶部 Kicker 胶囊化（带实时脉冲指示小圆点与微光边框）；
  - 右侧 4 个统计指标小方块升级为悬浮微光磨砂玻璃卡片，支持鼠标 Hover 微浮动，数值升级为纯白高亮 Tabular Nums。
- **概览看板区 (`VocabularyOverviewHeader.vue`)**：
  - 今日任务面板（`VocabularyOverviewDailyTask.vue`）：升级为通透磨砂悬浮卡片，带金色立体 Icon Badge 与高光进度条；
  - 4 栏统计（`VocabularyOverviewStatsGrid.vue`）：重塑为“今日学习（靛紫）、已掌握（翡翠绿）、学习中（科技蓝）、待复习（珊瑚红）”4 种主题色微光玻璃卡片，立体图标底座增加发光投影，数值亮白高对比度。
- **Tab 导轨与主容器 (`VocabularyView.vue`)**：
  - 彻底覆盖 Naive UI 在深色主题下出现的脏泥土灰褐色背景，重构 `.n-tabs-rail` 为深黑通透磨砂底轨（`rgba(15, 23, 42, 0.65)`）与内阴影；
  - 激活胶囊滑块（`.n-tabs-capsule`）升级为蓝紫科技微光渐变，激活文字纯白高亮。
- **筛词栏与词汇列表 (`VocabularyBrowseFilterBar.vue` & `VocabularyBrowseWordGrid.vue`)**：
  - 筛词栏：搜索按钮升级为蓝紫微光主色按键，总数展示重塑为精致药丸 Badge；
  - 词汇卡片行：增加左侧高光指示线、等宽代码序号徽章、青蓝色等宽音标、加粗明亮单词标题，**核心释义文字亮度全面提升为高对比度 `#cbd5e1`**；发音喇叭升级为灵动微交互按钮。
- **词汇背诵训练面板 (`VocabularyLearnPanel.vue` & `VocabularyLearnSessionPanel.vue`)**：
  - 侧轨指标统一为微光磨砂玻璃卡片；
  - 移除失效的 `.dark-mode` 选择器，默认适配深色模式，修复助记词在暗色下深蓝字体看不清的严重问题，提高例句与释义对比度。

### 6. 单词详情弹窗彻底重塑 (`VocabularyDetailModal.vue`) —— 解决黑底黑字看不清
- **对比度崩塌根治**：
  - 原组件由于错误使用未定义的 `:global(.dark-mode)` 规则，导致深色模式下回退到了浅色写死样式（释义 `.meaning-big` 与英文例句 `.ex-en` 均为纯黑 `#18181b`），在暗色卡片上直接“黑底黑字”几乎完全隐形；
  - 本次重构将核心释义设置为**纯白明亮字体（`#ffffff`，字重 700）**，例句设置为高对比度浅白（`#f1f5f9`），音标配置等宽青蓝高光（`#38bdf8`），并在浅色主题下通过 `html[data-theme='light']` 自动切换为高对比度深蓝灰（`#0f172a`）；
- **释义重复展示修复**：
  - 修复了当词条 `definition` 与 `meaning` 内容完全一致时重复展示两行相同文字的冗余缺陷，增加智能去重判定；
- **玻璃态高质感微光弹窗**：
  - 弹窗背景采用双重径向微光与深邃 Slate 灰蓝玻璃渐变，配合毛玻璃模糊与外圈微光线；
  - 发音喇叭升级为放大悬停微光按钮，新增发光小圆点标签栏与 AI 导师精讲操作键。

### 7. AI 学习助手浮窗深度优化 (`AITutor.vue` & `QuickReplies.vue`)
- **浮窗外壳与极光顶栏 (`.ai-tutor-panel` & `.tutor-header`)**：
  - 彻底摆脱粗糙暗黑方块，面板采用双重径向微光与深邃 Slate 灰蓝毛玻璃渐变（`backdrop-filter: blur(24px)`），配合微高光边框与深层投影；
  - 顶栏 Bot 图标升级为立体发光底座，对话状态标签升级为通透翡翠微光胶囊，对话历史与任务清单切换键升级为高质感磨砂胶囊；
- **当前上下文与任务工作区 (`.workspace-strip`)**：
  - 上下文单词 `currentTopic` 升级为 800 加粗白亮排印，标签配置发光微圆点；
  - 任务推进卡片与 3 栏指标重塑为悬浮微光胶囊卡片，数字加粗等宽高亮（Tabular Nums）；
- **消息气泡高对比度重塑 (`.chat-messages`)**：
  - **助手气泡**：底板从近乎隐形的 `rgba(255, 255, 255, 0.05)` 升级为通透磨砂底板 `rgba(30, 41, 59, 0.65)`，增加左侧紫蓝高光指示线与高对比度文字排印，重点加粗文本设置为高亮翡翠绿（`#34d399`），代码块配置深色磨砂与金黄代码字；
  - **用户气泡**：升级为科技紫蓝渐变（`linear-gradient(135deg, #6366f1, #4f46e5)`）配以微光发光投影；
  - **流式生成态**：气泡升级为发光虚线呼吸框，流式光标脉冲；
- **快速追问与底部输入区 (`QuickReplies.vue` & `.chat-input`)**：
  - 快速追问面板与快捷卡片重构为通透微光玻璃卡片，Hover 高亮浮起；
  - 底部输入区升级为毛玻璃磨砂底托，发送按键升级为蓝紫高光发光按键，Hover 浮动扩散发光。

### 8. 词汇能力测试页面与测评流深度优化 (`VocabularyTestView.vue` 及测试模块子组件)
- **页面顶栏排印升级 (`PracticeStageHeader.vue` / `VocabularyTestView.vue`)**：
  - 顶栏大标题（词汇能力测试）升级为金珀极光渐变（`#fbbf24` ~ `#f59e0b`），右上角词库、模式、难度、题量 4 项测试指标小卡片采用高亮等宽数字与微光玻璃底板；
- **测试设置主面板 (`VocabularyTestSetupPanel.vue`)**：
  - **标题排版挤压折行修复**：彻底解决原先左标题右说明导致右侧说明文案被挤压折叠成三四行的拥挤缺陷，重塑为左对齐全宽开阔排版，增加发光圆点 Kicker 胶囊与层次分明的副标题说明；
  - **考试词库卡片 (`.exam-card`)**：告别沉闷死黑方块，未选中态升级为半透明磨砂玻璃卡片（带圆形图标底座与柔和悬浮微动效）；选中态升级为**蓝紫微光流体高光卡片**（`rgba(99, 102, 241, 0.55)` 边框与发光投影），右上角配置发光 CheckCircle 徽章；
  - **测试题型行 (`.mode-row`)**：升级为立体微光选择卡片，选中态配置左侧高光指示线与高亮状态标签；
  - **边轨卡片与开始测试 (`.setup-rail`)**：难度级别升级为高质感磨砂胶囊 Pills，测试题量卡片突出等宽加粗数字，总结面板药丸化，“开始生成试卷”主按钮升级为蓝紫高光渐变按键并带有呼吸悬浮动效；
- **作答与测评结果流 (`VocabularyTestQuestionPanel.vue` & `VocabularyTestResultPanel.vue`)**：
  - 移除失效的 `.dark-mode` 选择器，默认适配深邃 Obsidian & Slate 科技基底，浅色主题通过 `html[data-theme='light']` 适配；
  - 题目卡片升级为极光微光考卷面板，选项卡片增加高光悬浮微交互，得分卡片配置金色奖杯微光投影。

### 9. 错题复习与错题本工作台深度优化 (`ErrorBookView.vue` 与 `ReviewView.vue`)
- **变量系统与深色模式基底纠偏 (`ErrorBookView.vue`)**：
  - 彻底矫正原先以浅色为默认变量导致的暗色未激活异常，默认变量全面升级为 Obsidian & Slate 科技基底（`--error-panel-bg: rgba(17, 24, 39, 0.75)`，`--error-panel-strong: rgba(15, 23, 42, 0.9)`，`--error-panel-border: rgba(255, 255, 255, 0.08)`），浅色通过 `html[data-theme='light']` 平滑映射；
- **顶栏 Hero 区域重塑**：
  - 引入呼吸发光圆点 Kicker 胶囊（`错题复盘工作台`，金珀微光边框与 `#fbbf24` 文字）；
  - 大标题（`错题本`）升级为白光到蓝紫极光渐变（`#ffffff` ~ `#cbd5e1` ~ `#818cf8`）；
  - 3 栏核心概览指标卡片（累计错题、高频模块、当前聚焦）升级为毛玻璃磨砂卡片，数字加粗等宽高亮（Tabular Nums）；
- **7 大模块导轨 (`.module-strip` 与 `.module-chip`)**：
  - 覆盖全部错题、词汇、语法、阅读、听力、口语、写作等 7 大模块；
  - 未选中卡片升级为微光磨砂玻璃，Hover 平滑浮起；
  - 选中态卡片激活专属主题色流光边框、立体内阴影与图标底座扩散光晕；
- **工作台搜索与筛选系统**：
  - 搜索栏升级为通透磨砂药丸栏，Focus 时呈现科技紫蓝高光聚焦环（Focus Ring）；
  - 刷新按钮升级为主色蓝紫渐变发光按键；
  - 筛选栏升级为微光磨砂药丸 Pills，Active 态立体高亮发光；
- **错题卡片与重大暗色对比度修复 (`.error-entry`)**：
  - 卡片顶部配置随题型 accent 自适应的 3px 微光流光线条；
  - 题目文本升级为加粗纯白高亮（`#ffffff`），行距舒适清爽；
  - **选项高对比度彻底修复**：
    - 正确答案（`.option-row.is-correct`）：从原先暗绿文字彻底升级为**高亮翡翠绿 `#34d399`**，徽标边框与外发光点缀，文字纯白加粗；
    - 错误答案（`.option-row.is-user.is-wrong`）：从原先昏暗的 `#dc2626` 彻底升级为**高亮珊瑚红 `#f87171`**，徽标边框与外发光点缀，文字纯白加粗；
  - 右侧速览看板（`.glance-grid`）：
    - “你的答案”卡片数值升级为亮珊瑚红（`#f87171`）；
    - “正确答案”卡片数值升级为亮翡翠绿（`#34d399`）；
  - 底部折叠解析面板升级为深蓝紫通透微光盒子，代码与上下文高清晰展示；
- **AI 错因深挖弹窗 (`.ai-analysis-modal`)**：
  - 升级为 Obsidian 毛玻璃外壳，配置科技脉冲雷达指示灯；
  - 错因诊断标签与强化题选项标签全量适配高对比度亮金（`#fbbf24`）与高亮翡翠绿（`#34d399`），积分奖励药丸化；
- **智能复习页面深度重塑与空状态彻底升级 (`ReviewView.vue`)**：
  - **核心指标数值隐形缺陷根除**：排查并彻底解决后端返回 `null` 导致前 3 栏指标（完全掌握、熟悉中、学习中）数值渲染为空白隐形的重大 Bug，安全类型转换并统一加上单位 `词`（如 `0 词`），数值字体升级为纯白等宽加粗大字（`font-variant-numeric: tabular-nums`）；
  - **顶栏 Hero 区域升级**：大标题升级为白光金琥珀极光渐变（`#ffffff` ~ `#fef3c7` ~ `#fbbf24`），右上角返回按钮升级为半透明磨砂流光胶囊；
  - **空状态面板星云化重塑 (`.review-empty`)**：
    - 告别单调沉闷的暗黑方框，中心引入**科技流光脉冲光环**（Nebula Halo Ring）与立体发光星芒徽章，配置 `记忆库稳固中` 发光微标；
    - 大标题升级为白银流光大字 `今日待复习单词已全部清空`；
    - **新增 3 栏智能指引建议卡片组 (`.empty-insights`)**：
      1. **艾宾浩斯智能排期**：清晰告知遗忘临界点推算逻辑；
      2. **持续扩充词汇储备**：引导前往词汇学习模块开启新关卡；
      3. **针对性错题攻坚**：直连错题本针对失分点进行强化训练；
    - **操作按钮高对比度升级**：
      - 主按键“去学习新单词”升级为高光蓝紫渐变发光按钮；
      - 次按键“去错题复盘”升级为磨砂毛玻璃按钮；
      - 辅助按键“重新检查队列”**彻底移除原先深灰底黑灰字隐形看不清的 Bug**，升级为通透磨砂高对比度按键；
- **每日任务与计划看板深度优化与空状态彻底升级 (`DailyTaskBoard.vue`)**：
  - **空状态面板星云化展台重塑 (`.empty-shell`)**：
    - 彻底根除截图所示单薄死黑大框（只有单一冷清按钮与大面积空旷压抑区）的痛点；
    - 中心引入**科技流光脉冲双环**（Outer Dashed Spin Ring + Inner Nebula Glow Ring），搭载 3D 罗盘晶体图标（`Compass`）；
    - 顶部配置呼吸微光胶囊微标：`AI 驱动 · 智能备战轨道`，带高亮脉冲翡翠绿点；
    - 大标题升级为白光蓝紫极光渐变大字 `开启专属自适应备考计划`；
    - **双行动按钮矩阵**：主按键“立即创建学习计划”（高光极光微光悬浮按键）+ 次按键“先去自主背词”（通透磨砂毛玻璃按键）；
    - **新增 3 栏智能特性价值卡片组 (`.plan-feature-grid`)**：
      1. **自适应每日排期**（翡翠绿徽章）：根据考试剩余天数动态分配每日任务量，平滑任务节奏；
      2. **多维能力闭环**（天青蓝徽章）：覆盖新词攻克、真题速读、语法练习与弱项错题重练；
      3. **每日打卡激励**（琥珀金徽章）：连胜天数勋章与双倍积分机制，实时追踪学习投入度；
    - 底部新增高对比度指引条：`创建计划大约只需 1 分钟，后续随时可以在“学习计划”中调整强度与偏好。`
  - **作战指挥看板全面极客升级**：
    - 顶栏 Hero 区域升级：新增 `今日作战指挥台 · 实时动态同步` 胶囊，已坚持天数、今日已得积分、计划周期等指标数值 Tabular Nums 加粗纯白高亮；
    - **7 天计划导轨 (`.week-strip`)**：7 天卡片升级为立体毛玻璃，今日卡片蓝紫高斯模糊外发光；
- **语法特训全流程极客科技感深度重塑 (`GrammarView.vue` 及 4 大子组件)**：
  - **知识点选择工作台 (`GrammarSetupPanel.vue`)**：
    - 告别生硬死黑方块，容器全量升级为 Obsidian 极曜石通透毛玻璃（`radial-gradient` + `backdrop-filter: blur(20px)`）；
    - 头部排版升级：新增呼吸微光胶囊徽标 `核心语法考点拓扑库`，大标题升级为白金极光渐变 `先选一个知识点，开启精准特训`，副标题语言凝练专业；
    - **语法知识点卡片 (`.topic-card`)**：
      - 默认态边框带柔和微光，悬浮态位移浮起并点亮火炬橙光晕；
      - 激活态（`.topic-card.active`）升级为双层发光光环（`box-shadow: 0 0 28px rgba(249, 115, 22, 0.22)`），右上角打勾徽章晶体化；
      - 底部状态标签升级为高对比度药丸胶囊，箭头指示器带悬浮位移动效；
    - **右侧“当前选择”面板 (`.rail-panel--focus`)**：
      - 顶部配置火炬流光饰线（`linear-gradient(90deg, #f97316, #fbbf24)`），标题纯白高亮；
      - 题库总量与历史练习指标格升级为 Tabular Nums 加粗纯白大数字卡片；
  - **右侧侧边栏控制台 (`GrammarSidebarPanel.vue`)**：
    - **学习状态仓**：今日特训时长数字高亮，`Lv. 1` 药丸升级为金色光晕徽章（`#fbbf24`），掌握度进度条加粗并采用橙金渐变；
    - **练习配置区**：当前主题/模式/难度摘要行高对比度显示；模式选择项升级为通透卡片列表与呼吸指示绿点；难度选择采用药丸式控制器；
    - **“开始练习”主按键**：彻底升级为微光悬浮大按键（`linear-gradient(135deg, #f97316, #ea580c)`），支持 Hover 微光浮起；
    - **作答题号导航 (`.nav-grid`)**：激活态橙金外发光，作答态天青蓝，正确态高亮翡翠绿（`#34d399`），错误态高亮珊瑚红（`#f87171`）；
  - **作答试卷面板 (`GrammarQuestionPanel.vue`)**：
    - 彻底清除历史硬编码粉色 `#db2777`，统一换装考纲橙金流光进度条与徽章；
    - 题目文本升级为纯白加粗无衬线排版，行距开阔舒适；
    - 选项卡片 A/B/C/D 批改后正确答案采用亮翡翠绿（`#34d399`），错误答案采用亮珊瑚红（`#f87171`），深浅模式均清晰醒目；
    - 语法解析面板升级为深蓝天青通透卡片，直连 AI 助教深入答疑；
  - **特训结果总结面板 (`GrammarResultPanel.vue`)**：
    - 结果卡片配置科技流光双环与 3D 黄金奖杯/靶心徽章；
    - 本次正确率与得分大字等宽排印，AI 诊断建议与推荐知识点全量药丸化。

---

### 10. AI 听力训练实验室全流程极客现代化重塑 (`ListeningView.vue` 及 8 大子组件)
- **顶栏 Hero 区域升级 (`ListeningView.vue`)**：
  - 新增 `AI 原声实战 · 听力实验室` 呼吸微光胶囊微标（琥珀橙光圈）；
  - 大标题升级为白光金琥珀极光渐变（`#ffffff` ~ `#fed7aa` ~ `#fb923c`）；
  - 4 栏实时指标卡片（来源、篇章、难度、进度/历史）升级为深邃 Obsidian 毛玻璃，数值采用纯白 Tabular Nums 加粗排印，支持鼠标悬浮微上浮动效。
- **听力设置主面板 (`ListeningSetupConfigPanel.vue` & `ListeningSetupHistorySection.vue`)**：
  - **听力来源材料库卡片 (`.listening-option-card`)**：
    - 彻底根除原先 6 个大卡片只有单调图标和大字导致的大面积空旷死黑问题；
    - 增加考题副标（如“大学四级 · 校园与社会”、“雅思学术 · 国际原声”、“TED 演讲 · 深度思维”等），视觉饱满专业；
    - 激活态升级为双层流光光环与右上角立体打勾徽章；
  - **右侧配置控制台 (`.listening-settings-box`)**：
    - 篇章数量、难度等级、语速节奏等选项重构为高质感药丸 Pills；
    - “开始生成听力训练”主按键升级为微光呼吸流光大按键，支持 Hover 扩散发光；
  - **历史记录列表 (`ListeningSetupHistorySection.vue`)**：
    - 升级为独立立体悬浮毛玻璃条状设计，Hover 平滑位移并高亮发光，载入材料箭头微动效。
- **作答工作台与交互播发器 (`ListeningTestingHeader.vue` & `ListeningAudioBlock.vue`)**：
  - **作答顶栏 (`ListeningTestingHeader.vue`)**：
    - 升级为黑曜石通透玻璃卡片，新增环形进度指示器与等宽蓝色加粗作答题号；
  - **听力音频播发器 (`ListeningAudioBlock.vue`)**：
    - 彻底告别原先朴素紫框与硬编码 `#6366f1`；
    - 播放按键重构为呼吸发光晶体按键，播放状态下激活橙蓝交织微光脉冲；
    - 动态律动仪（Visualizer）条柱动态高低起伏平滑动画与亮青渐变；
    - 进度条升级为极光渐变槽（`#0ea5e9` ~ `#38bdf8` ~ `#fb923c`），时间显示采用等宽药丸底托。
- **作答试卷与题目导航 (`ListeningQuestionCard.vue` & `ListeningQuestionNavigator.vue`)**：
  - **试卷卡片**：
    - 题号胶囊化，题目文本升级为纯白加粗排印；
    - 选项卡片升级为微光玻璃卡片，激活态呈现青蓝渐变高光与发光边框，字母圆标立体晶体化；
    - 底部上一题与提交试卷按键升级为极光悬浮按键；
  - **题目导航面板 (`ListeningQuestionNavigator.vue`)**：
    - 升级为 Obsidian 毛玻璃面板；
    - 激活题号升级为亮天蓝高光渐变与外阴影；已作答题号升级为翡翠绿微透明胶囊。
- **成果汇报与逐题精析 (`ListeningResultPanel.vue`, `ListeningAnalysisHeader.vue` & `ListeningPassageAnalysisCard.vue`)**：
  - **成绩单卡片 (`ListeningResultPanel.vue`)**：
    - 环形得分环升级为根据分数自适应的科技流光双环（优秀翡翠绿、及格天青蓝、待加强珊瑚红）；
    - 评定等级与下一步建议升级为深邃玻璃卡片，支持一键查看解析、再练一次与成果分享；
  - **逐题精析卡片 (`ListeningPassageAnalysisCard.vue`)**：
    - 听力原声文本升级为沉浸式对照阅读舱；
    - 选项批改正确答案高亮翡翠绿（`#34d399`），错误答案高亮珊瑚红（`#f87171`）；
    - AI 专家解析卡片升级为天青微光左饰线条与直连 AI 助教答疑按键。

---

### 11. AI 阅读理解训练全流程极客现代化重塑 (`ReadingView.vue` 及 4 大子组件)
- **顶栏 Hero 区域升级 (`ReadingView.vue`)**：
  - Kicker 升级为呼吸微光胶囊微标：`全真外刊精读 · 阅读实验室`（带实时脉冲指示小绿点）；
  - 顶栏渐变主色升级为翡翠绿极光渐变（`#34d399` ~ `#10b981`）；
  - 4 栏实时指标小卡片（来源、题材、篇幅/难度、进度/历史）升级为高亮 Tabular Nums 等宽纯白加粗大字。
- **阅读配置工作台 (`ReadingSetupPanel.vue` & `ReadingHistoryPanel.vue`)**：
  - **阅读语料来源卡片网格 (`.source-grid`)**：
    - 升级为黑曜石通透微光玻璃卡片，支持 2-4 列自适应；
    - 激活态升级为翡翠绿极光渐变高光、发光微边框与右上角立体 `CheckCircle2` 徽标；
  - **文章题材卡片网格 (`.category-grid`)**：
    - 升级为双列自适应玻璃卡片，题材专属图标底座微光晶体化；
    - 增加加粗高对比度题材标题与辅助说明，右侧配置药丸状态微标（`已选 / 选择`）；
  - **右侧配置核验边栏 (`.setup-sidebar`, `.side-settings`)**：
    - 难度等级与文章篇幅重构为立体磨砂胶囊 Pills，激活时高光翡翠绿渐变发光；
    - 配置摘要看板（来源库、题材、难度、目标篇幅）药丸化，纯白等宽排印；
    - “生成阅读任务”主按钮升级为翡翠极光悬浮按键，带脉冲呼吸光效；
  - **历史生成档案 (`ReadingHistoryPanel.vue`)**：
    - 升级为独立立体悬浮毛玻璃条状设计，带来源 Tag、难度 Tag、题数与词数徽章；
    - Hover 平滑位移浮起，载入文章动作键微动效。
- **作答工作台与沉浸阅读舱 (`ReadingExamPanel.vue`)**：
  - 顶部返回按钮与顶栏 Kicker 升级为呼吸发光小绿点胶囊；
  - **沉浸式阅读舱 (`.reading-cabin`)**：
    - 原文阅读卡片采用深邃半透黑曜石微光底托，行距舒适扩展至 1.95，段落两端对齐排版；
    - 标题加粗白金渐变，副标包含词数等宽 Badge 与精读模式药丸；
    - 打字机生成态光标配置高亮翡翠绿脉冲呼吸灯；
  - **题目与作答选项卡片 (`.question-content`, `.answer-option`)**：
    - 题号胶囊化（`Question 1 / 5`）；
    - 题目文本升级为纯白加粗高对比度无衬线排印；
    - 选项 A/B/C/D 升级为微光玻璃卡片，Hover 上浮微发光，选中态激活高亮翡翠绿渐变光晕与立体 `CheckCircle2` 徽标；
    - 底部上一题、下一题、提交试卷按键升级为极光悬浮渐变按键；
  - **阅读导航控制台 (`.nav-panel`)**：
    - 完成进度、当前题号、已答题数升级为等宽加粗大字卡片；
    - 题号网格（`.nav-btn`）激活态翡翠绿高光外发光，已答题号翡翠绿微透明胶囊。
- **成果汇报与逐题精析 (`ReadingResultPanel.vue` & `ReadingReviewPanel.vue`)**：
  - **阅读成果成绩单 (`ReadingResultPanel.vue`)**：
    - 环形正确率得分环升级为自适应科技流光双环（优秀翡翠绿、良好天青蓝、待加强珊瑚红）；
    - 评定等级、建议下一步、核心复盘点 3 栏指标深邃卡片化；
    - 操作栏提供“查看原文与逐题复盘”、“开始下一篇阅读”与“分享精读成果”三大高质感主键；
  - **原文复盘解析面板 (`ReadingReviewPanel.vue`)**：
    - 原文对照区增加段落序号胶囊（`P1`, `P2`, `P3`）；
    - 顶部综合正确率、答对题数、文章总段落指标卡片化；
    - 右侧逐题复盘：你的选择（答对高亮翡翠绿 `#34d399`，答错高亮珊瑚红 `#f87171`）、正确答案高亮翡翠绿；
    - 题目解析卡片配置直连 AI 助教答疑微光按钮。

---

### 12. 听力训练配置面板深度重塑与视觉升维 (`ListeningSetupConfigPanel.vue`) —— 彻底根除暗色大空洞与死黑
- **来源材料库 6 大考纲卡片全面升维**：
  - **考纲专属元数据与视觉映射体系 (`examTypeMetaMap`)**：为小学、中考、高考、CET-4、CET-6、IELTS、TOEFL 等不同材料库配置专属词汇规模（如 `~4,500 词`）、真实播音标称语速（如 `130-150 WPM`）、核心考题体裁（如 `['短篇新闻', '长对话', '听力篇章']`）与考纲专属主题色；
  - **信息层级饱满化，根除右下角大片死黑**：
    - 顶部增设 2px 细窄渐变微光饰线（`card-top-line`），选中态呈现活力橙高光；
    - 右上角：选中时显示带流光外发光的立体 `CheckCircle2` 徽标；未选中时展示考纲类型小 Tag；
    - 磨砂晶体图标盒与主副标题排版升级，新增中下部数据指标带（词库规模与语速 Pill）；
    - 底部新增真题体裁胶囊组，深浅模式下均具备半透明纳米磨砂质感，彻底消除空旷感；
  - **立体景深与选中外发光扩散**：
    - 选中态配置双层高对比度活力橙边框（`rgba(249, 115, 22, 0.8)`）与内外双层光晕（`0 12px 32px rgba(249, 115, 22, 0.2)`）；
- **右侧会话控制边栏（Session Control Rail）全面升级**：
  - **药丸单选控制器（Pills）**：篇数、难度、语速选择器升级为深色磨砂与高对比度极光渐变滑块；
  - **新增会话启动概要小看板 (`Session Briefing Card`)**：
    - 位于主操作按键上方，提供实时绿点呼吸灯（“就绪状态 · 参数已锁定”）；
    - 2x2 精致指标网格：展示材料来源、练习篇数、梯度难度、播音倍率；
    - 底部展示预估耗时计算（如 `⏱️ 预计耗时约 6~10 分钟 · 深度听觉专注`），填补右侧下方原本的空白，使左右高度平衡协调；
  - **主生成按键升级 (`Hero Action Button`)**：
    - 扩充按钮高度与内边距，配置扫光流光动效（Shimmering effect）与火箭图标上浮微悬停动效；
- **深浅双主题对比度达标（WCAG AA）**：
  - 深色下无死黑，浅色下所有卡片、边框、标题（`#0f172a`）、副标（`#475569`）均经过精密色彩校验。

---

### 13. AI 口语练习全流程视觉与交互现代化重塑 (`SpeakingView.vue` & `SpeakingSetupPanel.vue`)
- **顶栏阶段指标卡片升级 (`PracticeStageHeader.vue` & `SpeakingView.vue`)**：
  - `PracticeStageHeader.vue` 支持并升级了 `summary-top` 与微光晶体图标底座（`summary-icon-box`）；
  - `SpeakingView.vue` 的 3 大阶段汇总指标（话题类型、难度、设备、历史题目；录音时长、转写词数；得分、流利度、语法、切题度）全面配置专属彩色微图标与等宽中文友好单位（如 `~题`、`~分`、`~词`）；
- **口语准备舞台卡片网格深度重构 (`SpeakingSetupPanel.vue`)**：
  - **4 大话题场景卡片全面升维**：
    - 彻底替换原有粗糙字母 `'D', 'W', 'T', 'A'`，升级为 `MessageSquare`、`Briefcase`、`Compass`、`GraduationCap` 4 大专属磨砂晶体图标；
    - 注入中英双语标签（如 `日常对话 · Daily Life & Socializing`）、考评重心指示条（如 `生活社交 · 快速敏捷反应`）；
    - 底部配置实战场景小药丸胶囊组（如 `['休闲聚会', '餐厅咖啡', '日常问询']`），彻底消除右下角空旷大黑块；
    - 卡片顶部增设 2px 细窄高光微线，选中态配置专属活力橙渐变发光与右上角立体 `CheckCircle2` 徽标；
  - **音频输入设备面板 (`.device-panel`)**：
    - 升级为深蓝灰半透毛玻璃底座，增加实时脉冲绿点指示徽章（`系统默认设备就绪` / `已捕获外置麦克风`）；
    - 刷新设备按钮升级为极光二次操作键，悬停旋转微动效；
    - 增加双核语音识别引擎提示说明（Vosk 本地离线与浏览器实时流式转写）；
- **右侧会话控制边栏与会话启动小看板**：
  - **难度等级药丸单选**：升级为通透磨砂与活力橙高对比度流光渐变激活滑块；
  - **新增口语训练参数概要看板 (`Session Briefing Card`)**：
    - 顶部实时脉冲绿点（`参数已锁定 · 录音引擎待命`）；
    - 4 宫格迷你指标展示：话题方向、梯度难度、录音输入设备、AI 评测核心维度（流利度 · 语法 · 切题度 · 词汇量）；
    - 底部展示动态预估作答时长（如 `⏱️ 预计作答时长约 3~5 分钟 · 沉浸实战`）；
  - **主生成按键升级 (`speaking-start-btn`)**：
    - 扩充至 52px 黄金高度，内置呼吸流光扫光动效（Shimmering effect）与火箭图标上浮动效；
- **深浅双模式严格达标**：
  - 浅色模式全量采用纯净高对比白底、深灰文字（`#0f172a`）、柔和边框，杜绝任何苍白看不清或暗黑死块。

---

### 14. 阅读理解训练与配置面板深度升维 (`ReadingView.vue` & `ReadingSetupPanel.vue`)
- **顶栏阶段指标卡片全面中文化与晶体图标化 (`ReadingView.vue`)**：
  - 彻底根除原本直接透传大写英文代码（`ECONOMIST`、`TECH`、`medium`）导致的突兀与不友好展示；
  - 建立优雅的中文标签体系（`经济学人`、`科技前沿`、`进阶 (Medium)`、`0 篇`）；
  - 全面配置翡翠绿极光微图标（`BookOpen`、`Layers`、`Target`、`HistoryIcon`），借助 `PracticeStageHeader.vue` 的 `summary-top` 与 `summary-icon-box` 呈现纳米晶体质感；
- **6 大阅读语料来源卡片全面升维 (`ReadingSetupPanel.vue`)**：
  - **外刊专属元数据体系 (`getSourceMeta`)**：为《经济学人》、《纽约时报》、《科学美国人》、《国家地理》、经典名著、现代小说注入专属考纲标签（如 `高频考源`、`地道美语`）、刊物特质（如 `政经前沿 · 严谨社论`）与适用备考梯度（如 `考研 / 雅思 / 高考`）；
  - **3 列自适应立体卡片布局**：增加 2px 顶部流光微线，选中时呈现翡翠绿渐变发光与右上角立体 `CheckCircle2` 徽标；
- **8 大文章题材分类卡片信息饱满化**：
  - 注入实战高频关键词胶囊组（如科技前沿：`['AI大模型', '深空探索', '生物芯片']`），彻底消除原本卡片下半截的空洞感；
  - 选中态升级为立体翡翠绿双层光晕与高对比度标签；
- **右侧会话控制边栏与精读启动看板**：
  - **难度与篇幅药丸单选**：升级为通透磨砂与翡翠绿高对比度激活滑块；
  - **新增精读任务配置看板 (`Session Briefing Card`)**：
    - 顶部实时脉冲绿点（`参数已就绪 · 篇章生成引擎待命`）；
    - 4 宫格迷你指标展示：语料来源、文章题材、挑战难度、篇幅规格与预估词数；
    - 底部展示动态预估阅读耗时（如 `⏱️ 预计阅读与答题耗时 8~12 分钟 · 沉浸精读`）；
  - **主生成按键升级 (`reading-start-btn`)**：
    - 扩充至 52px 黄金高度，内置呼吸流光扫光动效（Shimmering effect）与火箭图标上浮动效；
- **运行时数组防御性容错修复 (`TypeError: Cannot read properties of undefined (reading 'find')`)**：
  - 排查并修复了 `useReadingPractice.js` 导出的静态元数据 `sources`、`categories` 等为 Plain Array 而非 Vue Ref 对象的架构细节；
  - 在 `ReadingView.vue` 计算属性中全面采用 `Array.isArray(x) ? x : x?.value || []` 双模兼容防御读取，杜绝因读取 `.value` 导致 `undefined.find()` 运行时崩溃，彻底保证路由切换与页面初次渲染的稳定性；
- **深浅双模式严格达标 (WCAG AA)**：
  - 浅色模式全量采用纯净高对比白底、深灰文字（`#0f172a`）、柔和边框，杜绝任何苍白看不清或暗黑死块。

### 15. 智能精批写作练习全流程视觉与交互现代化重塑 (`WritingView.vue`、`WritingSetupPanel.vue`、`WritingSetupSidePanel.vue`)
- **顶栏阶段指标卡片升级 (`PracticeStageHeader.vue` & `WritingView.vue`)**：
  - 顶栏引入全局规范组件 `PracticeStageHeader.vue`，配置白光-橙金渐变大标题（`#ffffff` ~ `#fb923c` ~ `#ea580c`）与带呼吸灯脉冲点的 Kicker 胶囊（`权威考纲真题 · 智能精批写作舱`）；
  - 为准备阶段、正文写作、结果分析三大阶段的汇总指标全面配置专属彩色微光晶体图标底座（`GraduationCap`、`PenTool`、`Gauge`、`Clock`、`HistoryIcon`、`Sparkles`、`Award`、`MessageSquare`、`Target`）与中文友好单位展示（如 `~分钟`、`~篇`、`~词`、`~分`、`~条`）；
- **考纲目标卡片网格深度重构 (`WritingSetupPanel.vue`)**：
  - **根除纵向通栏变形缺陷**：彻底清除原先因样式穿透失效导致的单列纵向长条变形缺陷，采用 3 列自适应响应式网格 (`exam-card-grid`)；
  - **专属元数据体系 (`getExamTypeMeta`)**：为小学、中考、高考、英语四级 (CET-4)、英语六级 (CET-6)、雅思 (IELTS)、托福 (TOEFL) 注入专属考纲标签、词数要求（如 `120 ~ 180 词`）、考评重心指示条（如 `词汇拓展与句型规范`、`论据组织与深层思辨`）与实战体裁胶囊组；
  - **立体质感与选中态**：卡片增设 2px 顶部流光微线，选中态配置双层活力橙高对比流光边框、纳米级景深投影与右上角立体 `CheckCircle2` 发光徽标；
- **写作题型卡片立体化 (`WritingSetupPanel.vue`)**：
  - 重构为 3 列自适应题型网格 (`mode-card-grid`)，为议论文、图表作文、应用文书信等配置场景描述与核心技能胶囊组，彻底消除死黑块与空旷感；
- **右侧会话控制边栏与任务概览看板升级 (`WritingSetupSidePanel.vue`)**：
  - **难度与限时单选药丸**：升级为通透磨砂与活力橙高对比度流光渐变激活滑块；
  - **新增写作训练任务概览看板 (`Session Briefing Card`)**：
    - 顶部实时绿点呼吸灯（`参数已就绪 · AI 精批模型待命`）；
    - 4 宫格迷你指标展示：目标考纲、写作题型、挑战难度、训练节奏；
    - 底部展示多维度精批指引（如 `⚡ 支持语法纠错 · 词汇替换 · 逻辑链评分`）；
  - **主生成按键升级 (`hero-action-btn`)**：
    - 扩充至 52px 黄金高度，内置呼吸流光扫光动效（Shimmering effect）与羽毛笔图标悬停上浮动效；
- **深浅双模式严格达标 (WCAG AA)**：
  - 深色模式下彻底消除生硬死黑块，浅色模式下全面保持纯净高对比白底与深蓝灰文字（`#0f172a`），确保各类文本与图标清晰可读。

### 16. 模拟考试全流程 UI 升级与浅色主题文字隐形/崩溃系统级修复 (`MockExamView.vue`、`MockExamSetupPanel.vue`、`DashboardView.vue`、`DashboardAiInsightPanel.vue`、`useDashboardOverview.js`、`App.vue`)
- **浅色主题文字隐形/闪烁与白屏根因排查与系统级修复**：
  - **移除 GSAP 动画引发的竞态死锁与文字隐藏**：排查发现 `useDashboardOverview.js` 在组件挂载时调用了 `gsap.timeline().from(..., { autoAlpha: 0 })`，在浅色模式/主题切换或刷新重新渲染时，与异步数据加载（`fetchDashboardStats`）和 ECharts 初始化发生严重冲突，导致页面在一瞬间之后被卡死在 `autoAlpha: 0` 状态，页面文字与数字全部不可见。彻底移除暴力覆盖 DOM 的 GSAP 入场动画，改用纯 CSS GPU 加速安全过渡，根治“刷新后一瞬间好、之后文字消失”的顽疾；
  - **清除 `App.vue` 全局 `n-card` 的暴力 `!important` 覆盖**：原本 `body.light-mode .n-card` 写了 `background-color: var(--card-bg) !important;`，导致任何自定义了纳米微光渐变背景的卡片（如 AI 洞察面板）被强行盖成纯白死块，解除该规则；
  - **修复 AI 深度洞察面板浅色主题对比度崩溃**：重构 `DashboardAiInsightPanel.vue`，彻底消除原先写死的 `text-white`、`text-gray-400`，建立深浅自适应语义类（`.ai-feature-title`、`.ai-feature-desc`、`.empty-ai-title`、`.empty-ai-desc`），确保浅色模式下标题达到 `#0f172a`、说明达到 `#475569` 极高对比度；
  - **强化指标卡片文字浅色对比度**：在 `DashboardView.vue` 中显式指定 `.stat-value`、`.stat-label` 与 `.chart-header` 在浅色主题下的标准文字颜色；
- **模拟考试全流程 UI/UX 视觉重塑与深浅双模式适配 (`MockExamView.vue` & `MockExamSetupPanel.vue`)**：
  - **顶栏接入规范组件**：引入 `PracticeStageHeader.vue`，赋予白光-科技蓝极光渐变大标题与发光呼吸灯 Kicker 胶囊（`全真考纲真题 · 沉浸实战模拟考`）；
  - **全阶段汇总指标微光晶体图标底座**：全面配置 `GraduationCap`、`Gauge`、`Clock`、`HistoryIcon`、`ListOrdered`、`CheckCircle2`、`Award`、`Layers` 专属矢量微图标与中文友好单位（`~套`、`~分钟`、`~题`、`~分`）；
  - **重构 8 大考试项目卡片（`MockExamSetupPanel.vue`）**：
    - 彻底告别原本简陋的单字母圆圈（P/M/H/4/6/I/T/G），重构为自适应 2 列现代立体卡片；
    - 建立专属场景元数据体系（`getExamTypeMeta`），为小学、中考、高考、四级、六级、雅思、托福、GRE 注入专属彩色磨砂晶体图标底座、权威考纲标签、建议词汇量要求 Badge（如 `词库 4,500+`）、考评重心指示条（如 `学术社科速读与细节抓取`、`逻辑填空双三空与严密修辞批判`）与实战真题模块微胶囊组（如 `['长对话听力', '仔细阅读', '段落匹配', '段落汉译英']`）；
    - 选中态配置双层科技蓝流光边框、内外双层发光光晕与右上角立体 `CheckCircle2` 发光徽标；
  - **升级右侧考务控制边栏与任务概览看板**：
    - 难度等级药丸单选升级为科技蓝高对比度极光渐变滑块；
    - 新增【模拟考会话启动概览看板】(`Session Briefing Card`)：顶部实时绿点呼吸指示灯（`考卷已就绪 · 全真计时引擎待命`），4 宫格迷你指标展示（目标考纲、试卷难度、全真限时、历史模考）与考务提示；
    - 主生成按键升级为 52px 黄金高度、带有呼吸流光扫光动效（Shimmering effect）与火箭图标上浮动效的大按键；
  - **深浅双模式严格达标 (WCAG AA)**：
    - 深浅双模式均进行严谨色彩校验，浅色模式下保持纯白基底、深蓝灰文字与柔和边框，杜绝任何苍白看不清或暗黑死块。

---

## 四、改动文件清单

1. `frontend-vue/src/views/DashboardView.vue`：重构 Welcome Banner 宇宙极光渐变、公告条、3 栏核心指标卡片（添加专属图标徽章、Tabular Nums）与图表卡片样式，强化浅色模式文字对比度。
2. `frontend-vue/src/components/dashboard/DashboardAiInsightPanel.vue`：重构 AI 深度洞察面板为星云微光底板，重塑交互式空状态待命引导卡片，修复浅色主题下文字看不清与背景被盖白的问题。
3. `frontend-vue/src/components/dashboard/DashboardSidebarPanel.vue`：升级排行榜与最近动态卡片质感，列表项微动效。
4. `frontend-vue/src/layouts/MainLayout.vue`：重塑侧边栏高科技菜单胶囊、Logo 发光动效与 VIP 会员金色微标。
5. `frontend-vue/src/components/QuotaDisplay.vue`：升级配额胶囊为半透明磨砂胶囊与微发光边框。
6. `frontend-vue/src/style.css`：暗色全局主题令牌升级为深邃现代 Obsidian & Slate 科技基底。
7. `frontend-vue/src/views/VocabularyView.vue`：升级词汇学习页主容器卡片与 Tab 导轨，彻底消除泥土灰褐底轨。
8. `frontend-vue/src/components/learning/PracticeStageHeader.vue`：重构顶栏大标题白光极光渐变、指示圆点 Kicker 与指标微光卡片，支持 `summary-top` 与晶体微图标，强化浅色模式文字对比度。
9. `frontend-vue/src/components/vocabulary/VocabularyOverviewDailyTask.vue`：重构今日任务悬浮磨砂卡片与金色 Icon。
10. `frontend-vue/src/components/vocabulary/VocabularyOverviewStatsGrid.vue`：升级 4 栏统计卡片主题色发光质感与立体图标。
11. `frontend-vue/src/components/vocabulary/VocabularyBrowseFilterBar.vue`：优化筛词栏布局、搜索微光按钮与总数徽章。
12. `frontend-vue/src/components/vocabulary/VocabularyBrowseWordGrid.vue`：升级词条卡片行左侧发光线、加粗排印与高对比度释义。
13. `frontend-vue/src/components/vocabulary/VocabularyBrowsePanel.vue` & `VocabularyLearnPanel.vue`：统一侧轨与内容区磨砂质感。
14. `frontend-vue/src/components/vocabulary/VocabularyLearnSessionPanel.vue`：修复助记词暗色对比度与样式选择器。
15. `frontend-vue/src/components/vocabulary/VocabularyDetailModal.vue`：彻底解决黑底黑字看不清问题，重塑为高对比度通透微光详情弹窗，消除释义重复。
16. `frontend-vue/src/components/AITutor.vue`：全面重构 AI 学习助手浮窗外壳、顶栏、工作区、消息气泡对比度与输入区。
17. `frontend-vue/src/components/QuickReplies.vue`：升级快捷追问面板与卡片暗色微光质感与对比度。
18. `frontend-vue/src/views/VocabularyTestView.vue`：升级词汇能力测试顶栏高光配色。
19. `frontend-vue/src/components/vocabulary/VocabularyTestSetupPanel.vue`：重构词汇测试设置面板排版（根除折行）、词库卡片微光系统与边轨开始按钮。
20. `frontend-vue/src/components/vocabulary/VocabularyTestQuestionPanel.vue`：升级作答试卷卡片、选项高光微交互与深浅模式适配。
21. `frontend-vue/src/components/vocabulary/VocabularyTestResultPanel.vue`：重构测试结果得分卡片与错题回顾面板。
22. `frontend-vue/src/views/ErrorBookView.vue`：错题复盘工作台全量现代化重构，彻底解决暗绿暗红对比度不足痛点，升级 7 大模块流光卡片、搜索 Pills 与 AI 深挖弹窗。
23. `frontend-vue/src/views/ReviewView.vue`：智能复习翻转卡片与答题主键现代化重构，升级 3D 毛玻璃、金珀释义与珊瑚红/翡翠绿答题按键。
24. `frontend-vue/src/views/DailyTaskBoard.vue`：每日任务看板与空状态深度重塑，重构流光双环罗盘、3 栏自适应备考特性卡片、双操作按键与全量极客指挥台。
25. `frontend-vue/src/views/GrammarView.vue`：语法特训主容器与主栅格重构，扩充侧边栏为 320px 黄金呼吸宽度，清除失效冗余旧样式。
26. `frontend-vue/src/components/grammar/GrammarSetupPanel.vue`：重构考点拓扑库卡片网格、激活态双层流光光环、高对比度微标与当前选择展台。
27. `frontend-vue/src/components/grammar/GrammarSidebarPanel.vue`：重构学习状态追踪仓、掌握度流光进度条、模式切换列表与呼吸微光开始按键。
28. `frontend-vue/src/components/grammar/GrammarQuestionPanel.vue`：重构作答试卷、纯白题目排版、高亮翡翠绿/珊瑚红判题选项与深度解析卡。
29. `frontend-vue/src/components/grammar/GrammarResultPanel.vue`：重构特训总结卡、星云双环、等宽大数字战绩与 AI 诊断建议面板。
30. `frontend-vue/src/views/ListeningView.vue`：听力实验室主视图顶栏白金琥珀渐变、Kicker 发光徽标、4 栏彩色微光图标底座与中文友好单位展示。
31. `frontend-vue/src/components/listening/ListeningSetupConfigPanel.vue`：重塑考纲 6 大卡片元数据（词库量/WPM/题型胶囊）、顶部发光饰线、右上角发光打勾徽标、右侧配置概览小看板与扫光主按键。
32. `frontend-vue/src/components/listening/ListeningSetupHistorySection.vue`：重构历史材料行卡片化、Hover 平滑位移与渐变高光交互。
33. `frontend-vue/src/components/listening/ListeningTestingHeader.vue`：重构作答顶栏黑曜石毛玻璃、环形进度指示器与等宽作答数字。
34. `frontend-vue/src/components/listening/ListeningAudioBlock.vue`：重塑音频交互舱，升级呼吸脉冲播放键、亮青动态律动波形仪、流光进度条与等宽计时器。
35. `frontend-vue/src/components/listening/ListeningQuestionCard.vue`：重构作答卡片、发光题号胶囊、纯白高对比度题目、立体选项与极光切换主键。
36. `frontend-vue/src/components/listening/ListeningQuestionNavigator.vue`：重构题目导航面板、亮天蓝激活呼吸光晕与翡翠绿作答胶囊。
37. `frontend-vue/src/components/listening/ListeningResultPanel.vue`：重构成绩单、分数自适应科技流光双环、等级胶囊与操作按钮组。
38. `frontend-vue/src/components/listening/ListeningAnalysisHeader.vue`：升级详细解析顶栏面包屑与通透返回胶囊按键。
39. `frontend-vue/src/components/listening/ListeningPassageAnalysisCard.vue`：重构原声对照阅读舱、高亮翡翠绿/珊瑚红选项与 AI 助教精讲卡片。
40. `frontend-vue/src/views/ReadingView.vue`：精读实验室顶栏 Kicker 胶囊化、翡翠绿极光主色与 4 栏中文友好微光图标指标卡片。
41. `frontend-vue/src/components/reading/ReadingSetupPanel.vue`：重构阅读来源 6 大卡片元数据、适用备考梯度胶囊、题材关键词胶囊组、配置核验边栏与开始按键。
42. `frontend-vue/src/components/reading/ReadingHistoryPanel.vue`：重构历史阅读任务卡片行、来源/难度 Badge 与悬浮位移动效。
43. `frontend-vue/src/components/reading/ReadingExamPanel.vue`：重塑交互式沉浸阅读舱、纯白高对比度题目、微光选项与进度导航控制台。
44. `frontend-vue/src/components/reading/ReadingResultPanel.vue`：重构正确率科技流光双环、诊断指标卡片与三大操作主键。
45. `frontend-vue/src/components/reading/ReadingReviewPanel.vue`：重构原文对照段落序号胶囊、答对/待复盘选项高光对比与 AI 助教答疑。
46. `frontend-vue/src/views/SpeakingView.vue`：口语实验室主视图顶栏 4 栏指标专属矢量图标徽标与中文单位增强。
47. `frontend-vue/src/components/speaking/SpeakingSetupPanel.vue`：重构口语准备 4 大话题卡片场景元数据、考评重心指标条、场景小药丸胶囊、麦克风设备状态灯、会话启动看板与扫光开始按钮。
48. `frontend-vue/src/views/WritingView.vue`：写作练习主视图接入 `PracticeStageHeader` 全局规范顶栏、专属微光晶体图标底座与中文友好指标。
49. `frontend-vue/src/components/writing/WritingSetupPanel.vue`：重构 3 列自适应考纲网格，根除纵向变形缺陷，注入词数要求、考评重心与真题体裁胶囊组，重构 3 列题型卡片。
50. `frontend-vue/src/components/writing/WritingSetupSidePanel.vue`：重构难度/限时药丸滑块，新增写作训练任务概览看板 (`Session Briefing Card`)，升级 52px 黄金流光扫光主生成按钮。
51. `frontend-vue/src/views/MockExamView.vue`：模拟考试主视图顶栏接入规范 `PracticeStageHeader`、白金科技蓝极光大标题与全阶段专属矢量图标指标底座。
52. `frontend-vue/src/components/mockexam/MockExamSetupPanel.vue`：重构 8 大考试项目自适应 2 列立体卡片，注入专属元数据体系、题量词汇要求与考评重心，新增模拟考任务概览看板，升级 52px 黄金主生成按键，深度适配深浅双主题。
53. `frontend-vue/src/composables/useDashboardOverview.js`：移除引发渲染竞态与文字消失的 GSAP 入场动画，彻底根治浅色模式下刷新文字隐形问题。
54. `frontend-vue/src/App.vue`：移除全局 `n-card` 的暴力 `!important` 覆盖，保证浅色主题下渐变背景卡片正常显示。
56. `frontend-vue/src/components/learning/LearningAnalysisOverviewSection.vue`：全景重塑综合能力值仪表舱，引入 SVG 动态微光环形仪表盘、段位评级徽章、两极速览条，并将次级指标升级为 3 大独立 Bento 晶体卡片，彻底消灭死黑空洞。
57. `frontend-vue/src/components/learning/LearningAnalysisHeader.vue`：升级学习分析顶栏，引入三柱元数据悬浮晶体舱（专属矢量图标底座）、流光 46px 科技操作键、实时脉冲呼吸灯。
58. `frontend-vue/src/views/LearningAnalysisView.vue`：向概览舱传递领跑模块与薄弱项全景信息，优化双主题自适应排版。
59. `frontend-vue/src/views/ErrorBookView.vue`：全景重塑错题本复盘工作台，顶部增加掌握度态势与快捷行动跳板消灭死黑空洞，右侧重构为 3 大 Bento 独立晶体卡片，7 模块导航条重构为全尺寸无缺口对称网格，新增零缺陷成就勋章舱。
60. `docs/前端应用/用户端前台UI视觉与设计系统优化文档.md`：本规范与记录文档。

---

## 17. 浅色主题文字全端隐形根除与全平台双模色彩系统重构

### 17.1 问题溯源与根因诊断（Root Cause Analysis）
用户在实际浏览器切换为浅色主题时，出现严重的“文字全屏隐形/白屏”异常，且伴随“刷新瞬间可见、数秒后文字彻底消失”的异常视觉现象。经深度审查与复现推导，确认根本原因由以下双重机制引发：
1. **Google WebFont 外部字体加载阻塞与 FOIT (Flash of Invisible Text)**：
   - `index.html` 引入了 `https://fonts.googleapis.com` 的 `Inter` 字体。在中国大陆网络环境下，`fonts.gstatic.com` 经常遭遇连接阻断或严重握手延迟；
   - 浏览器初次绘制时使用系统字体瞬时渲染（用户看到正常文本），随后样式引擎触发对 `Inter` 远程字体的拉取，进入长达数十秒的 WebFont FOIT 阻塞挂起状态，将页面所有匹配到该字体的文本内容（包括静态 HTML 文字、动态插值、深紫色 Welcome Banner 上的白字）强行渲染为不可见空白；
2. **浅色文字样式的作用域隔离与白底白字回退**：
   - `style.css` 原先将核心浅色模式颜色规则（如 `.setup-title`, `.stat-value`, `.chart-header`, `.word-text` 等）错误封装在 `@media (max-width: 900px)` 媒体查询内部，桌面端（> 900px）浅色模式下规则完全失效；
   - `global-mobile.css` 中将 Naive UI 浅色组件通用规则错误封装在 `@media (max-width: 768px)` 内部，导致桌面端组件回退到局部组件写死的白色文字，融入白色卡片背景形成白底白字；
3. **彩色渐变大背景卡片文字保护不足**：
   - 欢迎横幅（`welcome-banner`）采用尊贵紫色微光渐变，其内部文字需要无论在深色还是浅色模式下均保持纯白高对比度，需专门设置抗深色洗刷规则。

### 17.2 实施方案与重构内容（Implementation Details）
1. **彻底移除外部阻塞性 WebFont，构建零延迟本地原生高质感字体栈**：
   - 彻底移除了 `frontend-vue/index.html` 中的 Google Fonts 外链；
   - 统一规范 `--app-font-family` 为本地安全字体栈：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif`，实现 0ms 本地渲染，从根本上绝灭 FOIT 隐形现象；
2. **提取全局全端浅色系统文本对比度层（Universal Light Theme Core）**：
   - 在 `style.css` 顶层（不受任何媒体查询约束）定义全局浅色主题文本规范：
     - 全部标题与核心高亮值强制指定为高对比度玄青黑 `#0f172a`；
     - 全部次级说明、标签与辅助元数据强制指定为经典石板灰 `#475569`；
     - 彻底排除了 `.welcome-banner` 内部的白色标题与打卡按钮文字，确保其在紫底上保持纯白晶透；
   - 通告栏浅色模式背景优化为高质感暖琥珀金 `rgba(255, 251, 235, 0.96)`，文字设为琥珀深褐 `#92400e`；
   - 核心统计指标卡与图表卡采用 `linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)` 搭配高精度边框 `#cbd5e1`，指标值强制为 `#0f172a`；
3. **全局辅助增强样式多重保险（`theme-text-enhancement.css` & `global-mobile.css`）**：
   - 在 `theme-text-enhancement.css` 中注入了对称的浅色模式高对比度增强规则，锁死所有 `h1~h6`、`p`、`label`、`strong`、`input`、`select` 的浅色对比度；
   - 在 `global-mobile.css` 中将 Naive UI 基础组件卡片、模态框、输入框和分页条的浅色规则提升至全局作用域，确保 PC 桌面端全尺寸生效；
4. **DashboardView 内部显式色彩强化**：
   - 针对 `.stat-value`, `.stat-label`, `.chart-header`, `.checkin-btn-glass` 内的文本与图标增加高优先级显式样式，杜绝任何Scoped样式冲突。

---

## 18. 学习中心（Learning Hub）全景重塑与信息架构黄金对齐

### 18.1 现状诊断与视觉痛点
用户反馈“优化学习中心页面前端”。通过对截图深度审查，发现以下三大核心痛点：
1. **左侧今日重点聚焦卡片（`hero-focus`）空洞死白**：
   - 由于右侧多卡片单列纵向堆叠拉长了整体高度（约 450px），在 `align-items: stretch` 作用下，左侧今日重点卡片被强行拉伸出近 300px 高度；
   - 内部仅在左下角保留 3 行简单文字、右下角放一个孤立按钮，中间出现大面积死白空白区，空间利用率极低且视觉空泛；
2. **右侧 7 项卡片死板单列纵向堆叠**：
   - 3 个指标卡（连续学习、今日投入、任务完成）加 4 个快捷操作（任务、模块、闪卡、听力）被强行塞在单列中，一字排开 7 层，视觉冗长压抑；
   - 快捷跳板缺乏专属矢量图标、hover 微交互与科技微光质感；
3. **白金极光与深海科技双模质感缺失**：
   - 卡片在浅色模式下缺乏渐变层次与纳米微光边框，缺少沉浸感。

### 18.2 核心重塑方案与技术落地（Implementation Details）
1. **重构顶层架构（`hero-topline` + `hero-main-grid`）**：
   - 顶栏清晰呈现日期胶囊、任务进度胶囊、大标题、AI 导航舱专属 Badge 与呼吸状态灯（`pulse-dot`）；
   - 主体采用 `1.45fr : 1fr` 黄金比例双栏互锁网格，实现左右高度自适应黄金平衡，彻底消灭死白空洞；
2. **今日王牌聚焦任务舱（Prime Focus Chamber）升维**：
   - 增加专属模块立体微光图标底座（电光蓝紫渐变，根据词汇/听力/阅读/语法/写作自动映射专属矢量图标）；
   - 增加任务大标题、经验值奖励胶囊（`+10 XP`）与微光进度条（`focus-progress-track`），配带流光扫光扫过动效；
   - 升级操作按钮为 **44px/52px 黄金流光扫光大按钮**，带有悬浮位移与箭头滑出微动效；
3. **全景多维仪表看板（Multi-metric Nexus Dashboard）多维重组**：
   - **三大指标卡横向网格（`hero-metrics-trio`）**：连续学习（燃火橙）、今日投入（科技青）、任务完成（翡翠绿），采用 3 列横向紧凑微光卡片，配带矢量图标徽标与 tabular-nums 大数值；
   - **4 大快捷跳板对称 2x2 网格（`hero-jumpers-grid`）**：为任务挑战、学习模块、单词闪卡、听力精练等分配专属彩色图标徽标底座、磁吸卡片背景与 hover 箭头浮动反馈；
4. **全端浅色与深色双模无缝融合**：
   - 浅色模式采用高质感纳米白金背景 `radial-gradient`，配合高对比度玄青黑 `#0f172a` 与石板灰 `#475569`；
   - 深色模式采用极客暗夜黑金与电光蓝紫极光渐变，确保双模极致优雅统一。

---

## 19. 学习分析（Learning Analysis）全景前台 UI/UX 视觉重塑与双模升维

### 19.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图分析，学习分析（`/analysis`）页面存在以下关键视觉缺陷：
1. **概览看板（`LearningAnalysisOverviewSection`）严重空洞死黑**：
   - 左侧大卡片（“综合能力值”）内部只有一个孤零零的大数字 `0`，上下留存大面积纯黑空白区，缺乏核心图表主体与视觉焦点；
   - 底部仅有一句简单说明与细线条，无法承托“全景综合能力”的专业看板定位；
   - 右侧三大指标（近 7 天变化、距目标差距、预测分值）生硬地塞在单一暗色盒子里拉得过长，各指标之间空白空旷，缺乏呼吸感与独立质感；
2. **顶栏模块（`LearningAnalysisHeader`）层级扁平单调**：
   - 底部三大诊断依据元数据（报告刷新、数据依据、优先补强）缺乏专属图标底座与层次感，在深色下沉闷，在浅色下单薄；
   - 右上角刷新诊断按键仅为常规扁平按键，缺少全站一致的 44px/46px 黄金流光高级操作质感；
3. **缺少段位能力映射与两极对照**：
   - 用户无法从数字快速得知当前所处阶段（如处于探索起步、稳步进阶还是熟练掌握阶段），也无法直观一眼对比领跑项与短板项。

### 19.2 核心重塑方案与技术落地（Implementation Details）
1. **重构综合能力值核心仪表看板（Core Capability Ring & Level Dashboard）**：
   - **SVG 动态微光环形仪表盘（Circular Radial Progress Gauge）**：
     - 构建带圆弧半径为 56 的极客科技环形进度仪表（周长 351.86），配合 `stroke-dashoffset` 优雅平滑过渡；
     - 仪表盘采用天蓝、亮紫到翡翠绿的三段渐变流光，配备暗夜轨道圈与发光滤镜；环心呈现 `0~100` 大数值与 `/ 100` 标尺，彻底消除中间大片死黑留白；
   - **能力段位等级胶囊（Capability Tier Capsule）**：
     - 根据综合得分自适应映射段位（起步建档 L1、爬坡强化 L2、熟练进阶 L3、卓越精通 L4），配带电光微光徽标与状态评语；
   - **模块两极极性速览条（Polarity Indicator Chips）**：
     - 实时对比并高亮“优势领跑”与“优先聚焦”两大模块与当前数值；
   - **底部微光扫描进度条**：增加头部高亮光斑扫光（Bar Glow）与起步/进阶/卓越三档刻度标尺；
2. **重构三大次级指标为 Bento 独立微光晶体卡片（Bento Matrix Cards）**：
   - 彻底打破单一堆叠盒，解构为 3 张独立微光悬浮卡片；
   - 为近 7 天变化（翡翠绿）、目标差距（琥珀橙）、CET 预测分值（科技蓝）配置 **3D 晶体微光图标底座** 与专属状态小药丸（上升/平稳/回调、需攻坚/已达成、全真推算/等待样本）；
   - 卡片底部增加独立微型态势条（Micro Bar），悬停支持微浮动与边框呼吸响应；
3. **顶栏（`LearningAnalysisHeader`）升维为全真诊断控制台**：
   - 增加 **三柱元数据悬浮晶体舱（Trio Glass Capsules）**，为时间、依据、补强分别注入时钟、数据库、靶心等微光矢量底座；
   - 右上角操作按键升级为 **46px 黄金流光扫光按钮**，结合状态脉冲呼吸灯（`status-pulse-dot`），操作体验极致流畅；
4. **全端双模白金极光与深海星云高精度自适应**：
   - 浅色模式下，使用纯白白金高光卡片搭配玄青黑 `#0f172a` 与石板灰 `#475569`，对比度满足 WCAG AA；
   - 深色模式下，使用深海黑晶（`rgba(10, 18, 38, 0.85)`）与多重极光径向渐变，全面呈现前沿科技学习终端质感。

---

## 20. 错题本（Error Book）全景复盘工作台 UI/UX 视觉重塑与网格对称升维

### 20.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图分析，错题本（`/error-book`）页面存在以下关键视觉与交互硬伤：
1. **顶部 Hero 主舱（`.error-hero__copy`）死黑大留白**：
   - 左侧大卡片占据了超大宽度（1.5fr），但在标题下方存在大片毫无内容的纯深色死黑死寂区域，缺乏视觉抓手与关键复盘进展表达；
   - 右侧三大统计条（累计错题、高频模块、当前聚焦）单列生硬堆叠，卡片被拉扯过长，缺乏 Bento 晶体卡片的呼吸感；
2. **7 大模块导航条（`.module-strip`）严重缺角不对称**：
   - 原先采用 `repeat(4, minmax(0, 1fr))` 网格排布，7 个卡片导致第一排 4 个、第二排仅有 3 个，右下角长期空出一大块缺口，视觉失衡极其明显；
3. **空状态体验生硬匮乏（Empty State Void）**：
   - 当错题池为 0 或筛选未命中时，仅有一段简陋的单行文字，未给用户传达“错题已攻克清零”的积极正向激励，缺乏下一步行动跳板；
4. **操作按钮扁平平淡**：
   - 搜索与刷新按钮缺乏流光微光质感与高级科技交互反馈。

### 20.2 核心重塑方案与技术落地（Implementation Details）
1. **重构顶部全真复盘控制台（Hero Workbench Deck）**：
   - **掌控度态势小舱（Mastery Status & Action Deck）**：
     - 在左侧主卡片底部注入专属「掌控度态势条」，自动计算当前失分点消化状态：
       - 当总错题为 0 时：点亮翡翠绿发光奖杯（`Trophy`），高亮「错题池已完全清零 · 表现卓越」与「全科零缺陷」成就胶囊；
       - 当有待复盘错题时：点亮警示盾牌（`ShieldAlert`），指示高频失分攻坚重点；
     - 集成两枚 44px 高质感操作跳板：**「前往练习巩固」**（根据当前模块精准直达词汇/阅读/听力/口语/写作等）与 **「AI 诊断咨询」**（一键调起 AI 导师错因分析），彻底消灭死黑空洞；
   - **右侧升级为 3 大 Bento 独立微光晶体卡片**：
     - 赋予翡翠绿/珊瑚红（累计错题）、琥珀金（高频模块）、电光蓝紫（当前聚焦）**3D 专属矢量图标底座** 与实时状态小药丸（零积压/待消化、重点攻坚/状态平稳、N 题在池）；
     - 支持 tabular-nums 大数值、副标题说明与悬浮微浮动响应；
2. **7 大学科模块全尺寸黄金对称网格（Symmetric Module Matrix）**：
   - **彻底根除右下角缺口**：
     - 桌面宽屏（> 1120px）：采用 `repeat(7, minmax(0, 1fr))` 一体化 7 列等宽流式晶体网格，整齐划一、气势磅礴；
     - 中屏（768px ~ 1120px）：采用 3 列对称网格，将「全部错题」设为跨满 3 列的超级总览舱（`grid-column: 1 / -1`），其余 6 大学科排成 2 排 x 3 列，完全对称；
     - 移动端（< 768px）：全部错题跨满 2 列，其余 6 大学科排成 3 排 x 2 列，全尺寸终结缺角硬伤；
   - 每个模块卡片注入彩色霓虹底座、专属错题数微药丸（`module-count-tag`）与更新时间胶囊；
3. **零缺陷成就勋章舱（Zero-Defect Trophy Chamber）**：
   - 当错题池清零时，呈现极客发光奖杯浮动光环（`pulse-halo`）；
   - 展示「错题本空空如也 · 表现极其出色！」大标题与鼓励语；
   - 配备「前往练习刷题」与「刷新同步记录」双黄金操作键；
4. **全端双模白金极光与深海星云高精度自适应**：
   - 浅色模式下，卡片呈现温润白金晶体，文字锁定为玄青黑 `#0f172a` 与石板灰 `#475569`，各选项与答案对比满足 WCAG AA；
   - 深色模式下，采用深海 Obsidian 与电光极光，层次分明通透。

---

## 21. 答题历史（Answer History）全真作答档案室 UI/UX 视觉重塑与启航舱升维

### 21.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图分析，答题历史（`/history`，`AnswerHistoryView.vue` 与 `AnswerHistoryList.vue`）页面存在以下关键视觉与交互硬伤：
1. **顶部 Hero 主舱（`.history-hero__copy`）严重死黑大留白**：
   - 左侧大卡片占据了超大宽度（1.45fr），但卡片内部仅有标题与一段两行导语，下半部分留出大面积毫无信息的纯黑空洞，缺乏视觉重心与学习动量牵引；
   - 右侧 3 大统计卡片（模块覆盖、累计记录、当前聚焦）堆叠在单一框体内，缺乏独立 Bento 晶体卡片的呼吸感与发光科技质感；
2. **5 大模块导航条（`.module-strip`）排布单薄扁平**：
   - 模块卡片缺乏专属的彩色霓虹底座与立体微光边框，激活状态缺少呼吸光弧与高亮光轨，视觉层级不足；
3. **空状态体验匮乏冷清（Empty State Void）**：
   - 在首次使用或暂无作答记录时，仅展示简单的单行默认说明与朴素的 emoji 🗂️，既没有正向激励，也没有任何快速引导用户去练习的核心行动跳板（CTA）；
4. **操作台按钮与搜索框缺乏精致度**：
   - 刷新按钮与搜索框缺乏 44px 黄金触控标准与流光交互动效。

### 21.2 核心重塑方案与技术落地（Implementation Details）
1. **重构顶部全真作答档案控制台（Hero Workbench Deck）**：
   - **掌控度态势条与黄金行动跳板（Hero Mastery Strip & Dual CTA Deck）**：
     - 在左侧主舱下部注入专属态势控制条：
       - 当累计记录为 0 时：亮起靛蓝微光 `Sparkles`，展示「全新学习周期 · 等待开启首测」与「待沉淀作答」脉冲微徽章；
       - 当已有记录时：亮起翡翠绿 `CheckCircle2`，展示「已跨学科归档 N 次训练记录」与「记录持续更新」微徽章；
     - 深度集成两枚高质感黄金行动跳板：
       - 主跳板：**「进入「当前模块」练习」**（直接路由直达对应模块的做题页，带 `ArrowRight` 流光箭号）；
       - 次跳板：**「全科错题本」**（一键跳转 `/error-book`，实现“历史回看 - 错题复盘 - 针对性练习”三位一体学习闭环）；
   - **右侧升级为 3 大独立 Bento 微光晶体卡片**：
     - 模块覆盖（Cyan 蓝青发光底座，带“全覆盖就绪”晶体药丸）；
     - 累计记录（Emerald 翡翠绿/Indigo 靛蓝发光底座，带“稳步积累/准备启航”晶体药丸）；
     - 当前聚焦（Amber 琥珀金发光底座，带“N条可查”晶体药丸）；
     - 独立毛玻璃卡片，支持悬停微浮动与立体双主题自适应；
2. **5 大学科模块微光晶体导航条（Module Strip Upgrade）**：
   - 采用 5 列一体化等宽网格，支持悬停微浮动与彩色主题光晕；
   - 激活项注入顶部晶体微光光弧（`::before` 专属光轨）与彩色呼吸投影，模块计数药丸（`module-count-badge`）晶莹通透；
3. **零记录启航舱（Orbit Deck）空状态彻底升维**：
   - 抛弃朴素 emoji，打造双环同心旋转轨道微光舱（`orbit-badge-hub`），中心搭载微浮动的极客矢量徽章；
   - 智能适配两种空状态场景：
     - 本地搜索/筛选无匹配时：呈现 Cyan 蓝青搜索微光徽章与「清空筛选条件」快捷复原按钮；
     - 当前学科暂无记录时：呈现 Indigo 靛蓝历史时空罗盘徽章，并配备「立即开启「当前学科」」与「前往错题本」双向行动跳板；
4. **答题卡片与题目解析深度高对比度适配**：
   - 答题得分药丸（`record-score`）升级为翡翠绿（高分）、琥珀金（良好）、珊瑚红（需提升）专属晶体底座；
   - 展开题目后的选项（`option-item`）、用户答案、AI 评价与解析卡片，全面优化深浅双主题对比度（浅色玄青黑 `#0f172a`、深色极光白 `#f8fafc`），彻底杜绝白字隐形与反差不足。

---

## 22. 通知中心（Notifications Center）全真通讯档案室 UI/UX 视觉重塑与启航舱升维

### 22.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图分析，通知中心（`/notifications`，`NotificationsView.vue`）页面存在以下关键视觉与交互硬伤：
1. **顶部 Hero 主舱（`.notifications-hero`）严重死黑大留白**：
   - 左侧主舱占据超大宽度（1.45fr），但卡片内部仅有一行标题与简短说明，下半部分留出大面积毫无信息的纯深色死寂区域，缺乏视觉抓手；
   - 右侧仅有两项单薄数据（通知总数、未读消息），缺乏独立 Bento 晶体卡片质感、专属彩色底座与实时通信状态感知；
2. **中间工具栏筛选体验单调生硬**：
   - 原先仅靠两个普通的小下拉选择器，缺少一键直达的高频分类胶囊（Pills）与快捷清除机制，交互效率低；
3. **空状态体验极其寒酸冷清（Empty State Void）**：
   - 当无通知时，仅展示一个灰色小图标和“暂时还没有通知”单行小字，在宽屏上显得极度空旷冷清，且没有任何下一步行动引导；
4. **通知卡片层次感不足**：
   - 列表卡片缺乏不同通知类型（系统通知、系统公告、课务更新、安全告警）的专属发光色彩头像与未读高对比呼吸感。

### 22.2 核心重塑方案与技术落地（Implementation Details）
1. **重构顶部全真通信档案控制台（Hero Workbench Deck）**：
   - **掌控度态势条与黄金行动跳板（Hero Mastery Strip & Dual CTA Deck）**：
     - 在左侧主舱下部注入专属态势控制条：
       - 当未读为 0 时：亮起翡翠绿微光 `CheckCircle2`，展示「信道畅通 · 消息已全量查阅」与「全部已读」微徽章；
       - 当有未读时：亮起琥珀金微光 `Sparkles`，展示「发现 N 条重点动态待查收」与「待查收」微徽章；
     - 深度集成两枚高质感黄金行动跳板：
       - 主跳板：**「刷新最新消息」**（44px 渐变流光按钮，带旋转动画）；
       - 次跳板：**「全部设为已读」**（支持未读状态自适应感知）；
   - **右侧升级为 3 大独立 Bento 微光晶体卡片**：
     - 累计接收（Inbox 图标，Cyan 蓝青发光底座，带“历史归档”晶体药丸）；
     - 未读动态（BellDot 图标，Emerald 翡翠绿/Rose 珊瑚红发光底座，带“完全掌握/待查收”晶体药丸）；
     - 实时推送（Radio 图标，Indigo 靛蓝发光底座，带“通道畅通”晶体药丸）；
2. **筛选控制台（Notifications Toolbar）高效化升维**：
   - 引入横向快捷分类胶囊组（全部、系统通知、公告、更新、告警），带专属颜色指示光点；
   - 引入阅读状态切换组（全部、未读、已读）；
   - 提供清空筛选与轻量刷新按钮，移动端智能平滑降级至底部抽屉；
3. **零通知启航舱（Orbit Deck）空状态彻底升维**：
   - 打造双环同心旋转轨道微光舱（`orbit-badge-hub`），中心搭载微浮动的极客矢量徽章；
   - 智能适配两种空状态场景：
     - 本地搜索/筛选未命中时：呈现 Cyan 蓝青搜索微光徽章与「清空筛选条件」快捷复原按钮；
     - 收件箱清空无通知时：呈现 Indigo 靛蓝收件箱徽章，并配备「前往学习中心」、「查看每日任务」与「刷新消息」三大黄金行动跳板；
4. **通知卡片类型发光头像与双主题对比度适配**：
   - 为每条通知卡片配备专属类型头像（系统通知蓝紫、公告蓝青、更新翡翠绿、告警珊瑚红）；
   - 未读卡片具有专属极光呼吸边框与发光未读圆点；
   - 浅色白金极光与深色深海星云高精度自适应，对比度完全符合 WCAG AA。

---

## 23. 个人中心（Profile Center）学员档案主舱与双列设置工作台 UI/UX 视觉重塑

### 23.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图分析，个人中心（`/profile`，`ProfileView.vue`）页面存在以下关键视觉与交互硬伤：
1. **页面视口狭窄且死黑留白严重**：
   - 外部写死 `max-w-4xl`（896px），与整个系统统一的 `max-width: 1380px` 宽屏框架脱节，导致在桌面大屏上左右两侧露出极大的无效死黑空间；
2. **顶部用户信息区极度简陋单薄（Header Void）**：
   - 左侧仅有一个小头像和两行文字标签，右侧 60% 屏幕宽度完全空白，没有任何学员核心资产展示（如经验值积累、VIP 特权状态、当前备考方向）；
   - 缺乏快捷学习跳板与尊贵身份感；
3. **工作台表单单列排布局促空旷**：
   - 通用设置表单挤在 `max-w-md`（448px）的狭窄单列里，右边留下大面积空旷暗色死角；
   - 用户名只读项表现生硬，缺乏只读锁定的明确视觉线索；
   - “保存修改”按钮扁平不起眼，缺乏 44px 黄金流光触控标准。

### 23.2 核心重塑方案与技术落地（Implementation Details）
1. **全宽极客架构与学员全维档案主舱（Profile Hero Deck）**：
   - **视口拓宽**：全面升级为 `max-width: 1380px; margin: 0 auto;` 殿堂级工作台视口；
   - **尊贵极客头像舱**：
     - 88px 大尺寸发光渐变底座头像，周围带有极光霓虹微边框与悬停交互微镜头；
     - VIP 尊享会员专属金色王冠（`Crown`）微勋章角标；
   - **全维学员名片与个性签名**：
     - 展现昵称与用户名标签，聚合 VIP 尊享标签、经验值 XP 徽章、等级徽章与备考目标胶囊；
     - 优雅个性签名气泡（“这家伙很低调，还没有写下个性签名。”）；
   - **掌控度态势条与三大黄金行动跳板（Hero Mastery Strip & Triple CTA）**：
     - 左侧态势文案：展示账号 VIP 权限状态或标准学习者状态感知；
     - 深度集成三大高转化行动跳板：
       - 主跳板：**「前往学习中心」**（直达做题专项训练）；
       - 次跳板：**「会员权益」**（一键快速切换至 VIP 特权 Tab）；
       - 辅助跳板：**「我的成就」**（一键快速切换至成就勋章 Tab）；
   - **右侧升级为 3 大独立 Bento 微光晶体卡片**：
     - 经验值与成长（Zap 图标，Amber 琥珀金发光底座，显示 XP 与当前评级）；
     - 会员尊享身份（Crown/ShieldCheck 图标，Indigo 蓝紫发光底座，显示会员有效期限）；
     - 当前备考方向（Target 图标，Cyan 蓝青发光底座，锁定 CET-4/雅思 等专属题库）；
2. **通用设置双列响应式网格（Two-Column Settings Grid）**：
   - **左列【核心身份档案】**：
     - 用户名（`readonly-input-shell`：专属微锁卡片，带 Lock 图标与“系统核心标识不可更改”提示）；
     - 昵称（带 User 图标，44px 高质感玻璃输入框）；
     - 电子邮箱（带 Mail 图标，44px 高质感玻璃输入框）；
     - 目标备考类型（带 Target 图标，专属下拉选择器）；
   - **右列【学习偏好与个性表达】**：
     - 个人简介与座右铭（大面积多行优雅文本域，文字高对比）；
     - 科学备考小贴士（带 BookOpen 图标与备考说明卡片）；
     - 44px 黄金流光「保存设置修改」按钮（紫蓝渐变、悬停微投影、带 Save 图标）；
3. **双主题 WCAG AA 级高对比度**：
   - 浅色白金极光：温润白金晶体底（`rgba(255, 255, 255, 0.95)`），文字锁定为玄青黑 `#0f172a` 与石板灰 `#475569`；
   - 深色深海星云：深邃 Obsidian（`rgba(15, 23, 42, 0.72)`），文字锁定为极光白 `#f8fafc`。

---

## 24. 系统设置（System Settings）中枢控制台 UI/UX 视觉重塑

### 24.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图（`media_1791649057487_9502589b.png`）分析，系统设置（`/settings`，`SettingsView.vue`）页面存在以下关键视觉与交互硬伤：
1. **视口狭窄与大面积死黑留白（Viewport Void）**：
   - 外部写死 `max-width: 1000px; margin: 40px auto;`，在大屏显示器下右侧留出超过 50% 的大片死黑空洞，与全局其他页面 1380px 顶级视口严重脱节；
2. **顶部 Header 极其简陋单薄（Header Void）**：
   - 仅有朴素的两行文字（“系统设置”与副标题），缺乏极客中枢 Hero 控制台、运行态势感知与 Bento 数据指示卡片；
3. **左侧导航卡片排布单调死板**：
   - 仅为 240px 纯黑背景和灰色小字，缺乏专属微光发光底座、双行说明文字与立体呼吸光轨；退出登录项缺乏防误触保护；
4. **右侧设置面板缺乏层次与卡片化设计**：
   - 设置项挤在纯黑列表内，图标与说明缺失；
   - 语言选择器、音效开关与缓存清理混杂在一起，缺乏直观的分区视觉指引；
   - 账号信息与个人中心（Profile）割裂，缺乏跳板联动；
   - 浅色模式下对比度不足，深色模式下死黑塑料感严重。

### 24.2 核心重塑方案与技术落地（Implementation Details）
1. **全宽极客架构与系统设置 Hero 中枢控制舱（Settings Hero Deck）**：
   - **视口拓宽**：全面升级为 `max-width: 1380px; margin: 0 auto; padding: 24px 20px 48px;` 顶级工作台容器；
   - **Hero 态势舱（Left Deck）**：
     - **Topline 态势条**：Kicker 胶囊（`Sparkles` + “系统设置与中枢控制台”），搭配脉冲绿光点态势胶囊（“客户端运行就绪 · 存储健康”）；
     - **渐变科技大标题**：钛金白/深邃 Slate 双主题高对比渐变大标题；
     - **导语说明**：“全维调控界面语言、音频朗读引擎、本地离线缓存、账户安全凭据及多端推送通道”；
     - **快捷态势行动条（Quick Action Strip）**：
       - 主跳板：**「前往个人中心档案」**（一键直达 `/profile` 管理头像与专属资料）；
       - 次跳板：**「一键清理本地缓存」**（带 Popconfirm 二次防误触弹窗与即时反馈）；
       - 辅助徽章：**「客户端 v2.4.0 · 运行平稳」**；
   - **右侧 3 大独立 Bento 微光晶体卡片（Bento Grid）**：
     - **界面语言环境**（`Globe` 图标，Cyan 蓝青发光底座，显示当前生效语言与“实时生效”徽章）；
     - **音频朗读引擎**（`Volume2` 图标，Emerald 翡翠绿发光底座，感知自动朗读与音效状态，标注“WebSpeech”引擎）；
     - **消息推送通道**（`Bell` 图标，Indigo 靛蓝发光底座，动态汇总 3 大提醒通道激活情况，标注“通道畅通”）；
2. **左侧立体微光导航侧栏（Settings Navigation Deck）**：
   - 拓宽至 290px，双层渐变毛玻璃底板与纳米微边框；
   - 顶部增加大写分类标签 `PREFERENCE NAVIGATION`；
   - 3 大导航项升级为立体微光卡片：
     - **通用设置**（`Settings` 图标，Cyan 蓝青底座，带“语言 · 音频 · 缓存管理”说明）；
     - **账户安全**（`Shield` 图标，Indigo 靛蓝底座，带“用户名 · 邮箱 · 密码防护”说明）；
     - **通知提醒**（`Bell` 图标，Amber 琥珀金底座，带“邮件推送 · 备考打卡”说明）；
     - 激活态配备右侧 18px 蓝紫流光指示条（Glow Indicator）；
   - 底部危险/存储操作区：
     - 琥珀色微光「清除本地临时缓存」胶囊（Popconfirm 确认）；
     - 柔红警示光「退出系统登录」胶囊（Popconfirm 确认）；
3. **右侧主设置工作台卡片化（Settings Content Deck）**：
   - **通用设置（General）**：
     - 界面语言卡片（`Globe` 蓝青图标 + 标题说明 + 下拉选择器）；
     - 自动朗读卡片（`Volume2` 翡翠绿图标 + 标题说明 + 精致 Switch 开关）；
     - 音效反馈卡片（`Sparkles` 靛蓝图标 + 标题说明 + 精致 Switch 开关）；
     - 离线缓存卡片（`Trash2` 琥珀色图标 + 标题说明 + 预警微光按钮）；
     - 44px 黄金流光「保存更改」保存按钮；
   - **账户安全（Account）**：
     - 学员身份预览徽章舱（72px 发光大头像 + 用户名 + VIP 金色徽章 + 邮箱 + 直达个人中心跳板）；
     - 基础身份信息（用户名输入框 + 邮箱只读微锁卡片）；
     - 安全密码修改（当前密码 + 新密码 + 密保提示卡）；
     - 44px 黄金流光「保存密码修改」按钮；
   - **通知提醒（Notifications）**：
     - 重要安全与更新邮件、每日备考打卡提醒、学情深度分析周报 3 大独立设置单元卡；
     - 44px 黄金流光「保存更改」按钮；
4. **全维深浅双主题高对比度自适应（WCAG AA）**：
   - 针对 `html:not(.dark)` 深度调校温润白金晶体背景（`rgba(255, 255, 255, 0.95)`）与玄青高对比文本（`#0f172a` / `#475569`），杜绝白字隐形；
   - 针对深色模式配置通透 Obsidian（`rgba(15, 23, 42, 0.72)`）与亮白高光（`#f8fafc` / `#94a3b8`）；
   - 全响应式支持（桌面宽屏 1380px、平板 1100px 折叠导航、移动端 768px 单列触控适配）。

---

## 25. 系统首页门户（Landing Page & Home Hub）UI/UX 视觉与科技感重塑

### 25.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图（`media_1791650617377_778aff93.png`）分析，系统首页（`/`，`LandingPage.vue`）存在以下重大视觉与工程硬伤：
1. **Hero 双列布局语法失效导致单列错位（Responsive Grid Collapse Bug）**：
   - 原组件采用 Naive UI `cols="1 800:2"` 配合 `responsive="screen"`，因未能识别非标准断点导致解析回退至 `cols="1"`；
   - 左侧 Hero 文字被迫单独占据首行，右侧视觉卡片掉入第二行左下角并被截断，在 1080P/2K 大屏上右侧露出了高达 70% 的大面积死黑空洞；
2. **Hero 视觉内容简陋单薄缺乏科技信服力**：
   - 右侧仅有一个 340px 的静态纯黑卡片，缺乏未来感 AI SaaS（如 OpenAI, Linear）的科技质感、动态数据感知与学习驾驶舱交互氛围；
3. **数据指标栏排布暗淡拥挤**：
   - 原 `hero-stats` 为暗淡小方块，数值与说明文字拥挤在单列下，缺乏独立彩色发光底座与增长趋势引导；
4. **功能板块缺失与内容信息架构单薄**：
   - 原页面在 Hero 之后仅有高校文字和 3 条评价，缺少系统四大核心引擎（词汇星系、全真模考、AI 专属导师、学情战力看板）的深度展现；
5. **双主题对比度与视口尺度脱节**：
   - 浅色模式下缺乏精准层级变量定义，深色模式下死黑塑料感严重，最大宽度未与全站 1380px 顶级视口对齐。

### 25.2 核心重塑方案与技术落地（Implementation Details）
1. **彻底修复 Hero 双列网格并升级为 1380px 顶级视口**：
   - 采用标准 CSS Grid（`grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 56px;`），彻底解决断点失效导致的单列掉落问题；
   - 容器升级为 `max-width: 1380px; width: 100%; margin: 0 auto;` 殿堂级工作台视口，大屏下左右黄金对称充盈，移动端智能平滑降级；
2. **打造新一代 AI 神经学习工作台（AI Neural Learning Cockpit）**：
   - **主控制舱卡片（Main Glass Deck）**：
     - **顶栏状态态势**：`Brain` 神经元微标 + `NEURAL ENGINE v2.4` + 动态翡翠绿脉冲呼吸灯（`Active · Realtime`）+ `DeepReasoning Active` 晶体标签；
     - **动态弱项扫描条**：展示“虚拟语气 42% 重点薄弱（珊瑚红）”、“长难句 78% 稳步提升（科技蓝）”、“学术词汇 89% 接近母语（翡翠绿）”三大专项；
     - **AI 动态突破建议胶囊**：`Sparkles` 徽标提示盲点与 10 题真题专属强化包，配备「立即突破」微交互跳板；
   - **3 大立体悬浮微光卫星卡片（Orbit Floating Satellites）**：
     - **卫星卡 1（右上浮动）**：口语母语级评测（`Volume2` 翡翠绿底座、动态 5 频段跳动声波条、`98.5分` 卓越徽章）；
     - **卫星卡 2（左下浮动）**：连续学习打卡（`Flame` 琥珀色底座、`+240 XP` 徽章、今日突破 45 核心词与 94% 留存率）；
     - **卫星卡 3（右下浮动）**：AI 深度写作润色（`CheckCircle2` 蓝青底座、实时高亮 Diff 对比标红删除与标绿高级母语表达）；
3. **Hero 左侧文案与数据指标栏（Hero Left Deck）升维**：
   - **Kicker 胶囊**：`v2.4.0 智能升级 · 全真多学科题库与自适应学习引擎`（带脉冲绿点与毛玻璃边框）；
   - **科技张力大标题**：双主题高对比钛金大标题搭配多段极光蓝紫流光渐变（`让 AI 重新定义 你的英语学习`）；
   - **44px 黄金流光按钮组**：渐变流光「开始免费体验 / 进入学习中心」（带 `Zap` 与平滑位移箭头）+ 毛玻璃「观看 AI 演示」按键；
   - **3 栏独立发光指标微卡**：10w+ 学员信赖（Users/Cyan）、95% 成绩突破率（TrendingUp/Emerald）、4.9 极高好评（Star/Amber），带趋势标签；
4. **全球高校背书与四大核心学习引擎矩阵（Core Architecture Grid）**：
   - 高校背书升级为微光粒子胶囊（Harvard, MIT, Stanford, Tsinghua, Peking Univ., Yale, Oxford）；
   - 增加四大核心引擎全景矩阵：
     - **智能词汇星系**（艾宾浩斯抗遗忘曲线、真题语境搭配、智能派生）；
     - **全真模考演练**（大纲还原、倒计时实战、秒级判分）；
     - **AI 专属导师 1V1**（母语深度润色、逻辑思维链追问、错因深度剖析）；
     - **学情全维战力看板**（能力雷达图透视、错题盲点穿透、科学提分预测）；
5. **学员真实口碑与沉浸式极光 CTA 横幅**：
   - 学员卡片升级为晶体毛玻璃面板，展示真实考试提分勋章与金色五星评分；
   - 底部 CTA 采用宇宙极光微光流体横幅，附带“7 天全功能免费体验 · 多端数据实时同步”安全保障承诺；
6. **全维双主题与 WCAG AA 级高对比度适配**：
   - 浅色白金极光：背景配置浅微蓝与柔和渐变，主文字锁定为玄青黑 `#0f172a`，副标题为石板灰 `#475569`，**彻底杜绝灰白字隐形**；
   - 深色深海星云：深邃 Obsidian（`#070a12`），配合柔和径向极光晕与纳米通透毛玻璃；
   - 移动端 768px / 480px 触控响应式与卫星卡片自适应堆叠支持。

### 25.3 绝对安全流式三层协同架构（Three-Tier Zero-Collision Flow）
针对绝对定位浮动卡片在不同屏幕分辨率与缩放比例下可能发生“压住顶栏 NEURAL ENGINE 标题”、“压住右上角标签”以及“覆盖底栏建议胶囊与立即突破按钮”的硬伤痛点，本次进行了从底层布局哲学上的彻底革新：
1. **彻底摒弃脆弱的绝对定位覆盖（No Fragile Absolute Overlap）**：
   - 彻底移除 `position: absolute` 导致的不可控坐标入侵，升级为标准的弹性文档流（Flexbox Flow）纵深架构；
2. **三层垂直安全隔离设计（Three-Tier Modular Orbit Deck）**：
   - **顶层双模态协同轨道（Top Orbit Deck）**：
     - 并排展示【连续学习打卡 21 天 · +240 XP】（`Flame`，琥珀金）与【口语母语级评测 98.5分】（`Volume2`，翡翠绿）；
     - 位于主控制台正上方，垂直向下预留 `14px` 物理安全间距，**在空间几何上 100% 不可能碰到主卡片顶栏与标题**；
   - **中层核心神经网络控制舱（Center Core Cockpit）**：
     - 顶栏、AI 实时弱项诊断进度条（虚拟语气 42%、长难句 78%、学术词汇 89%）、底部「针对性强化突破建议胶囊」与「立即突破」按钮完完整整通透展现，**无任何外界元素侵入与视觉遮挡**；
   - **底层写作成果协同轨道（Bottom Orbit Deck）**：
     - 展示【AI 深度写作润色 · Native Diff 对比】（`CheckCircle2`，蓝青高光），全宽展开；
     - 位于主控制台正下方，垂直向上预留 `14px` 物理安全间距，**在空间几何上 100% 不可能碰到主卡片底部的建议胶囊与按钮**；
3. **全分辨率与多端 DPI 零重叠保证**：
   - 无论在 1080P、2K、4K、Windows 125%/150% 缩放还是移动端平板下，各卡片物理隔离自洽，杜绝一切文字压盖与操作遮挡。

---

## 26. 功能展示页面（Features Page & Showcase Hub）UI/UX 视觉重塑

### 26.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图（`media_1791652019351_92c57e6b.png`）分析，功能展示页面（`/features`，`FeaturesPage.vue`）存在以下重大视觉与工程硬伤：
1. **视口狭窄与大面积死黑留白（Viewport Constraint & Visual Emptiness）**：
   - 原页面样式写死 `max-width: 1200px`，在 1080P/2K 大屏视口下两侧留白过大，中央拥挤，缺乏现代 AI 旗舰产品的开阔展厅气度；
2. **缺少 Hero 展厅头部与快速锚点导航（Missing Showcase Hero & Navigation）**：
   - 用户进入页面后直接掉入局部功能卡片，缺乏统一的系统架构全景指引，也没有支持平滑滚动定位的特性导航胶囊群；
3. **交互演练舱右侧空洞塑料感（Simulated Card Emptiness）**：
   - 原“AI 实时能力评估”演示卡片在扫描阶段仅有一个单调的居中旋转 Loading 圈，下方 80% 区域全黑无内容，如同半成品界面，缺乏可信的科技动效与多维数据感知；
4. **四大核心王牌功能残缺（Incomplete Core Feature Set）**：
   - 原页面仅列出“智能推荐”、“动态路径”、“数据分析”三个板块，严重缺失了作为系统最核心亮点与技术壁垒的“母语级 AI 导师 1V1 深度交互与学术润色”引擎；
5. **图表与拓扑组件缺乏真实感与沉浸感**：
   - 数据分析板块仅有简单的几个数字，学习路径缺乏直观的拓扑推导与连线动效，缺乏对现代教育科技（EdTech）产品说服力的支撑；
6. **双主题对比度与视觉一致性欠缺**：
   - 未完全接入全站 CSS 变量系统，浅色模式下边框与文字层次不清晰，深色模式下缺乏晶体毛玻璃的深邃光影。

### 26.2 核心重塑方案与技术落地（Implementation Details）
1. **拓宽至 1380px 顶级视口与打造展厅 Hero 看板**：
   - 页面容器升级为 `max-width: 1380px; margin: 0 auto; padding: 0 clamp(16px, 3.5vw, 40px);`；
   - 顶部注入 `NEXT-GEN ARCHITECTURE · 全真多学科自适应引擎` Kicker 脉冲胶囊；
   - 采用钛金与极光渐变大标题（`为什么选择 LearnSphere? · 解构驱动提分的四大王牌引擎`）与副标题；
   - 配置 4 大特性平滑滚动锚点胶囊群（智能推荐、自适应路径、数据看板、AI 导师 1V1），支持点击精准定位视口；
2. **构建四大王牌引擎交错交互演练舱（Four Flagship Feature Decks）**：
   - **王牌引擎 1: AI 智能推荐与认知诊断引擎（Cognitive Diagnosis & Adaptive Recommendations）**：
     - 左侧特性解析：知识图谱弱项穿透、艾宾浩斯记忆追踪、毫秒级动态调度等 3 项高光点；
     - 右侧可操作三阶段演练舱：
       - `扫描中`：动态雷达扫掠网格、旋转粒子光环，辅以“多维认知矩阵分析中”、“IR 模型参数收敛”、“实时错误率 23.4%”三大高科技数据流芯片；
       - `诊断完成`：多维弱项穿透清单，精准标出长难句倒装（42% 脆弱）与虚拟语气（38% 待强化）；
       - `推荐练习`：生成专属提分题包，配备一键直达学习中心的微跳板；
       - 底部提供 44px 黄金流光「重新模拟 AI 评估」实时演算按钮；
   - **王牌引擎 2: 全真动态自适应学习路径（Dynamic Adaptive Learning Pipeline）**：
     - 反向交错排布，左侧部署动态拓扑演算台：
       - 四大核心节点：`能力测评（Baseline）` ➔ `归因分析（Diagnostics）` ➔ `专项干预（Intervention）` ➔ `能力突破（Mastery）`；
       - 节点间配备动态高光能量传输管道与进度百分比，悬浮态展现微卡高光；
     - 右侧详述路径动态重塑能力：实时动态重规划、分级梯度爬坡、目标导向提分；
   - **王牌引擎 3: 多维学情战力数据看板（Multidimensional Analytics Dashboard）**：
     - 右侧部署高保真全景数据舱：
       - 双核心指标微卡：累计专注学习 42.5 小时（周环比 +18%）、综合平均正确率 88.6%（已超越 92% 同类考生）；
       - 周度学时动态渐变柱状图（周一至周日柱状梯度对比）；
       - 答题正确率贝塞尔平滑趋势折线图（SVG 矢量平滑曲线配发光数据节点）；
     - 左侧阐述“全景能力透视”、“盲点溯源归因”与“科学提分预测”；
   - **王牌引擎 4: 母语级 AI 导师 1V1 深度交互（Native-Level AI Tutor & Academic Reasoning）**：
     - 补齐核心王牌板块，左侧全真还原 AI 对话交互舱：
       - 用户提出长难句学术化润色求助；
       - AI 导师展示三层深度拆解：思维链推导（Chain-of-Thought）、中式初阶 vs 母语学术 Diff 对比标红删除与标绿高级母语表达、核心考点（分词作伴随状语）提炼；
     - 右侧详解学术逻辑链追问、母语地道表达纠偏、全天候随时答疑能力；
3. **全维技术底座矩阵与宇宙极光底部 CTA（Tech Foundations & Aurora CTA）**：
   - 底座矩阵展示：毫秒级知识图谱响应（50ms）、教育大模型专属微调（Edu-LLM）、端到端全链路加密保障（Privacy）；
   - 底部 CTA 采用宇宙极光沉浸式横幅，附带“7 天全功能免费体验 · 多端数据无缝同步”承诺保障；
4. **全维深浅双主题与 WCAG AA 级高对比度自适应**：
   - 浅色白金极光（`html:not(.dark)`）：卡片晶体白色背景（`rgba(255, 255, 255, 0.95)`），文本精准锁定为玄青黑 `#0f172a` 与高对比灰 `#475569`，**严禁白字隐形**；
   - 深色深海星云（`.dark`）：黑曜石通透微晶面板（`rgba(15, 23, 42, 0.72)`），配备极光蓝紫流光边框；
   - 响应式完美适配：1100px 自动降级为单列纵向排列，768px / 480px 移动端触控友好布局。

---

## 27. 主流考试全真模考专区（Exams Page & Simulation Hub）UI/UX 视觉与科技感重塑

### 27.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图（`media_1791652320314_9e18eaa1.png`）分析，主流考试页面（`/exams`，`ExamsPage.vue`）存在以下重大视觉与工程硬伤：
1. **页面极度空洞与大面积死黑留白（Extreme Visual Emptiness）**：
   - 在 1080P/2K 大屏视口下，整屏仅有标题、2个切换按钮、1条细线和4个极简小卡片，四处皆是死黑，缺乏严肃权威考试 SaaS 的沉浸感与视觉充盈度，像未完工的原型草稿；
2. **考试卡片信息维度严重缺失（Shallow Card Information Architecture）**：
   - 原卡片仅有一个 Emoji、名称、代号与简陋的“目标 425+”，缺失真题收录套数、考纲词汇量、参与模考人次、历史平均提分幅度、高频攻坚专项标签与进入模考的明确操作入口；
3. **特性条缺乏现代科技质感（Flat & Monotonous Pillar Banner）**：
   - 原中间的真题还原、考情分析、智能批改三项仅平铺在一条灰线条两边，缺乏微光粒子、发光晶体底座与数据感知；
4. **核心功能演示与说服力展台缺失（Missing Live Cockpit & Social Proof）**：
   - 缺少 1:1 全真机考实战演练舱，用户无法直观感受 LearnSphere 相比传统题库软件的降维优势；缺少科学备考闭环工作流与真实学霸提分战报；
5. **双主题对比度与视口未统一（Contrast & Viewport Issues）**：
   - 浅色模式下灰白对比度低，深色模式死黑塑料感严重，未对齐 1380px 顶级视口规范。

### 27.2 核心重塑方案与技术落地（Implementation Details）
1. **1380px 顶级视口与 Hero 展厅看板（Hero Showcase Hub & Category Tabs）**：
   - 页面容器升级为 `max-width: 1380px; margin: 0 auto; padding: 0 clamp(16px, 3.5vw, 40px);`；
   - 顶部注入 `OFFICIAL EXAM SUITE · 2026 最新大纲深度适配` Kicker 脉冲胶囊；
   - 采用钛金与极光渐变大标题（`全方位覆盖主流考试 · 1:1 还原真实模考机房`）与说明文案；
   - 拓展为三大分类 Tabs 切换胶囊群：`国内主流考试 (4门全真库)`、`国际出国考试 (4门对标库)`、`职场与专业拓展 (4门备考库)`，带数量徽标与流光高亮；
2. **三大核心模考支柱微晶卡片（Core Examination Pillars）**：
   - **1:1 全真机考环境还原（99.8% 仿真度）**：大纲标准时钟倒计时、试卷模块跳转锁、双声道听力原声与标准答题卡交互；
   - **大数据考情图谱与预测（近 10 年 120+ 套真题）**：大数据追踪高频词汇分布、语法题眼分布与命题人命制陷阱；
   - **母语级 AI 主观题即时精批（秒级出分 · 逐句精修）**：写作与翻译秒级全维度评分，标记中式表达缺陷并推荐地道母语替换；
3. **考试卡片全要素旗舰矩阵（Rich Exam Decks）**：
   - 涵盖 CET-4/6、考研英语、TEM-4/8、IELTS、TOEFL、GRE、DET、BEC、CATTI、TOEIC 12 门主流考试；
   - 每个卡片集成：专属发光品牌渐变徽标、最新大纲同步标签、目标分数指示器、三大关键量化指标（历年真题套数、考纲核心词、平均提分幅度）、高频攻坚专项标签流、44px 黄金流光「进入全真模考」直达按钮与「专项刷题」辅助按钮；
4. **全真机考 1:1 沉浸式实战演算舱（Live Simulation Preview Cockpit）**：
   - **考场顶栏模拟**：展示真实考试倒计时（`01:38:02` 脉冲提醒）、科目卷次与正在测试状态指示灯；
   - **左侧 30 题答题卡矩阵**：可视化已答（绿色）、当前题（极光蓝高亮）、已标记（琥珀金）以及答题进度百分比；
   - **中间真题阅读实战区**：长难句学术语篇、高亮重点句，支持 4 个选项（A/B/C/D）单选交互，选定后即时展开「AI 实时考点剖析与题眼定位」抽屉；
   - **右侧 AI 综合战力态势舱**：预测模考总分（596 分，超过全站 92.4% 考生）、四大维度能力进度条（听力辨音 94%、长难句穿透 88%、阅读定位 92%、写作逻辑 86%）；
5. **4 步科学模考提分闭环（4-Step Mastery Pipeline）**：
   - `01 全真摸底诊断` ➔ `02 AI 靶向专项专攻` ➔ `03 1:1 限时高压模考` ➔ `04 多维归因与提分突破`；
6. **备考学霸提分荣誉榜与宇宙极光模考 CTA（High-Score Wall & Launch Banner）**：
   - 3 位名校学员真实备考反馈与提分战报（CET-6 +184分、考研英语 +27分、雅思 +2.0Band）；
   - 底部宇宙极光模考动员横幅，提供“近 10 年权威真题全量收录”、“AI 主观题秒级多维评分”、“错题本无缝自动归因”三重保障；
7. **全维深浅双主题与 WCAG AA 级高对比度自适应**：
   - 浅色白金极光（`html:not(.dark)`）：卡片采用温润白金晶体（`rgba(255, 255, 255, 0.94)`），主文本 `#0f172a`，副文本 `#475569`，**严禁灰白字隐形**；
   - 深色深海星云（`.dark`）：黑曜石通透微晶面板（`rgba(15, 23, 42, 0.72)`），配备极光蓝紫流光边框；
   - 响应式多断点适配：1100px 考场三栏与卡片自适应折叠，768px / 480px 移动端单列触控优化。

---

## 28. 巅峰学习功勋榜（Leaderboard View & Champion Hub）UI/UX 视觉与竞技体验重塑

### 28.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图（`media_1791652334548_afa1f12e.png`）分析，排行榜页面（`/leaderboard`，`LeaderboardView.vue`）存在以下重大视觉与工程硬伤：
1. **领奖台条件隐藏导致的极端死黑空洞（Podium Vanishing Bug）**：
   - 原组件采用硬编码判断 `v-if="!loading && leaderboard.length >= 3"`。在冷启动、单人测试或学员不足 3 人时，领奖台直接完全消失，整屏只剩下 3 个黑框和 1 行单调表格，导致 80% 的大面积死黑旷野，用户体验极度荒凉；
2. **概览指标卡粗糙暗淡（Dull Stats Boxes）**：
   - 累计学员、今日活跃、平均打卡 3 个小方块在数据量较少时显示为极其生硬的“1, 0, 0”，缺乏彩色发光渐变底座、增长趋势与状态说明；
3. **榜单维度与竞技互动系统缺失（Missing Gamification & Interaction）**：
   - 原 Tab 无法根据不同维度进行真实排序；
   - 缺乏学员间的社交互动（如点赞助威、加油打气）；
   - 缺少赛季结算机制与奖励池公示（每周日 24:00 结算，TOP 3 颁发 VIP 特权等）；
4. **学术成长段位体系单薄（Shallow League Tier System）**：
   - 仅显示一个简单的“稳步上升”标签，学员无法获知自己处于什么段位，缺少目标感与成长驱动力；
5. **视口狭窄与双主题对比度脱节**：
   - 原容器限定在 1100px，未对齐全站 1380px 顶级视口，浅色模式容易对比度不足，深色模式缺乏光影层次。

### 28.2 核心重塑方案与技术落地（Implementation Details）
1. **1380px 顶级视口与 Hero 展厅看板（Hero Showcase Hub）**：
   - 升级为 `max-width: 1380px; margin: 0 auto; padding: 0 clamp(16px, 3.5vw, 40px);`；
   - 顶栏部署高质感同步倒计时微胶囊（下次自动同步倒计时与最后更新时刻）；
   - 钛金与极光渐变大标题（`巅峰学习功勋榜`）与励志标语；
   - 三大核心战力概览微晶卡片（全站学员入驻、今日打卡先锋、平均连续打卡），带多段渐变发光底座与真实同步标签；
2. **个人位次浮动透视舱（Personal Standing Deck）**：
   - 未登录学员：极光紫微晶卡，提示“开启你的巅峰学习排位之旅”，配备「立即加入挑战」黄金流光按钮；
   - 已登录学员：展示“我的当前排位 #X”、头像昵称、个性签名、连续自律天数与「开启今日刷题冲榜」直达按钮；
3. **智能自适应荣誉殿堂领奖台（Smart Adaptive Top 3 Podium）**：
   - 彻底修复 `length >= 3` 导致的隐形 Bug：无论当前有几名学员，领奖台始终以高保真姿态巍峨屹立；
   - **黄金王座（Champion）**：配备专属桂冠微动效、金色流光光环、发光头像、领跑天数与荣誉积分；
   - **银铜席位（Runner-up & Third Place）**：若有对应学员则展现其风采；若暂时不足则呈现高质感“虚位以待 · 冲榜争夺中”卡片，极大激发用户的打卡好胜心；
   - 公示“2026 S1 赛季 · 每周巅峰荣誉殿堂（每周日 24:00 结算）”与榜首 7 天 VIP 特权奖励；
4. **多维榜单控制条与学员交互大名单（Multi-Dimensional Roster & Kudos）**：
   - 3 大榜单维度即时切换：`🏆 全站功勋总榜`（按积分优先）、`🔥 连续打卡榜`（按自律天数优先）、`⚡ 累计天数黑马`（按总天数优先）；
   - 搜索框支持学员昵称与签名的即时过滤；
   - 学员表格升级：金银铜前三专属勋章、PRO 高阶学员徽标、连续打卡火焰计数、累计天数指示、学力段位发光标签；
   - **新增为 Ta 助威点赞（Kudos）微交互**：支持本地即时 +1 计数与爱心高亮动画反馈；
5. **学力段位阶梯体系路线图（Learner League Tiers Roadmap）**：
   - 展示从青铜·笃行者（0-100 XP）到巅峰·宗师霸主（2,000+ XP）五大进阶卡片，明确各段位的晋级条件与荣耀特权；
6. **全维深浅双主题与 WCAG AA 级高对比度自适应**：
   - 浅色白金极光（`html:not(.dark)`）：卡片晶体微白背景（`rgba(255, 255, 255, 0.94)`），文本锁定为玄青黑 `#0f172a` 与高对比灰 `#475569`，**严禁灰白字隐形**；
   - 深色深海星云（`.dark`）：黑曜石通透微晶面板（`rgba(15, 23, 42, 0.72)`），配备极光蓝紫流光边框；
   - 响应式多断点适配：768px 领奖台与卡片平滑折叠，移动端单列触控优化。

### 27.3 考试卡片高度剪切与自适应修复（Exam Card Cutoff Fix）
针对卡片底部操作按钮（“进入全真模考”与“专项刷题”）在特定分辨率下出现被卡片下边缘截断腰斩的硬伤，实施了以下彻底修复：
1. **解除高度循环死锁（Break Height Dependency Deadlock）**：
   - 移除导致 flex 内部折叠高度测量的 `overflow: hidden` 与 `card-inner-body` 的 `height: 100%`，改用标准的 `flex: 1 1 auto; box-sizing: border-box;`；
2. **精细化间距分配与防挤压（Spacing Optimization）**：
   - 移除 `exam-tags-flow` 的 `flex-grow: 1`，避免标签换行强行吃满高度挤压底栏；
   - 将卡片底部内边距由 20px 增加至 `24px` 物理安全边界，将 `card-actions-dock` 的 `margin-top: auto` 配合显式的 `padding-top: 6px`，确保按钮完整通透展现，彻底根除截断。

---

## 29. 简单透明价格方案页面（Pricing Page & Plan Matrix）UI/UX 视觉与商业信赖重塑

### 29.1 现状诊断与视觉痛点（UI/UX Diagnosis）
根据最新界面截图（`media_1791654701513_966a19c9.png`）分析，价格方案页面（`/pricing`，`PricingPage.vue`）存在以下重大视觉与工程硬伤：
1. **页面极度单薄与大面积旷野死黑（Extreme Visual Emptiness）**：
   - 在 1080P/2K 大屏视口下，整屏仅有标题和 4 个死黑小方块卡片，上下左右空出高达 50% 的死黑背景，极其空旷简陋，缺乏现代 AI 旗舰 SaaS（如 Cursor、Linear、ChatGPT Plus）的商业信服力与产品厚重感；
2. **缺少计费周期切换开关（Missing Billing Switcher）**：
   - 无法在“月付”与“年付”之间切换，无法向用户直观传达“年付立省 30% / 享赠送 2 个月”的省钱利益点；
3. **权益列表缺乏全维横向对比矩阵（Missing Feature Comparison Matrix）**：
   - 原卡片仅罗列了几行基础文字加小勾选框，用户无法清晰横向对比各版本在 AI 能量配额、全真模考套数、AI 导师追问深度、主观题逐句批改与专属客服上的精确支持差异；
4. **缺少平台信赖背书与支付安全保障（Missing Trust & Security Guarantees）**：
   - 缺少“7 天无理由全额退款”、“银行级 SSL 加密”、“秒级权限自动生效”等关键转化保障；
5. **缺少常见问题解答 FAQ 手风琴（Missing FAQ Accordion）**：
   - 备考学员关心的 AI 能量何时重置、中途升级补差价规则、多设备跨端同步、增值税电子发票申请等高频疑惑无处寻觅；
6. **视口狭窄与双主题对比度脱节**：
   - 原页面样式写死 1200px，未对齐全站 1380px 顶级视口，浅色模式容易对比度不足，深色模式缺乏微晶毛玻璃层次。

### 29.2 核心重塑方案与技术落地（Implementation Details）
1. **1380px 顶级视口与 Hero 看板（Hero Showcase Hub & Billing Switcher）**：
   - 容器升级为 `max-width: 1380px; margin: 0 auto; padding: 0 clamp(16px, 3.5vw, 40px);`；
   - 顶部注入 `TRANSPARENT & FLEXIBLE · 灵活透明的会员计划` 翡翠呼吸脉冲胶囊；
   - 采用钛金与极光蓝紫流光大标题（`简单透明的价格方案`）与副标题；
   - 配置高质感计费周期切换胶囊（按月付费 vs 按年付费，带“立省 30% · 加赠2个月”绿色高光勋章）；
2. **四大定价套餐卡片矩阵（Pricing Tier Decks）**：
   - 基础版（免费 · 永久）、月度会员（¥10/月 · 50点）、季度会员（¥25/季 · 100点 · 最受欢迎超值精选）、年度会员（¥88/年 · 200点 · 最佳性价比）；
   - 动态支持从 `systemStore.configs` 读取后台维护的价格（保持业务逻辑 100% 兼容）；
   - 专属发光晶体图标底座、每日能量值胶囊、绿色 Check 发光列表、44px 黄金订阅按钮；
3. **全维功能权益横向对比矩阵表（Comprehensive Feature Comparison Matrix）**：
   - 涵盖四大核心维度：AI 核心大模型与对话、全真题库与备考系统、数据分析与尊享服务、身份标识与排行榜特权；
   - 高亮展示季度会员推荐列，让各档位差异清晰透彻；
4. **四大官方信赖与支付安全保障卡片（Trust & Guarantees Deck）**：
   - 7 天无忧全额退款、银行级 SSL 安全加密、权益秒级即时生效、随时升级或取消；
5. **高频常见问题解答 FAQ 交互手风琴（Interactive FAQ Accordion）**：
   - 精选 AI 能量重置时间、中途升级补差价机制、多设备云端同步、增值税发票申请、班级高校团购等 5 大核心解答；
6. **高校与机构团队定制方案横幅（Campus & Enterprise Plan Banner）**：
   - 为班级教学、教研团队与留学机构提供集中管理看板、专属批量折扣与咨询入口；
7. **全维双主题与 WCAG AA 级高对比度自适应**：
   - 浅色白金极光（`html:not(.dark)`）：卡片晶体微白背景（`rgba(255, 255, 255, 0.94)`），主文本锁定为玄青黑 `#0f172a` 与高对比灰 `#475569`，**严禁灰白字隐形**；
   - 深色深海星云（`.dark`）：黑曜石通透微晶面板（`rgba(15, 23, 42, 0.72)`），配备极光蓝紫流光边框；
   - 响应式多断点适配：1100px 两列排布、640px 单列触控优化。

















