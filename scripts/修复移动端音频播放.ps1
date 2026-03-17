# 移动端音频播放修复 - 快速部署脚本
# 用途：修复移动端听力播放问题后的快速构建和部署

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "移动端音频播放修复 - 快速部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot | Split-Path -Parent

# 检查是否在项目根目录
if (-not (Test-Path "$projectRoot\package.json")) {
    Write-Host "错误: 未找到 package.json，请确认脚本在项目根目录的 scripts 文件夹中" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] 清理旧的构建产物..." -ForegroundColor Yellow
$backendStaticDir = "$projectRoot\backend\src\main\resources\static\dist"
if (Test-Path $backendStaticDir) {
    Remove-Item -Path $backendStaticDir -Recurse -Force
    Write-Host "  ✓ 已清理旧的前端静态资源" -ForegroundColor Green
}

$backendTargetDir = "$projectRoot\backend\target"
if (Test-Path $backendTargetDir) {
    Remove-Item -Path $backendTargetDir -Recurse -Force
    Write-Host "  ✓ 已清理旧的后端构建产物" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] 构建前端..." -ForegroundColor Yellow
Set-Location $projectRoot
try {
    npm run build:frontend
    Write-Host "  ✓ 前端构建成功" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 前端构建失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/5] 验证前端构建产物..." -ForegroundColor Yellow
if (-not (Test-Path "$backendStaticDir\index.html")) {
    Write-Host "  ✗ 未找到 index.html，前端构建可能失败" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "$backendStaticDir\assets")) {
    Write-Host "  ✗ 未找到 assets 目录，前端构建可能失败" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ 前端构建产物验证通过" -ForegroundColor Green

Write-Host ""
Write-Host "[4/5] 构建后端..." -ForegroundColor Yellow
Set-Location "$projectRoot\backend"
try {
    mvn clean package -DskipTests
    Write-Host "  ✓ 后端构建成功" -ForegroundColor Green
} catch {
    Write-Host "  ✗ 后端构建失败: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[5/5] 查找构建产物..." -ForegroundColor Yellow
$jarFiles = Get-ChildItem -Path "$projectRoot\backend\target" -Filter "*.jar" | Where-Object { $_.Name -notlike "*-sources.jar" -and $_.Name -notlike "*-javadoc.jar" }

if ($jarFiles.Count -eq 0) {
    Write-Host "  ✗ 未找到 JAR 文件" -ForegroundColor Red
    exit 1
}

$jarFile = $jarFiles[0]
$jarPath = $jarFile.FullName
$jarSize = [math]::Round($jarFile.Length / 1MB, 2)

Write-Host "  ✓ 找到构建产物: $($jarFile.Name) ($jarSize MB)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "构建完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "JAR 文件位置:" -ForegroundColor Yellow
Write-Host "  $jarPath" -ForegroundColor White
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 将 JAR 文件上传到服务器" -ForegroundColor White
Write-Host "  2. 在宝塔面板中重启 Java 项目" -ForegroundColor White
Write-Host "  3. 使用移动端浏览器访问听力页面测试" -ForegroundColor White
Write-Host "  4. 如果仍有问题，查看排查指南:" -ForegroundColor White
Write-Host "     docs\部署运维\移动端音频播放问题排查指南.md" -ForegroundColor Cyan
Write-Host ""

# 询问是否复制 JAR 文件路径到剪贴板
$copyPath = Read-Host "是否复制 JAR 文件路径到剪贴板？(Y/N)"
if ($copyPath -eq "Y" -or $copyPath -eq "y") {
    Set-Clipboard -Value $jarPath
    Write-Host "  ✓ 已复制到剪贴板" -ForegroundColor Green
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
