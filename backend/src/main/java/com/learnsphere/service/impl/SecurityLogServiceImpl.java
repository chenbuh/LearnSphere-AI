package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.SecurityLog;
import com.learnsphere.mapper.SecurityLogMapper;
import com.learnsphere.service.ISecurityLogService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SecurityLogServiceImpl extends ServiceImpl<SecurityLogMapper, SecurityLog> implements ISecurityLogService {

    @Override
    public void log(Long userId, String event, String ip, String status, String details) {
        SecurityLog log = new SecurityLog();
        log.setUserId(userId);
        log.setEvent(event);
        log.setIp(ip);
        log.setStatus(status);
        log.setDetails(details);
        log.setCreateTime(LocalDateTime.now());
        this.save(log);
    }
}
