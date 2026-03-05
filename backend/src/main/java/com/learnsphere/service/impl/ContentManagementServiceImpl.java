package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.learnsphere.dto.ContentHeatAnalysisDTO;
import com.learnsphere.dto.ContentQualityCheckDTO;
import com.learnsphere.entity.GrammarExercise;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.entity.ListeningMaterial;
import com.learnsphere.entity.ReadingArticle;
import com.learnsphere.entity.SpeakingTopic;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.entity.VocabularyMastery;
import com.learnsphere.entity.WritingTopic;
import com.learnsphere.mapper.LearningRecordMapper;
import com.learnsphere.mapper.SensitiveWordMapper;
import com.learnsphere.mapper.VocabularyMasteryMapper;
import com.learnsphere.service.IContentManagementService;
import com.learnsphere.service.IGrammarExerciseService;
import com.learnsphere.service.IListeningMaterialService;
import com.learnsphere.service.IReadingArticleService;
import com.learnsphere.service.ISpeakingTopicService;
import com.learnsphere.service.IVocabularyService;
import com.learnsphere.service.IWritingTopicService;
import com.learnsphere.utils.SensitiveWordFilter;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * Content management service implementation.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ContentManagementServiceImpl implements IContentManagementService {

    private static final String GENERAL_TYPE = "general";
    private static final int DEFAULT_HOT_LIMIT = 10;
    private static final int MAX_HOT_LIMIT = 50;

    private final SensitiveWordMapper sensitiveWordMapper;
    private final LearningRecordMapper learningRecordMapper;
    private final VocabularyMasteryMapper vocabularyMasteryMapper;
    private final IVocabularyService vocabularyService;
    private final IReadingArticleService readingArticleService;
    private final IListeningMaterialService listeningMaterialService;
    private final IWritingTopicService writingTopicService;
    private final IGrammarExerciseService grammarExerciseService;
    private final ISpeakingTopicService speakingTopicService;

    private final SensitiveWordFilter sensitiveWordFilter = new SensitiveWordFilter();

    @Override
    public void reloadSensitiveWords() {
        init();
        log.info("Sensitive words dictionary reloaded manually.");
    }

    @PostConstruct
    public void init() {
        Set<String> sensitiveWords = new HashSet<>();
        sensitiveWords.add("violence");
        sensitiveWords.add("porn");
        sensitiveWords.add("gambling");
        sensitiveWords.add("drug");
        sensitiveWords.add("terror");

        try {
            sensitiveWordMapper.selectList(null).forEach(sw -> sensitiveWords.add(sw.getWord()));
        } catch (Exception e) {
            log.warn("Failed to load sensitive words from DB: {}", e.getMessage());
        }

        sensitiveWordFilter.init(sensitiveWords);
    }

    @Override
    public ContentQualityCheckDTO checkContentQuality(String content, String contentType) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be empty");
        }

        ContentQualityCheckDTO result = new ContentQualityCheckDTO();
        List<ContentQualityCheckDTO.Issue> issues = new ArrayList<>();

        List<Map<String, Object>> sensitiveWords = sensitiveWordFilter.findAll(content);
        for (Map<String, Object> item : sensitiveWords) {
            ContentQualityCheckDTO.Issue issue = new ContentQualityCheckDTO.Issue();
            issue.setType("sensitive");
            issue.setSeverity("high");
            issue.setMessage("Sensitive word detected: " + item.get("word"));
            issue.setPosition((Integer) item.get("position"));
            issue.setSuggestion("Please remove or rewrite this part.");
            issue.setOriginalText((String) item.get("word"));
            issues.add(issue);
        }

        if (content.length() < 10) {
            ContentQualityCheckDTO.Issue issue = new ContentQualityCheckDTO.Issue();
            issue.setType("format");
            issue.setSeverity("medium");
            issue.setMessage("Content is too short, at least 10 characters is recommended.");
            issue.setPosition(0);
            issue.setSuggestion("Please add more details.");
            issues.add(issue);
        }

        Map<String, String> commonErrors = getCommonSpellingErrors();
        for (Map.Entry<String, String> entry : commonErrors.entrySet()) {
            if (content.contains(entry.getKey())) {
                int position = content.indexOf(entry.getKey());
                ContentQualityCheckDTO.Issue issue = new ContentQualityCheckDTO.Issue();
                issue.setType("spelling");
                issue.setSeverity("low");
                issue.setMessage("Possible typo: '" + entry.getKey() + "' should be '" + entry.getValue() + "'");
                issue.setPosition(position);
                issue.setSuggestion(entry.getValue());
                issue.setOriginalText(entry.getKey());
                issues.add(issue);
            }
        }

        if (content.contains(",,") || content.contains("..") || content.contains("!!")) {
            ContentQualityCheckDTO.Issue issue = new ContentQualityCheckDTO.Issue();
            issue.setType("format");
            issue.setSeverity("low");
            issue.setMessage("Repeated punctuation detected.");
            issue.setPosition(0);
            issue.setSuggestion("Please review punctuation marks.");
            issues.add(issue);
        }

        int score = calculateQualityScore(content, issues);

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("wordCount", content.length());
        statistics.put("issueCount", issues.size());

        result.setIssues(issues);
        result.setScore(score);
        result.setPassed(score >= 60 && issues.stream().noneMatch(i -> "high".equals(i.getSeverity())));
        result.setStatistics(statistics);

        return result;
    }

    @Override
    @Cacheable(cacheNames = "contentHeatAnalysis", key = "#contentType + ':' + #contentId", unless = "#result == null")
    public ContentHeatAnalysisDTO getContentHeatAnalysis(Long contentId, String contentType) {
        String normalizedType = normalizeContentType(contentType);

        ContentHeatAnalysisDTO result = new ContentHeatAnalysisDTO();
        result.setContentId(contentId);
        result.setContentType(normalizedType);
        result.setTitle(resolveContentTitle(contentId, normalizedType));

        long viewCount = countViewRecords(contentId, normalizedType);
        long completeCount = countCompletedRecords(contentId, normalizedType);
        long favoriteCount = countFavoriteRecords(contentId, normalizedType);

        result.setViewCount(viewCount);
        result.setCompleteCount(completeCount);
        result.setFavoriteCount(favoriteCount);
        result.setCompleteRate(calculateRate(completeCount, viewCount));
        result.setFavoriteRate(calculateRate(favoriteCount, viewCount));
        result.setRank(calculateRank(normalizedType, viewCount));
        result.setTrend(buildTrendData(contentId, normalizedType));

        return result;
    }

    @Override
    @Cacheable(cacheNames = "contentHotList", key = "#contentType + ':' + #orderBy + ':' + #limit", unless = "#result == null")
    public List<ContentHeatAnalysisDTO> getHotContentList(String contentType, String orderBy, Integer limit) {
        String normalizedType = normalizeContentType(contentType);
        int effectiveLimit = normalizeLimit(limit);

        List<ContentHeatAnalysisDTO> result = aggregateHotContent(normalizedType);
        sortHotList(result, orderBy);

        if (result.size() > effectiveLimit) {
            result = new ArrayList<>(result.subList(0, effectiveLimit));
        }

        for (int i = 0; i < result.size(); i++) {
            result.get(i).setRank(i + 1);
        }

        return result;
    }

    private List<ContentHeatAnalysisDTO> aggregateHotContent(String contentType) {
        QueryWrapper<LearningRecord> query = new QueryWrapper<>();
        query.eq("deleted", 0)
                .select(
                        "content_id as contentId",
                        "content_type as contentType",
                        "COUNT(*) as viewCount",
                        "SUM(CASE WHEN score IS NOT NULL THEN 1 ELSE 0 END) as completeCount")
                .groupBy("content_id", "content_type");

        if (!GENERAL_TYPE.equals(contentType)) {
            query.eq("content_type", contentType);
        }

        List<Map<String, Object>> rows = learningRecordMapper.selectMaps(query);
        List<ContentHeatAnalysisDTO> result = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            Long contentId = toLong(row.get("contentId"));
            if (contentId == null) {
                continue;
            }

            String rowType = Objects.toString(row.get("contentType"), contentType);
            long viewCount = toLong(row.get("viewCount"), 0L);
            long completeCount = toLong(row.get("completeCount"), 0L);
            long favoriteCount = countFavoriteRecords(contentId, rowType);

            ContentHeatAnalysisDTO dto = new ContentHeatAnalysisDTO();
            dto.setContentId(contentId);
            dto.setContentType(rowType);
            dto.setTitle(resolveContentTitle(contentId, rowType));
            dto.setViewCount(viewCount);
            dto.setCompleteCount(completeCount);
            dto.setFavoriteCount(favoriteCount);
            dto.setCompleteRate(calculateRate(completeCount, viewCount));
            dto.setFavoriteRate(calculateRate(favoriteCount, viewCount));
            dto.setTrend(new ArrayList<>());
            result.add(dto);
        }

        return result;
    }

    private void sortHotList(List<ContentHeatAnalysisDTO> result, String orderBy) {
        String normalizedOrderBy = orderBy == null ? "viewcount" : orderBy.toLowerCase(Locale.ROOT);
        result.sort((a, b) -> {
            int primary;
            switch (normalizedOrderBy) {
                case "completerate":
                    primary = compareDoubleDesc(a.getCompleteRate(), b.getCompleteRate());
                    break;
                case "favoriterate":
                    primary = compareDoubleDesc(a.getFavoriteRate(), b.getFavoriteRate());
                    break;
                case "completecount":
                    primary = compareLongDesc(a.getCompleteCount(), b.getCompleteCount());
                    break;
                case "favoritecount":
                    primary = compareLongDesc(a.getFavoriteCount(), b.getFavoriteCount());
                    break;
                default:
                    primary = compareLongDesc(a.getViewCount(), b.getViewCount());
                    break;
            }

            if (primary != 0) {
                return primary;
            }

            int byView = compareLongDesc(a.getViewCount(), b.getViewCount());
            if (byView != 0) {
                return byView;
            }

            return compareLongAsc(a.getContentId(), b.getContentId());
        });
    }

    private long countViewRecords(Long contentId, String contentType) {
        QueryWrapper<LearningRecord> query = buildBaseRecordQuery(contentId, contentType);
        return learningRecordMapper.selectCount(query);
    }

    private long countCompletedRecords(Long contentId, String contentType) {
        QueryWrapper<LearningRecord> query = buildBaseRecordQuery(contentId, contentType);
        query.isNotNull("score");
        return learningRecordMapper.selectCount(query);
    }

    private long countFavoriteRecords(Long contentId, String contentType) {
        if (!"vocabulary".equalsIgnoreCase(contentType)) {
            return 0L;
        }

        QueryWrapper<VocabularyMastery> query = new QueryWrapper<>();
        query.eq("deleted", 0)
                .eq("vocabulary_id", contentId)
                .eq("is_favorite", 1);
        return vocabularyMasteryMapper.selectCount(query);
    }

    private int calculateRank(String contentType, long currentViewCount) {
        if (currentViewCount <= 0) {
            return 0;
        }

        QueryWrapper<LearningRecord> query = new QueryWrapper<>();
        query.eq("deleted", 0)
                .select("content_id")
                .groupBy("content_id")
                .having("COUNT(*) > {0}", currentViewCount);

        if (!GENERAL_TYPE.equals(contentType)) {
            query.eq("content_type", contentType);
        }

        int higherCount = learningRecordMapper.selectMaps(query).size();
        return higherCount + 1;
    }

    private List<ContentHeatAnalysisDTO.TrendData> buildTrendData(Long contentId, String contentType) {
        QueryWrapper<LearningRecord> query = new QueryWrapper<>();
        query.eq("deleted", 0)
                .eq("content_id", contentId)
                .ge("create_time", LocalDate.now().minusDays(6).atStartOfDay())
                .select(
                        "DATE(create_time) as date",
                        "COUNT(*) as views",
                        "SUM(CASE WHEN score IS NOT NULL THEN 1 ELSE 0 END) as completes")
                .groupBy("DATE(create_time)");

        if (!GENERAL_TYPE.equals(contentType)) {
            query.eq("content_type", contentType);
        }

        List<Map<String, Object>> rows = learningRecordMapper.selectMaps(query);
        Map<String, Map<String, Object>> rowMap = new HashMap<>();
        for (Map<String, Object> row : rows) {
            rowMap.put(Objects.toString(row.get("date"), ""), row);
        }

        List<ContentHeatAnalysisDTO.TrendData> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String date = LocalDate.now().minusDays(i).toString();
            Map<String, Object> row = rowMap.getOrDefault(date, new LinkedHashMap<>());

            ContentHeatAnalysisDTO.TrendData item = new ContentHeatAnalysisDTO.TrendData();
            item.setDate(date);
            item.setViews(toLong(row.get("views"), 0L));
            item.setCompletes(toLong(row.get("completes"), 0L));
            item.setFavorites(0L);
            trend.add(item);
        }

        return trend;
    }

    private QueryWrapper<LearningRecord> buildBaseRecordQuery(Long contentId, String contentType) {
        QueryWrapper<LearningRecord> query = new QueryWrapper<>();
        query.eq("deleted", 0)
                .eq("content_id", contentId);

        if (!GENERAL_TYPE.equals(contentType)) {
            query.eq("content_type", contentType);
        }

        return query;
    }

    private String resolveContentTitle(Long contentId, String contentType) {
        try {
            switch (contentType) {
                case "vocabulary": {
                    Vocabulary vocabulary = vocabularyService.getById(contentId);
                    return vocabulary != null ? vocabulary.getWord() : "Vocabulary #" + contentId;
                }
                case "reading": {
                    ReadingArticle article = readingArticleService.getById(contentId);
                    return article != null ? article.getTitle() : "Reading #" + contentId;
                }
                case "listening": {
                    ListeningMaterial material = listeningMaterialService.getById(contentId);
                    return material != null ? material.getTitle() : "Listening #" + contentId;
                }
                case "grammar": {
                    GrammarExercise exercise = grammarExerciseService.getById(contentId);
                    return exercise != null ? exercise.getTopic() : "Grammar #" + contentId;
                }
                case "speaking": {
                    SpeakingTopic topic = speakingTopicService.getById(contentId);
                    return topic != null ? topic.getTitle() : "Speaking #" + contentId;
                }
                case "writing": {
                    WritingTopic topic = writingTopicService.getById(contentId);
                    return topic != null ? topic.getTitle() : "Writing #" + contentId;
                }
                default:
                    return "Content #" + contentId;
            }
        } catch (Exception e) {
            log.warn("Failed to resolve content title. contentId={}, contentType={}", contentId, contentType, e);
            return "Content #" + contentId;
        }
    }

    private int normalizeLimit(Integer limit) {
        if (limit == null || limit <= 0) {
            return DEFAULT_HOT_LIMIT;
        }
        return Math.min(limit, MAX_HOT_LIMIT);
    }

    private String normalizeContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return GENERAL_TYPE;
        }
        return contentType.toLowerCase(Locale.ROOT);
    }

    private Double calculateRate(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0D;
        }
        return Math.round((numerator * 10000.0 / denominator)) / 100.0;
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private long toLong(Object value, long defaultValue) {
        Long parsed = toLong(value);
        return parsed == null ? defaultValue : parsed;
    }

    private int compareLongDesc(Long a, Long b) {
        long left = a == null ? 0L : a;
        long right = b == null ? 0L : b;
        return Long.compare(right, left);
    }

    private int compareLongAsc(Long a, Long b) {
        long left = a == null ? Long.MAX_VALUE : a;
        long right = b == null ? Long.MAX_VALUE : b;
        return Long.compare(left, right);
    }

    private int compareDoubleDesc(Double a, Double b) {
        double left = a == null ? 0D : a;
        double right = b == null ? 0D : b;
        return Double.compare(right, left);
    }

    private int calculateQualityScore(String content, List<ContentQualityCheckDTO.Issue> issues) {
        int baseScore = 100;

        for (ContentQualityCheckDTO.Issue issue : issues) {
            switch (issue.getSeverity()) {
                case "high":
                    baseScore -= 30;
                    break;
                case "medium":
                    baseScore -= 15;
                    break;
                case "low":
                    baseScore -= 5;
                    break;
                default:
                    break;
            }
        }

        if (content.length() > 100) {
            baseScore += 5;
        }

        return Math.max(0, Math.min(100, baseScore));
    }

    private Map<String, String> getCommonSpellingErrors() {
        Map<String, String> errors = new HashMap<>();
        errors.put("recieve", "receive");
        errors.put("occured", "occurred");
        errors.put("seperate", "separate");
        errors.put("definately", "definitely");
        errors.put("accomodate", "accommodate");
        errors.put("de de de", "Check the correct use of Chinese particles.");
        return errors;
    }
}
