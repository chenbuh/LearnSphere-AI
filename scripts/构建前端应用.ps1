param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectDir,

    [Parameter(Mandatory = $true)]
    [string]$Label,

    [string]$BuildScript = 'build',

    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

function Resolve-WorkspacePath {
    param([string]$Path)

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return (Join-Path $repoRoot $Path)
}

$resolvedProjectDir = Resolve-WorkspacePath -Path $ProjectDir
$packageJsonPath = Join-Path $resolvedProjectDir 'package.json'

if (-not (Test-Path $packageJsonPath)) {
    throw "未找到 package.json：$resolvedProjectDir"
}

Push-Location $resolvedProjectDir
try {
    if (-not $SkipInstall) {
        if (Test-Path 'package-lock.json') {
            Write-Host "[$Label] 执行 npm ci..."
            & npm ci
        }
        else {
            Write-Host "[$Label] 执行 npm install..."
            & npm install
        }

        if ($LASTEXITCODE -ne 0) {
            throw "[$Label] 依赖安装失败。"
        }
    }

    Write-Host "[$Label] 执行 npm run $BuildScript..."
    & npm run $BuildScript

    if ($LASTEXITCODE -ne 0) {
        throw "[$Label] 构建失败。"
    }

    Write-Host "[$Label] 构建完成。"
}
finally {
    Pop-Location
}
