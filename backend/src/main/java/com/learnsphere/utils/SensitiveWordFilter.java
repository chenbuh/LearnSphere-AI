package com.learnsphere.utils;

import java.util.*;

/**
 * 敏感词过滤器 (DFA算法实现)
 * 用于快速检测文本中的敏感词
 */
public class SensitiveWordFilter {

    /**
     * 敏感词库（DFA树）
     */
    private Map<String, Object> wordMap = new HashMap<>();

    /**
     * 结束标志
     */
    private static final String END_FLAG = "isEnd";

    /**
     * 初始化敏感词库
     * 
     * @param sensitiveWords 敏感词列表
     */
    public void init(Set<String> sensitiveWords) {
        if (sensitiveWords == null || sensitiveWords.isEmpty()) {
            return;
        }

        for (String word : sensitiveWords) {
            if (word == null || word.trim().isEmpty()) {
                continue;
            }
            addWord(word.trim());
        }
    }

    /**
     * 添加敏感词到DFA树
     */
    private void addWord(String word) {
        Map<String, Object> currentMap = wordMap;

        for (int i = 0; i < word.length(); i++) {
            String key = String.valueOf(word.charAt(i));

            @SuppressWarnings("unchecked")
            Map<String, Object> tempMap = (Map<String, Object>) currentMap.get(key);

            if (tempMap == null) {
                tempMap = new HashMap<>();
                currentMap.put(key, tempMap);
            }

            currentMap = tempMap;

            // 最后一个字符，标记结束
            if (i == word.length() - 1) {
                currentMap.put(END_FLAG, true);
            }
        }
    }

    /**
     * 检查文本中是否包含敏感词
     * 
     * @param text 待检查文本
     * @return 是否包含敏感词
     */
    public boolean contains(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }

        for (int i = 0; i < text.length(); i++) {
            int matchLength = checkWord(text, i);
            if (matchLength > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * 获取文本中所有敏感词及其位置
     * 
     * @param text 待检查文本
     * @return 敏感词列表 [{"word": "xxx", "position": 10}]
     */
    public List<Map<String, Object>> findAll(String text) {
        List<Map<String, Object>> result = new ArrayList<>();

        if (text == null || text.trim().isEmpty()) {
            return result;
        }

        for (int i = 0; i < text.length(); i++) {
            int matchLength = checkWord(text, i);
            if (matchLength > 0) {
                String word = text.substring(i, i + matchLength);
                Map<String, Object> item = new HashMap<>();
                item.put("word", word);
                item.put("position", i);
                result.add(item);

                // 跳过已匹配的字符
                i += matchLength - 1;
            }
        }

        return result;
    }

    /**
     * 替换敏感词为*号
     * 
     * @param text 待处理文本
     * @return 替换后的文本
     */
    public String replace(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < text.length(); i++) {
            int matchLength = checkWord(text, i);

            if (matchLength > 0) {
                // 替换为*号
                for (int j = 0; j < matchLength; j++) {
                    result.append("*");
                }
                i += matchLength - 1;
            } else {
                result.append(text.charAt(i));
            }
        }

        return result.toString();
    }

    /**
     * 检查从指定位置开始是否匹配敏感词
     * 
     * @param text       文本
     * @param beginIndex 开始位置
     * @return 匹配的敏感词长度，如果不匹配返回0
     */
    @SuppressWarnings("unchecked")
    private int checkWord(String text, int beginIndex) {
        int matchLength = 0;
        Map<String, Object> currentMap = wordMap;

        for (int i = beginIndex; i < text.length(); i++) {
            String key = String.valueOf(text.charAt(i));
            currentMap = (Map<String, Object>) currentMap.get(key);

            if (currentMap == null) {
                break;
            }

            matchLength++;

            // 找到结束标志，表示匹配到敏感词
            if (currentMap.get(END_FLAG) != null && (Boolean) currentMap.get(END_FLAG)) {
                return matchLength;
            }
        }

        return 0;
    }
}
