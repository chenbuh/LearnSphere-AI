param(
    [switch]$IncludeAdmin,
    [switch]$SkipInstall,
    [switch]$SkipFrontend,
    [switch]$SkipBackendPackage
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

function Invoke-Step {
    param(
        [string]$Title,
        [scriptblock]$Action
    )

    Write-Host "`n=== $Title ===" -ForegroundColor Cyan
    & $Action
    if ($LASTEXITCODE -ne 0) {
        throw "$Title 执行失败。"
    }
}

function Get-BuildArgs {
    param(
        [string]$ProjectDir,
        [string]$Label,
        [switch]$SkipInstallFlag
    )

    $args = @(
        '-ExecutionPolicy', 'Bypass',
        '-File', 'scripts\构建前端应用.ps1',
        '-ProjectDir', $ProjectDir,
        '-Label', $Label
    )

    if ($SkipInstallFlag) {
        $args += '-SkipInstall'
    }

    return $args
}

if (-not $SkipFrontend) {
    Invoke-Step -Title '构建前端用户端' -Action {
        $args = Get-BuildArgs -ProjectDir 'frontend-vue' -Label '前端用户端' -SkipInstallFlag:$SkipInstall
        & powershell @args
    }

    Invoke-Step -Title '同步前端用户端静态资源' -Action {
        & powershell -ExecutionPolicy Bypass -File 'scripts\同步静态资源.ps1'
    }

    if ($IncludeAdmin) {
        Invoke-Step -Title '构建管理后台' -Action {
            $args = Get-BuildArgs -ProjectDir 'admin-vue' -Label '管理后台' -SkipInstallFlag:$SkipInstall
            & powershell @args
        }

        Invoke-Step -Title '同步管理后台静态资源' -Action {
            & powershell -ExecutionPolicy Bypass -File 'scripts\同步静态资源.ps1' -AdminOnly
        }
    }
}

if (-not $SkipBackendPackage) {
    Push-Location 'backend'
    try {
        Invoke-Step -Title '打包后端 Jar' -Action {
            & mvn clean package -DskipTests
        }
    }
    finally {
        Pop-Location
    }
}

Write-Host "`n本地发版准备完成。" -ForegroundColor Green
Write-Host '建议下一步：' -ForegroundColor Green
Write-Host '1. 核对 backend/target 下的 Jar 产物' -ForegroundColor Green
Write-Host '2. 按 docs/部署运维/本地发版与宝塔上线检查清单.md 执行上线检查' -ForegroundColor Green
