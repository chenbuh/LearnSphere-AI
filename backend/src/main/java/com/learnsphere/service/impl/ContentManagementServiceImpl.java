package com.learnsphere.service.impl;

import com.learnsphere.dto.ContentQualityCheckDTO;
import com.learnsphere.dto.ContentHeatAnalysisDTO;
import com.learnsphere.service.IContentManagementService;
import com.learnsphere.mapper.SensitiveWordMapper;
import lombok.extern.slf4j.Slf4j;
import com.learnsphere.utils.SensitiveWordFilter;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import jakarta.annotation.PostConstruct;
import java.util.*;

/**
 * 内容管理服务实现
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ContentManagementServiceImpl implements IContentManagementService {

    private final SensitiveWordMapper sensitiveWordMapper;

    private final SensitiveWordFilter sensitiveWordFilter = new SensitiveWordFilter();

    @Override
    public void reloadSensitiveWords() {
        init();
        log.info("Sensitive words dictionary reloaded manually.");
    }

    /**
     * 初始化敏感词库
     */
    @PostConstruct
    public void init() {
        // 初始化敏感词库（示例词汇）
        Set<String> sensitiveWords = new HashSet<>();
        sensitiveWords.add("暴力");
        sensitiveWords.add("色情");
        sensitiveWords.add("赌博");
        sensitiveWords.add("毒品");
        sensitiveWords.add("恐怖");
        // 从数据库加载额外的敏感词
        try {
            sensitiveWordMapper.selectList(null)
                    .forEach(sw -> sensitiveWords.add(sw.getWord()));
        } catch (Exception e) {
            log.warn("Failed to load sensitive words from DB: {}", e.getMessage());
        }

        sensitiveWordFilter.init(sensitiveWords);
    }

    @Override
    public ContentQualityCheckDTO checkContentQuality(String content, String contentType) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("内容不能为空");
        }

        ContentQualityCheckDTO result = new ContentQualityCheckDTO();
        List<ContentQualityCheckDTO.Issue> issues = new ArrayList<>();

        // 1. 敏感词检测
        List<Map<String, Object>> sensitiveWords = sensitiveWordFilter.findAll(content);
        for (Map<String, Object> item : sensitiveWords) {
            ContentQualityCheckDTO.Issue issue = new ContentQualityCheckDTO.Issue();
            issue.setType("sensitive");
            issue.setSeverity("high");
            issue.setMessage("检测到敏感词: " + item.get("word"));
            issue.setPosition((Integer) item.get("position"));
            issue.setSuggestion("请删除或修改此内容");
            issue.setOriginalText((String) item.get("word"));
            issues.add(issue);
        }

        // 2. 格式检查
        if (content.length() < 10) {
            ContentQualityCheckDTO.Issue issue = new ContentQualityCheckDTO.Issue();
            issue.setType("format");
            issue.setSeverity("medium");
            issue.setMessage("内容过短，建议至少10个字符");
            issue.setPosition(0);
            issue.setSuggestion("请补充更多内容");
            issues.add(issue);
        }

        // 3. 简单的拼写检查（检测常见错误）
        Map<String, String> commonErrors = getCommonSpellingErrors();
        for (Map.Entry<String, String> entry : commonErrors.entrySet()) {
            if (content.contains(entry.getKey())) {
                int position = content.indexOf(entry.getKey());
                ContentQualityCheckDTO.Issue issue = new ContentQualityCheckDTO.Issue();
                issue.setType("spelling");
                issue.setSeverity("low");
                issue.setMessage("可能的拼写错误: '" + entry.getKey() + "' 应为 '" + entry.getValue() + "'");
                issue.setPosition(position);
                issue.setSuggestion(entry.getValue());
                issue.setOriginalText(entry.getKey());
                issues.add(issue);
            }
        }

        // 4. 标点符号检查
        if (content.contains(",,") || content.contains("..") || content.contains("!!")) {
            ContentQualityCheckDTO.Issue issue = new ContentQualityCheckDTO.Issue();
            issue.setType("format");
            issue.setSeverity("low");
            issue.setMessage("检测到重复标点符号");
            issue.setPosition(0);
            issue.setSuggestion("请检查并修正标点符号");
            issues.add(issue);
        }

        // 计算评分
        int score = calculateQualityScore(content, issues);

        // 统计信息
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
    public ContentHeatAnalysisDTO getContentHeatAnalysis(Long contentId, String contentType) {
        // TODO: 从数据库查询实际数据
        // 这里返回模拟数据作为示例

        ContentHeatAnalysisDTO result = new ContentHeatAnalysisDTO();
        result.setContentId(contentId);
        result.setContentType(contentType);
        result.setTitle("示例内容 #" + contentId);

        // 模拟数据
        long viewCount = 1000 + new Random().nextInt(1000);
        long completeCount = (long) (viewCount * (0.5 + new Random().nextDouble() * 0.3));
        long favoriteCount = (long) (viewCount * (0.1 + new Random().nextDouble() * 0.2));

        result.setViewCount(viewCount);
        result.setCompleteCount(completeCount);
        result.setFavoriteCount(favoriteCount);
        result.setCompleteRate(completeCount * 100.0 / viewCount);
        result.setFavoriteRate(favoriteCount * 100.0 / viewCount);
        result.setRank(1);

        // 7天趋势数据
        List<ContentHeatAnalysisDTO.TrendData> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            ContentHeatAnalysisDTO.TrendData data = new ContentHeatAnalysisDTO.TrendData();
            data.setDate(java.time.LocalDate.now().minusDays(i).toString());
            data.setViews((long) (100 + new Random().nextInt(100)));
            data.setCompletes((long) (60 + new Random().nextInt(40)));
            data.setFavorites((long) (20 + new Random().nextInt(30)));
            trend.add(data);
        }
        result.setTrend(trend);

        return result;
    }

    @Override
    public List<ContentHeatAnalysisDTO> getHotContentList(String contentType, String orderBy, Integer limit) {
        // TODO: 从数据库查询实际数据
        // 这里返回模拟数据

        List<ContentHeatAnalysisDTO> result = new ArrayList<>();

        for (int i = 1; i <= (limit != null ? limit : 10); i++) {
            ContentHeatAnalysisDTO item = new ContentHeatAnalysisDTO();
            item.setContentId((long) i);
            item.setContentType(contentType);
            item.setTitle("热门内容 #" + i);

            long viewCount = 2000 - i * 100;
            long completeCount = (long) (viewCount * 0.7);
            long favoriteCount = (long) (viewCount * 0.25);

            item.setViewCount(viewCount);
            item.setCompleteCount(completeCount);
            item.setFavoriteCount(favoriteCount);
            item.setCompleteRate(completeCount * 100.0 / viewCount);
            item.setFavoriteRate(favoriteCount * 100.0 / viewCount);
            item.setRank(i);

            result.add(item);
        }

        return result;
    }

    /**
     * 计算内容质量评分
     */
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
            }
        }

        // 内容长度奖励
        if (content.length() > 100) {
            baseScore += 5;
        }

        return Math.max(0, Math.min(100, baseScore));
    }

    /**
     * 获取常见拼写错误映射
     */
    private Map<String, String> getCommonSpellingErrors() {
        Map<String, String> errors = new HashMap<>();
        // 英文常见错误
        errors.put("recieve", "receive");
        errors.put("occured", "occurred");
        errors.put("seperate", "separate");
        errors.put("definately", "definitely");
        errors.put("accomodate", "accommodate");
        // 中文常见错误
        errors.put("的地得", "的/地/得（请正确使用）");
        return errors;
    }
}
