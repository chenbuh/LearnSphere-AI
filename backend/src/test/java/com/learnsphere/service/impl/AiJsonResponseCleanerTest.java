package com.learnsphere.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * {@link AiJsonResponseCleaner} 的单元测试。
 *
 * <p>该方法此前是 {@code AIGenerationServiceImpl} 的私有方法，被 15 处调用，
 * 却完全没有测试覆盖。抽成独立类后补齐边界用例。
 */
class AiJsonResponseCleanerTest {

    @Test
    @DisplayName("null 输入返回空对象字面量")
    void clean_returnsEmptyObjectForNull() {
        assertThat(AiJsonResponseCleaner.clean(null)).isEqualTo("{}");
    }

    @ParameterizedTest
    @ValueSource(strings = { "", "   ", "\n\t " })
    @DisplayName("空白输入返回空字符串")
    void clean_returnsEmptyStringForBlank(String input) {
        assertThat(AiJsonResponseCleaner.clean(input)).isEmpty();
    }

    @Test
    @DisplayName("纯 JSON 对象原样返回")
    void clean_keepsPlainObject() {
        String input = "{\"score\":80,\"feedback\":\"good\"}";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo(input);
    }

    @Test
    @DisplayName("纯 JSON 数组原样返回")
    void clean_keepsPlainArray() {
        String input = "[{\"a\":1},{\"b\":2}]";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo(input);
    }

    @Test
    @DisplayName("剥离 json 代码块围栏")
    void clean_stripsJsonFence() {
        String input = "```json\n{\"score\":90}\n```";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo("{\"score\":90}");
    }

    @Test
    @DisplayName("剥离无语言标注的代码块围栏")
    void clean_stripsBareFence() {
        String input = "```\n{\"score\":90}\n```";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo("{\"score\":90}");
    }

    @Test
    @DisplayName("截取前后带解释文字的对象")
    void clean_extractsObjectFromProse() {
        String input = "好的，这是评分结果：{\"score\":85} 希望有帮助。";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo("{\"score\":85}");
    }

    @Test
    @DisplayName("截取前后带解释文字的数组")
    void clean_extractsArrayFromProse() {
        String input = "结果如下：[{\"a\":1}] 以上。";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo("[{\"a\":1}]");
    }

    @Test
    @DisplayName("数组先出现时优先按数组截取")
    void clean_prefersEarlierBracket() {
        String input = "说明 [1,2] 后面还有 {\"a\":1}";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo("[1,2]");
    }

    @Test
    @DisplayName("对象先出现时优先按对象截取")
    void clean_prefersEarlierBrace() {
        String input = "说明 {\"a\":1} 后面还有 [1,2]";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo("{\"a\":1}");
    }

    @Test
    @DisplayName("字符串内的括号不参与配对")
    void clean_ignoresBracketsInsideString() {
        String input = "{\"text\":\"这里有个 } 括号\",\"score\":80}";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo(input);
    }

    @Test
    @DisplayName("字符串内的转义引号不提前结束字符串")
    void clean_handlesEscapedQuote() {
        String input = "{\"text\":\"他说\\\"你好\\\"\",\"score\":80}";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo(input);
    }

    @Test
    @DisplayName("嵌套对象按最外层括号配对")
    void clean_handlesNestedObject() {
        String input = "前缀 {\"a\":{\"b\":{\"c\":1}}} 后缀";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo("{\"a\":{\"b\":{\"c\":1}}}");
    }

    @Test
    @DisplayName("括号未闭合时返回从起始括号到末尾的内容")
    void clean_returnsTailWhenUnclosed() {
        String input = "{\"a\":1,\"b\":2";
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo("{\"a\":1,\"b\":2");
    }

    @Test
    @DisplayName("完全没有括号时返回去空白后的原文")
    void clean_returnsTrimmedTextWhenNoBrackets() {
        assertThat(AiJsonResponseCleaner.clean("  纯文本回复  ")).isEqualTo("纯文本回复");
    }

    @ParameterizedTest
    @CsvSource({
            "'```json\n[1,2,3]\n```', '[1,2,3]'",
            "'```JSON\n{\"a\":1}\n```', '{\"a\":1}'",
            "'```json\n{\"a\":1}', '{\"a\":1}'"
    })
    @DisplayName("多种围栏写法都能正确处理")
    void clean_handlesFenceVariants(String input, String expected) {
        assertThat(AiJsonResponseCleaner.clean(input)).isEqualTo(expected);
    }

    @Test
    @DisplayName("空对象保持为空对象")
    void clean_keepsEmptyObject() {
        assertThat(AiJsonResponseCleaner.clean("{}")).isEqualTo("{}");
    }
}
