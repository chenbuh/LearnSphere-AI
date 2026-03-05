@echo off
echo ====================================
echo LearnSphere AI - HTTPS 开发环境设置
echo ====================================
echo.

REM 检查是否安装了 mkcert
where mkcert >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [1/3] 正在安装 mkcert...
    echo.

    REM 检查是否有 Chocolatey
    where choco >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo 使用 Chocolatey 安装 mkcert...
        choco install mkcert -y
    ) else (
        echo 未检测到 Chocolatey，请手动安装 mkcert：
        echo.
        echo 方法 1 - 使用 Chocolatey（推荐）:
        echo   1. 以管理员身份运行 PowerShell
        echo   2. 安装 Chocolatey: Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        echo   3. 安装 mkcert: choco install mkcert
        echo.
        echo 方法 2 - 手动下载:
        echo   从 https://github.com/FiloSottile/mkcert/releases 下载 Windows 版本
        echo   解压后将 mkcert.exe 放到 PATH 环境变量包含的目录中
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [2/3] 正在安装本地 CA...
mkcert -install

echo.
echo [3/3] 设置完成！
echo.
echo 现在可以运行: npm run dev
echo.
pause
