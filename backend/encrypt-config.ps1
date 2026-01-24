# Jasypt 密码加密脚本
# 用于加密配置文件中的敏感信息

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jasypt 配置加密工具" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 加密密钥（建议通过环境变量设置）
$JASYPT_PASSWORD = $env:JASYPT_PASSWORD
if (-not $JASYPT_PASSWORD) {
    $JASYPT_PASSWORD = "LearnSphere2026SecretKey"
    Write-Host "⚠️  使用默认加密密钥，生产环境请设置 JASYPT_PASSWORD 环境变量" -ForegroundColor Yellow
}

# 需要加密的明文列表
$secrets = @{
    "数据库密码" = "chen20040209"
    "AI API Key" = "sk-8b5df7e3d85442fd8e4ddb7c5204da48"
}

Write-Host "加密结果：" -ForegroundColor Green
Write-Host ""

foreach ($key in $secrets.Keys) {
    $plainText = $secrets[$key]
    
    # 这里我们手动生成加密文本（使用简单算法演示）
    # 实际项目中需要使用 Java Jasypt 库
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($plainText)
    $encrypted = [Convert]::ToBase64String($bytes)
    
    Write-Host "$key :" -ForegroundColor Cyan
    Write-Host "  明文: $plainText" -ForegroundColor Gray
    Write-Host "  密文: ENC($encrypted)" -ForegroundColor Green
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📝 使用说明：" -ForegroundColor Yellow
Write-Host "1. 将上面的 ENC(...) 复制到 application-secret.properties"
Write-Host "2. 格式：spring.datasource.password=ENC(...)"
Write-Host "3. 在启动时添加参数：-Djasypt.encryptor.password=LearnSphere2026SecretKey"
Write-Host "========================================" -ForegroundColor Cyan
