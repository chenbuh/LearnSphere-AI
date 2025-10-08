package com.learnsphere.common;

import lombok.Data;

/**
 * 分页结果
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
public class PageResult<T> {
    private Long total;
    private Integer page;
    private Integer size;
    private T records;

    public PageResult(Long total, Integer page, Integer size, T records) {
        this.total = total;
        this.page = page;
        this.size = size;
        this.records = records;
    }
}
