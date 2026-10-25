package com.learnsphere.service.impl;

import com.learnsphere.util.PromptTemplateFormatter;
import com.learnsphere.util.ReadingTaxonomy;
import com.learnsphere.util.SystemPromptDefaults;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 阅读提示词的拼装结果。
 *
 * <p>为什么单独测这个：{@code generateReading} 把「来源」接进提示词的方式
 * 是往模板里塞两个新占位符，而占位符与传参一旦错位，
 * {@link PromptTemplateFormatter} 只会保留占位符原文或按字符串输出，
 * 不会报错 —— 表现是模型收到「语料来源：%s」这种残缺指令，
 * 生成质量下降但接口一切正常，很难被发现。
 *
 * <p>所以这里直接断言拼装后的最终文本：来源的展示名和风格说明
 * 必须真的出现在该出现的位置。
 */
class ReadingPromptRenderingTest {

    /** 与 generateReading 完全相同的拼装方式。 */
    private static String renderUserPrompt(String source, String category, String difficulty, String length) {
        String template = SystemPromptDefaults.all().stream()
                .filter(prompt -> prompt.promptKey().equals("READING_GEN_USER"))
                .findFirst()
                .orElseThrow()
                .content();
        String lengthDesc = switch (length == null ? "" : length.toLowerCase(java.util.Locale.ROOT)) {
            case "short" -> "200-300";
            case "long" -> "800-1000";
            default -> "400-600";
        };
        return PromptTemplateFormatter.format(template, difficulty,
                ReadingTaxonomy.getSourceLabel(source),
                ReadingTaxonomy.getCategoryLabel(category),
                ReadingTaxonomy.getSourceStyle(source),
                lengthDesc);
    }

    @Test
    void renderedPromptCarriesSourceLabelAndStyle() {
        String prompt = renderUserPrompt("economist", "tech", "medium", "medium");

        assertThat(prompt)
                .contains("语料来源：经济学人")
                .contains("主题：科技前沿")
                .contains("400-600词")
                .contains("政经类社论")
                .doesNotContain("%s");
    }

    /** 换一个来源，提示词必须真的跟着变 —— 这正是修复前做不到的事。 */
    @Test
    void differentSourcesProduceDifferentPrompts() {
        String economist = renderUserPrompt("economist", "tech", "medium", "medium");
        String novel = renderUserPrompt("novel", "art", "medium", "medium");
        String sciam = renderUserPrompt("sciam", "science", "medium", "medium");

        assertThat(economist).isNotEqualTo(novel).isNotEqualTo(sciam);
        assertThat(novel).contains("现当代小说").contains("现当代小说");
        assertThat(sciam).contains("科学美国人").contains("科普文章");
    }

    /** 三个篇幅档位对应的词数区间必须与前端界面显示的一致。 */
    @Test
    void lengthTiersMatchFrontendCopy() {
        assertThat(renderUserPrompt("economist", "tech", "medium", "short")).contains("200-300词");
        assertThat(renderUserPrompt("economist", "tech", "medium", "medium")).contains("400-600词");
        assertThat(renderUserPrompt("economist", "tech", "medium", "long")).contains("800-1000词");
    }

    /** 未知来源也要产出可读的提示词，不能留下空洞或占位符。 */
    @Test
    void unknownSourceStillRendersUsablePrompt() {
        String prompt = renderUserPrompt("no-such-source", "no-such-category", "hard", "short");

        assertThat(prompt)
                .contains("语料来源：精选外刊")
                .contains("主题：no-such-category")
                .doesNotContain("%s");
    }

    /** 历史键名（scientific / fiction）渲染结果应与现行键名完全一致。 */
    @Test
    void legacySourceKeysRenderIdentically() {
        assertThat(renderUserPrompt("scientific", "science", "medium", "medium"))
                .isEqualTo(renderUserPrompt("sciam", "science", "medium", "medium"));
        assertThat(renderUserPrompt("fiction", "art", "medium", "medium"))
                .isEqualTo(renderUserPrompt("novel", "art", "medium", "medium"));
    }
}
