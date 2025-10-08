package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.ReadingArticle;
import com.learnsphere.mapper.ReadingArticleMapper;
import com.learnsphere.service.IReadingArticleService;
import org.springframework.stereotype.Service;

/**
 * 阅读文章服务实现类
 */
@Service
public class ReadingArticleServiceImpl extends ServiceImpl<ReadingArticleMapper, ReadingArticle>
        implements IReadingArticleService {
}
