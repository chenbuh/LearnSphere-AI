package com.learnsphere.controller.admin;

import cn.hutool.core.util.NumberUtil;
import cn.hutool.system.SystemUtil;
import com.learnsphere.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.util.HashMap;
import java.util.Map;

/**
 * 系统运维监控控制器
 */
@RestController
@RequestMapping("/api/admin/monitor")
public class AdminMonitorController {

    @GetMapping("/server")
    public Result<?> getServerInfo() {
        Map<String, Object> server = new HashMap<>();

        try {
            // 1. 系统基础信息 (OS)
            OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
            server.put("osName", SystemUtil.getOsInfo().getName());
            server.put("osArch", SystemUtil.getOsInfo().getArch());
            server.put("processors", osBean.getAvailableProcessors());

            // 系统负载 (Windows下可能无效返回-1)
            double load = osBean.getSystemLoadAverage();
            server.put("systemLoad", load < 0 ? 0 : load);

            // 2. JVM 内存信息
            MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
            long heapMax = memoryBean.getHeapMemoryUsage().getMax();
            long heapUsed = memoryBean.getHeapMemoryUsage().getUsed();
            long nonHeapUsed = memoryBean.getNonHeapMemoryUsage().getUsed();

            // Convert to MB
            server.put("heapMax", NumberUtil.div(heapMax, 1024 * 1024, 2));
            server.put("heapUsed", NumberUtil.div(heapUsed, 1024 * 1024, 2));
            server.put("nonHeapUsed", NumberUtil.div(nonHeapUsed, 1024 * 1024, 2));

            // 计算使用率
            double usage = heapMax > 0 ? (double) heapUsed / heapMax * 100 : 0;
            server.put("heapUsage", NumberUtil.round(usage, 2));

            // 3. 磁盘信息 (当前项目所在磁盘)
            File root = new File(".");
            long totalSpace = root.getTotalSpace();
            long freeSpace = root.getFreeSpace();
            long usedSpace = totalSpace - freeSpace;

            server.put("diskTotal", NumberUtil.div(totalSpace, 1024 * 1024 * 1024, 2)); // GB
            server.put("diskUsed", NumberUtil.div(usedSpace, 1024 * 1024 * 1024, 2)); // GB
            server.put("diskFree", NumberUtil.div(freeSpace, 1024 * 1024 * 1024, 2)); // GB
            server.put("diskUsage", totalSpace > 0 ? NumberUtil.round((double) usedSpace / totalSpace * 100, 2) : 0);

            // 4. Java 运行时信息
            server.put("javaVersion", SystemUtil.getJavaInfo().getVersion());
            server.put("jvmName", SystemUtil.getJvmInfo().getName());
            server.put("startTime", ManagementFactory.getRuntimeMXBean().getStartTime());
            server.put("uptime", ManagementFactory.getRuntimeMXBean().getUptime()); // 毫秒

            // 5. 线程信息
            server.put("threadCount", ManagementFactory.getThreadMXBean().getThreadCount());
            server.put("daemonThreadCount", ManagementFactory.getThreadMXBean().getDaemonThreadCount());

        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取系统监控信息失败: " + e.getMessage());
        }

        return Result.success(server);
    }
}
