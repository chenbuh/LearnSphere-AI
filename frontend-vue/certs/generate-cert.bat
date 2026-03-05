@echo off
REM 生成自签名SSL证书用于Vite开发服务器
REM 注意：这仅用于本地开发，不要在生产环境使用

echo 正在生成自签名SSL证书...

openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj "/CN=localhost" -keyout key.pem -out cert.pem -days 365

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 证书生成成功！
    echo ========================================
    echo.
    echo 现在可以使用 HTTPS 启动开发服务器了
    echo.
) else (
    echo.
    echo ========================================
    echo 证书生成失败！
    echo ========================================
    echo.
    echo 请确保已安装 OpenSSL。在 Windows 上，你可以：
    echo 1. 安装 Git for Windows（包含 OpenSSL）
    echo 2. 或者从 https://slproweb.com/products/Win32OpenSSL.html 下载
    echo.
    pause
)
