package com.learnsphere.payment;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EpaySignerTest {

    private Map<String, String> sample() {
        Map<String, String> params = new HashMap<>();
        params.put("pid", "1001");
        params.put("type", "alipay");
        params.put("out_trade_no", "20261011001");
        params.put("name", "VIP 月度");
        params.put("money", "1.00");
        params.put("sitename", "");
        params.put("sign_type", "MD5");
        return params;
    }

    @Test
    void signsSortedNonEmptyParamsWithKeyAppended() {
        // md5("money=1.00&name=VIP 月度&out_trade_no=20261011001&pid=1001&type=alipay" + "testkey")
        assertEquals("c830d6039ec558fbde07cfe31b2fb3ed", EpaySigner.sign(sample(), "testkey"));
    }

    @Test
    void verifyAcceptsValidAndRejectsTampered() {
        Map<String, String> params = sample();
        params.put("sign", EpaySigner.sign(params, "testkey"));
        assertTrue(EpaySigner.verify(params, "testkey"));

        params.put("money", "0.01");
        assertFalse(EpaySigner.verify(params, "testkey"));

        params.remove("sign");
        assertFalse(EpaySigner.verify(params, "testkey"));
    }
}
