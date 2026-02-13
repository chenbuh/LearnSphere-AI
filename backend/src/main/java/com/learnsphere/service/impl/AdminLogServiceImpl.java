package com.learnsphere.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.AdminLog;
import com.learnsphere.entity.User;
import com.learnsphere.mapper.AdminLogMapper;
import com.learnsphere.service.IAdminLogService;
import com.learnsphere.service.IUserService;
import com.learnsphere.utils.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AdminLogServiceImpl extends ServiceImpl<AdminLogMapper, AdminLog> implements IAdminLogService {

    private final IUserService userService;

    @Override
    public void log(String module, String action, String details, Integer status, String errorMsg) {
        try {
            AdminLog log = new AdminLog();

            // Get current user info if logged in
            if (StpUtil.isLogin()) {
                String loginId = StpUtil.getLoginId().toString();
                Long userId;
                if (loginId.startsWith("admin:")) {
                    userId = Long.parseLong(loginId.substring(6));
                } else {
                    userId = Long.parseLong(loginId);
                }
                log.setAdminId(userId);
                User user = userService.getById(userId);
                if (user != null) {
                    log.setAdminUsername(user.getUsername());
                }
            } else {
                log.setAdminUsername("System/Guest");
            }

            log.setModule(module);
            log.setAction(action);
            log.setDetails(details);
            log.setStatus(status);
            log.setErrorMsg(errorMsg);

            // Get IP
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder
                    .getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                log.setIp(IpUtil.getClientIp(request));
            }

            this.save(log);
        } catch (Exception e) {
            log.error("Failed to record admin log", e);
        }
    }
}
