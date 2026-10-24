package com.learnsphere.service.impl;

/**
 * AI 响应 JSON 清洗工具。
 *
 * <p>大模型返回的内容经常包裹在 Markdown 代码块里（```json ... ```），
 * 或者前后带有解释性文字。本工具负责从这类响应中截取第一段完整的
 * JSON 对象或数组，供上层直接交给 JSON 解析器。
 *
 * <p>从 {@code AIGenerationServiceImpl} 中抽出，原因是该方法被 15 处调用，
 * 属于跨模块共用的纯函数，且此前完全没有测试覆盖。
 *
 * <p>截取逻辑基于括号配对，并正确处理字符串字面量与转义字符，
 * 因此不会把字符串内的括号误判为结构括号。
 */
public final class AiJsonResponseCleaner {

    private AiJsonResponseCleaner() {
    }

    /**
     * 从模型响应中截取第一段完整的 JSON。
     *
     * @param content 模型原始响应，可为 {@code null}
     * @return 清洗后的 JSON 文本；入参为 {@code null} 时返回 {@code "{}"}；
     *         找不到任何括号时返回去除首尾空白后的原文
     */
    public static String clean(String content) {
        if (content == null) {
            return "{}";
        }

        String normalized = content.trim();
        if (normalized.startsWith("```")) {
            normalized = normalized
                    .replaceFirst("^```(?:json)?\\s*", "")
                    .replaceFirst("\\s*```$", "")
                    .trim();
        }

        int arrayStart = normalized.indexOf('[');
        int objectStart = normalized.indexOf('{');
        int startIndex;
        char openingChar;
        char closingChar;

        if (arrayStart == -1 && objectStart == -1) {
            return normalized;
        }

        if (arrayStart != -1 && (objectStart == -1 || arrayStart < objectStart)) {
            startIndex = arrayStart;
            openingChar = '[';
            closingChar = ']';
        } else {
            startIndex = objectStart;
            openingChar = '{';
            closingChar = '}';
        }

        boolean inString = false;
        boolean escaped = false;
        int depth = 0;
        for (int index = startIndex; index < normalized.length(); index++) {
            char current = normalized.charAt(index);

            if (escaped) {
                escaped = false;
                continue;
            }

            if (current == '\\') {
                escaped = true;
                continue;
            }

            if (current == '"') {
                inString = !inString;
                continue;
            }

            if (inString) {
                continue;
            }

            if (current == openingChar) {
                depth++;
            } else if (current == closingChar) {
                depth--;
                if (depth == 0) {
                    return normalized.substring(startIndex, index + 1).trim();
                }
            }
        }

        return normalized.substring(startIndex).trim();
    }
}
