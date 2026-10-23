package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.learnsphere.common.annotation.AdminOperation;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.ExamRecord;
import com.learnsphere.entity.MockExam;
import com.learnsphere.service.IExamRecordService;
import com.learnsphere.service.IMockExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import cn.hutool.json.JSONUtil;
import com.learnsphere.util.ExamTypeSupport;
import lombok.Data;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Mock Exam Controller
 */
@RestController
@RequestMapping("/api/admin/exams")
@SaCheckRole("admin")
public class AdminExamController {

    @Autowired
    private IMockExamService mockExamService;

    @Autowired
    private IExamRecordService examRecordService;

    /**
     * Get exam list
     */
    @GetMapping
    public Result<?> getExamList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String examType) {

        Page<MockExam> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<MockExam> query = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.like(MockExam::getTitle, keyword);
        }

        if (examType != null && !examType.isEmpty()) {
            query.eq(MockExam::getExamType, examType);
        }

        query.orderByDesc(MockExam::getCreateTime);
        Page<MockExam> result = mockExamService.page(pageParam, query);

        // 动校准参与人数（从真实试记录表中统，确保数捇硧）
        if (result.getRecords() != null && !result.getRecords().isEmpty()) {
            for (MockExam exam : result.getRecords()) {
                long actualCount = examRecordService.count(
                        new LambdaQueryWrapper<ExamRecord>().eq(ExamRecord::getExamId, exam.getId()));
                exam.setParticipants((int) actualCount);
            }
        }

        return Result.success(result);
    }

    /**
     * 新建试卷（手工录入题目）
     */
    @PostMapping
    @AdminOperation(module = "试卷管理", action = "新建试卷")
    public Result<?> createExam(@RequestBody ExamRequest request) {
        String error = validate(request);
        if (error != null) {
            return Result.error(error);
        }
        MockExam exam = new MockExam();
        apply(exam, request);
        exam.setParticipants(0);
        mockExamService.save(exam);
        return Result.success(Map.of("id", exam.getId()));
    }

    /**
     * 编辑试卷（标题、类型、时长、难度、题目）
     */
    @PutMapping("/{id}")
    @AdminOperation(module = "试卷管理", action = "编辑试卷")
    public Result<?> updateExam(@PathVariable Long id, @RequestBody ExamRequest request) {
        MockExam exam = mockExamService.getById(id);
        if (exam == null) {
            return Result.error("试卷不存在");
        }
        String error = validate(request);
        if (error != null) {
            return Result.error(error);
        }
        apply(exam, request);
        mockExamService.updateById(exam);
        return Result.success("已保存");
    }

    private String validate(ExamRequest request) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            return "请填写试卷标题";
        }
        if (request.getTitle().trim().length() > 200) {
            return "标题不能超过 200 字";
        }
        if (!ExamTypeSupport.isSupported(request.getExamType())) {
            return "请选择有效的考试类型";
        }
        if (request.getDuration() == null || request.getDuration() < 1 || request.getDuration() > 600) {
            return "考试时长需在 1-600 分钟之间";
        }
        if (request.getDifficulty() != null && (request.getDifficulty() < 1 || request.getDifficulty() > 5)) {
            return "难度需在 1-5 之间";
        }
        List<Map<String, Object>> questions = request.getQuestions();
        if (questions == null || questions.isEmpty()) {
            return "至少需要一道题目";
        }
        for (int i = 0; i < questions.size(); i++) {
            Map<String, Object> q = questions.get(i);
            Object text = q.get("text");
            if (text == null || text.toString().isBlank()) {
                return "第 " + (i + 1) + " 题缺少题干";
            }
            Object options = q.get("options");
            Object correct = q.get("correct");
            if (options instanceof List<?> list && !list.isEmpty() && correct != null) {
                int index;
                try {
                    index = Integer.parseInt(correct.toString());
                } catch (NumberFormatException e) {
                    return "第 " + (i + 1) + " 题正确答案格式不正确";
                }
                if (index < 0 || index >= list.size()) {
                    return "第 " + (i + 1) + " 题正确答案超出选项范围";
                }
            }
        }
        return null;
    }

    private void apply(MockExam exam, ExamRequest request) {
        exam.setTitle(request.getTitle().trim());
        exam.setExamType(ExamTypeSupport.normalize(request.getExamType()));
        exam.setDuration(request.getDuration());
        exam.setDifficulty(request.getDifficulty() == null ? 3 : request.getDifficulty());
        // 题号按顺序重排，保证与判分时的下标一致
        List<Map<String, Object>> questions = new ArrayList<>();
        int no = 1;
        for (Map<String, Object> q : request.getQuestions()) {
            Map<String, Object> copy = new LinkedHashMap<>(q);
            copy.put("id", no++);
            questions.add(copy);
        }
        exam.setTotalQuestions(questions.size());
        exam.setQuestions(JSONUtil.toJsonStr(questions));
    }

    @Data
    public static class ExamRequest {
        private String title;
        private String examType;
        private Integer duration;
        private Integer difficulty;
        private List<Map<String, Object>> questions;
    }

    /**
     * Delete exam
     */
    @DeleteMapping("/{id}")
    @AdminOperation(module = "试卷管理", action = "删除试卷")
    public Result<?> deleteExam(@PathVariable Long id) {
        mockExamService.removeById(id);
        return Result.success("Exam deleted");
    }

    /**
     * Get exam details (with questions)
     */
    @GetMapping("/{id}")
    public Result<?> getExamDetail(@PathVariable Long id) {
        return Result.success(mockExamService.getExamDetailOnly(id));
    }

    /**
     * Get exam records (User attempts)
     */
    @GetMapping("/records")
    public Result<?> getExamRecords(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long examId) {

        Page<ExamRecord> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<ExamRecord> query = new LambdaQueryWrapper<>();

        if (userId != null)
            query.eq(ExamRecord::getUserId, userId);
        if (examId != null)
            query.eq(ExamRecord::getExamId, examId);

        query.orderByDesc(ExamRecord::getCreateTime);
        Page<ExamRecord> result = examRecordService.page(pageParam, query);

        return Result.success(result);
    }
}
