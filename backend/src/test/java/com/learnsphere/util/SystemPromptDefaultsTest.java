package com.learnsphere.util;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@link SystemPromptDefaults} 的结构约束。
 *
 * <p>这些内容会被写入 {@code system_prompt} 表并被后台直接编辑，
 * 所以键名重复、正文为空、占位符与调用处不一致都无法在编译期发现，
 * 只能靠测试兜住。每一条断言都对应一个已经发生过的故障：
 * 键名打错导致运营看不到该提示词、%d 收到字符串导致听力生成 500、
 * 占位符少于传参导致难度被静默丢弃。
 */
class SystemPromptDefaultsTest {

    private static final Pattern PLACEHOLDER = Pattern.compile("%(\\d+\\$)?([-#+0,(]*)(\\d+)?(\\.\\d+)?([tT])?([a-zA-Z%])");

    private static List<SystemPromptDefaults.PromptDefault> defaults() {
        return SystemPromptDefaults.all();
    }

    @Test
    void containsNoDuplicateKeys() {
        Set<String> seen = new HashSet<>();
        Set<String> duplicated = new HashSet<>();
        for (SystemPromptDefaults.PromptDefault prompt : defaults()) {
            if (!seen.add(prompt.promptKey())) {
                duplicated.add(prompt.promptKey());
            }
        }

        assertThat(duplicated).as("prompt_key 必须唯一，否则 INSERT IGNORE 会静默丢弃后一条").isEmpty();
    }

    @Test
    void everyEntryHasKeyDescriptionAndContent() {
        assertThat(defaults()).isNotEmpty();
        assertThat(defaults()).allSatisfy(prompt -> {
            assertThat(prompt.promptKey()).as("prompt_key").isNotBlank().matches("[A-Z0-9_]+");
            assertThat(prompt.description()).as(prompt.promptKey() + " 的 description").isNotBlank();
            assertThat(prompt.content()).as(prompt.promptKey() + " 的 content").isNotBlank();
        });
    }

    /**
     * 正文首尾不应有任何空白。
     *
     * <p>V3 时代这条规则有个「结尾允许一个换行」的例外，因为库里 15 条模板
     * 是那个形态，为了对齐它去改写一堆无关提示词并不划算。V4 把这 15 条
     * 一并归一后，例外不再需要 —— 现在「数据库内容 == 代码默认值」是无条件成立的，
     * 任何一处漂移都会被这里和 Flyway 校验同时发现。
     */
    @Test
    void contentHasNoSurroundingWhitespace() {
        assertThat(defaults()).allSatisfy(prompt ->
                assertThat(prompt.content())
                        .as(prompt.promptKey() + " 的正文首尾不应有任何空白（含换行）")
                        .isEqualTo(prompt.content().strip()));
    }

    /**
     * 用户提示词里的占位符个数必须与代码传入的参数个数一致。
     *
     * <p>这条最容易出错，且后果最隐蔽：{@code String.format} 在参数多于占位符时
     * 静默丢弃多余参数（难度丢失），在 {@code %d} 收到字符串时抛异常（接口 500）。
     * 下面按调用处的真实传参个数逐一固定。
     */
    @Test
    void userTemplatesDeclareThePlaceholderCountTheCodePasses() {
        assertPlaceholderCount("READING_GEN_USER", 5);
        assertPlaceholderCount("WRITING_GEN_USER", 3);
        assertPlaceholderCount("WRITING_GEN_USER_PRIMARY", 3);
        assertPlaceholderCount("WRITING_GEN_USER_MIDDLE", 3);
        assertPlaceholderCount("WRITING_GEN_USER_HIGH", 3);
        assertPlaceholderCount("WRITING_EVAL_USER", 2);
        assertPlaceholderCount("LISTENING_GEN_USER", 4);
        assertPlaceholderCount("LISTENING_GEN_USER_PRIMARY", 4);
        assertPlaceholderCount("LISTENING_GEN_USER_MIDDLE", 4);
        assertPlaceholderCount("LISTENING_GEN_USER_HIGH", 4);
        assertPlaceholderCount("VOCAB_DETAIL_USER", 2);
        assertPlaceholderCount("VOCAB_DETAIL_USER_PRIMARY", 2);
        assertPlaceholderCount("VOCAB_DETAIL_USER_MIDDLE", 2);
        assertPlaceholderCount("VOCAB_DETAIL_USER_HIGH", 2);
        assertPlaceholderCount("MOCK_EXAM_GEN_USER", 7);
        assertPlaceholderCount("MOCK_EXAM_GEN_USER_PRIMARY", 7);
        assertPlaceholderCount("MOCK_EXAM_GEN_USER_MIDDLE", 7);
        assertPlaceholderCount("MOCK_EXAM_GEN_USER_HIGH", 7);
        assertPlaceholderCount("GRAMMAR_GEN_USER", 3);
        assertPlaceholderCount("SPEAKING_GEN_USER", 4);
        assertPlaceholderCount("SPEAKING_EVAL_USER", 2);
        assertPlaceholderCount("REC_ENGINE_USER", 1);
        assertPlaceholderCount("LEARNING_ADVICE_USER", 4);
    }

