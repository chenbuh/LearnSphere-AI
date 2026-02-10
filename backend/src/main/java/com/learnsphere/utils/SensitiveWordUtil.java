package com.learnsphere.utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 敏感词过滤工具类 (DFA 算法)
 * 高性能、低冲突，用于 AI 请求与响应的合规性校验。
 */
public class SensitiveWordUtil {

    private static Map<Object, Object> sensitiveWordMap;
    public static int minMatchTYpe = 1; // 最小匹配规则
    public static int maxMatchType = 2; // 最大匹配规则

    /**
     * 初始化敏感词库
     */
    public static synchronized void init(List<String> sensitiveWords) {
        sensitiveWordMap = new HashMap<>(sensitiveWords.size());
        for (String word : sensitiveWords) {
            Map nowMap = sensitiveWordMap;
            for (int i = 0; i < word.length(); i++) {
                char keyChar = word.charAt(i);
                Object wordMap = nowMap.get(keyChar);

                if (wordMap != null) {
                    nowMap = (Map) wordMap;
                } else {
                    Map<String, String> newPMap = new HashMap<>();
                    newPMap.put("isEnd", "0");
                    nowMap.put(keyChar, newPMap);
                    nowMap = newPMap;
                }

                if (i == word.length() - 1) {
                    nowMap.put("isEnd", "1");
                }
            }
        }
    }

    /**
     * 判断是否包含敏感词
     */
    public static boolean contains(String txt, int matchType) {
        if (sensitiveWordMap == null)
            return false;
        for (int i = 0; i < txt.length(); i++) {
            int matchFlag = checkSensitiveWord(txt, i, matchType);
            if (matchFlag > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取第一个匹配到的敏感词
     */
    public static String getFirstMatchedWord(String txt, int matchType) {
        if (sensitiveWordMap == null)
            return null;
        for (int i = 0; i < txt.length(); i++) {
            int matchFlag = checkSensitiveWord(txt, i, matchType);
            if (matchFlag > 0) {
                return txt.substring(i, i + matchFlag);
            }
        }
        return null;
    }

    /**
     * 检查敏感词长度
     */
    private static int checkSensitiveWord(String txt, int beginIndex, int matchType) {
        boolean flag = false;
        int matchFlag = 0;
        char word;
        Map nowMap = sensitiveWordMap;
        for (int i = beginIndex; i < txt.length(); i++) {
            word = txt.charAt(i);
            nowMap = (Map) nowMap.get(word);
            if (nowMap != null) {
                matchFlag++;
                if ("1".equals(nowMap.get("isEnd"))) {
                    flag = true;
                    if (SensitiveWordUtil.minMatchTYpe == matchType) {
                        break;
                    }
                }
            } else {
                break;
            }
        }
        if (matchFlag < 2 && !flag) {
            matchFlag = 0;
        }
        return flag ? matchFlag : 0;
    }
}
