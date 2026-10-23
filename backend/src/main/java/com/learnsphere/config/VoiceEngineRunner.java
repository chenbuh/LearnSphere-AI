package com.learnsphere.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

/**
 * 语音引擎启动器
 * 自动管理本地 Python TTS/STT 服务的生命周期
 */
@Component
@Slf4j
public class VoiceEngineRunner {

    @Value("${voice-engine.enabled:true}")
    private boolean enabled;

    @Value("${voice-engine.python-command:python}")
    private String pythonCommand;

    /**
     * 实际执行的解释器命令（可能是 "py -3.8" 这样的多段命令）。
     * pythonCommand 是配置里的原始字符串，ProcessBuilder 只能接收单个可执行文件，
     * 所以探测出可用解释器后统一用这个列表来拼命令。
     */
    private List<String> interpreterCommand = new ArrayList<>();

    /** 语音服务守护：定时探活，进程挂了自动拉起 */
    private java.util.concurrent.ScheduledExecutorService watchdog;
    private volatile boolean shuttingDown = false;
    /** 自动重启次数，用于日志与退避，避免疯狂重启 */
    private volatile int restartCount = 0;

    @Value("${voice-engine.script-path:edge_tts_server.py}")
    private String scriptPath;

    @Value("${voice-engine.port:5010}")
    private int port;

    @Value("${voice-engine.host:127.0.0.1}")
    private String host;

    @Value("${voice-engine.startup-timeout-seconds:20}")
    private int startupTimeoutSeconds;

    @Value("${voice-engine.auto-install-deps:true}")
    private boolean autoInstallDeps;

    @Value("${voice-engine.requirements-path:requirements-voice.txt}")
    private String requirementsPath;

    @Value("${voice-engine.install-timeout-seconds:600}")
    private int installTimeoutSeconds;

    @Value("${voice-engine.extra-python-path:}")
    private String extraPythonPath;

    private Process process;

    private final ExecutorService logExecutor = Executors.newSingleThreadExecutor(r -> {
        Thread t = new Thread(r, "voice-engine-log-reader");
        t.setDaemon(true);
        return t;
    });

    @PostConstruct
    public void init() {
        if (!enabled) {
            log.info("Voice Engine is disabled by configuration.");
            return;
        }

        if (isServiceRunning()) {
            log.info("Voice Engine service is already running on port {}.", port);
            return;
        }

        // 优先挑一个真正装了 edge-tts 的解释器。
        // 配置里的 pythonCommand 常常指向某个没装依赖的 Python（例如 Anaconda 3.14 没有
        // edge-tts 的 wheel），直接用它会让语音服务起不来，而语音失效对用户体验影响很大。
        selectWorkingInterpreter();

        startService();
    }

    /**
     * 依次探测候选 Python 解释器，选中第一个能 import edge_tts 的。
     * 找到后会覆盖 pythonCommand 字段，后续启动与依赖检查都用它。
     */
    private void selectWorkingInterpreter() {
        List<List<String>> candidates = new ArrayList<>();
        candidates.add(List.of(pythonCommand));
        // Windows py launcher 常见的多版本场景
        candidates.add(List.of("py", "-3.12"));
        candidates.add(List.of("py", "-3.11"));
        candidates.add(List.of("py", "-3.10"));
        candidates.add(List.of("py", "-3.9"));
        candidates.add(List.of("py", "-3.8"));
        candidates.add(List.of("python3"));
        candidates.add(List.of("python"));

        for (List<String> candidate : candidates) {
            List<String> cmd = new ArrayList<>(candidate);
            cmd.add("-c");
            cmd.add("import edge_tts");
            try {
                ProcessBuilder pb = new ProcessBuilder(cmd);
                pb.redirectErrorStream(true);
                Process process = pb.start();
                boolean finished = process.waitFor(15, TimeUnit.SECONDS);
                if (!finished) {
                    process.destroyForcibly();
                    continue;
                }
                if (process.exitValue() == 0) {
                    String joined = String.join(" ", candidate);
                    interpreterCommand = new ArrayList<>(candidate);
                    if (!joined.equals(pythonCommand)) {
                        log.info("Voice Engine: using interpreter '{}' (has edge-tts).", joined);
                    } else {
                        log.info("Voice Engine: configured interpreter '{}' has edge-tts.", joined);
                    }
                    return;
                }
            } catch (Exception e) {
                // 该候选不可用，继续试下一个
            }
        }

        interpreterCommand = new ArrayList<>(List.of(pythonCommand));
        log.error("Voice Engine: no Python interpreter with edge-tts found. "
                + "TTS will fail until one is installed: pip install edge-tts");
    }