    /**
     * 听力模板第 2、4 个占位符必须是 {@code %d}。
     *
     * <p>旧模板写作「请生成%d段%s难度」，而调用处按 (考试名, 段数, 难度, 段数) 传参，
     * 第一个 %d 收到 "CET-4" 直接抛 IllegalFormatConversionException。
     * 只数个数不够，类型也必须对。
     */
    @Test
    void listeningTemplatesUseIntegerConversionForCounts() {
        for (String key : List.of("LISTENING_GEN_USER", "LISTENING_GEN_USER_PRIMARY",
                "LISTENING_GEN_USER_MIDDLE", "LISTENING_GEN_USER_HIGH")) {
            String content = contentOf(key);
            List<String> conversions = conversionsOf(content);
            assertThat(conversions).as(key + " 的占位符序列").hasSize(4);
            assertThat(conversions.get(0)).as(key + " 第 1 个占位符接收考试名，应为 %s").isEqualTo("s");
            assertThat(conversions.get(1)).as(key + " 第 2 个占位符接收段数，应为 %d").isEqualTo("d");
            assertThat(conversions.get(2)).as(key + " 第 3 个占位符接收难度，应为 %s").isEqualTo("s");
            assertThat(conversions.get(3)).as(key + " 第 4 个占位符接收段数，应为 %d").isEqualTo("d");
        }
    }

    /** 模拟考试的会话号是「%s-%d」，第一个占位符绝不能是 %d。 */
    @Test
    void mockExamTemplateStartsWithTextPlaceholder() {
        for (String key : List.of("MOCK_EXAM_GEN_USER", "MOCK_EXAM_GEN_USER_PRIMARY",
                "MOCK_EXAM_GEN_USER_MIDDLE", "MOCK_EXAM_GEN_USER_HIGH")) {
            List<String> conversions = conversionsOf(contentOf(key));
            assertThat(conversions).as(key + " 的占位符序列").hasSize(7);
            assertThat(conversions.get(0)).as(key + " 第 1 个占位符（Session ID 前缀）应为 %s").isEqualTo("s");
            assertThat(conversions.get(1)).as(key + " 第 2 个占位符（Session ID 序号）应为 %d").isEqualTo("d");
        }
    }

    /**
     * 系统提示词不应包含位置占位符：它们只作为 system message 发送，不经过格式化。
     * 若出现 %s，模型会看到字面的 %s 并可能把它抄进输出。
     */
    @Test
    void systemPromptsContainNoPositionalPlaceholders() {
        assertThat(defaults())
                .filteredOn(prompt -> prompt.promptKey().contains("_SYSTEM"))
                .allSatisfy(prompt -> assertThat(conversionsOf(prompt.content()))
                        .as(prompt.promptKey() + " 是系统提示词，不应含 %s/%d 占位符")
                        .isEmpty());
    }

