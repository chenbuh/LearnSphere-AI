package com.learnsphere.service.impl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@link UserLogServiceImpl#truncateUserAgent} 的单元测试。
 *
 * <p>user_agent 列宽 512。若超长 UA 不做截断，插入会失败并导致整条日志丢失 ——
 * 日志丢失比日志截断严重得多，所以这里重点覆盖边界。
 */
@DisplayName("UserLogServiceImpl - 原始 UA 入库前的规整")
class UserLogServiceImplTest {

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   ", "\t", "\n"})
    @DisplayName("空值或纯空白返回 null，不写入空串")
    void blankBecomesNull(String input) {
        assertThat(UserLogServiceImpl.truncateUserAgent(input)).isNull();
    }

    @Test
    @DisplayName("正常 UA 原样保留")
    void normalKept() {
        String ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                + "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
        assertThat(UserLogServiceImpl.truncateUserAgent(ua)).isEqualTo(ua);
    }

    @Test
    @DisplayName("首尾空白会被去掉")
    void trimsWhitespace() {
        String ua = "  Mozilla/5.0 (iPhone) MicroMessenger/8.0.50  ";
        assertThat(UserLogServiceImpl.truncateUserAgent(ua)).isEqualTo("Mozilla/5.0 (iPhone) MicroMessenger/8.0.50");
    }

    @Test
    @DisplayName("恰好 512 字符不截断")
    void exactlyMaxLength() {
        String ua = "a".repeat(512);
        assertThat(UserLogServiceImpl.truncateUserAgent(ua)).hasSize(512).isEqualTo(ua);
    }

    @Test
    @DisplayName("超过 512 字符截断到 512，避免插入失败丢整条日志")
    void overMaxLengthTruncated() {
        String ua = "a".repeat(2000);
        String result = UserLogServiceImpl.truncateUserAgent(ua);
        assertThat(result).hasSize(512);
        assertThat(result).isEqualTo(ua.substring(0, 512));
    }

    @Test
    @DisplayName("超长且带首尾空白：先 trim 再判断长度")
    void overMaxLengthWithWhitespace() {
        String ua = "  " + "b".repeat(600) + "  ";
        String result = UserLogServiceImpl.truncateUserAgent(ua);
        assertThat(result).hasSize(512);
        assertThat(result).startsWith("bbb");
    }
}
