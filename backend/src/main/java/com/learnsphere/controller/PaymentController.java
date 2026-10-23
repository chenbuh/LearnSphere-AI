package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.RateLimit;
import com.learnsphere.common.annotation.UserOperation;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.payment.EpayService;
import com.learnsphere.payment.VipUpgradeCalculator;
import com.learnsphere.utils.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * 用户支付控制器（彩虹易支付）
 */
@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    /** 网关支持的设备类型：pc=二维码 / mobile=H5 / wechat=微信内 JSAPI / jump=自适应跳转 */
    private static final Set<String> DEVICES = Set.of("pc", "mobile", "wechat", "jump");

    /** 网关标准回调字段（文档「回调安全警示」白名单），param 为可选业务扩展参数 */
    private static final Set<String> NOTIFY_FIELDS = Set.of(
            "pid", "trade_no", "out_trade_no", "type", "name",
            "money", "trade_status", "sign", "sign_type", "param");

    private final StringRedisTemplate redisTemplate;
    private final EpayService epayService;

    /**
     * 获取支付幂等性 Token。
     *
     * 安全修复（2026-10）：原实现无任何限流。每个 Token 会在 Redis 里留下
     * 一个 5 分钟 TTL 的 key，登录用户可循环调用无限写入，造成 Redis 内存膨胀。
     * 现按用户限流（60 秒 10 次），正常支付流程每次下单只取一个，足够用。
     */
    @GetMapping("/token")
    @RateLimit(key = "payment:token", time = 60, count = 10, limitType = RateLimit.LimitType.USER)
    @UserOperation(module = "payment", action = "get_token", description = "获取支付令牌")
    public Result<String> getPaymentToken() {
        String token = UUID.randomUUID().toString();
        Long userId = StpUtil.getLoginIdAsLong();
        // 存储 Token，5分钟内有效
        Duration duration = Duration.ofMinutes(5);
        java.util.Objects.requireNonNull(duration);
        redisTemplate.opsForValue().set("pay_token:" + userId + ":" + token, "1", duration);
        return Result.success(token);
    }

    /**
     * 在线支付是否可用（前端据此决定是否展示支付按钮）
     */
    @GetMapping("/status")
    public Result<Map<String, Object>> status() {
        return Result.success(Map.of("enabled", epayService.isReady()));
    }

    /**
     * 创建待支付订单。
     * 微信支付（device=pc）返回 qrcode，由前端自建二维码收款窗口，不跳转网关页面；
     * 其它设备类型返回 payurl 走跳转支付。
     */
    @RateLimit(time = 60, count = 5, limitType = RateLimit.LimitType.USER)
    @PostMapping("/checkout")
    @UserOperation(module = "payment", action = "checkout", description = "购买 VIP", detailKeys = {
            "request.vipLevel", "request.payType"
    })
    public Result<Map<String, Object>> checkout(@RequestBody CheckoutRequest request,
                                                HttpServletRequest httpRequest) {
        Long userId = StpUtil.getLoginIdAsLong();

        // 1. 参数校验（无副作用，放在幂等校验之前）
        //
        // 修复（2026-10）：原实现一进来就先 delete 掉幂等 token，再做参数校验。
        // 只要校验不通过（套餐非法 / 价格未配 / 降级拦截），token 就被白白烧掉，
        // 用户必须重新申请才能重试。现改为「先校验、后消费」，校验失败不消耗 token。
        if (!epayService.isReady()) {
            return Result.error("在线支付暂未开放，请联系管理员开通会员");
        }
        Integer level = request.getVipLevel();
        if (level == null || !EpayService.PLAN_NAMES.containsKey(level)) {
            return Result.error("无效的会员套餐");
        }
        String payType = request.getPayType() == null ? "alipay" : request.getPayType();
        if (!epayService.isValidPayType(payType)) {
            return Result.error("不支持的支付方式");
        }
        if (epayService.planPrice(level).signum() <= 0) {
            return Result.error("套餐价格未配置，请联系管理员");
        }
        VipUpgradeCalculator.Quote quote = epayService.quote(userId, level);
        if (VipUpgradeCalculator.DOWNGRADE.equals(quote.type())) {
            return Result.error("当前会员有效期内不支持购买更低档位，可续费或升级");
        }

        // 2. 幂等性检查（校验全部通过后才消费 token）
        //
        // 安全修复（2026-03）：原实现为
        //     Boolean deleted = redisTemplate.delete(tokenKey);
        //     if (Boolean.FALSE.equals(deleted)) { return Result.error(...); }
        // 该判断只在「明确返回 false」时拒绝。而 StringRedisTemplate.delete 在
        // Redis 连接异常等情况下可能返回 null，此时 Boolean.FALSE.equals(null)
        // 为 false，校验会被跳过、请求继续执行 —— 即 Redis 故障时幂等性静默失效，
        // 可能造成重复下单。
        // 现改为「非显式成功即拒绝」，使故障时向安全侧降级（宁可拒绝，不可重复）。
        String tokenKey = "pay_token:" + userId + ":" + request.getPaymentToken();
        Boolean deleted;
        try {
            deleted = redisTemplate.delete(tokenKey);
        } catch (Exception e) {
            log.error("支付幂等校验失败（Redis 异常），已拒绝本次请求 userId={}", userId, e);
            return Result.error("支付服务暂时不可用，请稍后重试");
        }
        if (!Boolean.TRUE.equals(deleted)) {
            return Result.error("支付请求已处理或已过期，请勿重复提交");
        }

        // 3. 设备类型：决定网关返回二维码还是跳转链接。
        // 微信支付默认 pc —— 返回 qrcode 由前端自建二维码收款窗口，不跳转网关页面；
        // 前端可按实际环境显式传 mobile（手机浏览器 H5）/ wechat（微信内 JSAPI）。
        String device = resolveDevice(request.getDevice(), payType);
        String clientIp = IpUtil.getClientIp(httpRequest);
        return Result.success(epayService.createOrder(userId, quote, payType, device, clientIp));
    }

    /** 归一化设备类型，非法值回落到默认值 */
    private static String resolveDevice(String raw, String payType) {
        String fallback = "wxpay".equals(payType) ? "pc" : "jump";
        if (raw == null || raw.isBlank()) {
            return fallback;
        }
        String device = raw.trim().toLowerCase();
        return DEVICES.contains(device) ? device : fallback;
    }

    /**
     * 当前用户各套餐的应付报价（升级时按剩余天数折算抵扣）
     */
    @GetMapping("/quote")
    public Result<List<Map<String, Object>>> quote() {
        Long userId = StpUtil.getLoginIdAsLong();
        List<Map<String, Object>> quotes = new ArrayList<>();
        for (int level = 1; level <= 3; level++) {
            VipUpgradeCalculator.Quote q = epayService.quote(userId, level);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("vipLevel", level);
            row.put("type", q.type());
            row.put("fromLevel", q.fromLevel());
            row.put("originalPrice", q.originalPrice());
            row.put("credit", q.credit());
            row.put("payable", q.payable());
            row.put("remainingDays", q.remainingDays());
            quotes.add(row);
        }
        return Result.success(quotes);
    }

    /**
     * 查询订单支付状态（仅本人订单）
     */
    @GetMapping("/order/{outTradeNo}")
    public Result<Map<String, Object>> order(@PathVariable String outTradeNo) {
        VipOrder order = epayService.queryOrder(StpUtil.getLoginIdAsLong(), outTradeNo);
        if (order == null) {
            return Result.error("订单不存在");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("outTradeNo", order.getOutTradeNo());
        data.put("vipLevel", order.getVipLevel());
        data.put("planName", EpayService.PLAN_NAMES.get(order.getVipLevel()));
        data.put("amount", order.getAmount());
        data.put("orderType", order.getOrderType());
        data.put("credit", order.getCreditAmount());
        data.put("status", order.getStatus());
        data.put("payTime", order.getPayTime());
        return Result.success(data);
    }

    /**
     * 易支付异步通知（公开接口，安全性依赖 MD5 验签 + 商户号 + 金额校验 + 网关回查）。
     * 必须原样返回纯文本 success，否则平台会重复通知。
     *
     * 安全加固（2026-10）：按网关文档「回调安全警示」补两步前置校验
     * ① 字段名单校验：只接受标准字段，出现其它字段直接拒绝；
     * ② 重复字段校验：同一字段只允许出现一次，防止攻击者把
     *    trade_status=TRADE_SUCCESS 夹带在其它参数值里重复出现。
     * 校验通过后才进入验签与入账流程。
     */
    @RequestMapping(value = "/epay/notify", method = { RequestMethod.GET, RequestMethod.POST },
            produces = "text/plain;charset=UTF-8")
    public String epayNotify(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        for (Map.Entry<String, String[]> entry : request.getParameterMap().entrySet()) {
            String name = entry.getKey();
            String[] values = entry.getValue();
            if (!NOTIFY_FIELDS.contains(name)) {
                log.warn("易支付通知含非标准字段，已拒绝 field={}", safeField(name));
                return "fail";
            }
            if (values == null || values.length != 1) {
                log.warn("易支付通知字段重复，已拒绝 field={} count={}",
                        safeField(name), values == null ? 0 : values.length);
                return "fail";
            }
            params.put(name, values[0]);
        }
        try {
            return epayService.handleNotify(params) ? "success" : "fail";
        } catch (Exception e) {
            log.error("处理易支付通知异常 out_trade_no={}", params.get("out_trade_no"), e);
            return "fail";
        }
    }

    /** 字段名来自请求，写日志前去掉换行避免日志注入 */
    private static String safeField(String name) {
        return name == null ? "" : name.replaceAll("[\\r\\n\\t]", "_");
    }

    @Data
    public static class CheckoutRequest {
        private String paymentToken;
        private Integer vipLevel;
        /** alipay / wxpay */
        private String payType;
        /** 可选：pc / mobile / wechat / jump，缺省时微信取 pc、支付宝取 jump */
        private String device;
    }
}
