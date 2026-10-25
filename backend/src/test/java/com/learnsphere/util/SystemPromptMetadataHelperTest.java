package com.learnsphere.util;

import com.learnsphere.entity.SystemPrompt;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 后台提示词列表的分组与排序。
 *
 * <p>这些规则直接决定运营在后台看到的分组标题和顺序。新加提示词时如果
 * 前缀没被 {@code moduleLabel} 覆盖，它会掉进「999 / 配置项」的兜底分组，
 * 表现为「后台看不到这条提示词」，而代码里明明在读写它。
 * 因此这里遍历全部默认值，要求每一条都能被识别到具体模块。
 */
class SystemPromptMetadataHelperTest {

    @Test
    void everyDefaultPromptKeyMapsToAKnownModule() {
        assertThat(SystemPromptDefaults.all()).allSatisfy(prompt ->
                assertThat(SystemPromptMetadataHelper.resolveDisplayDescription(
                        prompt.promptKey(), prompt.description()))
                        .as(prompt.promptKey() + " 的分组说明")
                        .doesNotContain("配置项")
                        .doesNotContain(prompt.promptKey()));
    }

    @Test
    void stageVariantsAreLabelledByStage() {
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("WRITING_GEN_SYSTEM_PRIMARY", "x"))
                .contains("小学");
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("WRITING_GEN_SYSTEM_MIDDLE", "x"))
                .contains("中考");
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("WRITING_GEN_SYSTEM_HIGH", "x"))
                .contains("高考");
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("WRITING_GEN_SYSTEM", "x"))
                .contains("通用");
    }

    @Test
    void stageVariantsAreSortedPrimaryThenMiddleThenHigh() {
        List<SystemPrompt> prompts = new ArrayList<>();
        prompts.add(promptOf("WRITING_GEN_SYSTEM_HIGH"));
        prompts.add(promptOf("WRITING_GEN_SYSTEM_MIDDLE"));
        prompts.add(promptOf("WRITING_GEN_SYSTEM_PRIMARY"));
        prompts.add(promptOf("WRITING_GEN_SYSTEM"));
        prompts.add(promptOf("WRITING_GEN_USER"));

        prompts.sort(SystemPromptMetadataHelper.promptComparator());

        assertThat(prompts).extracting(SystemPrompt::getPromptKey).containsExactly(
                "WRITING_GEN_SYSTEM",
                "WRITING_GEN_SYSTEM_PRIMARY",
                "WRITING_GEN_SYSTEM_MIDDLE",
                "WRITING_GEN_SYSTEM_HIGH",
                "WRITING_GEN_USER");
    }

    /** 系统提示词排在用户提示词之前，运营改文案时不必在两类之间来回找。 */
    @Test
    void systemPromptsComeBeforeUserPrompts() {
        List<SystemPrompt> prompts = new ArrayList<>();
        prompts.add(promptOf("READING_GEN_USER"));
        prompts.add(promptOf("READING_GEN_SYSTEM"));

        prompts.sort(SystemPromptMetadataHelper.promptComparator());

        assertThat(prompts).extracting(SystemPrompt::getPromptKey)
                .containsExactly("READING_GEN_SYSTEM", "READING_GEN_USER");
    }

    /** 模块顺序：阅读 → 写作 → 听力 → 词汇 → 模拟考 → 语法 → 口语 → 分析 → 助教。 */
    @Test
    void modulesFollowBusinessOrder() {
        List<SystemPrompt> prompts = new ArrayList<>();
        for (String key : List.of("REC_ENGINE_SYSTEM", "SPEAKING_GEN_SYSTEM", "GRAMMAR_GEN_SYSTEM",
                "MOCK_EXAM_GEN_SYSTEM", "VOCAB_DETAIL_SYSTEM", "LISTENING_GEN_SYSTEM",
                "WRITING_GEN_SYSTEM", "READING_GEN_SYSTEM")) {
            prompts.add(promptOf(key));
        }

        prompts.sort(SystemPromptMetadataHelper.promptComparator());

        assertThat(prompts).extracting(SystemPrompt::getPromptKey).containsExactly(
                "READING_GEN_SYSTEM",
                "WRITING_GEN_SYSTEM",
                "LISTENING_GEN_SYSTEM",
                "VOCAB_DETAIL_SYSTEM",
                "MOCK_EXAM_GEN_SYSTEM",
                "GRAMMAR_GEN_SYSTEM",
                "SPEAKING_GEN_SYSTEM",
                "REC_ENGINE_SYSTEM");
    }

    @Test
    void writingAdviceRulesAreGroupedUnderTutor() {
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("AI_TUTOR_ADVICE_RULES", "x"))
                .contains("AI 助教")
                .contains("回答规范");
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("LEARNING_ADVICE_USER", "x"))
                .contains("AI 助教");
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("DEEP_ANALYZE_SYSTEM", "x"))
                .contains("深度分析");
    }

    @Test
    void unknownKeyFallsBackToGivenDescription() {
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("SOMETHING_ELSE", "自定义说明"))
                .isEqualTo("自定义说明");
        assertThat(SystemPromptMetadataHelper.resolveDisplayDescription("SOMETHING_ELSE", null))
                .isEqualTo("SOMETHING_ELSE");
    }

    private SystemPrompt promptOf(String promptKey) {
        SystemPrompt prompt = new SystemPrompt();
        prompt.setPromptKey(promptKey);
        return prompt;
    }
}
