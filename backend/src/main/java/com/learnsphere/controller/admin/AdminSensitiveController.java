package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.SensitiveLog;
import com.learnsphere.mapper.SensitiveLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 后台敏感内容审计控制器
 */
@RestController
@RequestMapping("/api/admin/sensitive")
@RequiredArgsConstructor
@SaCheckRole("admin")
public class AdminSensitiveController {

    private final SensitiveLogMapper sensitiveLogMapper;

    /**
     * 分页查询审核日志
     */
    @GetMapping("/list")
    public Result<Page<SensitiveLog>> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        Page<SensitiveLog> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SensitiveLog> wrapper = new LambdaQueryWrapper<>();

        if (cn.hutool.core.util.StrUtil.isNotBlank(keyword)) {
            wrapper.like(SensitiveLog::getUsername, keyword)
                    .or()
                    .like(SensitiveLog::getContent, keyword)
                    .or()
                    .like(SensitiveLog::getMatchedWord, keyword);
        }

        wrapper.orderByDesc(SensitiveLog::getCreateTime);

        return Result.success(sensitiveLogMapper.selectPage(pageParam, wrapper));
    }

    /**
     * 删除审核日志
     */
    @DeleteMapping("/{id}")
    @com.learnsphere.common.annotation.AdminOperation(module = "内容审计", action = "删除审计记录")
    public Result<Void> delete(@PathVariable Long id) {
        sensitiveLogMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 批量删除审核日志
     */
    @PostMapping("/batch-delete")
    @com.learnsphere.common.annotation.AdminOperation(module = "内容审计", action = "批量删除审计记录")
    public Result<Void> batchDelete(@RequestBody java.util.List<Long> ids) {
        sensitiveLogMapper.deleteBatchIds(ids);
        return Result.success();
    }
}
