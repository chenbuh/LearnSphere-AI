-- ============================================================================
-- V4: 阅读接入语料来源，并归一提示词正文末尾换行
-- ============================================================================
--
-- 这是 V3 的两个收尾项，性质不同：
--   一、READING_GEN_USER 增加来源占位符 —— 修一个功能缺口
--   二、15 条模板去掉正文末尾换行 —— 消除「DB == Java 默认值」的最后一个例外
--
-- 守卫方式与 V3 一致：每条 UPDATE 都带 WHERE content = <旧内容全文>，
-- 只有「还是上一次发布的默认值」的记录才会被更新。
-- 运营在后台手工改过的文案原样保留，不会被这次升级冲掉。
--
-- 为什么这些模板在后台可编辑还要写迁移：
--   DatabaseInitializer 用 INSERT IGNORE，只在键不存在时插入。
--   存量库里这些键早已存在，改 Java 默认值对它们无效。
--   本脚本负责存量库那一半，Java 侧（SystemPromptDefaults）是它的镜像。
--
-- 幂等性：条件 UPDATE 第二次执行时因内容已变而匹配 0 行。
-- 脚本不含反斜杠转义，换行是真实换行，任何 sql_mode 下语义一致。
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 一、READING_GEN_USER：把语料来源接入提示词（占位符 3 → 5）
-- ---------------------------------------------------------------------------
--
-- 背景：前端设置页提供了 6 个语料来源（经济学人 / 纽约时报 / 科学美国人 /
-- 国家地理 / 经典名著 / 现代小说），每个来源还配了命题风格与适用考试。
-- 但后端只把 source 收进方法签名就丢掉了：模板里没有它的位置，
-- reading_article.source 也从未被写入。用户选「科学美国人」和选「现代小说」，
-- 拿到的提示词完全一样，界面上那 6 张卡片的差异全是装饰。
--
-- 现在模板多两个占位符：来源展示名与来源风格说明，由 ReadingTaxonomy 提供。
--

-- READING_GEN_USER
UPDATE `system_prompt` SET `content` = '请生成一篇%s难度的英语阅读理解，语料来源：%s，主题：%s。
来源风格要求：%s
【重要】文章长度要求：%s词左右。请务必写够字数，内容要丰富充实！
要求：
1. 文章要地道、有趣、贴近生活，段落结构清晰。
2. 包含5道选择题，每题4个选项。
3. 必须返回标准的JSON格式，不要包含任何Markdown格式，直接返回JSON字符串。
JSON结构：{"title":"文章标题", "passage":"这里放完整的长篇文章内容", "questions":[{"text":"问题", "options":["A","B","C","D"], "correct":0, "explanation":"解析"}]}'
WHERE `prompt_key` = 'READING_GEN_USER' AND `content` = '请生成一篇%s难度的英语阅读理解，主题：%s。
【重要】文章长度要求：%s词左右。请务必写够字数，内容要丰富充实！
要求：
1. 文章要地道、有趣、贴近生活，段落结构清晰。
2. 包含5道选择题，每题4个选项。
3. 必须返回标准的JSON格式，不要包含任何Markdown格式，直接返回JSON字符串。
JSON结构：{"title":"文章标题", "passage":"这里放完整的长篇文章内容", "questions":[{"text":"问题", "options":["A","B","C","D"], "correct":0, "explanation":"解析"}]}';

-- ---------------------------------------------------------------------------
-- 二、归一正文末尾换行（15 条）
-- ---------------------------------------------------------------------------
--
-- 这批模板的正文都以一个换行结尾，是早期用字符串拼接建表时留下的。
-- 它本身不影响模型输出，但让「数据库内容 == 代码默认值」这条约束多了一个例外，
-- 校验脚本和测试都得为此写特例。去掉之后两边可以逐字节比对，
-- 以后任何一处漂移都会立刻被发现。
--
-- 纯空白改动，无文案变化；同样带旧内容全文作为守卫。

-- GRAMMAR_GEN_USER
UPDATE `system_prompt` SET `content` = '请针对"%s"这个语法点生成10道%s难度的选择题。
返回JSON：{"topic":"%s", "questions":[{"text":"题目", "options":["A","B","C","D"], "correct":0, "explanation":"解析"}]}'
WHERE `prompt_key` = 'GRAMMAR_GEN_USER' AND `content` = '请针对"%s"这个语法点生成10道%s难度的选择题。
返回JSON：{"topic":"%s", "questions":[{"text":"题目", "options":["A","B","C","D"], "correct":0, "explanation":"解析"}]}
';

