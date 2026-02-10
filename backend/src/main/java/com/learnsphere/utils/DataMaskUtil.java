package com.learnsphere.utils;

import cn.hutool.core.util.DesensitizedUtil;
import cn.hutool.core.util.ReUtil;
import cn.hutool.core.util.StrUtil;

/**
 * 敏感数据脫敏工具类
 * 防止 PII (个人隐私) 数据泄露到日志系统
 */
public class DataMaskUtil {

    /**
     * 对文本内容进行智能脱敏
     * 自动识别手机号、邮箱、身份证号并脱敏
     */
    public static String maskSensitiveInfo(String content) {
        if (StrUtil.isBlank(content)) {
            return content;
        }

        String result = content;

        // 1. 脱敏手机号 (近似正则)
        result = ReUtil.replaceAll(result, "1[3-9]\\d{9}", m -> DesensitizedUtil.mobilePhone(m.group()));

        // 2. 脱敏邮箱
        result = ReUtil.replaceAll(result,
                "[\\w!#$%&'*+/=?^_`{|}~-]+(?:\\.[\\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\\w](?:[\\w-]*[\\w])?\\.)+[\\w](?:[\\w-]*[\\w])?",
                m -> DesensitizedUtil.email(m.group()));

        // 3. 脱敏身份证 (简单正则)
        result = ReUtil.replaceAll(result, "\\d{15}|\\d{18}|\\d{17}(\\d|X|x)",
                m -> DesensitizedUtil.idCardNum(m.group(), 1, 2));

        return result;
    }
}
