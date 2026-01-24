package com.learnsphere.controller;

import com.learnsphere.common.Result;
import com.learnsphere.entity.SystemConfig;
import com.learnsphere.service.ISystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 公共接口控制器（无需登录即可访问）
 */
@RestController
@RequestMapping("/api/common")
public class CommonController {

    @Autowired
    private ISystemConfigService systemConfigService;

    /**
     * 获取公开的系统配置（过滤掉敏感信息）
     * 仅返回以 'ui.' 或 'sys.public.' 开头的配置，以及特定的几个配置
     */
    @GetMapping("/config")
    public Result<?> getPublicConfigs() {
        // 定义允许公开的配置 key 前缀白名单
        String[] allowedPrefixes = { "ui.", "sys.site_name", "sys.announcement", "sys.user_registration",
                "sys.maintenance_mode", "sys.maintenance_message" };

        List<SystemConfig> allConfigs = systemConfigService.list();

        Map<String, String> publicConfigs = new HashMap<>();

        for (SystemConfig config : allConfigs) {
            String key = config.getConfigKey();
            if (key == null)
                continue;

            boolean isAllowed = false;
            for (String prefix : allowedPrefixes) {
                if (key.startsWith(prefix) || key.equals(prefix)) {
                    isAllowed = true;
                    break;
                }
            }

            if (isAllowed) {
                publicConfigs.put(key, config.getConfigValue());
            }
        }

        return Result.success(publicConfigs);
    }
}
