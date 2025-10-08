package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.ExamRecord;
import com.learnsphere.mapper.ExamRecordMapper;
import com.learnsphere.service.IExamRecordService;
import org.springframework.stereotype.Service;

@Service
public class ExamRecordServiceImpl extends ServiceImpl<ExamRecordMapper, ExamRecord> implements IExamRecordService {
}
