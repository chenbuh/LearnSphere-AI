package com.learnsphere.payment;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnsphere.entity.User;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.mapper.VipOrderMapper;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.service.IUserService;
import com.sun.net.httpserver.HttpServer;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 验证「回调只能当提醒、不能当支付凭证」：
 * 验签通过后仍必须回查网关确认 status=1 才允许入账。
 */
class EpayNotifyRequeryTest {

    private static final String PID = "1003";
    private static final String KEY = "testkey123";
    private static final String OUT_TRADE_NO = "20261022210000123456";

    private HttpServer server;
    private volatile String gatewayBody;
    private volatile int gatewayHits;

    private VipOrderMapper vipOrderMapper;
    private EpayService service;

    @BeforeEach
    void setUp() throws Exception {
        // LambdaUpdateWrapper.set() 会立即解析列名，需要先注册实体元数据
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(new MybatisConfiguration(), "");
        TableInfoHelper.initTableInfo(assistant, VipOrder.class);
        TableInfoHelper.initTableInfo(assistant, User.class);

        // 默认：网关说「未支付」
        gatewayBody = "{\"code\":1,\"status\":0,\"out_trade_no\":\"" + OUT_TRADE_NO + "\"}";
        gatewayHits = 0;

        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/api.php", exchange -> {
            gatewayHits++;
            byte[] bytes = gatewayBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        });
        server.start();

        EpayProperties props = new EpayProperties();
        props.setEnabled(true);
        props.setApiUrl("http://127.0.0.1:" + server.getAddress().getPort() + "/");
        props.setPid(PID);
        props.setKey(KEY);
        props.setNotifyUrl("https://example.com/api/payment/epay/notify");
        props.setReturnUrl("https://example.com/payment/result");

        User user = new User();
        user.setId(9L);
        user.setVipLevel(0);
        user.setVipExpireTime(null);

        IUserService userService = mock(IUserService.class);
        when(userService.getById(9L)).thenReturn(user);
        when(userService.update(any(), any())).thenReturn(true);

        vipOrderMapper = mock(VipOrderMapper.class);
        service = new EpayService(props, vipOrderMapper, userService,
                mock(ISystemConfigService.class), new ObjectMapper(), noopTransactionTemplate());
    }

    /** 单测不接数据库，用一个什么都不做的 PlatformTransactionManager 直接执行回调 */
    private static TransactionTemplate noopTransactionTemplate() {
        AbstractPlatformTransactionManager manager = new AbstractPlatformTransactionManager() {
            @Override
            protected Object doGetTransaction() {
                return new Object();
            }

            @Override
            protected void doBegin(Object transaction, TransactionDefinition definition) {
            }

            @Override
            protected void doCommit(DefaultTransactionStatus status) {
            }

            @Override
            protected void doRollback(DefaultTransactionStatus status) {
            }
        };
        return new TransactionTemplate(manager);
    }

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    private VipOrder pendingOrder() {
        VipOrder order = new VipOrder();
        order.setId(1L);
        order.setUserId(9L);
        order.setVipLevel(1);
        order.setAmount(new BigDecimal("29.00"));
        order.setStatus("PENDING");
        order.setOutTradeNo(OUT_TRADE_NO);
        order.setCreateTime(LocalDateTime.now());
        return order;
    }

    private Map<String, String> notifyParams(String money) {
        Map<String, String> p = new HashMap<>();
        p.put("pid", PID);
        p.put("trade_no", "GW123456");
        p.put("out_trade_no", OUT_TRADE_NO);
        p.put("type", "wxpay");
        p.put("name", "LearnSphere 月度会员");
        p.put("money", money);
        p.put("trade_status", "TRADE_SUCCESS");
        p.put("sign_type", "MD5");
        p.put("sign", EpaySigner.sign(p, KEY));
        return p;
    }

    @Test
    void rejectsNotifyWhenGatewaySaysUnpaid() {
        when(vipOrderMapper.selectOne(any())).thenReturn(pendingOrder());

        boolean ok = service.handleNotify(notifyParams("29.00"));

        assertFalse(ok, "网关查单未确认已支付时必须拒绝入账");
        assertEquals(1, gatewayHits, "必须真实发起一次回查");
        verify(vipOrderMapper, never()).update(any(), any());
    }

    @Test
    void creditsOnlyAfterGatewayConfirmsPaid() {
        gatewayBody = "{\"code\":1,\"status\":1,\"out_trade_no\":\"" + OUT_TRADE_NO
                + "\",\"trade_no\":\"GW123456\",\"money\":\"29.00\",\"type\":\"wxpay\"}";
        when(vipOrderMapper.selectOne(any())).thenReturn(pendingOrder());
        when(vipOrderMapper.update(any(), any())).thenReturn(1);

        boolean ok = service.handleNotify(notifyParams("29.00"));

        assertTrue(ok);
        assertEquals(1, gatewayHits);
        verify(vipOrderMapper).update(any(), any());
    }

    @Test
    void rejectsForgedNotifyWithoutCallingGateway() {
        Map<String, String> params = notifyParams("29.00");
        params.put("sign", "0".repeat(32)); // 伪造签名

        boolean ok = service.handleNotify(params);

        assertFalse(ok);
        assertEquals(0, gatewayHits, "验签失败不应发起查单");
        verify(vipOrderMapper, never()).update(any(), any());
    }

    @Test
    void rejectsWhenAmountDiffersFromOrder() {
        gatewayBody = "{\"code\":1,\"status\":1,\"out_trade_no\":\"" + OUT_TRADE_NO
                + "\",\"trade_no\":\"GW123456\",\"money\":\"0.01\",\"type\":\"wxpay\"}";
        when(vipOrderMapper.selectOne(any())).thenReturn(pendingOrder());

        boolean ok = service.handleNotify(notifyParams("0.01"));

        assertFalse(ok, "金额与订单不一致必须拒绝");
        verify(vipOrderMapper, never()).update(any(), any());
    }

    @Test
    void rejectsWhenGatewayUnreachable() {
        server.stop(0);
        when(vipOrderMapper.selectOne(any())).thenReturn(pendingOrder());

        boolean ok = service.handleNotify(notifyParams("29.00"));

        assertFalse(ok, "网关不可达时不能凭回调直接入账");
        verify(vipOrderMapper, never()).update(any(), any());
    }

    @Test
    void repeatedNotifyForPaidOrderIsAcknowledgedWithoutRequery() {
        VipOrder paid = pendingOrder();
        paid.setStatus("PAID");
        when(vipOrderMapper.selectOne(any())).thenReturn(paid);

        boolean ok = service.handleNotify(notifyParams("29.00"));

        assertTrue(ok, "已入账订单的重复通知应回复 success 让网关停止重试");
        assertEquals(0, gatewayHits, "已终态订单无需再查单");
    }
}
