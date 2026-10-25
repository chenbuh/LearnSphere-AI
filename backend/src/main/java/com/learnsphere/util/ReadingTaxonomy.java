package com.learnsphere.util;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * 阅读模块的语料来源与题材口径。
 *
 * <p>为什么需要这个类：阅读与其它题型不同，它不按学段组织，而是以
 * <b>语料来源 + 题材 + 篇幅</b> 为三条主轴（见 {@code generateReading} 的说明）。
 * 前端设置页提供了 6 个来源与 8 个题材，但后端此前只把 {@code source} 收进方法签名
 * 就丢掉了，{@code reading_article.source} 字段也从未被写入 ——
 * 用户在界面上精心选的「经济学人 / 科学美国人」，对生成结果没有任何影响。
 *
 * <p>这里把「键 → 展示名 → 命题风格说明」收敛到一处，原因与
 * {@link ExamTypeSupport} 相同：这些映射会被提示词、落库、展示三个地方同时用到，
 * 分散写必然走样。此前前端就已经出现过 {@code scientific} 与 {@code sciam}、
 * {@code fiction} 与 {@code novel} 两套键名并存、导致卡片元数据静默回退到默认文案的问题。
 */
public final class ReadingTaxonomy {

    /** 来源键 → 展示名。顺序与前端设置页一致。 */
    private static final Map<String, String> SOURCE_LABELS = new LinkedHashMap<>();

    /** 来源键 → 命题风格说明，直接拼进用户提示词。 */
    private static final Map<String, String> SOURCE_STYLES = new LinkedHashMap<>();

    /** 题材键 → 展示名。 */
    private static final Map<String, String> CATEGORY_LABELS = new LinkedHashMap<>();

    static {
        SOURCE_LABELS.put("economist", "经济学人");
        SOURCE_LABELS.put("nyt", "纽约时报");
        SOURCE_LABELS.put("sciam", "科学美国人");
        SOURCE_LABELS.put("natgeo", "国家地理");
        SOURCE_LABELS.put("classic", "经典名著");
        SOURCE_LABELS.put("novel", "现代小说");

        SOURCE_STYLES.put("economist",
                "模仿政经类社论的笔法：论点先行、数据与例证支撑、句式紧凑，常用抽象名词表达立场，"
                        + "适合考查推理判断与作者态度。");
        SOURCE_STYLES.put("nyt",
                "模仿深度特写的笔法：以具体人物或事件切入，叙事与评论交织，段落之间有明显的转折，"
                        + "适合考查细节定位与写作意图。");
        SOURCE_STYLES.put("sciam",
                "模仿科普文章的笔法：先抛出科学现象或研究结论，再解释机制与意义，术语会随文给出解释，"
                        + "适合考查因果链与词义猜测。");
        SOURCE_STYLES.put("natgeo",
                "模仿地理与生态纪实的笔法：画面感强的场景描写搭配客观事实，常涉及自然现象与环境保护，"
                        + "适合考查信息归纳与主旨概括。");
        SOURCE_STYLES.put("classic",
                "模仿文学典籍的笔法：句式较长、修辞与倒装较多，用词考究，情节推进依赖人物心理，"
                        + "适合考查句意理解与语气推断。");
        SOURCE_STYLES.put("novel",
                "模仿现当代小说的笔法：以对话和内心独白推进，语言贴近日常但有文学性，"
                        + "适合考查人物关系与情感态度。");

        CATEGORY_LABELS.put("tech", "科技前沿");
        CATEGORY_LABELS.put("business", "商业财经");
        CATEGORY_LABELS.put("humanities", "人文历史");
        CATEGORY_LABELS.put("nature", "自然环境");
        CATEGORY_LABELS.put("society", "社会生活");
        CATEGORY_LABELS.put("art", "艺术文学");
        CATEGORY_LABELS.put("health", "健康医疗");
        CATEGORY_LABELS.put("science", "基础科学");
    }

    private ReadingTaxonomy() {
    }

    /**
     * 归一来源键。
     *
     * <p>兼容两套历史键名：前端设置页曾用 {@code scientific}/{@code fiction}，
     * 而展示层与部分存量数据用 {@code sciam}/{@code novel}。两者都映射到同一来源，
     * 避免任何一侧单独改动后又一次出现「元数据回退到默认文案」。
     */
    public static String normalizeSource(String source) {
        String key = source == null ? "" : source.trim().toLowerCase(Locale.ROOT);
        return switch (key) {
            case "scientific" -> "sciam";
            case "fiction" -> "novel";
            default -> key;
        };
    }

    /** 来源展示名；未知来源返回「精选外刊」，不返回空串，避免提示词里出现空洞。 */
    public static String getSourceLabel(String source) {
        return SOURCE_LABELS.getOrDefault(normalizeSource(source), "精选外刊");
    }

    /** 来源的命题风格说明；未知来源给一条通用说明。 */
    public static String getSourceStyle(String source) {
        return SOURCE_STYLES.getOrDefault(normalizeSource(source),
                "使用地道、规范的外刊英语，语篇有清晰的信息层次，适合作为阅读理解材料。");
    }

    /** 是否为受支持的来源。 */
    public static boolean isSupportedSource(String source) {
        return SOURCE_LABELS.containsKey(normalizeSource(source));
    }

    /**
     * 题材展示名。
     *
     * <p>同时接受键与中文名：存量 {@code reading_article.category} 里既有
     * {@code tech} 这样的键，也有「科技」这样的中文（早期导入的数据），
     * 两边都要能识别，否则按题材筛选会静默匹配不到任何记录。
     */
    public static String getCategoryLabel(String category) {
        String key = category == null ? "" : category.trim().toLowerCase(Locale.ROOT);
        String byKey = CATEGORY_LABELS.get(key);
        if (byKey != null) {
            return byKey;
        }
        for (String label : CATEGORY_LABELS.values()) {
            if (label.equals(category == null ? "" : category.trim())) {
                return label;
            }
        }
        return category == null || category.isBlank() ? "综合" : category.trim();
    }

    /** 全部来源键，供测试与前端契约核对。 */
    public static Map<String, String> sourceLabels() {
        return Map.copyOf(SOURCE_LABELS);
    }

    /** 全部题材键，供测试与前端契约核对。 */
    public static Map<String, String> categoryLabels() {
        return Map.copyOf(CATEGORY_LABELS);
    }
}
