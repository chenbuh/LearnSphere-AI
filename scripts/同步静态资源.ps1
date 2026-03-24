param(
    [string]$FrontendDist = 'backend/src/main/resources/static/dist',
    [string]$AdminDist = 'backend/src/main/resources/static/admin',
    [string]$StaticDir = 'backend/src/main/resources/static',
    [switch]$IncludeAdmin,
    [switch]$AdminOnly
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

function Assert-DistReady {
    param(
        [string]$DistPath,
        [string]$Label
    )

    if (-not (Test-Path $DistPath)) {
        throw "未找到 $Label 构建目录：$DistPath"
    }

    $indexPath = Join-Path $DistPath 'index.html'
    if (-not (Test-Path $indexPath)) {
        throw "$Label 构建目录缺少 index.html：$DistPath"
    }
}

function Test-SamePath {
    param(
        [string]$Left,
        [string]$Right
    )

    $leftFull = [System.IO.Path]::GetFullPath($Left).TrimEnd([char[]]@('\', '/'))
    $rightFull = [System.IO.Path]::GetFullPath($Right).TrimEnd([char[]]@('\', '/'))
    return [System.StringComparer]::OrdinalIgnoreCase.Equals($leftFull, $rightFull)
}
function Ensure-Directory {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Clear-DirectoryContent {
    param(
        [string]$Path,
        [string[]]$ExcludeNames = @()
    )

    Ensure-Directory -Path $Path

    Get-ChildItem -Path $Path -Force | ForEach-Object {
        if ($ExcludeNames -contains $_.Name) {
            return
        }

        Remove-Item -Path $_.FullName -Recurse -Force
    }
}

function Copy-DistContent {
    param(
        [string]$SourceDir,
        [string]$TargetDir
    )

    Ensure-Directory -Path $TargetDir
    Copy-Item -Path (Join-Path $SourceDir '*') -Destination $TargetDir -Recurse -Force
}

$resolvedFrontendDist = Resolve-WorkspacePath -Path $FrontendDist
$resolvedAdminDist = Resolve-WorkspacePath -Path $AdminDist
$resolvedStaticDir = Resolve-WorkspacePath -Path $StaticDir

if (-not $AdminOnly) {
    $frontendTarget = Join-Path $resolvedStaticDir 'dist'
    if (Test-SamePath -Left $resolvedFrontendDist -Right $frontendTarget) {
        Assert-DistReady -DistPath $frontendTarget -Label '前端用户端静态目录'
        Write-Host "前端用户端已直接输出到静态目录，跳过同步 -> $frontendTarget"
    }
    else {
        Assert-DistReady -DistPath $resolvedFrontendDist -Label '前端用户端'
        Clear-DirectoryContent -Path $frontendTarget
        Copy-DistContent -SourceDir $resolvedFrontendDist -TargetDir $frontendTarget
        Write-Host "已同步前端用户端静态资源 -> $frontendTarget"
    }
}

if ($IncludeAdmin -or $AdminOnly) {
    $adminTarget = Join-Path $resolvedStaticDir 'admin'
    if (Test-SamePath -Left $resolvedAdminDist -Right $adminTarget) {
        Assert-DistReady -DistPath $adminTarget -Label '管理后台静态目录'
        Write-Host "管理后台已直接输出到静态目录，跳过同步 -> $adminTarget"
    }
    else {
        Assert-DistReady -DistPath $resolvedAdminDist -Label '管理后台'
        Clear-DirectoryContent -Path $adminTarget
        Copy-DistContent -SourceDir $resolvedAdminDist -TargetDir $adminTarget
        Write-Host "已同步管理后台静态资源 -> $adminTarget"
    }
}

Write-Host '静态资源同步完成。'
