package com.learnsphere.util;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 阅读模块语料来源与题材的口径。
 *
 * <p>这个类存在的原因是一个具体的 bug：前端设置页有 6 个来源、8 个题材，
 * 但后端此前只把 {@code source} 收进方法签名就丢掉，
 * {@code reading_article.source} 也从未被写入 —— 界面上的选择对生成结果毫无影响。
 *
 * <p>修的过程中还发现前端与展示层各用了一套键名
 * （{@code scientific} vs {@code sciam}、{@code fiction} vs {@code novel}），
 * 导致卡片元数据静默回退到默认文案。所以这里的测试重点是
 * 「键名的唯一口径」而不是字符串常量本身。
 */
class ReadingTaxonomyTest {

    /** 与前端 useReadingPractice.js 的 sources 数组逐项对应。 */
    private static final List<String> FRONTEND_SOURCE_KEYS =
            List.of("economist", "nyt", "sciam", "natgeo", "classic", "novel");

    /** 与前端 useReadingPractice.js 的 categories 数组逐项对应。 */
    private static final List<String> FRONTEND_CATEGORY_KEYS =
            List.of("tech", "business", "humanities", "nature", "society", "art", "health", "science");

    @Test
    void everyFrontendSourceKeyIsSupported() {
        for (String key : FRONTEND_SOURCE_KEYS) {
            assertThat(ReadingTaxonomy.isSupportedSource(key))
                    .as("前端可选来源 " + key + " 必须被后端识别，否则用户的选择会被静默忽略")
                    .isTrue();
        }
    }

    @Test
    void everyFrontendSourceKeyHasLabelAndStyle() {
        for (String key : FRONTEND_SOURCE_KEYS) {
            assertThat(ReadingTaxonomy.getSourceLabel(key))
                    .as(key + " 的展示名")
                    .isNotBlank()
                    .isNotEqualTo("精选外刊");
            assertThat(ReadingTaxonomy.getSourceStyle(key))
                    .as(key + " 的命题风格说明")
                    .isNotBlank()
                    .hasSizeGreaterThan(20);
        }
    }

    @Test
    void everyFrontendCategoryKeyHasLabel() {
        for (String key : FRONTEND_CATEGORY_KEYS) {
            assertThat(ReadingTaxonomy.getCategoryLabel(key))
                    .as(key + " 的展示名")
                    .isNotBlank()
                    .isNotEqualTo(key)
                    .isNotEqualTo("综合");
        }
    }

    /**
     * 两套历史键名都要能用。
     *
     * <p>前端曾用 {@code scientific}/{@code fiction}，展示层与部分存量数据用
     * {@code sciam}/{@code novel}。归一后必须落到同一个来源，
     * 否则同一次选择在不同代码路径上会被当成两个来源。
     */
    @Test
    void legacyAndCurrentSourceKeysResolveToSameSource() {
        assertThat(ReadingTaxonomy.normalizeSource("scientific")).isEqualTo("sciam");
        assertThat(ReadingTaxonomy.normalizeSource("fiction")).isEqualTo("novel");
        assertThat(ReadingTaxonomy.getSourceLabel("scientific"))
                .isEqualTo(ReadingTaxonomy.getSourceLabel("sciam"));
        assertThat(ReadingTaxonomy.getSourceLabel("fiction"))
                .isEqualTo(ReadingTaxonomy.getSourceLabel("novel"));
        assertThat(ReadingTaxonomy.getSourceStyle("scientific"))
                .isEqualTo(ReadingTaxonomy.getSourceStyle("sciam"));
    }

    @Test
    void sourceKeyIsCaseInsensitiveAndTrimmed() {
        assertThat(ReadingTaxonomy.normalizeSource("  Economist ")).isEqualTo("economist");
        assertThat(ReadingTaxonomy.getSourceLabel("NATGEO")).isEqualTo("国家地理");
    }

    /** 未知来源不能返回空串：它会原样拼进提示词，留下「语料来源：」这样的空洞。 */
    @Test
    void unknownSourceFallsBackToUsableText() {
        assertThat(ReadingTaxonomy.getSourceLabel("unknown-source")).isEqualTo("精选外刊");
        assertThat(ReadingTaxonomy.getSourceStyle("unknown-source")).isNotBlank();
        assertThat(ReadingTaxonomy.isSupportedSource("unknown-source")).isFalse();
        assertThat(ReadingTaxonomy.getSourceLabel(null)).isEqualTo("精选外刊");
        assertThat(ReadingTaxonomy.getSourceLabel("")).isEqualTo("精选外刊");
    }

    /**
     * 题材要同时接受键与中文名。
     *
     * <p>存量 {@code reading_article.category} 里既有 {@code tech}，
     * 也有早期导入的「科技」。只认其中一种，按题材筛选就会静默漏数据。
     */
    @Test
    void categoryAcceptsBothKeyAndChineseLabel() {
        assertThat(ReadingTaxonomy.getCategoryLabel("tech")).isEqualTo("科技前沿");
        assertThat(ReadingTaxonomy.getCategoryLabel("科技前沿")).isEqualTo("科技前沿");
        assertThat(ReadingTaxonomy.getCategoryLabel("humanities")).isEqualTo("人文历史");
    }

    @Test
    void unknownCategoryKeepsOriginalText() {
        assertThat(ReadingTaxonomy.getCategoryLabel("自造题材")).isEqualTo("自造题材");
        assertThat(ReadingTaxonomy.getCategoryLabel(null)).isEqualTo("综合");
        assertThat(ReadingTaxonomy.getCategoryLabel("")).isEqualTo("综合");
    }

    /** 两个映射表都不能为空，且键名不能重复（Map 天然去重，这里防的是误加空值）。 */
    @Test
    void taxonomyTablesAreWellFormed() {
        Map<String, String> sources = ReadingTaxonomy.sourceLabels();
        Map<String, String> categories = ReadingTaxonomy.categoryLabels();

        assertThat(sources).hasSize(FRONTEND_SOURCE_KEYS.size());
        assertThat(categories).hasSize(FRONTEND_CATEGORY_KEYS.size());
        assertThat(sources.keySet()).containsExactlyInAnyOrderElementsOf(FRONTEND_SOURCE_KEYS);
        assertThat(categories.keySet()).containsExactlyInAnyOrderElementsOf(FRONTEND_CATEGORY_KEYS);
        assertThat(sources.values()).allSatisfy(label -> assertThat(label).isNotBlank());
        assertThat(categories.values()).allSatisfy(label -> assertThat(label).isNotBlank());
    }

    /** 每个来源的风格说明都应彼此不同，否则「按来源命题」就没有实际区分度。 */
    @Test
    void eachSourceHasDistinctStyle() {
        List<String> styles = FRONTEND_SOURCE_KEYS.stream()
                .map(ReadingTaxonomy::getSourceStyle)
                .toList();

        assertThat(styles).doesNotHaveDuplicates();
    }
}
