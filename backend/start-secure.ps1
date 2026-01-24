# LearnSphere AI 安全启动脚本
# 使用环境变量管理敏感信息

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LearnSphere AI 后端服务安全启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 设置加密密钥（从环境变量或用户输入）
$JASYPT_PASSWORD = $env:JASYPT_PASSWORD
if (-not $JASYPT_PASSWORD) {
    Write-Host "⚠️  未检测到 JASYPT_PASSWORD 环境变量" -ForegroundColor Yellow
    $JASYPT_PASSWORD = Read-Host "请输入加密密钥 (直接回车使用默认密钥)"
    if (-not $JASYPT_PASSWORD) {
        $JASYPT_PASSWORD = "<REDACTED-JASYPT-KEY>"
        Write-Host "使用默认加密密钥（仅限开发环境）" -ForegroundColor Yellow
    }
}

Write-Host "✅ 加密密钥已设置" -ForegroundColor Green
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
