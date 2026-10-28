package com.learnsphere.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * {@link EdgeTTSController#enforceAmericanEnglish} 的单元测试。
 *
 * <p>背景：用户反馈「语音不像美式，也不像英式」。根因之一是前端可能把英音、
 * 澳音甚至其他英语口音的音色传到后端。产品要求所有学习场景统一美音，
 * 因此在服务端加最后一道兜底：任何 en-* 音色都映射到 en-US-JennyNeural。
 */
@DisplayName("EdgeTTSController - 英语音色强制美音")
class EdgeTTSControllerAmericanEnglishTest {

    private EdgeTTSController newController(boolean forceAmerican) {
        EdgeTTSController controller = new EdgeTTSController();
        ReflectionTestUtils.setField(controller, "forceAmericanEnglish", forceAmerican);
        return controller;
    }

    @ParameterizedTest
    @DisplayName("各种英语口音一律映射到 Jenny 美音")
    @CsvSource({
        "en-US-JennyNeural, en-US-JennyNeural",
        "en-US-GuyNeural, en-US-JennyNeural",
        "en-GB-SoniaNeural, en-US-JennyNeural",
        "en-GB-RyanNeural, en-US-JennyNeural",
        "en-AU-NatashaNeural, en-US-JennyNeural",
        "en-IN-NeerjaNeural, en-US-JennyNeural",
        "en-CA-ClaraNeural, en-US-JennyNeural"
    })
    void englishVoicesMappedToAmerican(String input, String expected) {
        assertThat(newController(true).enforceAmericanEnglish(input)).isEqualTo(expected);
    }

    @ParameterizedTest
    @DisplayName("中文语音原样保留，供调音台使用")
    @CsvSource({
        "zh-CN-XiaoxiaoNeural, zh-CN-XiaoxiaoNeural",
        "zh-CN-YunxiNeural, zh-CN-YunxiNeural"
    })
    void chineseVoicesKept(String input, String expected) {
        assertThat(newController(true).enforceAmericanEnglish(input)).isEqualTo(expected);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("空值原样返回，由调用方兜默认值")
    void nullAndEmpty(String input) {
        assertThat(newController(true).enforceAmericanEnglish(input)).isEqualTo(input);
    }

    @Test
    @DisplayName("首尾空白会被去掉")
    void trimsWhitespace() {
        assertThat(newController(true).enforceAmericanEnglish("  en-GB-SoniaNeural  "))
                .isEqualTo("en-US-JennyNeural");
    }

    @Test
    @DisplayName("大小写不敏感：EN-GB 也算英语")
    void caseInsensitive() {
        assertThat(newController(true).enforceAmericanEnglish("EN-GB-SoniaNeural"))
                .isEqualTo("en-US-JennyNeural");
    }

    @Test
    @DisplayName("关闭开关后不做映射，便于调试其他音色")
    void disabledKeepsOriginal() {
        assertThat(newController(false).enforceAmericanEnglish("en-GB-SoniaNeural"))
                .isEqualTo("en-GB-SoniaNeural");
    }

    @Test
    @DisplayName("空白字符串原样返回（不做 trim 以外的处理）")
    void blankKept() {
        assertThat(newController(true).enforceAmericanEnglish("   ")).isEqualTo("   ");
    }
}