    /**
     * 每 30 秒探活一次；发现服务不可用就自动重启。
     * 语音失效对用户是明显缺陷，不能只在启动时检查一次。
     */
    private void startWatchdog() {
        if (watchdog != null) {
            return;
        }
        watchdog = java.util.concurrent.Executors.newSingleThreadScheduledExecutor(r -> {
            Thread th = new Thread(r, "voice-engine-watchdog");
            th.setDaemon(true);
            return th;
        });
        watchdog.scheduleWithFixedDelay(() -> {
            if (shuttingDown) {
                return;
            }
            try {
                if (isServiceRunning()) {
                    return;
                }
                if (restartCount >= 20) {
                    log.error("Voice Engine restart limit reached ({}); giving up. TTS may be unavailable.", restartCount);
                    return;
                }
                restartCount++;
                log.warn("Voice Engine health check failed; restarting (attempt {}).", restartCount);
                Process p = process;
                if (p != null && p.isAlive()) {
                    p.destroyForcibly();
                }
                startServiceSilently();
            } catch (Exception e) {
                log.warn("Voice Engine watchdog error: {}", e.getMessage());
            }
        }, 30, 30, TimeUnit.SECONDS);
        log.info("Voice Engine watchdog started (interval 30s).");
    }

    /** watchdog 专用：重启时不重复注册 watchdog */
    private void startServiceSilently() {
        try {
            File scriptFile = resolveScriptFile();
            if (scriptFile == null) {
                log.error("Voice Engine script not found for restart: {}", scriptPath);
                return;
            }
            if (!ensureDependencies(scriptFile.getParentFile(), null)) {
                log.error("Voice Engine dependencies unavailable; skip restart.");
                return;
            }
            ProcessBuilder pb = new ProcessBuilder(concatCommand(scriptFile.getName()));
            pb.directory(scriptFile.getParentFile());
            pb.redirectErrorStream(true);
            applyPythonEnvironment(pb, null);
            process = pb.start();
            logExecutor.submit(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        log.info("[VoiceEngine] {}", line);
                    }
                } catch (IOException ignored) {
                }
            });
            if (waitForServiceReady()) {
                log.info("Voice Engine restarted successfully, now healthy.");
            } else {
                log.warn("Voice Engine restart did not become healthy in time.");
            }
        } catch (Exception e) {
            log.error("Voice Engine restart failed: {}", e.getMessage());
        }
    }

    /**
     * 把解释器命令和额外参数拼成完整命令列表。
     * interpreterCommand 可能是 ["py", "-3.8"]，直接传给 ProcessBuilder 会报找不到可执行文件。
     */
    private List<String> concatCommand(String... extra) {
        List<String> cmd = new ArrayList<>(interpreterCommand.isEmpty()
                ? List.of(pythonCommand)
                : interpreterCommand);
        cmd.addAll(List.of(extra));
        return cmd;
    }

    private boolean isServiceRunning() {
        try {
            URL url = new URL("http://" + host + ":" + port + "/health");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(1500);
            connection.setReadTimeout(1500);
            return connection.getResponseCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }

    private File resolveScriptFile() {
        Path configured = Paths.get(scriptPath);
        List<Path> candidates = new ArrayList<>();

        if (configured.isAbsolute()) {
            candidates.add(configured);
        } else {
            Path userDir = Paths.get(System.getProperty("user.dir"));
            candidates.add(userDir.resolve(configured));
            candidates.add(userDir.resolve("backend").resolve(configured));
        }

        for (Path candidate : candidates) {
            File file = candidate.normalize().toFile();
            if (file.exists() && file.isFile()) {
                return file;
            }
        }

        return null;
    }

    private File resolveRequirementsFile(File scriptDir) {
        Path configured = Paths.get(requirementsPath);
        List<Path> candidates = new ArrayList<>();

        if (configured.isAbsolute()) {
            candidates.add(configured);
        } else {
            Path userDir = Paths.get(System.getProperty("user.dir"));
            if (scriptDir != null) {
                candidates.add(scriptDir.toPath().resolve(configured));
            }
            candidates.add(userDir.resolve(configured));
            candidates.add(userDir.resolve("backend").resolve(configured));
        }

        for (Path candidate : candidates) {
            File file = candidate.normalize().toFile();
            if (file.exists() && file.isFile()) {
                return file;
            }
        }

        return null;
    }

    private void applyPythonEnvironment(ProcessBuilder pb, String runtimePythonPath) {
        pb.environment().putIfAbsent("PYTHONIOENCODING", "utf-8");
        pb.environment().putIfAbsent("PYTHONUTF8", "1");

        if (runtimePythonPath != null && !runtimePythonPath.isBlank()) {
            String existing = pb.environment().get("PYTHONPATH");
            String merged = runtimePythonPath;
            if (existing != null && !existing.isBlank()) {
                merged = runtimePythonPath + File.pathSeparator + existing;
            }
            pb.environment().put("PYTHONPATH", merged);
        }
    }

    private String joinPythonPaths(List<String> paths) {
        if (paths == null || paths.isEmpty()) {
            return "";
        }
        return String.join(File.pathSeparator, paths);
    }

    private void appendPythonPath(List<String> paths, String candidate) {
        if (candidate == null || candidate.isBlank()) {
            return;
        }
        String[] split = candidate.split(java.util.regex.Pattern.quote(File.pathSeparator));
        for (String item : split) {
            String trimmed = item == null ? "" : item.trim();
            if (!trimmed.isBlank() && !paths.contains(trimmed)) {
                paths.add(trimmed);
            }
        }
    }

    private String executeCommandAndCaptureFirstLine(
            List<String> command,
            File workingDir,
            int timeoutSeconds,
            String runtimePythonPath
    ) {
        ProcessBuilder pb = new ProcessBuilder(command);
        if (workingDir != null && workingDir.exists()) {
            pb.directory(workingDir);
        }
        pb.redirectErrorStream(true);
        applyPythonEnvironment(pb, runtimePythonPath);

        try {
            Process p = pb.start();
            String firstLine = null;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (firstLine == null && !line.isBlank()) {
                        firstLine = line.trim();
                    }
                }
            }
            boolean finished = p.waitFor(Math.max(timeoutSeconds, 1), TimeUnit.SECONDS);
            if (!finished || p.exitValue() != 0) {
                return null;
            }
            return firstLine;
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isScipyHealthy(File workingDir, String runtimePythonPath) {
        List<String> check = concatCommand(
                "-c",
                "import scipy,sys; sys.exit(0 if getattr(scipy,'__version__',None) else 1)");
        return runCommandWithLogging(check, workingDir, 15, "scipy-check", runtimePythonPath);
    }

    private String detectCondaScipySitePackages(File workingDir, String runtimePythonPath) {
        String prefix = executeCommandAndCaptureFirstLine(
                concatCommand("-c", "import sys; print(sys.prefix)"),
                workingDir,
                15,
                runtimePythonPath
        );
        if (prefix == null || prefix.isBlank()) {
            return null;
        }

        File pkgsDir = new File(prefix, "pkgs");
        if (!pkgsDir.exists() || !pkgsDir.isDirectory()) {
            return null;
        }

        File[] dirs = pkgsDir.listFiles(file ->
                file.isDirectory() && file.getName().toLowerCase(Locale.ROOT).startsWith("scipy-"));
        if (dirs == null || dirs.length == 0) {
            return null;
        }

        java.util.Arrays.sort(dirs, (a, b) -> b.getName().compareToIgnoreCase(a.getName()));
        for (File dir : dirs) {
            File candidate = new File(dir, "Lib\\site-packages");
            File scipyInit = new File(candidate, "scipy\\__init__.py");
            if (candidate.isDirectory() && scipyInit.exists()) {
                return candidate.getAbsolutePath();
            }
        }
        return null;
    }

    private String resolveRuntimePythonPath(File workingDir) {
        List<String> pathItems = new ArrayList<>();
        appendPythonPath(pathItems, extraPythonPath);
        String currentPath = joinPythonPaths(pathItems);

        if (isScipyHealthy(workingDir, currentPath)) {
            return currentPath;
        }

        String detected = detectCondaScipySitePackages(workingDir, currentPath);
        if (detected != null && !detected.isBlank()) {
            appendPythonPath(pathItems, detected);
            String resolved = joinPythonPaths(pathItems);
            if (isScipyHealthy(workingDir, resolved)) {
                log.info("Detected scipy fallback path for voice engine: {}", detected);
                return resolved;
            }
        }

        return currentPath;
    }

    private boolean ensureDependencies(File scriptDir, String runtimePythonPath) {
        if (!autoInstallDeps) {
            return true;
        }

        if (checkDependencies(scriptDir, runtimePythonPath)) {
            log.info("Voice Engine dependencies are ready.");
            return true;
        }

        File requirementsFile = resolveRequirementsFile(scriptDir);
        if (requirementsFile == null) {
            log.error("Voice Engine dependencies missing and requirements file not found. Configured path: {}", requirementsPath);
            return false;
        }

        log.warn("Voice Engine dependencies missing. Installing from {} ...", requirementsFile.getAbsolutePath());
        List<String> installCommand = concatCommand(
                "-m",
                "pip",
                "install",
                "-r",
                requirementsFile.getName()
        );
        boolean installOk = runCommandWithLogging(
                installCommand,
                requirementsFile.getParentFile(),
                Math.max(installTimeoutSeconds, 60),
                "pip",
                runtimePythonPath
        );

        if (!installOk) {
            return false;
        }

        return checkDependencies(scriptDir, runtimePythonPath);
    }

    private boolean checkDependencies(File workingDir, String runtimePythonPath) {
        log.info("Checking Voice Engine Python dependencies...");
        List<String> checkCommand = concatCommand(
                "-c",
                // 仅需 edge_tts：轻量脚本 edge_tts_lite.py 只用标准库 + edge-tts，
                // 不再依赖 flask / whisper / scipy / numba / ffmpeg（那些只在完整的 STT 服务里需要）。
                "import edge_tts; print(edge_tts.__version__ if hasattr(edge_tts, '__version__') else 'ok')"
        );
        return runCommandWithLogging(checkCommand, workingDir, 45, "deps-check", runtimePythonPath);
    }

    private boolean runCommandWithLogging(
            List<String> command,
            File workingDir,
            int timeoutSeconds,
            String label,
            String runtimePythonPath
    ) {
        ProcessBuilder pb = new ProcessBuilder(command);
        if (workingDir != null && workingDir.exists()) {
            pb.directory(workingDir);
        }
        pb.redirectErrorStream(true);
        applyPythonEnvironment(pb, runtimePythonPath);

        ExecutorService outputExecutor = Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "voice-engine-" + label);
            t.setDaemon(true);
            return t;
        });

        try {
            Process cmdProcess = pb.start();
            Future<?> outputFuture = outputExecutor.submit(() -> {
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(cmdProcess.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        log.info("[VoiceEngine][{}] {}", label, line);
                    }
                } catch (IOException e) {
                    log.error("Failed to read output for command [{}]", label, e);
                }
            });

            boolean finished = cmdProcess.waitFor(Math.max(timeoutSeconds, 1), TimeUnit.SECONDS);
            if (!finished) {
                cmdProcess.destroyForcibly();
                log.error("Command [{}] timed out after {} seconds: {}", label, timeoutSeconds, String.join(" ", command));
                return false;
            }

            try {
                outputFuture.get(3, TimeUnit.SECONDS);
            } catch (Exception e) {
                log.debug("Output reader for [{}] closed with exception: {}", label, e.getMessage());
            }

            int exitCode = cmdProcess.exitValue();
            if (exitCode != 0) {
                log.error("Command [{}] failed with exit code {}: {}", label, exitCode, String.join(" ", command));
                return false;
            }
            return true;
        } catch (IOException e) {
            log.error("Failed to start command [{}]: {}", label, String.join(" ", command), e);
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Command [{}] interrupted: {}", label, String.join(" ", command));
            return false;
        } finally {
            outputExecutor.shutdownNow();
        }
    }

    private void startService() {
        log.info("Starting Voice Engine service: {} {}", String.join(" ", interpreterCommand), scriptPath);

        try {
            File scriptFile = resolveScriptFile();
            if (scriptFile == null) {
                log.error("Voice Engine script not found. Configured path: {}", scriptPath);
                return;
            }

            String runtimePythonPath = resolveRuntimePythonPath(scriptFile.getParentFile());
            if (runtimePythonPath != null && !runtimePythonPath.isBlank()) {
                log.info("Voice Engine runtime PYTHONPATH activated.");
            }

            if (!ensureDependencies(scriptFile.getParentFile(), runtimePythonPath)) {
                log.error("Voice Engine dependency check/install failed. Skip startup.");
                return;
            }

            ProcessBuilder pb = new ProcessBuilder(concatCommand(scriptFile.getName()));
            // 将工作目录设置为脚本所在目录
            pb.directory(scriptFile.getParentFile());
            pb.redirectErrorStream(true);
            applyPythonEnvironment(pb, runtimePythonPath);

            process = pb.start();

            // 异步读取输出，防止进程挂起
            logExecutor.submit(() -> {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        log.info("[VoiceEngine] {}", line);
                    }
                } catch (IOException e) {
                    log.error("Error reading Voice Engine output", e);
                }
            });

            log.info("Voice Engine process started with PID {}, script at {}.", process.pid(), scriptFile.getAbsolutePath());
            if (waitForServiceReady()) {
                log.info("Voice Engine is ready at http://{}:{}/health", host, port);
            } else {
                log.warn("Voice Engine did not become healthy within {} seconds.", startupTimeoutSeconds);
            }

            startWatchdog();

        } catch (IOException e) {
            log.error("Failed to start Voice Engine service", e);
        }
    }

    private boolean waitForServiceReady() {
        long timeoutAt = System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(Math.max(startupTimeoutSeconds, 1));
        while (System.currentTimeMillis() < timeoutAt) {
            if (process == null || !process.isAlive()) {
                return false;
            }
            if (isServiceRunning()) {
                return true;
            }
            try {
                Thread.sleep(500L);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            }
        }
        return false;
    }

    @PreDestroy
    public void stop() {
        shuttingDown = true;
        if (watchdog != null) {
            watchdog.shutdownNow();
            watchdog = null;
        }
        if (process != null && process.isAlive()) {
            log.info("Stopping Voice Engine service...");
            process.destroy();
            try {
                // 等待几秒尝试优雅关闭
                if (!process.waitFor(5, TimeUnit.SECONDS)) {
                    process.destroyForcibly();
                }
                log.info("Voice Engine service stopped.");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                process.destroyForcibly();
            }
        }
        logExecutor.shutdownNow();
    }
}
