package com.learnsphere.common.filter;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HtmlUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

/**
 * XSS 过滤请求包装类
 */
public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper {

    public XssHttpServletRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    @Override
    public String[] getParameterValues(String name) {
        String[] values = super.getParameterValues(name);
        if (values == null) {
            return null;
        }
        int count = values.length;
        String[] encodedValues = new String[count];
        for (int i = 0; i < count; i++) {
            encodedValues[i] = HtmlUtil.filter(values[i]);
        }
        return encodedValues;
    }

    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        if (StrUtil.isBlank(value)) {
            return value;
        }
        return HtmlUtil.filter(value);
    }

    @Override
    public String getHeader(String name) {
        String value = super.getHeader(name);
        if (StrUtil.isBlank(value)) {
            return value;
        }
        return HtmlUtil.filter(value);
    }

    /**
     * 注意：对于普通的 JSON 请求体，Hutool 的 HtmlUtil 加在 Body 上需要谨慎。
     * 这里主要处理 Parameter，针对 Body 的处理通常在序列化层（Jackson）做。
     */
}
