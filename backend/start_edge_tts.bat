@echo off
echo ========================================
echo   Edge TTS 服务安装与启动
echo ========================================
echo.

echo [1/3] 检查 Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python 未安装！请先安装 Python 3.7+
    echo    下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python 已安装

echo.
echo [2/3] 安装依赖...
pip install edge-tts flask flask-cors
if errorlevel 1 (
    echo ❌ 依赖安装失败！
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [3/3] 启动 Edge TTS 服务...
echo.
echo ========================================
echo   服务已启动！
echo   API: http://localhost:5010/api/tts
echo   健康检查: http://localhost:5010/health
echo ========================================
echo.
echo 按 Ctrl+C 停止服务
echo.

python edge_tts_server.py
