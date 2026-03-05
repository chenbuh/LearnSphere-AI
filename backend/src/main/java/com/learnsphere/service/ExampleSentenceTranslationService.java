package com.learnsphere.service;

import cn.hutool.core.util.StrUtil;
import cn.hutool.core.util.URLUtil;
import cn.hutool.http.HtmlUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Pattern;

/**
 * Example sentence translation service dedicated to EN -> ZH-CN.
 * This service does not rely on any Qwen model.
 */
@Slf4j
@Service
public class ExampleSentenceTranslationService {

    private static final Pattern CHINESE_PATTERN = Pattern.compile("[\\u4E00-\\u9FFF]");
    private static final Pattern ASCII_LETTER_PATTERN = Pattern.compile("[A-Za-z]");
    private static final String HTTP_UA = "LearnSphereAI/1.0";

    @Value("${translation.enabled:true}")
    private boolean translationEnabled;

    @Value("${translation.timeout-ms:7000}")
    private int timeoutMs;

    @Value("${translation.google-url:https://translate.googleapis.com/translate_a/single}")
    private String googleTranslateUrl;

    @Value("${translation.mymemory-url:https://api.mymemory.translated.net/get}")
    private String myMemoryUrl;

    private final Cache<String, String> cache = Caffeine.newBuilder()
            .maximumSize(5000)
            .expireAfterWrite(Duration.ofHours(12))
            .build();

    public String translateEnToZh(String text) {
        if (!translationEnabled || StrUtil.isBlank(text)) {
            return "";
        }
        String source = normalize(text);
        if (source.isEmpty()) {
            return "";
        }
        // Already Chinese text.
        if (containsChinese(source) && !containsAsciiLetters(source)) {
            return source;
        }

        String cached = cache.getIfPresent(source);
        if (StrUtil.isNotBlank(cached)) {
            return cached;
        }

        String translated = translateInternal(source);
        if (isUsableTranslation(translated, source)) {
            cache.put(source, translated);
            return translated;
        }

        return "";
    }

    private String translateInternal(String source) {
        try {
            String googleResult = translateWithGoogle(source);
            if (isUsableTranslation(googleResult, source)) {
                return googleResult;
            }
        } catch (Exception e) {
            log.debug("Google translate failed: {}", e.getMessage());
        }

        try {
            String myMemoryResult = translateWithMyMemory(source);
            if (isUsableTranslation(myMemoryResult, source)) {
                return myMemoryResult;
            }
        } catch (Exception e) {
            log.debug("MyMemory translate failed: {}", e.getMessage());
        }

        return "";
    }

    private String translateWithGoogle(String source) {
        String url = String.format(
                "%s?client=gtx&sl=en&tl=zh-CN&dt=t&q=%s",
                googleTranslateUrl,
                URLUtil.encode(source, StandardCharsets.UTF_8));

        String body = HttpRequest.get(url)
                .header("User-Agent", HTTP_UA)
                .timeout(timeoutMs)
                .execute()
                .body();

        if (!JSONUtil.isTypeJSONArray(body)) {
            return "";
        }

        JSONArray root = JSONUtil.parseArray(body);
        JSONArray firstLayer = root.getJSONArray(0);
        if (firstLayer == null || firstLayer.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        for (Object item : firstLayer) {
            if (item instanceof JSONArray arr) {
                String piece = arr.getStr(0);
                if (StrUtil.isNotBlank(piece)) {
                    sb.append(piece);
                }
            }
        }
        return normalizeTranslation(sb.toString());
    }

    private String translateWithMyMemory(String source) {
        String url = String.format(
                "%s?q=%s&langpair=en|zh-CN",
                myMemoryUrl,
                URLUtil.encode(source, StandardCharsets.UTF_8));

        String body = HttpRequest.get(url)
                .header("User-Agent", HTTP_UA)
                .timeout(timeoutMs)
                .execute()
                .body();

        if (!JSONUtil.isTypeJSONObject(body)) {
            return "";
        }

        JSONObject obj = JSONUtil.parseObj(body);
        String translated = obj.getByPath("responseData.translatedText", String.class);
        if (StrUtil.isNotBlank(translated)) {
            return normalizeTranslation(translated);
        }

        JSONArray matches = obj.getJSONArray("matches");
        if (matches == null || matches.isEmpty()) {
            return "";
        }

        String best = "";
        double bestScore = Double.NEGATIVE_INFINITY;
        for (Object matchObj : matches) {
            if (!(matchObj instanceof JSONObject match)) {
                continue;
            }
            String candidate = normalizeTranslation(match.getStr("translation"));
            if (StrUtil.isBlank(candidate)) {
                continue;
            }
            double quality = match.getDouble("quality", 0.0);
            if (quality > bestScore) {
                bestScore = quality;
                best = candidate;
            }
        }
        return best;
    }

    private String normalizeTranslation(String text) {
        if (StrUtil.isBlank(text)) {
            return "";
        }
        String unescaped = HtmlUtil.unescape(text);
        String normalized = normalize(unescaped);
        normalized = StrUtil.removePrefix(normalized, "\"");
        normalized = StrUtil.removeSuffix(normalized, "\"");
        return normalized;
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        return StrUtil.trim(text).replaceAll("\\s+", " ");
    }

    private boolean isUsableTranslation(String translated, String source) {
        if (StrUtil.isBlank(translated)) {
            return false;
        }
        if (translated.equalsIgnoreCase(source)) {
            return false;
        }
        return containsChinese(translated);
    }

    private boolean containsChinese(String text) {
        return CHINESE_PATTERN.matcher(text).find();
    }

    private boolean containsAsciiLetters(String text) {
        return ASCII_LETTER_PATTERN.matcher(text).find();
    }
}
