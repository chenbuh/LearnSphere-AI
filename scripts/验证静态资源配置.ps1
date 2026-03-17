# 验证前端打包到后端静态资源配置
# 用途：检查 Vite 构建配置和 Spring Boot 静态资源映射是否正确

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "验证静态资源配置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $projectRoot "frontend-vue"
$backendStaticDir = Join-Path $projectRoot "backend\src\main\resources\static"
$distDir = Join-Path $backendStaticDir "dist"

# 1. 检查 Vite 配置
Write-Host "[1/6] 检查 Vite 构建配置..." -ForegroundColor Yellow
$viteConfigPath = Join-Path $frontendDir "vite.config.js"

if (Test-Path $viteConfigPath) {
    $viteConfig = Get-Content $viteConfigPath -Raw

    if ($viteConfig -match "outDir.*backend.*resources.*static.*dist") {
        Write-Host "  ✓ Vite outDir 配置正确" -ForegroundColor Green
        Write-Host "    输出目录: backend/src/main/resources/static/dist" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Vite outDir 配置可能有误" -ForegroundColor Red
        Write-Host "    请检查 vite.config.js 中的 build.outDir 配置" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ 找不到 vite.config.js" -ForegroundColor Red
}

Write-Host ""

# 2. 检查 WebConfig.java
Write-Host "[2/6] 检查 Spring Boot WebConfig..." -ForegroundColor Yellow
$webConfigPath = Join-Path $projectRoot "backend\src\main\java\com\learnsphere\config\WebConfig.java"

if (Test-Path $webConfigPath) {
    $webConfig = Get-Content $webConfigPath -Raw

    $checks = @(
        @{ Pattern = "/assets/\*\*.*classpath:/static/dist/assets/"; Name = "/assets/** 映射" },
        @{ Pattern = "/dist/assets/\*\*.*classpath:/static/dist/assets/"; Name = "/dist/assets/** 映射" },
        @{ Pattern = "/sw\.js.*classpath:/static/dist/"; Name = "Service Worker 映射" },
        @{ Pattern = "/dist/\*\*.*classpath:/static/dist/"; Name = "/dist/** 映射" },
        @{ Pattern = "/\*\*.*classpath:/static/dist/"; Name = "SPA 路由回退" }
    )

    $allPassed = $true
    foreach ($check in $checks) {
        if ($webConfig -match $check.Pattern) {
            Write-Host "  ✓ $($check.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $($check.Name) 未找到" -ForegroundColor Red
            $allPassed = $false
        }
    }

    if ($allPassed) {
        Write-Host "  ✓ WebConfig 配置完整" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ WebConfig 配置可能不完整" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ 找不到 WebConfig.java" -ForegroundColor Red
}

Write-Host ""

# 3. 检查后端静态资源目录结构
Write-Host "[3/6] 检查后端静态资源目录..." -ForegroundColor Yellow

if (Test-Path $backendStaticDir) {
    Write-Host "  ✓ static 目录存在: $backendStaticDir" -ForegroundColor Green

    # 检查 dist 目录
    if (Test-Path $distDir) {
        Write-Host "  ✓ dist 目录存在" -ForegroundColor Green

        # 检查关键文件
        $indexHtml = Join-Path $distDir "index.html"
        $assetsDir = Join-Path $distDir "assets"
        $swJs = Join-Path $distDir "sw.js"

        if (Test-Path $indexHtml) {
            Write-Host "    ✓ index.html 存在" -ForegroundColor Green
        } else {
            Write-Host "    ✗ index.html 不存在" -ForegroundColor Red
        }

        if (Test-Path $assetsDir) {
            $jsFiles = Get-ChildItem -Path $assetsDir -Recurse -Filter "*.js" | Measure-Object
            $cssFiles = Get-ChildItem -Path $assetsDir -Recurse -Filter "*.css" | Measure-Object
            Write-Host "    ✓ assets 目录存在 (JS: $($jsFiles.Count), CSS: $($cssFiles.Count))" -ForegroundColor Green
        } else {
            Write-Host "    ✗ assets 目录不存在" -ForegroundColor Red
        }

        if (Test-Path $swJs) {
            Write-Host "    ✓ sw.js 存在" -ForegroundColor Green
        } else {
            Write-Host "    ⚠ sw.js 不存在（可选）" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ dist 目录不存在" -ForegroundColor Red
        Write-Host "    请先运行: npm run build:frontend" -ForegroundColor Yellow
    }

    # 检查 admin 目录
    $adminDir = Join-Path $backendStaticDir "admin"
    if (Test-Path $adminDir) {
        Write-Host "  ✓ admin 目录存在" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ admin 目录不存在（如果有管理后台需要）" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ static 目录不存在: $backendStaticDir" -ForegroundColor Red
}

Write-Host ""

# 4. 检查 package.json 构建脚本
Write-Host "[4/6] 检查 package.json 构建脚本..." -ForegroundColor Yellow
$packageJsonPath = Join-Path $projectRoot "package.json"

if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

    if ($packageJson.scripts."build:frontend") {
        Write-Host "  ✓ build:frontend 脚本存在" -ForegroundColor Green
        Write-Host "    命令: $($packageJson.scripts.'build:frontend')" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ build:frontend 脚本不存在" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ 找不到 package.json" -ForegroundColor Red
}

Write-Host ""

# 5. 测试构建流程
Write-Host "[5/6] 测试构建流程..." -ForegroundColor Yellow
Write-Host "  提示: 这将执行一次完整的前端构建" -ForegroundColor Gray
$response = Read-Host "  是否执行测试构建? (y/N)"

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "  开始构建前端..." -ForegroundColor Cyan

    Push-Location $projectRoot
    try {
        $buildOutput = npm run build:frontend 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ 前端构建成功" -ForegroundColor Green

            # 验证构建产物
            if (Test-Path $distDir) {
                $indexHtml = Join-Path $distDir "index.html"
                if (Test-Path $indexHtml) {
                    Write-Host "  ✓ 构建产物已输出到 backend/src/main/resources/static/dist/" -ForegroundColor Green
                } else {
                    Write-Host "  ✗ 构建产物不完整" -ForegroundColor Red
                }
            } else {
                Write-Host "  ✗ dist 目录未创建" -ForegroundColor Red
            }
        } else {
            Write-Host "  ✗ 前端构建失败" -ForegroundColor Red
            Write-Host $buildOutput -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "  跳过测试构建" -ForegroundColor Gray
}

Write-Host ""

# 6. 生成验证报告
Write-Host "[6/6] 生成验证报告..." -ForegroundColor Yellow

$reportPath = Join-Path $projectRoot "static-config-report.txt"
$report = @"
========================================
静态资源配置验证报告
生成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
========================================

1. Vite 配置
   - 配置文件: frontend-vue/vite.config.js
   - 输出目录: backend/src/main/resources/static/dist
   - 状态: $(if (Test-Path $viteConfigPath) { "存在" } else { "缺失" })

2. Spring Boot 配置
   - 配置文件: backend/src/main/java/com/learnsphere/config/WebConfig.java
   - 状态: $(if (Test-Path $webConfigPath) { "存在" } else { "缺失" })

3. 静态资源目录
   - static 目录: $(if (Test-Path $backendStaticDir) { "存在" } else { "缺失" })
   - dist 目录: $(if (Test-Path $distDir) { "存在" } else { "缺失" })
   - index.html: $(if (Test-Path (Join-Path $distDir "index.html")) { "存在" } else { "缺失" })
   - assets 目录: $(if (Test-Path (Join-Path $distDir "assets")) { "存在" } else { "缺失" })

4. 构建脚本
   - package.json: $(if (Test-Path $packageJsonPath) { "存在" } else { "缺失" })
   - build:frontend: $(if ((Get-Content $packageJsonPath -Raw | ConvertFrom-Json).scripts."build:frontend") { "已配置" } else { "未配置" })

5. 访问路径（生产环境）
   - 用户前端: http://localhost:8080/ 或 http://localhost:8080/dist/
   - 管理后台: http://localhost:8080/admin/
   - 静态资源: http://localhost:8080/assets/**
   - API 接口: http://localhost:8080/api/**

6. 构建命令
   - 构建前端: npm run build:frontend
   - 构建后端: cd backend && mvn clean package -DskipTests
   - 快速构建: cd scripts && .\修复移动端音频播放.ps1

7. 常见问题
   - 如果 404: 检查 dist 目录是否存在且包含 index.html
   - 如果静态资源 404: 检查 WebConfig.java 的路径映射
   - 如果 SPA 路由 404: 检查 /** 的 PathResourceResolver 配置

========================================
"@

$report | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "  ✓ 验证报告已生成: $reportPath" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "验证完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 如果配置有误，请参考 docs/开发指南/前端打包到后端静态资源配置.md" -ForegroundColor Gray
Write-Host "  2. 构建前端: npm run build:frontend" -ForegroundColor Gray
Write-Host "  3. 构建后端: cd backend && mvn clean package -DskipTests" -ForegroundColor Gray
Write-Host "  4. 启动后端: java -jar backend/target/learnsphere-*.jar" -ForegroundColor Gray
Write-Host "  5. 访问测试: http://localhost:8080/" -ForegroundColor Gray
Write-Host ""
