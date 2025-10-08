package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.ListeningMaterial;
import com.learnsphere.mapper.ListeningMaterialMapper;
import com.learnsphere.service.IListeningMaterialService;
import org.springframework.stereotype.Service;

/**
 * 听力材料服务实现类
 */
@Service
public class ListeningMaterialServiceImpl extends ServiceImpl<ListeningMaterialMapper, ListeningMaterial>
        implements IListeningMaterialService {
}
