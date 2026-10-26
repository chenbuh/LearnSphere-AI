package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.payment.EpayConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 易支付配置管理。
 *
 * <p>配置存于 {@code system_config} 表，后台改完即时生效，无需改配置文件重启服务。
 * 商户密钥属于敏感信息：读取时只回传「是否已配置」，写入时加密存储。
 *
 * <p>权限：仅超管可查看与修改支付配置（涉及资金安全）。
 */
@RestController
@RequestMapping("/api/admin/payment/epay")
@SaCheckRole("admin")
@RequiredArgsConstructor
public class AdminEpayConfigController {

    private final EpayConfigService epayConfigService;

    /**
     * 读取当前易支付配置（密钥脱敏）。
     */
    @GetMapping
    public Result<?> get() {
        return Result.success(epayConfigService.describeForAdmin());
    }

    /**
     * 保存易支付配置。
     *
     * <p>请求体字段：enabled / apiUrl / pid / key / notifyUrl / returnUrl /
     * sitename / unifiedOrderPath / queryPath。
     * {@code key} 留空表示不修改已有密钥。
     */
    @PutMapping
    @AdminOperation(module = "支付配置", action = "修改易支付配置")
    public Result<?> save(@RequestBody Map<String, String> form) {
        epayConfigService.save(form);
        return Result.success(epayConfigService.describeForAdmin());
    }
}
