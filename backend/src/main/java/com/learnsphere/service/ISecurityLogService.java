package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.SecurityLog;

public interface ISecurityLogService extends IService<SecurityLog> {
    /**
     * 记录安全日志
     */
    void log(Long userId, String event, String ip, String status, String details);
}
