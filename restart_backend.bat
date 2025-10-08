@echo off
chcp 65001 >nul
echo ========================================
echo 重新编译并重启后端服务
echo ========================================

cd backend

echo.
echo [1/2] 正在编译后端...
call mvn clean package -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 编译失败！
    pause
    exit /b 1
)

echo.
echo ✅ 编译成功！
echo.
echo [2/2] 请手动重启后端服务
echo.
echo 提示：
echo 1. 停止当前运行的后端服务
echo 2. 运行: java -jar target/learnsphere-backend.jar
echo.
echo 或者使用你的启动脚本
echo.
pause
