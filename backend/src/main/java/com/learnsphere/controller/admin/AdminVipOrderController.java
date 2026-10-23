package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.entity.SystemConfig;
import com.learnsphere.entity.User;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.mapper.VipOrderMapper;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * VIP 订单与套餐价格管理
 */
@RestController
@RequestMapping("/api/admin/orders")
@SaCheckRole("admin")
@RequiredArgsConstructor
public class AdminVipOrderController {

    private static final Map<Integer, String> PLAN_NAMES = Map.of(1, "月度会员", 2, "季度会员", 3, "年度会员");
    private static final Set<String> STATUSES = Set.of("PAID", "PENDING", "MANUAL_GRANTED", "REFUNDED");

    private final VipOrderMapper vipOrderMapper;
    private final IUserService userService;
    private final ISystemConfigService systemConfigService;

    @GetMapping
    public Result<?> list(@RequestParam(defaultValue = "1") int page,
                          @RequestParam(defaultValue = "20") int size,
                          @RequestParam(required = false) String status,
                          @RequestParam(required = false) Integer vipLevel,
                          @RequestParam(required = false) String keyword,
                          @RequestParam(required = false) String startDate,
                          @RequestParam(required = false) String endDate) {
        LambdaQueryWrapper<VipOrder> query = new LambdaQueryWrapper<VipOrder>().orderByDesc(VipOrder::getCreateTime);
        if (StringUtils.hasText(status)) {
            query.eq(VipOrder::getStatus, status);
        }
        if (vipLevel != null) {
            query.eq(VipOrder::getVipLevel, vipLevel);
        }
        if (StringUtils.hasText(startDate)) {
            query.ge(VipOrder::getCreateTime, LocalDate.parse(startDate).atStartOfDay());
        }
        if (StringUtils.hasText(endDate)) {
            query.lt(VipOrder::getCreateTime, LocalDate.parse(endDate).plusDays(1).atStartOfDay());
        }
        if (StringUtils.hasText(keyword)) {
            String kw = keyword.trim();
            List<Long> userIds = userService.list(new LambdaQueryWrapper<User>()
                            .select(User::getId)
                            .like(User::getUsername, kw).or().like(User::getEmail, kw).or().like(User::getNickname, kw)
                            .last("LIMIT 500"))
                    .stream().map(User::getId).toList();
            Long orderId = parseLong(kw);
            if (userIds.isEmpty() && orderId == null) {
                return Result.success(new Page<Map<String, Object>>(page, size, 0));
            }
            query.and(w -> {
                if (!userIds.isEmpty()) {
                    w.in(VipOrder::getUserId, userIds);
                }
                if (orderId != null) {
                    if (!userIds.isEmpty()) {
                        w.or();
                    }
                    w.eq(VipOrder::getId, orderId);
                }
            });
        }

        Page<VipOrder> result = vipOrderMapper.selectPage(new Page<>(page, Math.min(size, 100)), query);
        Map<Long, User> users = loadUsers(result.getRecords().stream().map(VipOrder::getUserId).collect(Collectors.toSet()));

        Page<Map<String, Object>> view = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        view.setRecords(result.getRecords().stream().map(order -> toView(order, users.get(order.getUserId()))).toList());
        return Result.success(view);
    }

    @GetMapping("/summary")
    public Result<?> summary() {
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        Map<String, Object> data = new HashMap<>();
        data.put("paidRevenue", sumAmount(new QueryWrapper<VipOrder>().eq("status", "PAID")));
        data.put("monthRevenue", sumAmount(new QueryWrapper<VipOrder>().eq("status", "PAID").ge("create_time", monthStart)));
        data.put("paidCount", vipOrderMapper.selectCount(new LambdaQueryWrapper<VipOrder>().eq(VipOrder::getStatus, "PAID")));
        data.put("manualCount", vipOrderMapper.selectCount(new LambdaQueryWrapper<VipOrder>().eq(VipOrder::getStatus, "MANUAL_GRANTED")));
        data.put("refundedCount", vipOrderMapper.selectCount(new LambdaQueryWrapper<VipOrder>().eq(VipOrder::getStatus, "REFUNDED")));
        data.put("activeVipCount", userService.count(new LambdaQueryWrapper<User>().gt(User::getVipExpireTime, LocalDateTime.now())));
        return Result.success(data);
    }

