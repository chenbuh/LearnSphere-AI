@echo off
chcp 65001 >nul
echo ========================================
echo  LearnSphere AI 一键部署脚本
echo ========================================
echo.

set STATIC_DIR=backend\src\main\resources\static

:: ─── 步骤 1：构建前端用户端 ──────────────────────────────────
echo [1/5] 构建前端（用户网站）...
echo.

powershell.exe -ExecutionPolicy Bypass -File "scripts\构建前端应用.ps1" -ProjectDir "frontend-vue" -Label "前端用户端"
if errorlevel 1 (
    echo [ERROR] 前端构建失败！
    pause & exit /b 1
)
echo 前端构建完成！
echo.

:: ─── 步骤 2：同步前端静态资源 ─────────────────────────────────
echo [2/5] 同步前端静态资源到后端 resources/static...
powershell.exe -ExecutionPolicy Bypass -File "scripts\同步静态资源.ps1"
if errorlevel 1 (
    echo [ERROR] 前端静态资源同步失败！
    pause & exit /b 1
)
echo 前端静态资源同步完成！
echo.

:: ─── 步骤 3：可选构建管理后台 ─────────────────────────────────
echo [3/5] 构建管理后台（可选）...
set /p BUILD_ADMIN="是否同时构建管理后台 admin-vue？(y/n): "
if /i "%BUILD_ADMIN%"=="y" (
    powershell.exe -ExecutionPolicy Bypass -File "scripts\构建前端应用.ps1" -ProjectDir "admin-vue" -Label "管理后台"
    if errorlevel 1 (
        echo [ERROR] 管理后台构建失败！
        pause & exit /b 1
    )
    echo [4/5] 同步管理后台静态资源到后端 resources/static/admin...
    powershell.exe -ExecutionPolicy Bypass -File "scripts\同步静态资源.ps1" -AdminOnly
    if errorlevel 1 (
        echo [ERROR] 管理后台静态资源同步失败！
        pause & exit /b 1
    )
    echo 管理后台构建并同步完成！
) else (
    echo 跳过管理后台构建。
)
echo.

:: ─── 步骤 5：Maven 打包后端 JAR ────────────────────────────────
echo [5/5] 打包后端 JAR（包含前端静态资源）...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo [ERROR] 后端打包失败！
    cd .. & pause & exit /b 1
)
cd ..
echo 后端打包完成！
echo.

echo ========================================
echo  部署准备完成！
echo ========================================
echo.
echo  JAR 路径: backend\target\learnsphere-ai-0.0.1-SNAPSHOT.jar
echo.
echo  访问地址（启动后）：
echo    前端用户端: http://服务器IP:8080/
echo    管理后台:   http://服务器IP:8080/admin/
echo    API接口:    http://服务器IP:8080/api/
echo.
echo  静态资源缓存策略:
echo    /assets/**   JS/CSS  -^> 7天强缓存 (immutable)
echo    /index.html  入口    -^> 不缓存 (no-store)
echo    /sw.js       SW      -^> 不缓存 (no-store)
echo.
echo  上传 JAR 到服务器后，参考 docs\部署运维\宝塔部署指南.md 启动。
echo.
pause
