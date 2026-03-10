param(
    [switch]$ChangedOnly
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

$textExtensions = @(
    '.md', '.txt', '.java', '.js', '.ts', '.vue', '.json', '.yml', '.yaml',
    '.xml', '.properties', '.sql', '.bat', '.ps1', '.css', '.scss'
)

$excludePatterns = @(
    '(^|[\/])node_modules([\/]|$)',
    '(^|[\/])\.git([\/]|$)',
    '(^|[\/])\.idea([\/]|$)',
    '(^|[\/])backend[\/]\.pip-tmp([\/]|$)',
    '(^|[\/])backend[\/]tmp([\/]|$)',
    '(^|[\/])backend[\/]learnsphere_ai_.*\.sql$',
    '(^|[\/])target([\/]|$)',
    '(^|[\/])dist([\/]|$)',
    '(^|[\/])backend[\/]src[\/]main[\/]resources[\/]static([\/]|$)',
    '(^|[\/])frontend-vue[\/]src[\/]data([\/]|$)',
    '(^|[\/])scripts[\/]扫描中文乱码\.ps1$',
    '^diff\.txt$',
    '^docs[\/]开发指南[\/]编码异常检查与修复记录\.md$'
)

$suspiciousRules = @(
    @{ Name = 'replacement-char'; Pattern = '�' },
    @{ Name = 'common-mojibake'; Pattern = '鈹|锟|閿|鍓|绔�|跾|鍚庣|鍓嶇' },
    @{ Name = 'project-known-fragments'; Pattern = '答历史|保存答记录|统计计|获取系统计统计计数据' }
)

function Test-ExcludedPath {
    param([string]$Path)

    foreach ($pattern in $excludePatterns) {
        if ($Path -match $pattern) {
            return $true
        }
    }
    return $false
}

function Get-ScanTargets {
    if (-not $ChangedOnly) {
        return Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object {
                $ext = [System.IO.Path]::GetExtension($_.FullName).ToLowerInvariant()
                $relativePath = $_.FullName.Substring($repoRoot.Path.Length + 1).Replace('\', '/')
                $textExtensions -contains $ext -and -not (Test-ExcludedPath $relativePath)
            } |
            ForEach-Object { $_.FullName.Substring($repoRoot.Path.Length + 1).Replace('\', '/') } |
            Sort-Object -Unique
    }

    $changed = @()
    $gitAvailable = Get-Command git -ErrorAction SilentlyContinue
    if (-not $gitAvailable) {
        throw '未检测到 git，无法使用 -ChangedOnly。'
    }

    $changed += git diff --name-only --diff-filter=ACMRTUXB
    $changed += git diff --cached --name-only --diff-filter=ACMRTUXB
    $changed += git ls-files --others --exclude-standard

    return $changed |
        Where-Object {
            $_ -and
            -not (Test-ExcludedPath $_) -and
            ($textExtensions -contains [System.IO.Path]::GetExtension($_).ToLowerInvariant()) -and
            (Test-Path $_)
        } |
        Sort-Object -Unique
}

$targets = Get-ScanTargets

if (-not $targets -or $targets.Count -eq 0) {
    Write-Host '未找到可扫描文件。'
    exit 0
}

$issues = @()

foreach ($relativePath in $targets) {
    $content = Get-Content -Path $relativePath -Raw -Encoding utf8

    foreach ($rule in $suspiciousRules) {
        $matches = Select-String -InputObject $content -Pattern $rule.Pattern -AllMatches
        if (-not $matches) {
            continue
        }

        foreach ($lineMatch in Select-String -Path $relativePath -Pattern $rule.Pattern -Encoding utf8) {
            $issues += [PSCustomObject]@{
                Rule = $rule.Name
                Path = $relativePath
                Line = $lineMatch.LineNumber
                Text = $lineMatch.Line.Trim()
            }
        }
    }
}

if ($issues.Count -eq 0) {
    Write-Host ('扫描完成，未发现疑似中文乱码。文件数: {0}' -f $targets.Count)
    exit 0
}

Write-Host ('发现 {0} 处疑似中文乱码:' -f $issues.Count)
$issues | Sort-Object Path, Line, Rule | Format-Table -AutoSize
exit 1
