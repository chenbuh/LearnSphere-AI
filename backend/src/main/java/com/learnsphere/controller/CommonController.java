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
 * 补充接口控制器，无需登录即可访问
 */
@RestController
@RequestMapping("/api/common")
public class CommonController {

    @Autowired
    private ISystemConfigService systemConfigService;

    /**
     * 获取兼的系统计配罼过滤掉敏感信恼
     * 仅返回以 'ui.' ?'sys.public.' 头的配置，以及特定的几个配置
     */
    @GetMapping("/config")
    public Result<?> getPublicConfigs() {
        /*
         * 允许公开的配置 key 前缀白名单。
         *
         * 注意这里**不再包含** ai.limit.daily. 与 ai.tutor.limit.daily.：
         * 这两个前缀会把各 VIP 等级的每日 AI 调用上限直接告诉未登录访问者，
         * 等于公开配额边界，方便攻击者精确规划「用满多少次刚好不触发限制」。
         * 前端并不需要这个数值（超限时后端会返回 QuotaExceededException 并带说明），
         * 所以直接移出白名单。
         */
        String[] allowedPrefixes = { "ui.", "sys.site_name", "sys.announcement", "sys.user_registration",
                "sys.maintenance_mode", "sys.maintenance_message", "vip.price." };

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
