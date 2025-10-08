package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.SpeakingTopic;
import com.learnsphere.mapper.SpeakingTopicMapper;
import com.learnsphere.service.ISpeakingTopicService;
import org.springframework.stereotype.Service;

@Service
public class SpeakingTopicServiceImpl extends ServiceImpl<SpeakingTopicMapper, SpeakingTopic>
        implements ISpeakingTopicService {
}
