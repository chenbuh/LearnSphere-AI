package com.learnsphere.controller;

import com.learnsphere.payment.EpayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 易支付回调入口的白名单与重复字段校验。
 * 该接口是公开的（不走登录鉴权），因此参数集合必须先于验签被约束。
 */
class PaymentNotifyWhitelistTest {

    private EpayService epayService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        epayService = mock(EpayService.class);
        PaymentController controller = new PaymentController(mock(StringRedisTemplate.class), epayService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void rejectsFieldOutsideWhitelist() throws Exception {
        mockMvc.perform(post("/api/payment/epay/notify")
                        .param("pid", "1003")
                        .param("out_trade_no", "X1")
                        .param("trade_status", "TRADE_SUCCESS")
                        .param("evil_param", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("fail"));

        verify(epayService, never()).handleNotify(any());
    }

    @Test
    void rejectsRepeatedField() throws Exception {
        mockMvc.perform(post("/api/payment/epay/notify")
                        .param("pid", "1003")
                        .param("out_trade_no", "X1")
                        .param("trade_status", "TRADE_SUCCESS")
                        .param("money", "29.00", "0.01"))
                .andExpect(status().isOk())
                .andExpect(content().string("fail"));

        verify(epayService, never()).handleNotify(any());
    }

    @Test
    void passesStandardFieldsToService() throws Exception {
        when(epayService.handleNotify(any())).thenReturn(true);

        mockMvc.perform(post("/api/payment/epay/notify")
                        .param("pid", "1003")
                        .param("trade_no", "GW1")
                        .param("out_trade_no", "X1")
                        .param("type", "wxpay")
                        .param("name", "LearnSphere 月度会员")
                        .param("money", "29.00")
                        .param("trade_status", "TRADE_SUCCESS")
                        .param("sign", "abc")
                        .param("sign_type", "MD5"))
                .andExpect(status().isOk())
                .andExpect(content().string("success"));

        verify(epayService).handleNotify(any());
    }

    @Test
    void returnsFailWhenServiceRejects() throws Exception {
        when(epayService.handleNotify(any())).thenReturn(false);

        mockMvc.perform(post("/api/payment/epay/notify")
                        .param("pid", "1003")
                        .param("out_trade_no", "X1")
                        .param("trade_status", "TRADE_SUCCESS"))
                .andExpect(status().isOk())
                .andExpect(content().string("fail"));
    }
}
