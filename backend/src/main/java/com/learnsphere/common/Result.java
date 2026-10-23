package com.learnsphere.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 统一返回结果
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
@Schema(description = "统一返回结果")
public class Result<T> {
    @Schema(description = "状态码", example = "200")
    private Integer code;

    @Schema(description = "返回消息", example = "操作成功")
    private String message;

    @Schema(description = "返回数据")
    private T data;

    /**
     * 动态加密使用的密钥日期（YYYY-MM-DD）。
     *
     * 仅加密接口会填。前端优先用它来解密密文：
     * 如果让前端自己算"今天"，一旦浏览器和服务器时区不同（例如服务器在 UTC，
     * 浏览器在 UTC+8），跨零点前后就会用错密钥，解出 n->a、空格->/ 这类乱码。
     */
    @Schema(description = "加密密钥日期", example = "2026-10-18")
    private String keyDate;

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("操作成功");
        result.setData(data);
        return result;
    }

    /**
     * 成功响应，并带上本次加密使用的密钥日期
     */
    public static <T> Result<T> successWithKeyDate(T data, String keyDate) {
        Result<T> result = success(data);
        result.setKeyDate(keyDate);
        return result;
    }

    public static <T> Result<T> success(String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> successMessage(String message) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage(message);
        result.setData(null);
        return result;
    }

    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> error(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}
