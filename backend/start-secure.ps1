# LearnSphere AI 安全启动脚本
# 使用环境变量管理敏感信息

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LearnSphere AI 后端服务安全启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 设置加密密钥（仅接受环境变量，不提供任何默认值）
# 安全修复（2026-03）：移除原「直接回车使用默认密钥」的分支（历史默认值已泄露）。
# 该密钥已随仓库公开，使用它等同于配置未加密；且会让下方 -Dspring.profiles.active=dev
# 的启动路径静默带上一把公开密钥。
$JASYPT_PASSWORD = $env:JASYPT_PASSWORD
if (-not $JASYPT_PASSWORD) {
    Write-Host "❌ 未检测到 JASYPT_PASSWORD 环境变量" -ForegroundColor Red
    Write-Host ""
    Write-Host "本脚本不再提供默认加密密钥（历史默认值已泄露，视为无效）。" -ForegroundColor Yellow
    Write-Host "请先生成一个高强度密钥并设置为环境变量，例如：" -ForegroundColor Yellow
    Write-Host '   $env:JASYPT_PASSWORD = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))' -ForegroundColor Gray
    Write-Host '   生产环境请改用密钥管理服务注入，不要写入脚本或配置文件。' -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ 加密密钥已从环境变量载入" -ForegroundColor Green
Write-Host ""

# 2. 编译项目
Write-Host "📦 正在编译项目..." -ForegroundColor Cyan
& mvn clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 编译失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 编译成功！" -ForegroundColor Green
Write-Host ""

# 3. 启动服务
Write-Host "🚀 正在启动服务..." -ForegroundColor Cyan
Write-Host ""

# 查找 JAR 文件
$JAR_FILE = Get-ChildItem -Path "target" -Filter "*.jar" | Select-Object -First 1

if (-not $JAR_FILE) {
    Write-Host "❌ 未找到 JAR 文件！" -ForegroundColor Red
    exit 1
}

# 启动参数
$JAVA_OPTS = @(
    "-Xms512m",                                      # 最小堆内存
    "-Xmx2048m",                                     # 最大堆内存
    "-Djasypt.encryptor.password=$JASYPT_PASSWORD", # Jasypt 加密密钥
    "-Dspring.profiles.active=dev",                 # 激活的配置文件
    "-Dfile.encoding=UTF-8"                         # 文件编码
)

Write-Host "启动命令：" -ForegroundColor Gray
Write-Host "java $($JAVA_OPTS -join ' ') -jar $($JAR_FILE.Name)" -ForegroundColor Gray
Write-Host ""

try {
    & java $JAVA_OPTS -jar $JAR_FILE.FullName
} catch {
    Write-Host "❌ 启动失败：$_" -ForegroundColor Red
    exit 1
}
