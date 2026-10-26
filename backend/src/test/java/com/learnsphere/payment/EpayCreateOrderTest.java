package com.learnsphere.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.mapper.VipOrderMapper;
import com.learnsphere.service.ISystemConfigService;
import com.learnsphere.service.IUserService;
import com.sun.net.httpserver.HttpServer;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;

import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 下单侧的限制：待支付订单上限、订单号碰撞重试。
 */
class EpayCreateOrderTest {

    private HttpServer server;
    private VipOrderMapper vipOrderMapper;
    private EpayService service;

    @BeforeEach
    void setUp() throws Exception {
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(new MybatisConfiguration(), "");
        TableInfoHelper.initTableInfo(assistant, VipOrder.class);

        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/mapi.php", exchange -> {
            byte[] bytes = ("{\"code\":1,\"trade_no\":\"GW1\","
                    + "\"qrcode\":\"https://pay.example.com/qr/abc\",\"payurl\":\"\"}")
                    .getBytes(StandardCharsets.UTF_8);
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
        props.setPid("1003");
        props.setKey("testkey123");
        props.setNotifyUrl("https://example.com/api/payment/epay/notify");
        props.setReturnUrl("https://example.com/payment/result");

        vipOrderMapper = mock(VipOrderMapper.class);
        service = new EpayService(props, EpayTestSupport.configServiceWithDefaults(props), vipOrderMapper,
                mock(IUserService.class), mock(ISystemConfigService.class), new ObjectMapper(),
                noopTransactionTemplate());
    }

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

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

    private VipUpgradeCalculator.Quote newQuote() {
        return new VipUpgradeCalculator.Quote("NEW", 1, null,
                new BigDecimal("29.00"), BigDecimal.ZERO.setScale(2), new BigDecimal("29.00"), 0);
    }

    @Test
    void rejectsWhenPendingOrderLimitReached() {
        when(vipOrderMapper.selectCount(any())).thenReturn(5L);

        BusinessException e = assertThrows(BusinessException.class,
                () -> service.createOrder(9L, newQuote(), "wxpay", "pc", "127.0.0.1"));

        assertEquals(400, e.getCode());
        assertTrue(e.getMessage().contains("未支付订单"));
        verify(vipOrderMapper, never()).insert(any());
    }

    @Test
    void retriesWhenOutTradeNoCollides() {
        when(vipOrderMapper.selectCount(any())).thenReturn(0L);
        // 第一次插入撞唯一索引，第二次成功
        doThrow(new DuplicateKeyException("dup")).doReturn(1).when(vipOrderMapper).insert(any());

        Map<String, Object> result = service.createOrder(9L, newQuote(), "wxpay", "pc", "127.0.0.1");

        assertNotNull(result);
        assertEquals("https://pay.example.com/qr/abc", result.get("qrcode"));
        assertNotNull(result.get("outTradeNo"));
        verify(vipOrderMapper, org.mockito.Mockito.times(2)).insert(any());
    }
}
