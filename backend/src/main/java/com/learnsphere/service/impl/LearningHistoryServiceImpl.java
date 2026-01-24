package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.entity.*;
import com.learnsphere.mapper.*;
import com.learnsphere.service.LearningHistoryService;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 学习历史服务实现
 */
@Service
public class LearningHistoryServiceImpl implements LearningHistoryService {

    @Autowired
    private ListeningMaterialMapper listeningMaterialMapper;

    @Autowired
    private ReadingArticleMapper readingArticleMapper;

    @Autowired
    private GrammarExerciseMapper grammarExerciseMapper;

    @Autowired
    private SpeakingTopicMapper speakingTopicMapper;

    @Autowired
    private WritingTopicMapper writingTopicMapper;

    @Autowired
    private LearningRecordMapper learningRecordMapper;

    @Override
    public Map<String, Object> getAnswerHistory(String module, int page, int size) {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> result = new HashMap<>();

        switch (module.toLowerCase()) {
            case "listening":
                Page<ListeningMaterial> listeningPage = new Page<>(page, size);
                LambdaQueryWrapper<ListeningMaterial> listeningWrapper = new LambdaQueryWrapper<>();
                listeningWrapper.eq(ListeningMaterial::getUserId, userId)
                        .orderByDesc(ListeningMaterial::getCreateTime);
                listeningMaterialMapper.selectPage(listeningPage, listeningWrapper);

                result.put("records", listeningPage.getRecords());
                result.put("total", listeningPage.getTotal());
                result.put("pages", listeningPage.getPages());
                break;

            case "reading":
                Page<ReadingArticle> readingPage = new Page<>(page, size);
                LambdaQueryWrapper<ReadingArticle> readingWrapper = new LambdaQueryWrapper<>();
                readingWrapper.eq(ReadingArticle::getUserId, userId)
                        .orderByDesc(ReadingArticle::getCreateTime);
                readingArticleMapper.selectPage(readingPage, readingWrapper);

                result.put("records", readingPage.getRecords());
                result.put("total", readingPage.getTotal());
                result.put("pages", readingPage.getPages());
                break;

            case "grammar":
                Page<GrammarExercise> grammarPage = new Page<>(page, size);
                LambdaQueryWrapper<GrammarExercise> grammarWrapper = new LambdaQueryWrapper<>();
                grammarWrapper.orderByDesc(GrammarExercise::getCreateTime);
                grammarExerciseMapper.selectPage(grammarPage, grammarWrapper);

                result.put("records", grammarPage.getRecords());
                result.put("total", grammarPage.getTotal());
                result.put("pages", grammarPage.getPages());
                break;

            case "speaking":
                Page<SpeakingTopic> speakingPage = new Page<>(page, size);
                LambdaQueryWrapper<SpeakingTopic> speakingWrapper = new LambdaQueryWrapper<>();
                speakingWrapper.orderByDesc(SpeakingTopic::getCreateTime);
                speakingTopicMapper.selectPage(speakingPage, speakingWrapper);

                result.put("records", speakingPage.getRecords());
                result.put("total", speakingPage.getTotal());
                result.put("pages", speakingPage.getPages());
                break;

            case "writing":
                Page<WritingTopic> writingPage = new Page<>(page, size);
                LambdaQueryWrapper<WritingTopic> writingWrapper = new LambdaQueryWrapper<>();
                writingWrapper.orderByDesc(WritingTopic::getCreateTime);
                writingTopicMapper.selectPage(writingPage, writingWrapper);

                result.put("records", writingPage.getRecords());
                result.put("total", writingPage.getTotal());
                result.put("pages", writingPage.getPages());
                break;

            default:
                result.put("records", new ArrayList<>());
                result.put("total", 0);
                result.put("pages", 0);
        }

        return result;
    }

    @Override
    public void saveAnswerRecord(LearningRecord record) {
        record.setUserId(StpUtil.getLoginIdAsLong());
        learningRecordMapper.insert(record);
    }

    @Override
    public Map<String, Object> getLearningStats() {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> stats = new HashMap<>();

        // 获取各模块的学习记录数量
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LearningRecord::getUserId, userId);
        List<LearningRecord> records = learningRecordMapper.selectList(wrapper);

        Map<String, Long> moduleStats = records.stream()
                .collect(Collectors.groupingBy(LearningRecord::getContentType, Collectors.counting()));

        stats.put("totalRecords", records.size());
        stats.put("moduleStats", moduleStats);

        // 计算平均分
        double avgScore = records.stream()
                .filter(r -> r.getScore() != null)
                .mapToInt(LearningRecord::getScore)
                .average()
                .orElse(0.0);
        stats.put("averageScore", avgScore);

        // 计算正确率
        long correctCount = records.stream()
                .filter(r -> r.getIsCorrect() != null && r.getIsCorrect() == 1)
                .count();
        double accuracy = records.isEmpty() ? 0 : (double) correctCount / records.size() * 100;
        stats.put("accuracy", accuracy);

        return stats;
    }
}
