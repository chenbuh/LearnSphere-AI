package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.Admin;
import com.learnsphere.mapper.AdminMapper;
import com.learnsphere.service.IAdminService;
import org.springframework.stereotype.Service;

/**
 * 管理员服务实现
 */
@Service
public class AdminServiceImpl extends ServiceImpl<AdminMapper, Admin> implements IAdminService {
}
