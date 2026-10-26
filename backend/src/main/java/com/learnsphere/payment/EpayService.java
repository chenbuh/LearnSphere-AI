package com.learnsphere.payment;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.learnsphere.entity.User;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.mapper.VipOrderMapper;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 彩虹易支付（页面跳转支付 submit.php + 异步通知 + 订单查询 api.php）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EpayService {

    public static final Map<Integer, String> PLAN_NAMES = Map.of(1, "月度会员", 2, "季度会员", 3, "年度会员");
    private static final Set<String> PAY_TYPES = Set.of("alipay", "wxpay");
    private static final Map<Integer, String> DEFAULT_PRICES = Map.of(1, "29", 2, "69", 3, "199");
    private static final DateTimeFormatter TRADE_NO_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final SecureRandom RANDOM = new SecureRandom();

    /** 并发待支付订单上限，防止反复下单无限堆积 */
    private static final int MAX_PENDING_ORDERS = 5;
    /** 超过该时长仍未支付的订单自动关闭 */
    private static final Duration PENDING_ORDER_TTL = Duration.ofMinutes(30);
    /** 订单号撞唯一索引时的重试次数 */
    private static final int OUT_TRADE_NO_RETRY = 3;

    private final EpayProperties props;
    private final EpayConfigService configService;
    private final VipOrderMapper vipOrderMapper;
    private final IUserService userService;
    private final ISystemConfigService systemConfigService;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    /**
     * 网关查单限频：同一订单 10 秒内最多回查一次。
     * 前端轮询（二维码窗口 / 结果页）每次都会请求订单状态，若每次都打网关，
     * 单笔支付就可能产生上百次出站请求，既拖慢响应也容易被网关限流或封 IP。
     * 异步通知链路不经过这里，仍会实时回查。
     */
    private static final Duration GATEWAY_QUERY_INTERVAL = Duration.ofSeconds(10);
    private final Cache<String, Boolean> gatewayQueryGuard = Caffeine.newBuilder()
            .expireAfterWrite(GATEWAY_QUERY_INTERVAL)
            .maximumSize(10_000)
            .build();

    public boolean isReady() {
        // 配置来自「数据库优先、配置文件兜底」，后台改完即时生效
        return configService.resolve().isReady();
    }

    public boolean isValidPayType(String type) {
        return PAY_TYPES.contains(type);
    }

    /** 套餐价格以后台配置为准，不信任前端金额 */
    public BigDecimal planPrice(int vipLevel) {
        String raw = systemConfigService.getConfigValue("vip.price." + vipLevel, DEFAULT_PRICES.get(vipLevel));
        try {
            return new BigDecimal(raw.trim()).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            return new BigDecimal(DEFAULT_PRICES.get(vipLevel)).setScale(2, RoundingMode.HALF_UP);
        }
    }

    /** 当前用户购买指定套餐的报价（新开 / 续费 / 升级补差价 / 降级） */
    public VipUpgradeCalculator.Quote quote(Long userId, int vipLevel) {
        User user = userService.getById(userId);
        if (user == null) {
            throw new IllegalStateException("用户不存在: " + userId);
        }
        return VipUpgradeCalculator.quote(user.getVipLevel(), user.getVipExpireTime(), LocalDateTime.now(),
                vipLevel, this::planPrice);
    }

    /**
     * 创建待支付订单并调用统一下单接口（mapi.php）。
     *
     * device=pc 时网关返回 qrcode（二维码链接），由前端自行渲染二维码收款窗口，
     * 不跳转网关收银台页面；device=jump/mobile/wechat 时返回 payurl 走跳转。
     *
     * @param device 设备类型：pc / mobile / wechat / jump
     * @param clientIp 用户 IP，网关要求必填（不校验真实性）
     */
    public Map<String, Object> createOrder(Long userId, VipUpgradeCalculator.Quote quote, String payType,
                                           String device, String clientIp) {
        int vipLevel = quote.targetLevel();
        BigDecimal amount = quote.payable();

        // 先清理超时未支付的历史订单，再限制并发待支付数量，避免反复下单无限堆积
        closeStalePendingOrders(userId);
        long pendingCount = vipOrderMapper.selectCount(new LambdaQueryWrapper<VipOrder>()
                .eq(VipOrder::getUserId, userId)
                .eq(VipOrder::getStatus, "PENDING"));
        if (pendingCount >= MAX_PENDING_ORDERS) {
            throw new BusinessException(400, "已有多笔未支付订单，请先完成支付或稍后再试");
        }

        VipOrder order = insertPendingOrder(userId, vipLevel, amount, payType, quote);
        String outTradeNo = order.getOutTradeNo();

        // 每次下单都取最新配置：后台刚改的网关地址/密钥无需重启即可生效
        EpayConfigService.ResolvedConfig cfg = configService.resolve();

        // 统一下单参数：注意不含 sitename（该字段仅页面跳转支付 submit.php 使用，
        // 带入会导致签名与网关校验的参数集合不一致）
        Map<String, String> params = new LinkedHashMap<>();
        params.put("pid", cfg.pid());
        params.put("type", payType);
        params.put("out_trade_no", outTradeNo);
        params.put("notify_url", cfg.notifyUrl());
        params.put("return_url", cfg.returnUrl());
        params.put("name", cfg.sitename() + " " + PLAN_NAMES.get(vipLevel));
        params.put("money", amount.toPlainString());
        params.put("clientip", clientIp == null || clientIp.isBlank() ? "127.0.0.1" : clientIp.trim());
        params.put("device", device);
        params.put("sign", EpaySigner.sign(params, cfg.key()));
        params.put("sign_type", "MD5");

        String body = params.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        try {
            HttpResponse<String> resp = http.send(HttpRequest.newBuilder(
                            URI.create(gateway() + cfg.unifiedOrderPath()))
                    .header("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build(), HttpResponse.BodyHandlers.ofString());

            JsonNode node = objectMapper.readTree(resp.body());
            if (node.path("code").asInt() != 1) {
                String msg = node.path("msg").asText("");
                log.warn("易支付下单失败 out_trade_no={} msg={}", outTradeNo, redactKey(msg));
                closeOrder(order.getId());
                throw new BusinessException(400, msg.isBlank() ? "支付网关下单失败" : msg);
            }

            String qrcode = node.path("qrcode").asText("");
            String payUrl = node.path("payurl").asText("");
            if (qrcode.isBlank() && payUrl.isBlank()) {
                closeOrder(order.getId());
                throw new BusinessException(400, "支付网关未返回支付地址");
            }

            String tradeNo = node.path("trade_no").asText("");
            if (!tradeNo.isBlank()) {
                vipOrderMapper.update(null, new LambdaUpdateWrapper<VipOrder>()
                        .eq(VipOrder::getId, order.getId())
                        .set(VipOrder::getTradeNo, tradeNo));
            }

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("outTradeNo", outTradeNo);
            result.put("amount", amount);
            result.put("orderType", quote.type());
            result.put("credit", quote.credit());
            result.put("device", device);
            result.put("qrcode", qrcode);
            result.put("payUrl", payUrl);
            return result;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            // 只记录异常类型，避免异常消息夹带含密钥的请求信息
            log.error("易支付下单请求异常 out_trade_no={}: {}", outTradeNo, e.getClass().getSimpleName());
            closeOrder(order.getId());
            throw new BusinessException(400, "支付网关暂时不可用，请稍后重试");
        }
    }

    /**
     * 插入待支付订单。
     * 订单号格式为「秒级时间戳 + 6 位随机数」，同一秒内仍可能撞唯一索引，
     * 撞到时换号重试，避免直接把 500 抛给用户。
     */
    private VipOrder insertPendingOrder(Long userId, int vipLevel, BigDecimal amount,
                                        String payType, VipUpgradeCalculator.Quote quote) {
        for (int attempt = 1; attempt <= OUT_TRADE_NO_RETRY; attempt++) {
            VipOrder order = new VipOrder();
            order.setUserId(userId);
            order.setVipLevel(vipLevel);
            order.setAmount(amount);
            order.setStatus("PENDING");
            order.setOutTradeNo(nextOutTradeNo());
            order.setPayType(payType);
            order.setOrderType(quote.type());
            order.setCreditAmount(quote.credit());
            order.setCreateTime(LocalDateTime.now());
            try {
                vipOrderMapper.insert(order);
                return order;
            } catch (DuplicateKeyException e) {
                log.warn("订单号碰撞，第 {} 次重试 out_trade_no={}", attempt, order.getOutTradeNo());
            }
        }
        throw new BusinessException(400, "下单失败，请稍后重试");
    }

    private static String nextOutTradeNo() {
        return LocalDateTime.now().format(TRADE_NO_TIME) + String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    /** 关闭超时未支付的旧订单，避免 PENDING 订单长期堆积 */
    private void closeStalePendingOrders(Long userId) {
        try {
            vipOrderMapper.update(null, new LambdaUpdateWrapper<VipOrder>()
                    .eq(VipOrder::getUserId, userId)
                    .eq(VipOrder::getStatus, "PENDING")
                    .lt(VipOrder::getCreateTime, LocalDateTime.now().minus(PENDING_ORDER_TTL))
                    .set(VipOrder::getStatus, "CLOSED"));
        } catch (Exception e) {
            // 清理失败不应阻断下单
            log.warn("清理超时未支付订单失败 userId={}: {}", userId, e.getClass().getSimpleName());
        }
    }

    /** 下单失败时关闭订单，避免遗留 PENDING 脏数据 */
    private void closeOrder(Long orderId) {
        try {
            vipOrderMapper.update(null, new LambdaUpdateWrapper<VipOrder>()
                    .eq(VipOrder::getId, orderId)
                    .eq(VipOrder::getStatus, "PENDING")
                    .set(VipOrder::getStatus, "CLOSED"));
        } catch (Exception e) {
            log.warn("关闭订单失败 id={}: {}", orderId, e.getClass().getSimpleName());
        }
    }

    /**
     * 处理易支付异步通知。返回 true 表示通知合法（无论是否首次处理），应回复 success。
     *
     * 安全加固（2026-10）：按网关文档「接入安全须知」第 2 条，回调只能当提醒、
     * 不能当支付凭证。验签通过后仍必须回查网关确认 status=1 才允许入账，
     * 否则商户密钥一旦泄露，攻击者可伪造验签合法的回调直接开通会员。
     *
     * 回查失败时返回 false，网关会重试通知，避免因一次网络抖动漏单。
     *
     * 事务边界（2026-10）：本方法不再整体加 @Transactional。
     * 回查网关是出站 HTTP 调用（最长 8 秒），若包在事务里会长时间占用数据库连接，
     * 高并发下可能耗尽连接池。现在只有真正写库的 markPaid 走 TransactionTemplate，
     * 网络调用与前置校验都在事务外完成。
     */
    public boolean handleNotify(Map<String, String> params) {
        EpayConfigService.ResolvedConfig cfg = configService.resolve();
        if (!cfg.isReady() || !EpaySigner.verify(params, cfg.key())) {
            log.warn("易支付通知验签失败 out_trade_no={}", params.get("out_trade_no"));
            return false;
        }
        if (!cfg.pid().equals(params.get("pid"))) {
            log.warn("易支付通知商户号不匹配 pid={}", params.get("pid"));
            return false;
        }
        if (!"TRADE_SUCCESS".equals(params.get("trade_status"))) {
            // 非成功状态无需处理，但通知本身合法
            return true;
        }

        String outTradeNo = params.get("out_trade_no");
        VipOrder order = findByOutTradeNo(outTradeNo);
        if (order == null) {
            log.warn("易支付通知订单不存在 out_trade_no={}", outTradeNo);
            return false;
        }
        // 已终态的订单直接放行，不再重复查单
        if ("PAID".equals(order.getStatus()) || "REFUNDED".equals(order.getStatus())) {
            return true;
        }

        // 二次确认：以网关查单结果为准
        JsonNode confirmed = fetchGatewayPaidOrder(outTradeNo);
        if (confirmed == null) {
            log.warn("易支付通知回查未确认已支付，拒绝入账 out_trade_no={}", outTradeNo);
            return false;
        }
        // 回调金额与查单金额都必须与订单一致
        String notifyMoney = params.get("money");
        String gatewayMoney = confirmed.path("money").asText(null);
        if (!amountMatches(order.getAmount(), notifyMoney) || !amountMatches(order.getAmount(), gatewayMoney)) {
            log.error("易支付金额不一致 out_trade_no={} 订单={} 通知={} 查单={}",
                    outTradeNo, order.getAmount(), notifyMoney, gatewayMoney);
            return false;
        }
        // 入账（更新订单 + 发放会员）在独立事务内完成，网络调用已在事务外
        Boolean credited = transactionTemplate.execute(status -> markPaid(outTradeNo,
                confirmed.path("trade_no").asText(params.get("trade_no")),
                gatewayMoney,
                confirmed.path("type").asText(params.get("type"))));
        return Boolean.TRUE.equals(credited);
    }

    /**
     * 查询订单状态；仍是待支付时主动向易支付查单（收不到异步通知时也能到账）。
     *
     * 事务边界（2026-10）：查单是网络调用，不再整体加 @Transactional，
     * 仅在确认已支付后由 syncFromGateway 内部开启事务写入。
     */
    public VipOrder queryOrder(Long userId, String outTradeNo) {
        VipOrder order = findByOutTradeNo(outTradeNo);
        if (order == null || !order.getUserId().equals(userId)) {
            return null;
        }
        if (("PENDING".equals(order.getStatus()) || "CLOSED".equals(order.getStatus()))
                && configService.resolve().isReady()) {
            // 限频：前端轮询可能每几秒一次，避免每次请求都打网关
            if (gatewayQueryGuard.getIfPresent(outTradeNo) == null) {
                gatewayQueryGuard.put(outTradeNo, Boolean.TRUE);
                syncFromGateway(order);
                order = findByOutTradeNo(outTradeNo);
            }
        }
        return order;
    }

    /**
     * 主动向易支付查单并确认已支付。
     *
     * 安全加固（2026-03）：
     * 商户密钥（key）此前作为 GET 查询参数拼接进 URL，会随出站请求进入
     * HTTP 客户端日志、反向代理 access log、以及任何抓包与缓存，导致密钥泄露。
     * 现改为 POST 表单提交，密钥不出现在 URL 中；并对异常信息做脱敏。
     *
     * @return 网关确认 status=1 且订单号一致时返回查单结果，否则 null
     */
    private JsonNode fetchGatewayPaidOrder(String outTradeNo) {
        try {
            EpayConfigService.ResolvedConfig cfg = configService.resolve();
            Map<String, String> form = new LinkedHashMap<>();
            form.put("act", "order");
            form.put("pid", cfg.pid());
            form.put("key", cfg.key());
            form.put("out_trade_no", outTradeNo);

            String body = form.entrySet().stream()
                    .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                    .collect(Collectors.joining("&"));

            HttpResponse<String> resp = http.send(HttpRequest.newBuilder(URI.create(gateway() + cfg.queryPath()))
                    .header("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
                    .timeout(Duration.ofSeconds(8))
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build(), HttpResponse.BodyHandlers.ofString());

            JsonNode node = objectMapper.readTree(resp.body());
            if (node.path("code").asInt() == 1
                    && node.path("status").asInt() == 1
                    && outTradeNo.equals(node.path("out_trade_no").asText())) {
                return node;
            }
            log.warn("易支付查单未确认已支付 out_trade_no={} code={} status={}", outTradeNo,
                    node.path("code").asInt(), node.path("status").asInt());
            return null;
        } catch (Exception e) {
            // 对外只记录订单号与异常类型，避免异常消息中夹带含密钥的请求信息
            log.warn("易支付查单失败 out_trade_no={}: {}", outTradeNo, e.getClass().getSimpleName());
            return null;
        }
    }

    /** 前端轮询兜底：向网关查单确认后入账（查单在事务外，入账走独立事务） */
    private void syncFromGateway(VipOrder order) {
        JsonNode node = fetchGatewayPaidOrder(order.getOutTradeNo());
        if (node == null) {
            return;
        }
        transactionTemplate.execute(status -> markPaid(order.getOutTradeNo(),
                node.path("trade_no").asText(null),
                node.path("money").asText(null),
                node.path("type").asText(null)));
    }

    /**
     * 日志脱敏：移除 URL / 文本中 key 参数的值。
     * 任何需要记录出站请求信息的场景都应先经过本方法。
     */
    static String redactKey(String text) {
        if (text == null) {
            return null;
        }
        return text.replaceAll("(?i)(key=)[^&\\s]*", "$1***");
    }

    /**
     * 待支付 → PAID 原子切换，只有切换成功的那一次才发放会员，保证幂等。
     * 允许 CLOSED 参与切换：下单时若因网络异常误判失败而关单，但用户实际已完成付款，
     * 网关查单确认后仍应正常入账。
     */
    private boolean markPaid(String outTradeNo, String tradeNo, String money, String payType) {
        VipOrder order = findByOutTradeNo(outTradeNo);
        if (order == null) {
            log.warn("易支付通知订单不存在 out_trade_no={}", outTradeNo);
            return false;
        }
        if (!amountMatches(order.getAmount(), money)) {
            log.error("易支付金额不一致 out_trade_no={} 订单={} 通知={}", outTradeNo, order.getAmount(), money);
            return false;
        }
        int updated = vipOrderMapper.update(null, new LambdaUpdateWrapper<VipOrder>()
                .eq(VipOrder::getId, order.getId())
                .in(VipOrder::getStatus, "PENDING", "CLOSED")
                .set(VipOrder::getStatus, "PAID")
                .set(VipOrder::getTradeNo, tradeNo)
                .set(payType != null && !payType.isBlank(), VipOrder::getPayType, payType)
                .set(VipOrder::getPayTime, LocalDateTime.now()));
        if (updated == 1) {
            applyVip(order);
            log.info("易支付到账 out_trade_no={} user={} level={}", outTradeNo, order.getUserId(), order.getVipLevel());
        }
        return true;
    }

    /**
     * 发放会员，额度跟随系统设置：
     * 升级订单的剩余时长已折算进价格，新套餐从支付时刻重新计时；
     * 新开 / 续费在未过期的基础上顺延（与后台手动开通一致）。
     */
    private void applyVip(VipOrder order) {
        Long userId = order.getUserId();
        int vipLevel = order.getVipLevel();
        User user = userService.getById(userId);
        if (user == null) {
            throw new IllegalStateException("用户不存在: " + userId);
        }
        LocalDateTime now = LocalDateTime.now();
        int currentLevel = user.getVipLevel() == null ? 0 : user.getVipLevel();
        boolean active = user.getVipExpireTime() != null && user.getVipExpireTime().isAfter(now);
        boolean upgrade = VipUpgradeCalculator.UPGRADE.equals(order.getOrderType());

        LocalDateTime base = active && !upgrade ? user.getVipExpireTime() : now;
        LocalDateTime expireTime = plusPlan(base, vipLevel);
        if (upgrade && active && currentLevel >= vipLevel && user.getVipExpireTime().isAfter(expireTime)) {
            // 下单后到账前用户已通过其他订单获得同级或更高会员：不缩短已有时长
            expireTime = user.getVipExpireTime();
        }
        // 当前已是更高等级且未过期时保留高等级
        int level = active && currentLevel > vipLevel ? currentLevel : vipLevel;
        userService.update(null, new LambdaUpdateWrapper<User>()
                .eq(User::getId, userId)
                .set(User::getVipLevel, level)
                .set(User::getVipExpireTime, expireTime)
                .set(User::getDailyAiQuota, null)
                .set(User::getDailyTutorQuota, null));
    }

    private static LocalDateTime plusPlan(LocalDateTime base, int vipLevel) {
        return switch (vipLevel) {
            case 1 -> base.plusMonths(1);
            case 2 -> base.plusMonths(3);
            case 3 -> base.plusYears(1);
            default -> throw new IllegalStateException("无效的 VIP 等级: " + vipLevel);
        };
    }

    private VipOrder findByOutTradeNo(String outTradeNo) {
        if (outTradeNo == null || outTradeNo.isBlank()) {
            return null;
        }
        return vipOrderMapper.selectOne(new LambdaQueryWrapper<VipOrder>()
                .eq(VipOrder::getOutTradeNo, outTradeNo).last("LIMIT 1"));
    }

    private static boolean amountMatches(BigDecimal expected, String money) {
        try {
            return money != null && expected.compareTo(new BigDecimal(money.trim())) == 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String gateway() {
        String url = configService.resolve().apiUrl();
        if (url == null) {
            url = "";
        }
        url = url.trim();
        return url.endsWith("/") ? url : url + "/";
    }
}
