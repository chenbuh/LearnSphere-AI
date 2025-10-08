package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.WritingTopic;
import com.learnsphere.mapper.WritingTopicMapper;
import com.learnsphere.service.IWritingTopicService;
import org.springframework.stereotype.Service;

@Service
public class WritingTopicServiceImpl extends ServiceImpl<WritingTopicMapper, WritingTopic>
        implements IWritingTopicService {
}
