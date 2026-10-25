package com.learnsphere.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@link PromptTemplateFormatter} 的行为约定。
 *
 * <p>这些用例的存在理由：本类之所以被引入，是因为 {@code String.format}
 * 在处理后台可编辑的提示词时会以两种方式静默出错 ——
 * 占位符类型不匹配时抛异常（听力生成直接 500），
 * 占位符少于参数时把多余的参数悄悄丢掉（难度从未进入写作提示词）。
 * 因此下面每个用例都对应一个真实故障场景，而不只是语法覆盖。
 */
class PromptTemplateFormatterTest {

    @Test
    void formatsPlaceholdersInDeclarationOrder() {
        String result = PromptTemplateFormatter.format("难度 %s，主题 %s，长度 %s", "medium", "space", "400-600");

        assertThat(result).isEqualTo("难度 medium，主题 space，长度 400-600");
    }

    @Test
    void convertsIntegerForPercentD() {
        assertThat(PromptTemplateFormatter.format("生成 %d 段材料", 3)).isEqualTo("生成 3 段材料");
    }

    /**
     * 真实故障：LISTENING_GEN_USER 的旧模板是 {@code 请生成%d段%s难度...}，
     * 而调用处按 (examLabel, count, difficulty, count) 传参，
     * 于是 %d 收到 "CET-4" 并抛出 IllegalFormatConversionException。
     */
    @Test
    void doesNotThrowWhenPercentDReceivesText() {
        String result = PromptTemplateFormatter.format("请为%d生成材料", "CET-4");

        assertThat(result).isEqualTo("请为CET-4生成材料");
    }

    /**
     * 参数多出来时不抛异常，但也不会被悄悄塞进结果。
     *
     * <p>这正是当初 WRITING_GEN_USER 的故障形态：模板只有两个 %s，
     * 调用处传了三个参数，难度被静默丢弃。格式化器无法替调用方猜出
     * 第三个参数该放在哪，所以这里只保证「不炸」，真正修法是让模板
     * 拥有与调用处一致的占位符个数（V3 迁移即为此而写）。
     */
    @Test
    void ignoresExtraArgumentsWithoutThrowing() {
        String result = PromptTemplateFormatter.format("请为%s生成一道%s题目", "CET-4", "essay", "hard");

        assertThat(result).isEqualTo("请为CET-4生成一道essay题目");
    }

    /**
     * 参数不足时必须保留占位符原文，而不是抛 MissingFormatArgumentException
     * 或输出 "null"。运营少写一个占位符不应该让整个接口挂掉。
     */
    @Test
    void keepsPlaceholderWhenArgumentIsMissing() {
        String result = PromptTemplateFormatter.format("主题：%s，难度：%s", "space");

        assertThat(result).isEqualTo("主题：space，难度：%s");
    }

    @Test
    void keepsIndexedPlaceholdersInOrder() {
        String result = PromptTemplateFormatter.format("%2$s / %1$s", "A", "B");

        assertThat(result).isEqualTo("B / A");
    }

    /** 提示词里出现的百分号是字面量，不能被当成转换符。 */
    @Test
    void treatsPercentPercentAsLiteralPercent() {
        assertThat(PromptTemplateFormatter.format("正确率 85%%")).isEqualTo("正确率 85%");
    }

    /**
     * 带空格的百分号是「50% off」这类正常文案，
     * 不能被误读成 %o（八进制）转换符。
     */
    @Test
    void doesNotTreatPercentFollowedBySpaceAsConversion() {
        String result = PromptTemplateFormatter.format("折扣 50% off，难度 %s", "hard");

        assertThat(result).isEqualTo("折扣 50% off，难度 hard");
    }

    @Test
    void handlesFloatingPointPlaceholders() {
        assertThat(PromptTemplateFormatter.format("正确率 %.1f%%", 85.5)).isEqualTo("正确率 85.5%");
    }

    @Test
    void handlesNullArgumentAsText() {
        String result = PromptTemplateFormatter.format("主题：%s", (Object) null);

        assertThat(result).isEqualTo("主题：null");
    }

    @Test
    void returnsTemplateUnchangedWhenThereAreNoPlaceholders() {
        String template = "你是一个专业的英语写作出题专家。";

        assertThat(PromptTemplateFormatter.format(template)).isEqualTo(template);
    }

    @Test
    void returnsEmptyStringForNullTemplate() {
        assertThat(PromptTemplateFormatter.format(null, "arg")).isEmpty();
    }

    /**
     * 未知转换符（如 %q）应原样保留。提示词里偶尔会出现 `%` 后跟字母的
     * 自然语言片段，静默吞掉它们会让文案变得莫名其妙。
     */
    @Test
    void keepsUnknownConversionVerbatim() {
        assertThat(PromptTemplateFormatter.format("100%q 完成")).isEqualTo("100%q 完成");
    }
}
