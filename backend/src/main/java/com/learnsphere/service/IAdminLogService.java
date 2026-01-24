package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.AdminLog;

public interface IAdminLogService extends IService<AdminLog> {
    void log(String module, String action, String details, Integer status, String errorMsg);
}
