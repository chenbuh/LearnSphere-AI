package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.ExamRecord;
import com.learnsphere.entity.MockExam;
import com.learnsphere.service.IExamRecordService;
import com.learnsphere.service.IMockExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin Mock Exam Controller
 */
@RestController
@RequestMapping("/api/admin/exams")
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

        // 动态校准参与人数（从真实考试记录表中统计，确保数据准确性）
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
     * Delete exam
     */
    @DeleteMapping("/{id}")
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