    /**
     * 标记退款：只改订单状态，不自动收回会员时长（需要的话在用户管理里扣减）
     */
    @PostMapping("/{id}/refund")
    @AdminOperation(module = "VIP订单", action = "标记退款")
    public Result<?> refund(@PathVariable Long id) {
        VipOrder order = vipOrderMapper.selectById(id);
        if (order == null) {
            return Result.error("订单不存在");
        }
        if (!"PAID".equals(order.getStatus())) {
            return Result.error("只有已支付订单可以标记退款");
        }
        VipOrder update = new VipOrder();
        update.setId(id);
        update.setStatus("REFUNDED");
        vipOrderMapper.updateById(update);
        return Result.success("已标记为退款");
    }

    @GetMapping("/plans")
    public Result<?> plans() {
        Map<String, SystemConfig> configs = systemConfigService.list(new LambdaQueryWrapper<SystemConfig>()
                        .likeRight(SystemConfig::getConfigKey, "vip.price."))
                .stream().collect(Collectors.toMap(SystemConfig::getConfigKey, Function.identity(), (a, b) -> a));
        List<Map<String, Object>> plans = new ArrayList<>();
        for (int level = 1; level <= 3; level++) {
            SystemConfig config = configs.get("vip.price." + level);
            Map<String, Object> plan = new HashMap<>();
            plan.put("vipLevel", level);
            plan.put("name", PLAN_NAMES.get(level));
            plan.put("price", config == null ? null : new BigDecimal(config.getConfigValue()));
            plans.add(plan);
        }
        return Result.success(plans);
    }

    @PutMapping("/plans")
    @AdminOperation(module = "VIP订单", action = "修改套餐价格")
    public Result<?> updatePlans(@RequestBody List<Map<String, Object>> plans) {
        for (Map<String, Object> plan : plans) {
            Integer level = plan.get("vipLevel") == null ? null : Integer.valueOf(plan.get("vipLevel").toString());
            if (level == null || !PLAN_NAMES.containsKey(level)) {
                return Result.error("无效的套餐等级");
            }
            BigDecimal price;
            try {
                price = new BigDecimal(String.valueOf(plan.get("price")));
            } catch (NumberFormatException e) {
                return Result.error(PLAN_NAMES.get(level) + "价格格式不正确");
            }
            if (price.compareTo(BigDecimal.ZERO) < 0 || price.compareTo(new BigDecimal("100000")) > 0) {
                return Result.error(PLAN_NAMES.get(level) + "价格超出范围");
            }

            String key = "vip.price." + level;
            SystemConfig config = systemConfigService.getOne(new LambdaQueryWrapper<SystemConfig>()
                    .eq(SystemConfig::getConfigKey, key));
            if (config == null) {
                config = new SystemConfig();
                config.setConfigKey(key);
                config.setDescription(PLAN_NAMES.get(level) + "价格（元）");
                config.setCategory("VIP_PLAN");
            }
            config.setConfigValue(price.stripTrailingZeros().toPlainString());
            config.setUpdateTime(LocalDateTime.now());
            systemConfigService.saveOrUpdate(config);
        }
        return Result.success("套餐价格已保存");
    }

    private Map<String, Object> toView(VipOrder order, User user) {
        Map<String, Object> row = new HashMap<>();
        row.put("id", order.getId());
        row.put("userId", order.getUserId());
        row.put("username", user == null ? null : user.getUsername());
        row.put("nickname", user == null ? null : user.getNickname());
        row.put("vipLevel", order.getVipLevel());
        row.put("planName", PLAN_NAMES.getOrDefault(order.getVipLevel(), "未知套餐"));
        row.put("amount", order.getAmount());
        row.put("status", STATUSES.contains(order.getStatus()) ? order.getStatus() : "UNKNOWN");
        row.put("createTime", order.getCreateTime());
        row.put("outTradeNo", order.getOutTradeNo());
        row.put("tradeNo", order.getTradeNo());
        row.put("payType", order.getPayType());
        row.put("payTime", order.getPayTime());
        row.put("orderType", order.getOrderType());
        row.put("creditAmount", order.getCreditAmount());
        return row;
    }

    private Map<Long, User> loadUsers(Set<Long> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return userService.listByIds(ids).stream().collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private BigDecimal sumAmount(QueryWrapper<VipOrder> query) {
        query.select("COALESCE(SUM(amount), 0) AS total");
        List<Map<String, Object>> rows = vipOrderMapper.selectMaps(query);
        if (rows == null || rows.isEmpty() || rows.get(0) == null || rows.get(0).get("total") == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(rows.get(0).get("total").toString());
    }

    private Long parseLong(String value) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
