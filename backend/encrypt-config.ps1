# 配置加密工具（安全版）
# ============================================================================
# 重要变更说明：
#   旧版本 encrypt-config.ps1 使用 Base64 编码并谎称为「加密」，
#   且把数据库口令、AI API Key 明文写在脚本内、加密密钥硬编码为固定字符串。
#   这些做法已全部移除。
#
#   本脚本只做一件事：调用项目自身的 JasyptEncryptUtil（AES-256）加密你输入的明文。
#   它不会、也无法回显任何既有明文口令或密钥。
#
#   加密口令必须通过环境变量 JASYPT_PASSWORD 提供；
#   脚本不提供默认口令，缺失时直接退出。
# ============================================================================

param(
    [Parameter(Mandatory = $true, HelpMessage = "要加密的明文（例如数据库口令）")]
    [string]$PlainText
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jasypt 配置加密工具（AES-256）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $env:JASYPT_PASSWORD) {
    Write-Host "❌ 未检测到环境变量 JASYPT_PASSWORD。" -ForegroundColor Red
    Write-Host "   为避免使用弱密钥，本脚本不提供默认口令。" -ForegroundColor Red
    Write-Host "   请先设置一个高强度口令，例如：" -ForegroundColor Yellow
    Write-Host '   $env:JASYPT_PASSWORD = "<32位以上随机串>"' -ForegroundColor Gray
    Write-Host ""
    Write-Host "   生成随机口令示例：" -ForegroundColor Yellow
    Write-Host '   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))' -ForegroundColor Gray
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$utilSource = Join-Path $scriptDir "src/main/java/com/learnsphere/utils/JasyptEncryptUtil.java"
$jasyptJar = Join-Path $env:USERPROFILE ".m2/repository/org/jasypt/jasypt/1.9.3/jasypt-1.9.3.jar"

if (-not (Test-Path $utilSource)) {
    Write-Host "❌ 未找到 JasyptEncryptUtil.java：$utilSource" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $jasyptJar)) {
    Write-Host "❌ 未找到 jasypt 依赖：$jasyptJar" -ForegroundColor Red
    Write-Host "   请先执行 mvn dependency:resolve" -ForegroundColor Gray
    exit 1
}

$outDir = Join-Path $scriptDir "target/jasypt-tool"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "📦 正在编译工具类..." -ForegroundColor Cyan
& javac -cp $jasyptJar -d $outDir $utilSource
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 编译失败" -ForegroundColor Red
    exit 1
}

Write-Host "🔐 正在加密..." -ForegroundColor Cyan
Write-Host ""
$result = & java -cp "$outDir;$jasyptJar" com.learnsphere.utils.JasyptEncryptUtil $PlainText
$result | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "📝 安全提醒：" -ForegroundColor Yellow
Write-Host "   1. 不要把 JASYPT_PASSWORD 写进任何文件或仓库。" -ForegroundColor Gray
Write-Host "   2. 密文与密钥必须分开存放，二者同仓库等于未加密。" -ForegroundColor Gray
Write-Host "   3. 部署时通过环境变量或密钥管理服务注入密钥。" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Yellow
