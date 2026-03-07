package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.entity.GrammarExercise;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.entity.ListeningMaterial;
import com.learnsphere.entity.ReadingArticle;
import com.learnsphere.entity.SpeakingTopic;
import com.learnsphere.entity.WritingTopic;
import com.learnsphere.service.IGrammarExerciseService;
import com.learnsphere.service.ILearningRecordService;
import com.learnsphere.service.IListeningMaterialService;
import com.learnsphere.service.IReadingArticleService;
import com.learnsphere.service.ISpeakingTopicService;
import com.learnsphere.service.IWritingTopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * 管理后台学习内容控制器
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminLearningContentController {

    private final ILearningRecordService learningRecordService;
    private final IListeningMaterialService listeningMaterialService;
    private final IReadingArticleService readingArticleService;
    private final IWritingTopicService writingTopicService;
    private final IGrammarExerciseService grammarExerciseService;
    private final ISpeakingTopicService speakingTopicService;

    /**
     * 获取学习记录列表
     */
    @GetMapping("/learning-records")
    public Result<?> getLearningRecords(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String contentType) {

        Page<LearningRecord> pageParam = new Page<>(page, size);
        QueryWrapper<LearningRecord> query = new QueryWrapper<>();

        if (userId != null) {
            query.eq("user_id", userId);
        }
        if (contentType != null && !contentType.isEmpty()) {
            query.eq("content_type", contentType);
        }

        query.orderByDesc("create_time");
        Page<LearningRecord> result = learningRecordService.page(pageParam, query);
        return Result.success(result);
    }

    /**
     * 获取启动材料列表
     */
    @GetMapping("/listening")
    public Result<?> getListeningList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<ListeningMaterial> pageParam = new Page<>(page, size);
        QueryWrapper<ListeningMaterial> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<ListeningMaterial> result = listeningMaterialService.page(pageParam, query);
        return Result.success(result);
    }

    /**
     * 获取阅文章列表
     */
    @GetMapping("/reading")
    public Result<?> getReadingList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<ReadingArticle> pageParam = new Page<>(page, size);
        QueryWrapper<ReadingArticle> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<ReadingArticle> result = readingArticleService.page(pageParam, query);
        return Result.success(result);
    }

    /**
     * 添加阅文章
     */
    @PostMapping("/reading")
    @AdminOperation(module = "阅管理", action = "添加文章")
    public Result<?> addReading(@RequestBody ReadingArticle article) {
        article.setCreateTime(LocalDateTime.now());
        readingArticleService.save(article);
        return Result.success("添加成功");
    }

    /**
     * 更新阅文章
     */
    @PutMapping("/reading/{id}")
    @AdminOperation(module = "阅管理", action = "更新文章")
    public Result<?> updateReading(@PathVariable Long id, @RequestBody ReadingArticle article) {
        article.setId(id);
        readingArticleService.updateById(article);
        return Result.success("更新成功");
    }

    /**
     * 删除阅文章
     */
    @DeleteMapping("/reading/{id}")
    @AdminOperation(module = "阅管理", action = "删除文章")
    public Result<?> deleteReading(@PathVariable Long id) {
        readingArticleService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 添加启动材料
     */
    @PostMapping("/listening")
    @AdminOperation(module = "启动管理", action = "添加启动")
    public Result<?> addListening(@RequestBody ListeningMaterial material) {
        material.setCreateTime(LocalDateTime.now());
        listeningMaterialService.save(material);
        return Result.success("添加成功");
    }

    /**
     * 更新启动材料
     */
    @PutMapping("/listening/{id}")
    @AdminOperation(module = "启动管理", action = "更新启动")
    public Result<?> updateListening(@PathVariable Long id, @RequestBody ListeningMaterial material) {
        material.setId(id);
        listeningMaterialService.updateById(material);
        return Result.success("更新成功");
    }

    /**
     * 删除启动材料
     */
    @DeleteMapping("/listening/{id}")
    @AdminOperation(module = "启动管理", action = "删除启动")
    public Result<?> deleteListening(@PathVariable Long id) {
        listeningMaterialService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 获取写作话列表
     */
    @GetMapping("/writing")
    public Result<?> getWritingList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<WritingTopic> pageParam = new Page<>(page, size);
        QueryWrapper<WritingTopic> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<WritingTopic> result = writingTopicService.page(pageParam, query);
        return Result.success(result);
    }

    /**
     * 添加写作话
     */
    @PostMapping("/writing")
    @AdminOperation(module = "写作管理", action = "添加写作")
    public Result<?> addWriting(@RequestBody WritingTopic topic) {
        topic.setCreateTime(LocalDateTime.now());
        writingTopicService.save(topic);
        return Result.success("添加成功");
    }

    /**
     * 更新写作话
     */
    @PutMapping("/writing/{id}")
    @AdminOperation(module = "写作管理", action = "更新写作")
    public Result<?> updateWriting(@PathVariable Long id, @RequestBody WritingTopic topic) {
        topic.setId(id);
        writingTopicService.updateById(topic);
        return Result.success("更新成功");
    }

    /**
     * 删除写作话
     */
    @DeleteMapping("/writing/{id}")
    @AdminOperation(module = "写作管理", action = "删除写作")
    public Result<?> deleteWriting(@PathVariable Long id) {
        writingTopicService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 获取诳练习列表
     */
    @GetMapping("/grammar")
    public Result<?> getGrammarList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<GrammarExercise> pageParam = new Page<>(page, size);
        QueryWrapper<GrammarExercise> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<GrammarExercise> result = grammarExerciseService.page(pageParam, query);
        return Result.success(result);
    }

    /**
     * 添加诳练习
     */
    @PostMapping("/grammar")
    @AdminOperation(module = "诳管理", action = "添加练习")
    public Result<?> addGrammar(@RequestBody GrammarExercise exercise) {
        exercise.setCreateTime(LocalDateTime.now());
        grammarExerciseService.save(exercise);
        return Result.success("添加成功");
    }

    /**
     * 更新诳练习
     */
    @PutMapping("/grammar/{id}")
    @AdminOperation(module = "诳管理", action = "更新练习")
    public Result<?> updateGrammar(@PathVariable Long id, @RequestBody GrammarExercise exercise) {
        exercise.setId(id);
        grammarExerciseService.updateById(exercise);
        return Result.success("更新成功");
    }

    /**
     * 删除诳练习
     */
    @DeleteMapping("/grammar/{id}")
    @AdminOperation(module = "诳管理", action = "删除练习")
    public Result<?> deleteGrammar(@PathVariable Long id) {
        grammarExerciseService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 获取口话列表
     */
    @GetMapping("/speaking")
    public Result<?> getSpeakingList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<SpeakingTopic> pageParam = new Page<>(page, size);
        QueryWrapper<SpeakingTopic> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<SpeakingTopic> result = speakingTopicService.page(pageParam, query);
        return Result.success(result);
    }

    /**
     * 添加口话
     */
    @PostMapping("/speaking")
    @AdminOperation(module = "口管理", action = "添加话")
    public Result<?> addSpeaking(@RequestBody SpeakingTopic topic) {
        topic.setCreateTime(LocalDateTime.now());
        speakingTopicService.save(topic);
        return Result.success("添加成功");
    }

    /**
     * 更新口话
     */
    @PutMapping("/speaking/{id}")
    @AdminOperation(module = "口管理", action = "更新话")
    public Result<?> updateSpeaking(@PathVariable Long id, @RequestBody SpeakingTopic topic) {
        topic.setId(id);
        speakingTopicService.updateById(topic);
        return Result.success("更新成功");
    }

    /**
     * 删除口话
     */
    @DeleteMapping("/speaking/{id}")
    @AdminOperation(module = "口管理", action = "删除话")
    public Result<?> deleteSpeaking(@PathVariable Long id) {
        speakingTopicService.removeById(id);
        return Result.success("删除成功");
    }
}
