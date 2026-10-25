package com.learnsphere.util;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 提示词模板的容错格式化器。
 *
 * <p>提示词模板存放在 {@code system_prompt} 表里，运营可以在后台随时改写，
 * 因此模板占位符与代码传入的参数不可能永远严格对应。直接使用
 * {@link String#format(String, Object...)} 会带来两类真实故障：
 * <ul>
 *   <li>模板写成 {@code %d} 而代码传入的是字符串，抛出
 *       {@link java.util.IllegalFormatConversionException}，整次 AI 生成直接失败并降级到本地题库；</li>
 *   <li>模板占位符少于参数个数时，多余参数被静默丢弃，难度、数量等约束根本没进入提示词，
 *       生成质量无声下降。</li>
 * </ul>
 *
 * <p>本工具保留 {@code String#format} 的语义（顺序替换、宽度、精度、{@code %%}、{@code %n}
 * 以及 {@code %1$s} 形式的显式索引），但把两种不匹配降级为可用的输出：
 * 类型不匹配时按字符串输出，参数不足时保留占位符原文，
 * 使提示词始终能拼装成功，且不丢失模板作者写下的任何约束。
 */
public final class PromptTemplateFormatter {

    /**
     * 单个占位符：{@code %[index$][flags][width][.precision][t]conversion}。
     *
     * <p>flags 刻意不含空格标志，避免把英文文案里的 {@code "50% off"} 误判成 {@code %o} 八进制转换。
     */
    private static final Pattern PLACEHOLDER = Pattern.compile(
            "%(\\d+\\$)?([-#+0,(]*)(\\d+)?(\\.\\d+)?([tT])?([a-zA-Z%])");

    /** 被识别为转换符的字符集合；其余（例如误写的 {@code %难度}）按字面量原样保留。 */
    private static final String CONVERSIONS = "sSdoxXfFeEgGbBcChHaA";

    private PromptTemplateFormatter() {
    }

    /**
     * 按模板拼装提示词，永不抛出格式化异常。
     *
     * @param template 模板内容，可为 {@code null} 或空（返回空串）
     * @param args     按顺序填充占位符的参数，可为 {@code null}
     * @return 拼装结果；参数不足处保留原始占位符
     */
    public static String format(String template, Object... args) {
        if (template == null || template.isEmpty()) {
            return "";
        }
        Object[] values = args == null ? new Object[0] : args;
        Matcher matcher = PLACEHOLDER.matcher(template);
        StringBuilder result = new StringBuilder(template.length() + 32);
        int cursor = 0;
        int nextIndex = 0;
        while (matcher.find()) {
            result.append(template, cursor, matcher.start());
            cursor = matcher.end();
            String conversion = matcher.group(6);
            if ("%".equals(conversion)) {
                result.append('%');
                continue;
            }
            if ("n".equals(conversion)) {
                result.append(System.lineSeparator());
                continue;
            }
            if (CONVERSIONS.indexOf(conversion.charAt(0)) < 0) {
                result.append(matcher.group());
                continue;
            }
            int index = resolveIndex(matcher.group(1), nextIndex);
            nextIndex = index + 1;
            if (index < 0 || index >= values.length) {
                // 参数不足：保留占位符原文，避免丢掉模板里写下的约束
                result.append(matcher.group());
                continue;
            }
            result.append(render(matcher, values[index]));
        }
        result.append(template, cursor, template.length());
        return result.toString();
    }

    /** 解析显式索引（{@code %2$s} 中的 {@code 2}）为 0 基下标，缺省时用顺序下标。 */
    private static int resolveIndex(String explicitIndex, int sequentialIndex) {
        if (explicitIndex == null || explicitIndex.isEmpty()) {
            return sequentialIndex;
        }
        try {
            return Integer.parseInt(explicitIndex.substring(0, explicitIndex.length() - 1)) - 1;
        } catch (NumberFormatException ignored) {
            return sequentialIndex;
        }
    }

    /** 渲染单个占位符，类型不匹配或格式非法时退化为字符串输出。 */
    private static String render(Matcher matcher, Object value) {
        String conversion = matcher.group(6);
        if (needsTextFallback(conversion, value)) {
            try {
                return String.format(Locale.ROOT, textSpec(matcher), String.valueOf(value));
            } catch (RuntimeException ignored) {
                return String.valueOf(value);
            }
        }
        try {
            return String.format(Locale.ROOT, matcher.group(), value);
        } catch (RuntimeException ignored) {
            return String.valueOf(value);
        }
    }

    /**
     * 判断该转换符能否安全接收当前类型的参数。
     *
     * <p>只把明确兼容的组合交给 {@code String.format}，其余一律走字符串兜底：
     * 宁可少一点数字格式化，也不要让一次运营改动把整条生成链路打挂。
     */
    private static boolean needsTextFallback(String conversion, Object value) {
        switch (conversion.charAt(0)) {
            case 's':
            case 'S':
            case 'b':
            case 'B':
            case 'h':
            case 'H':
                return false;
            case 'd':
            case 'o':
            case 'x':
            case 'X':
                return !isIntegral(value);
            case 'f':
            case 'e':
            case 'E':
            case 'g':
            case 'G':
            case 'a':
            case 'A':
                return !(value instanceof Number);
            case 'c':
            case 'C':
                return !(value instanceof Character || isIntegral(value));
            default:
                return true;
        }
    }

    /** 整数转换符（{@code %d} 等）不接受浮点类型，需要单独识别。 */
    private static boolean isIntegral(Object value) {
        return value instanceof Number && !(value instanceof Double) && !(value instanceof Float);
    }

    /**
     * 构造字符串兜底用的占位符：保留显式索引、宽度和精度，丢弃数字专用标志
     * （{@code ,}、{@code +}、{@code 0} 等用在 {@code %s} 上会抛异常）。
     */
    private static String textSpec(Matcher matcher) {
        StringBuilder spec = new StringBuilder("%");
        if (matcher.group(1) != null) {
            spec.append(matcher.group(1));
        }
        if (matcher.group(3) != null) {
            spec.append(matcher.group(3));
        }
        if (matcher.group(4) != null) {
            spec.append(matcher.group(4));
        }
        return spec.append('s').toString();
    }
}