    /**
     * 阅读模板必须给「来源」留位置。
     *
     * <p>前端提供了 6 个语料来源，每个都配了命题风格。V4 之前模板只有
     * 难度 / 主题 / 长度三个占位符，来源根本没进提示词，
     * 用户选什么都得到同一篇东西。这条断言把「来源必须参与生成」钉住。
     */
    @Test
    void readingTemplateCarriesSourceAndStyle() {
        String content = contentOf("READING_GEN_USER");

        assertThat(content)
                .as("阅读模板必须包含来源展示名与来源风格两个位置")
                .contains("语料来源")
                .contains("来源风格");
        assertThat(conversionsOf(content))
                .as("顺序应为 难度 → 来源名 → 题材 → 来源风格 → 长度")
                .containsExactly("s", "s", "s", "s", "s");
    }

    /** 每个题型都必须有系统提示词，且学段变体齐全 —— 这是本次审计的核心诉求。 */
    @Test
    void everyQuestionTypeHasSystemPromptsIncludingStageVariants() {
        Set<String> keys = new HashSet<>();
        defaults().forEach(prompt -> keys.add(prompt.promptKey()));

        for (String base : List.of("READING_GEN", "WRITING_GEN", "LISTENING_GEN",
                "VOCAB_DETAIL", "MOCK_EXAM_GEN", "GRAMMAR_GEN", "SPEAKING_GEN")) {
            assertThat(keys).as(base + " 缺少系统提示词").contains(base + "_SYSTEM");
            assertThat(keys).as(base + " 缺少用户提示词").contains(base + "_USER");
        }

        // 有学段概念的题型，三个学段都要有系统提示词
        for (String base : List.of("WRITING_GEN", "LISTENING_GEN", "VOCAB_DETAIL", "MOCK_EXAM_GEN")) {
            assertThat(keys).as(base + " 学段系统提示词不全")
                    .contains(base + "_SYSTEM_PRIMARY", base + "_SYSTEM_MIDDLE", base + "_SYSTEM_HIGH");
        }
    }

    /**
     * 阅读有意不做学段变体。
     *
     * <p>其它题型按小学/中考/高考拆成三份，阅读不拆：它以「来源 + 题材 + 篇幅」
     * 组织，各学段读同一批外刊语料，差异体现在篇幅与难度上。
     * 这条断言把这个取舍写成代码约束 —— 若有人后来加了
     * {@code READING_GEN_SYSTEM_PRIMARY} 却没同步前端与 {@code generateReading}，
     * 这里会先失败，避免出现「键存在但永远读不到」的孤立配置。
     */
    @Test
    void readingDeliberatelyHasNoStageVariants() {
        Set<String> keys = new HashSet<>();
        defaults().forEach(prompt -> keys.add(prompt.promptKey()));

        assertThat(keys)
                .as("阅读按来源/题材/篇幅组织，不按学段；如要引入学段请同时改前端与生成逻辑")
                .noneMatch(key -> key.startsWith("READING_GEN_") && key.matches(".*_(PRIMARY|MIDDLE|HIGH)$"));
    }

    private void assertPlaceholderCount(String key, int expected) {
        assertThat(conversionsOf(contentOf(key)))
                .as(key + " 的占位符个数应与调用处传参个数一致")
                .hasSize(expected);
    }

    private String contentOf(String key) {
        return defaults().stream()
                .filter(prompt -> prompt.promptKey().equals(key))
                .findFirst()
                .map(SystemPromptDefaults.PromptDefault::content)
                .orElseThrow(() -> new AssertionError("缺少提示词：" + key));
    }

    /** 提取正文中的占位符转换符序列，跳过 {@code %%} 与 {@code %n}。 */
    private List<String> conversionsOf(String content) {
        List<String> conversions = new java.util.ArrayList<>();
        Matcher matcher = PLACEHOLDER.matcher(content);
        while (matcher.find()) {
            String conversion = matcher.group(6);
            if ("%".equals(conversion) || "n".equals(conversion)) {
                continue;
            }
            conversions.add(conversion.toLowerCase(java.util.Locale.ROOT));
        }
        return conversions;
    }
}