-- LISTENING_GEN_USER_HIGH
UPDATE `system_prompt` SET `content` = '请为%s学习阶段生成%d段%s难度的英语听力素材。
命题说明：贴近高考英语听力，覆盖校园通知、新闻简讯、活动安排、访谈片段等场景，强调关键信息定位与简单推断。
要求：
1. 每段包含 title、audioScript 和 5 道选择题。
2. 题目要兼顾细节获取和语境理解。
3. 必须完成 %d 段。
4. 返回纯JSON：{"passages":[{"title":"...","audioScript":"...","questions":[{"text":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}]}'
WHERE `prompt_key` = 'LISTENING_GEN_USER_HIGH' AND `content` = '请为%s学习阶段生成%d段%s难度的英语听力素材。
命题说明：贴近高考英语听力，覆盖校园通知、新闻简讯、活动安排、访谈片段等场景，强调关键信息定位与简单推断。
要求：
1. 每段包含 title、audioScript 和 5 道选择题。
2. 题目要兼顾细节获取和语境理解。
3. 必须完成 %d 段。
4. 返回纯JSON：{"passages":[{"title":"...","audioScript":"...","questions":[{"text":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}]}
';

-- LISTENING_GEN_USER_MIDDLE
UPDATE `system_prompt` SET `content` = '请为%s学习阶段生成%d段%s难度的英语听力素材。
命题说明：内容围绕校园生活、活动安排、计划建议、社会常识等中考高频听力场景，题干清晰，难度层次分明。
要求：
1. 每段包含 title、audioScript 和 5 道选择题。
2. 题目要体现信息定位和基础推断。
3. 必须完成 %d 段。
4. 返回纯JSON：{"passages":[{"title":"...","audioScript":"...","questions":[{"text":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}]}'
WHERE `prompt_key` = 'LISTENING_GEN_USER_MIDDLE' AND `content` = '请为%s学习阶段生成%d段%s难度的英语听力素材。
命题说明：内容围绕校园生活、活动安排、计划建议、社会常识等中考高频听力场景，题干清晰，难度层次分明。
要求：
1. 每段包含 title、audioScript 和 5 道选择题。
2. 题目要体现信息定位和基础推断。
3. 必须完成 %d 段。
4. 返回纯JSON：{"passages":[{"title":"...","audioScript":"...","questions":[{"text":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}]}
';

-- LISTENING_GEN_USER_PRIMARY
UPDATE `system_prompt` SET `content` = '请为%s学习阶段生成%d段%s难度的英语听力素材。
命题说明：语篇长度较短、语速偏慢，词汇以高频基础词为主，场景聚焦校园、家庭、天气、购物、兴趣等小学生熟悉情境。
要求：
1. 每段包含 title、audioScript 和 5 道选择题。
2. 题干要清晰直接，选项避免复杂干扰。
3. 必须完成 %d 段。
4. 返回纯JSON：{"passages":[{"title":"...","audioScript":"...","questions":[{"text":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}]}'
WHERE `prompt_key` = 'LISTENING_GEN_USER_PRIMARY' AND `content` = '请为%s学习阶段生成%d段%s难度的英语听力素材。
命题说明：语篇长度较短、语速偏慢，词汇以高频基础词为主，场景聚焦校园、家庭、天气、购物、兴趣等小学生熟悉情境。
要求：
1. 每段包含 title、audioScript 和 5 道选择题。
2. 题干要清晰直接，选项避免复杂干扰。
3. 必须完成 %d 段。
4. 返回纯JSON：{"passages":[{"title":"...","audioScript":"...","questions":[{"text":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]}]}
';

-- MOCK_EXAM_GEN_USER
UPDATE `system_prompt` SET `content` = '[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。
要求：
1. Part I Writing：1道作文题，type=''essay''。
2. Part II Listening：1-2段听力材料，合计不少于5道选择题。
3. Part III Reading：2-3篇阅读材料，合计不少于8道选择题。
4. Part IV Translation：1道翻译或表达题，type=''translation''。
5. 所有选择题必须有4个选项、correct 和 explanation 字段。
6. 返回纯JSON，questions 数组扁平化存储，总题量尽量接近 %d 题。
示例：{"title":"%s 全真模拟","questions":[{"id":1,"section":"Part I Writing","type":"essay","text":"Directions: ...","options":[]}]}'
WHERE `prompt_key` = 'MOCK_EXAM_GEN_USER' AND `content` = '[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。
要求：
1. Part I Writing：1道作文题，type=''essay''。
2. Part II Listening：1-2段听力材料，合计不少于5道选择题。
3. Part III Reading：2-3篇阅读材料，合计不少于8道选择题。
4. Part IV Translation：1道翻译或表达题，type=''translation''。
5. 所有选择题必须有4个选项、correct 和 explanation 字段。
6. 返回纯JSON，questions 数组扁平化存储，总题量尽量接近 %d 题。
示例：{"title":"%s 全真模拟","questions":[{"id":1,"section":"Part I Writing","type":"essay","text":"Directions: ...","options":[]}]}
';

-- MOCK_EXAM_GEN_USER_HIGH
UPDATE `system_prompt` SET `content` = '[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。
命题说明：整体难度贴近高考英语，覆盖写作、听力、阅读和翻译表达，强调篇章理解、逻辑组织和较完整的语言输出。
要求：
1. Part I Writing：1道高考风格写作题。
2. Part II Listening：1-2段听力材料，合计不少于5道选择题。
3. Part III Reading：2-3篇阅读材料，合计不少于8道选择题。
4. Part IV Translation：1道翻译或表达题。
5. 所有选择题必须有4个选项、correct 和 explanation 字段。
6. 返回纯JSON，questions 数组扁平化存储，总题量尽量接近 %d 题。
示例：{"title":"%s 全真模拟","questions":[{"id":1,"section":"Part I Writing","type":"essay","text":"Directions: ...","options":[]}]}'
WHERE `prompt_key` = 'MOCK_EXAM_GEN_USER_HIGH' AND `content` = '[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。
命题说明：整体难度贴近高考英语，覆盖写作、听力、阅读和翻译表达，强调篇章理解、逻辑组织和较完整的语言输出。
要求：
1. Part I Writing：1道高考风格写作题。
2. Part II Listening：1-2段听力材料，合计不少于5道选择题。
3. Part III Reading：2-3篇阅读材料，合计不少于8道选择题。
4. Part IV Translation：1道翻译或表达题。
5. 所有选择题必须有4个选项、correct 和 explanation 字段。
6. 返回纯JSON，questions 数组扁平化存储，总题量尽量接近 %d 题。
示例：{"title":"%s 全真模拟","questions":[{"id":1,"section":"Part I Writing","type":"essay","text":"Directions: ...","options":[]}]}
';

-- MOCK_EXAM_GEN_USER_MIDDLE
UPDATE `system_prompt` SET `content` = '[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。
命题说明：整体难度贴近中考英语，覆盖基础写作、听力理解、阅读理解和基础翻译表达，强调信息提取与综合运用。
要求：
1. Part I Writing：1道中考风格写作题。
2. Part II Listening：1-2段听力材料，合计不少于5道选择题。
3. Part III Reading：2-3篇阅读材料，合计不少于8道选择题。
4. Part IV Translation：1道翻译或表达题。
5. 所有选择题必须有4个选项、correct 和 explanation 字段。
6. 返回纯JSON，questions 数组扁平化存储，总题量尽量接近 %d 题。
示例：{"title":"%s 全真模拟","questions":[{"id":1,"section":"Part I Writing","type":"essay","text":"Directions: ...","options":[]}]}'
WHERE `prompt_key` = 'MOCK_EXAM_GEN_USER_MIDDLE' AND `content` = '[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。
命题说明：整体难度贴近中考英语，覆盖基础写作、听力理解、阅读理解和基础翻译表达，强调信息提取与综合运用。
要求：
1. Part I Writing：1道中考风格写作题。
2. Part II Listening：1-2段听力材料，合计不少于5道选择题。
3. Part III Reading：2-3篇阅读材料，合计不少于8道选择题。
4. Part IV Translation：1道翻译或表达题。
5. 所有选择题必须有4个选项、correct 和 explanation 字段。
6. 返回纯JSON，questions 数组扁平化存储，总题量尽量接近 %d 题。
示例：{"title":"%s 全真模拟","questions":[{"id":1,"section":"Part I Writing","type":"essay","text":"Directions: ...","options":[]}]}
';

-- MOCK_EXAM_GEN_USER_PRIMARY
UPDATE `system_prompt` SET `content` = '[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。
命题说明：整体难度贴近小学英语综合测评，题材聚焦校园、家庭、节日、兴趣与基础日常交流，指令更直接、语篇更短。
要求：
1. Part I Writing：1道基础写作题。
2. Part II Listening：1-2段简短听力材料，合计不少于5道选择题。
3. Part III Reading：2篇短文，合计不少于6道选择题。
4. Part IV Translation：1道基础翻译或表达题。
5. 所有选择题必须有4个选项、correct 和 explanation 字段。
6. 返回纯JSON，questions 数组扁平化存储，总题量尽量接近 %d 题。
示例：{"title":"%s 全真模拟","questions":[{"id":1,"section":"Part I Writing","type":"essay","text":"Directions: ...","options":[]}]}'
WHERE `prompt_key` = 'MOCK_EXAM_GEN_USER_PRIMARY' AND `content` = '[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。
命题说明：整体难度贴近小学英语综合测评，题材聚焦校园、家庭、节日、兴趣与基础日常交流，指令更直接、语篇更短。
要求：
1. Part I Writing：1道基础写作题。
2. Part II Listening：1-2段简短听力材料，合计不少于5道选择题。
3. Part III Reading：2篇短文，合计不少于6道选择题。
4. Part IV Translation：1道基础翻译或表达题。
5. 所有选择题必须有4个选项、correct 和 explanation 字段。
6. 返回纯JSON，questions 数组扁平化存储，总题量尽量接近 %d 题。
示例：{"title":"%s 全真模拟","questions":[{"id":1,"section":"Part I Writing","type":"essay","text":"Directions: ...","options":[]}]}
';

-- VOCAB_DETAIL_USER
UPDATE `system_prompt` SET `content` = '请解析单词：''%s'' (目标等级：%s)。
要求返回 JSON 格式，包含：word、phonetic、definition、translation、etymology、mnemonics、example、exampleTranslation、collocations。'
WHERE `prompt_key` = 'VOCAB_DETAIL_USER' AND `content` = '请解析单词：''%s'' (目标等级：%s)。
要求返回 JSON 格式，包含：word、phonetic、definition、translation、etymology、mnemonics、example、exampleTranslation、collocations。
';

-- VOCAB_DETAIL_USER_HIGH
UPDATE `system_prompt` SET `content` = '请解析单词：''%s'' (目标等级：%s)。
阶段说明：释义与例句贴合高考语境，适度补充近义辨析、书面表达搭配和常见考法。
要求返回 JSON 格式，包含：word、phonetic、definition、translation、etymology、mnemonics、example、exampleTranslation、collocations。'
WHERE `prompt_key` = 'VOCAB_DETAIL_USER_HIGH' AND `content` = '请解析单词：''%s'' (目标等级：%s)。
阶段说明：释义与例句贴合高考语境，适度补充近义辨析、书面表达搭配和常见考法。
要求返回 JSON 格式，包含：word、phonetic、definition、translation、etymology、mnemonics、example、exampleTranslation、collocations。
';

-- VOCAB_DETAIL_USER_MIDDLE
UPDATE `system_prompt` SET `content` = '请解析单词：''%s'' (目标等级：%s)。
阶段说明：释义与例句贴合中考高频语境，适度强调固定搭配、常见变形和容易混淆的用法。
要求返回 JSON 格式，包含：word、phonetic、definition、translation、etymology、mnemonics、example、exampleTranslation、collocations。'
WHERE `prompt_key` = 'VOCAB_DETAIL_USER_MIDDLE' AND `content` = '请解析单词：''%s'' (目标等级：%s)。
阶段说明：释义与例句贴合中考高频语境，适度强调固定搭配、常见变形和容易混淆的用法。
要求返回 JSON 格式，包含：word、phonetic、definition、translation、etymology、mnemonics、example、exampleTranslation、collocations。
';

-- VOCAB_DETAIL_USER_PRIMARY
UPDATE `system_prompt` SET `content` = '请解析单词：''%s'' (目标等级：%s)。
阶段说明：优先给出基础、高频、具体可感的释义与例句，例句要短、易懂、贴近日常生活，避免生僻表达。
要求返回 JSON 格式，包含：word、phonetic、definition、translation、etymology、mnemonics、example、exampleTranslation、collocations。'
WHERE `prompt_key` = 'VOCAB_DETAIL_USER_PRIMARY' AND `content` = '请解析单词：''%s'' (目标等级：%s)。
阶段说明：优先给出基础、高频、具体可感的释义与例句，例句要短、易懂、贴近日常生活，避免生僻表达。
要求返回 JSON 格式，包含：word、phonetic、definition、translation、etymology、mnemonics、example、exampleTranslation、collocations。
';

-- WRITING_GEN_USER_HIGH
UPDATE `system_prompt` SET `content` = '请为%s学习阶段生成一道%s类型、%s难度的英语写作题目。
命题说明：面向高考英语，题目应体现应用文写作、观点表达或情境任务特点，兼顾信息整合、篇章结构和较规范的书面表达。
要求：
1. 题目要符合高考常见写作场景。
2. 提供详细写作要求(prompt)。
3. 提供3-5条写作提示(tips)。
4. 给出合理的 minWords 和 timeLimit。
5. difficulty 字段原样返回 easy、medium 或 hard。
返回JSON：{"title":"题目","prompt":"详细要求","tips":["提示1","提示2"],"minWords":120,"timeLimit":30,"difficulty":"medium"}'
WHERE `prompt_key` = 'WRITING_GEN_USER_HIGH' AND `content` = '请为%s学习阶段生成一道%s类型、%s难度的英语写作题目。
命题说明：面向高考英语，题目应体现应用文写作、观点表达或情境任务特点，兼顾信息整合、篇章结构和较规范的书面表达。
要求：
1. 题目要符合高考常见写作场景。
2. 提供详细写作要求(prompt)。
3. 提供3-5条写作提示(tips)。
4. 给出合理的 minWords 和 timeLimit。
5. difficulty 字段原样返回 easy、medium 或 hard。
返回JSON：{"title":"题目","prompt":"详细要求","tips":["提示1","提示2"],"minWords":120,"timeLimit":30,"difficulty":"medium"}
';

-- WRITING_GEN_USER_MIDDLE
UPDATE `system_prompt` SET `content` = '请为%s学习阶段生成一道%s类型、%s难度的英语写作题目。
命题说明：面向中考英语，题目贴近校园生活、成长经历、活动安排、书信通知等高频场景，强调信息覆盖和基本逻辑。
要求：
1. 题目要符合中考常见写作任务。
2. 提供详细写作要求(prompt)。
3. 提供3-5条写作提示(tips)。
4. 给出合理的 minWords 和 timeLimit。
5. difficulty 字段原样返回 easy、medium 或 hard。
返回JSON：{"title":"题目","prompt":"详细要求","tips":["提示1","提示2"],"minWords":100,"timeLimit":25,"difficulty":"medium"}'
WHERE `prompt_key` = 'WRITING_GEN_USER_MIDDLE' AND `content` = '请为%s学习阶段生成一道%s类型、%s难度的英语写作题目。
命题说明：面向中考英语，题目贴近校园生活、成长经历、活动安排、书信通知等高频场景，强调信息覆盖和基本逻辑。
要求：
1. 题目要符合中考常见写作任务。
2. 提供详细写作要求(prompt)。
3. 提供3-5条写作提示(tips)。
4. 给出合理的 minWords 和 timeLimit。
5. difficulty 字段原样返回 easy、medium 或 hard。
返回JSON：{"title":"题目","prompt":"详细要求","tips":["提示1","提示2"],"minWords":100,"timeLimit":25,"difficulty":"medium"}
';

-- WRITING_GEN_USER_PRIMARY
UPDATE `system_prompt` SET `content` = '请为%s学习阶段生成一道%s类型、%s难度的英语写作题目。
命题说明：面向小学英语学习者，主题聚焦校园、家庭、朋友、节日和兴趣，语言简洁直接。
要求：
1. 题目要具体、友好、易理解。
2. 提供详细写作要求(prompt)。
3. 提供3-5条写作提示(tips)。
4. 给出合理的 minWords 和 timeLimit。
5. difficulty 字段原样返回 easy、medium 或 hard。
返回JSON：{"title":"题目","prompt":"详细要求","tips":["提示1","提示2"],"minWords":80,"timeLimit":20,"difficulty":"medium"}'
WHERE `prompt_key` = 'WRITING_GEN_USER_PRIMARY' AND `content` = '请为%s学习阶段生成一道%s类型、%s难度的英语写作题目。
命题说明：面向小学英语学习者，主题聚焦校园、家庭、朋友、节日和兴趣，语言简洁直接。
要求：
1. 题目要具体、友好、易理解。
2. 提供详细写作要求(prompt)。
3. 提供3-5条写作提示(tips)。
4. 给出合理的 minWords 和 timeLimit。
5. difficulty 字段原样返回 easy、medium 或 hard。
返回JSON：{"title":"题目","prompt":"详细要求","tips":["提示1","提示2"],"minWords":80,"timeLimit":20,"difficulty":"medium"}
';


