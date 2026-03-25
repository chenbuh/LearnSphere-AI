package com.learnsphere.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP地址工具类
 */
@Slf4j
public class IpUtils {

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private static final Map<String, IpLocation> LOCATION_CACHE = new ConcurrentHashMap<>();

    /**
     * 获取客户端真实IP地址
     * 支持多级代理
     */
    public static String getIpAddress(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // 对于多级代理，取第一个不为 unknown 的IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        // 本地访问
        if ("0:0:0:0:0:0:0:1".equals(ip) || "127.0.0.1".equals(ip)) {
            ip = "127.0.0.1";
        }

        return ip;
    }

    /**
     * 根据IP地址获取地理位置信息
     */
    public static IpLocation getIpLocation(String ip) {
        String normalizedIp = normalizeIp(ip);
        if (normalizedIp == null) {
            return createUnknownLocation();
        }

        // 本地IP
        if ("127.0.0.1".equals(normalizedIp) || "localhost".equalsIgnoreCase(normalizedIp)) {
            return createLocation("中国", "本地", "本地");
        }

        // 局域网IP
        if (isInternalIp(normalizedIp)) {
            return createLocation("中国", "局域网", "内网IP");
        }

        return LOCATION_CACHE.computeIfAbsent(normalizedIp, key -> {
            IpLocation resolvedLocation = resolveFromIpApi(key);
            if (!hasMeaningfulLocation(resolvedLocation)) {
                resolvedLocation = resolveFromPcOnline(key);
            }
            if (!hasMeaningfulLocation(resolvedLocation)) {
                resolvedLocation = createUnknownLocation();
            }
            return resolvedLocation;
        }).copy();
    }

    /**
     * 判断是否为内网IP
     */
    private static boolean isInternalIp(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }

        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            return false;
        }

        try {
            int first = Integer.parseInt(parts[0]);
            int second = Integer.parseInt(parts[1]);

            // 10.0.0.0 - 10.255.255.255
            if (first == 10) {
                return true;
            }

            // 172.16.0.0 - 172.31.255.255
            if (first == 172 && second >= 16 && second <= 31) {
                return true;
            }

            // 192.168.0.0 - 192.168.255.255
            if (first == 192 && second == 168) {
                return true;
            }

            return false;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private static IpLocation resolveFromIpApi(String ip) {
        try {
            String responseBody = sendGet("http://ip-api.com/json/" + ip + "?lang=zh-CN");
            if (responseBody == null) {
                return createUnknownLocation();
            }

            JsonNode jsonNode = OBJECT_MAPPER.readTree(responseBody);
            if (!"success".equalsIgnoreCase(jsonNode.path("status").asText())) {
                log.debug("ip-api lookup failed for ip={}, message={}", ip, jsonNode.path("message").asText());
                return createUnknownLocation();
            }

            String country = trimToNull(jsonNode.path("country").asText());
            String province = trimToNull(jsonNode.path("regionName").asText());
            String city = trimToNull(jsonNode.path("city").asText());

            return normalizeLocation(country, province, city);
        } catch (Exception e) {
            log.debug("Failed to resolve IP location via ip-api. ip={}", ip, e);
            return createUnknownLocation();
        }
    }

    private static IpLocation resolveFromPcOnline(String ip) {
        try {
            String responseBody = sendGet("https://whois.pconline.com.cn/ipJson.jsp?json=true&ip=" + ip);
            if (responseBody == null) {
                return createUnknownLocation();
            }

            JsonNode jsonNode = OBJECT_MAPPER.readTree(responseBody);
            String province = trimToNull(jsonNode.path("pro").asText());
            String city = trimToNull(jsonNode.path("city").asText());
            String address = trimToNull(jsonNode.path("addr").asText());

            String country = null;
            if (province != null || city != null) {
                country = "中国";
            } else if (address != null) {
                String compactAddress = address.replaceAll("\\s+", " ").trim();
                int separatorIndex = compactAddress.indexOf(' ');
                country = separatorIndex > 0 ? compactAddress.substring(0, separatorIndex) : compactAddress;
            }

            return normalizeLocation(country, province, city);
        } catch (Exception e) {
            log.debug("Failed to resolve IP location via pconline. ip={}", ip, e);
            return createUnknownLocation();
        }
    }

    private static String sendGet(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(3))
                    .header("Accept", "application/json,text/plain,*/*")
                    .header("User-Agent", "LearnSphere-AI/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            }

            log.debug("IP location request failed. url={}, status={}", url, response.statusCode());
            return null;
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.debug("IP location request error. url={}", url, e);
            return null;
        }
    }

    private static IpLocation normalizeLocation(String country, String province, String city) {
        String normalizedCountry = trimToNull(country);
        String normalizedProvince = trimToNull(province);
        String normalizedCity = trimToNull(city);

        if (normalizedProvince == null && normalizedCountry != null) {
            normalizedProvince = normalizedCountry;
        }

        return createLocation(
                normalizedCountry != null ? normalizedCountry : "未知",
                normalizedProvince != null ? normalizedProvince : "未知",
                normalizedCity != null ? normalizedCity : "未知");
    }

    private static boolean hasMeaningfulLocation(IpLocation location) {
        if (location == null) {
            return false;
        }

        return hasRealValue(location.getCountry())
                || hasRealValue(location.getProvince())
                || hasRealValue(location.getCity());
    }

    private static boolean hasRealValue(String value) {
        return value != null && !value.isBlank() && !"未知".equals(value);
    }

    private static String normalizeIp(String ip) {
        String trimmed = trimToNull(ip);
        if (trimmed == null || "unknown".equalsIgnoreCase(trimmed)) {
            return null;
        }
        if ("0:0:0:0:0:0:0:1".equals(trimmed) || "::1".equals(trimmed)) {
            return "127.0.0.1";
        }
        return trimmed;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static IpLocation createLocation(String country, String province, String city) {
        IpLocation location = new IpLocation();
        location.setCountry(country);
        location.setProvince(province);
        location.setCity(city);
        return location;
    }

    private static IpLocation createUnknownLocation() {
        return createLocation("未知", "未知", "未知");
    }

    /**
     * IP地理位置信息
     */
    public static class IpLocation {
        private String country;
        private String province;
        private String city;

        public String getCountry() {
            return country;
        }

        public void setCountry(String country) {
            this.country = country;
        }

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public IpLocation copy() {
            return createLocation(country, province, city);
        }
    }
}
