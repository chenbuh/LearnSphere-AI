package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.common.Result;
import com.learnsphere.entity.SystemConfig;
import com.learnsphere.service.ISystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * System Configuration Controller
 */
@RestController
@RequestMapping("/api/admin/system/config")
@SaCheckRole("admin")
public class AdminSystemConfigController {

    @Autowired
    private ISystemConfigService systemConfigService;

    /**
     * Get all system configurations
     */
    @GetMapping
    public Result<?> getAllConfigs() {
        return Result.success(systemConfigService.list());
    }

    /**
     * Update a specific configuration
     */
    @PutMapping("/{key}")
    @com.learnsphere.common.annotation.AdminOperation(module = "系统配置", action = "修改配置项")
    public Result<?> updateConfig(@PathVariable String key, @RequestBody Map<String, String> body) {
        String value = body.get("value");
        if (value == null) {
            return Result.error("Value required");
        }
        systemConfigService.setConfigValue(key, value);
        return Result.success("Config updated");
    }

    /**
     * Batch update configurations
     */
    @PutMapping("/batch")
    @AdminOperation(module = "系统配置", action = "批量修改配置")
    public Result<?> batchUpdate(@RequestBody List<SystemConfig> configs) {
        for (SystemConfig config : configs) {
            if (config.getConfigKey() != null) {
                systemConfigService.setConfigValue(config.getConfigKey(), config.getConfigValue());
            }
        }
        return Result.success("Configs updated successfully");
    }
}
