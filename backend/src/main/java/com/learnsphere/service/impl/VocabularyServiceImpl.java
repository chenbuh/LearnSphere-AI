package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.mapper.VocabularyMapper;

import com.learnsphere.service.IVocabularyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import java.util.Arrays;

/**
 * 词汇服务
 */
@Slf4j
@Service
public class VocabularyServiceImpl extends ServiceImpl<VocabularyMapper, Vocabulary> implements IVocabularyService {

    @Value("${ai.api-key:}")
    private String apiKey;

    @Value("${ai.model:qwen-plus}")
    private String modelName;

    /**
     * 分页查询词汇列表
     * 支持多条件组合筛选：
     * 1. 考试类型 (cet4/cet6...)
     * 2. 难度等级 (1-5)
     * 3. 关键词模糊搜索 (匹配单词或释义)
     * 结果默认按词频降序排列。
     */
    @Override
    public Page<Vocabulary> getVocabularyList(Integer page, Integer pageSize, String examType, Integer difficulty,
            String keyword) {
        Page<Vocabulary> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<Vocabulary> wrapper = new LambdaQueryWrapper<>();

        // 考试类型筛选
        if (examType != null && !examType.isEmpty()) {
            wrapper.eq(Vocabulary::getExamType, examType);
        }

        // 难度筛选
        if (difficulty != null) {
            wrapper.eq(Vocabulary::getDifficulty, difficulty);
        }

        // 关键词搜索
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Vocabulary::getWord, keyword)
                    .or().like(Vocabulary::getTranslation, keyword));
        }

        // 按词频降序排序
        wrapper.orderByDesc(Vocabulary::getFrequency);

        return this.page(pageParam, wrapper);
    }

    /**
     * 获取每日推荐单词
     * 逻辑：
     * 根据指定的考试类型，优先推荐高频词汇 (Frequency 高 -> 低)。
     * 用于首页展示或每日打卡学习。
     */
    @Override
    public Page<Vocabulary> getDailyWords(String examType, Integer count) {
        Page<Vocabulary> pageParam = new Page<>(1, count);
        LambdaQueryWrapper<Vocabulary> wrapper = new LambdaQueryWrapper<>();

        if (examType != null && !examType.isEmpty()) {
            wrapper.eq(Vocabulary::getExamType, examType);
        }

        // 按频率降序排序获取高频词
        wrapper.orderByDesc(Vocabulary::getFrequency);

        return this.page(pageParam, wrapper);
    }

    /**
     * 获取单词详情
     */
    @Override
    public Vocabulary getVocabularyDetail(Long id) {
        Vocabulary vocabulary = this.getById(id);
        if (vocabulary == null) {
            throw new BusinessException("词汇不存在");
        }
        return vocabulary;
    }

    /**
     * 利用 AI 生成单词详情
     * 当本地数据库缺乏某个单词的详细信息（如例句、音标）时调用此方法。
     * 直接请求大模型返回特定 JSON 结构的单次解析。
     *
     * @param word 目标单词
     * @return 填充好的 Vocabulary 对象（未持久化）
     */
    @Override
    public Vocabulary generateVocabularyDetails(String word) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new BusinessException("AI API Key not configured");
        }

        String prompt = String.format("Please generate detailed information for the English word '%s' in JSON format. "
                +
                "The JSON should include: " +
                "phonetic (IPA), definition (English), translation (Chinese), example (English sentence), exampleTranslation (Chinese translation of the example), "
                +
                "difficulty (1-5 integer), frequency (1-100 integer). " +
                "Do not include any other text.", word);

        try {
            Generation gen = new Generation();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content(prompt).build();
            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model(modelName)
                    .messages(Arrays.asList(userMsg))
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .build();

            GenerationResult result = gen.call(param);
            String content = result.getOutput().getChoices().get(0).getMessage().getContent();

            // Cleanup markdown
            if (content.startsWith("```")) {
                content = content.replaceAll("^```(json)?\\n?", "").replaceAll("\\n?```$", "");
            }

            JSONObject json = JSONUtil.parseObj(content);
            Vocabulary vocab = new Vocabulary();
            vocab.setWord(word);
            vocab.setPhonetic(json.getStr("phonetic"));
            vocab.setDefinition(json.getStr("definition"));
            vocab.setTranslation(json.getStr("translation"));
            vocab.setExample(json.getStr("example"));
            vocab.setExampleTranslation(json.getStr("exampleTranslation"));
            vocab.setDifficulty(json.getInt("difficulty", 3));
            vocab.setFrequency(json.getInt("frequency", 50));
            vocab.setExamType("cet4");

            return vocab;
        } catch (Exception e) {
            log.error("AI generation failed for word: " + word, e);
            throw new BusinessException("AI generation failed: " + e.getMessage());
        }
    }
}
